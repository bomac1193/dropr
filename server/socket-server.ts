/**
 * Standalone Socket.io Server
 *
 * Run this alongside the Next.js app for real-time battle updates.
 *
 * Usage:
 *   npx ts-node --project tsconfig.server.json server/socket-server.ts
 *
 * Or add to package.json scripts:
 *   "socket": "ts-node --project tsconfig.server.json server/socket-server.ts"
 */

import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const PORT = process.env.SOCKET_PORT || 3001;
const CORS_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Create HTTP server
const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: 'socket' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

// Create Socket.io server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
  path: '/socket.io',
});

// Track active battles
const activeBattles = new Map<string, Set<string>>();

// Handle connections
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Join battle room
  socket.on('battle:join', ({ battleId, playerId }) => {
    socket.join(`battle:${battleId}`);
    socket.data = { ...socket.data, battleId, playerId };

    // Track viewer count
    if (!activeBattles.has(battleId)) {
      activeBattles.set(battleId, new Set());
    }
    activeBattles.get(battleId)?.add(socket.id);

    const viewerCount = activeBattles.get(battleId)?.size || 0;
    console.log(`[Socket] ${socket.id} joined battle:${battleId} (${viewerCount} viewers)`);

    // Notify room of viewer count
    io.to(`battle:${battleId}`).emit('battle:viewerCount', {
      battleId,
      count: viewerCount,
    });
  });

  // Leave battle room
  socket.on('battle:leave', ({ battleId }) => {
    socket.leave(`battle:${battleId}`);
    socket.data = { ...socket.data, battleId: undefined };

    // Update viewer count
    activeBattles.get(battleId)?.delete(socket.id);
    const viewerCount = activeBattles.get(battleId)?.size || 0;

    if (viewerCount === 0) {
      activeBattles.delete(battleId);
    } else {
      io.to(`battle:${battleId}`).emit('battle:viewerCount', {
        battleId,
        count: viewerCount,
      });
    }

    console.log(`[Socket] ${socket.id} left battle:${battleId} (${viewerCount} viewers)`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const battleId = socket.data?.battleId;
    if (battleId) {
      activeBattles.get(battleId)?.delete(socket.id);
      const viewerCount = activeBattles.get(battleId)?.size || 0;

      if (viewerCount === 0) {
        activeBattles.delete(battleId);
      } else {
        io.to(`battle:${battleId}`).emit('battle:viewerCount', {
          battleId,
          count: viewerCount,
        });
      }
    }
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// API for emitting events from Next.js API routes
// This allows the Next.js app to trigger socket events via HTTP

httpServer.on('request', (req, res) => {
  if (req.method === 'POST' && req.url?.startsWith('/emit/')) {
    const eventPath = req.url.slice(6); // Remove '/emit/'
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const eventName = eventPath.replace('/', ':') as string;

        // If battleId is present, emit to that room
        if (data.battleId) {
          io.to(`battle:${data.battleId}`).emit(eventName as any, data);
        }

        // For certain events, also emit globally
        if (eventName === 'battle:created' || eventName === 'battle:completed') {
          io.emit(eventName as any, data);
        }

        console.log(`[Socket] Emitted ${eventName}:`, data.battleId || 'global');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        console.error('[Socket] Emit error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });

    return;
  }
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`[Socket] Server running on port ${PORT}`);
  console.log(`[Socket] CORS origin: ${CORS_ORIGIN}`);
  console.log(`[Socket] Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Socket] Shutting down...');
  io.close();
  httpServer.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Socket] Shutting down...');
  io.close();
  httpServer.close();
  process.exit(0);
});
