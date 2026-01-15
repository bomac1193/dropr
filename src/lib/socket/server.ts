/**
 * Socket.io Server
 *
 * Real-time server for DROPR battle updates.
 * Can be run as a standalone server or integrated with Next.js custom server.
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  BattleCreatedEvent,
  RemixSelectedEvent,
  BattleStateChangedEvent,
  VoteCastEvent,
  BattleCompletedEvent,
} from './types';

// =============================================================================
// Types
// =============================================================================

export type IOServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// =============================================================================
// Singleton Socket Server
// =============================================================================

let io: IOServer | null = null;

/**
 * Initialize Socket.io server
 */
export function initSocketServer(httpServer: HTTPServer): IOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join battle room
    socket.on('battle:join', ({ battleId, playerId }) => {
      socket.join(`battle:${battleId}`);
      socket.data.battleId = battleId;
      socket.data.playerId = playerId;
      console.log(`[Socket] ${socket.id} joined battle:${battleId}`);
    });

    // Leave battle room
    socket.on('battle:leave', ({ battleId }) => {
      socket.leave(`battle:${battleId}`);
      socket.data.battleId = undefined;
      console.log(`[Socket] ${socket.id} left battle:${battleId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Get Socket.io server instance
 */
export function getIO(): IOServer | null {
  return io;
}

// =============================================================================
// Event Emitters
// =============================================================================

/**
 * Emit battle created event
 */
export function emitBattleCreated(event: BattleCreatedEvent): void {
  if (!io) {
    console.warn('[Socket] Server not initialized, cannot emit battle:created');
    return;
  }

  // Emit to all connected clients (for lobby/spectate list)
  io.emit('battle:created', event);
  console.log(`[Socket] Emitted battle:created for ${event.battleId}`);
}

/**
 * Emit remix selected event
 */
export function emitRemixSelected(event: RemixSelectedEvent): void {
  if (!io) {
    console.warn('[Socket] Server not initialized, cannot emit battle:remixSelected');
    return;
  }

  // Emit to battle room
  io.to(`battle:${event.battleId}`).emit('battle:remixSelected', event);
  console.log(`[Socket] Emitted battle:remixSelected for ${event.battleId}`);
}

/**
 * Emit battle state changed event
 */
export function emitBattleStateChanged(event: BattleStateChangedEvent): void {
  if (!io) {
    console.warn('[Socket] Server not initialized, cannot emit battle:stateChanged');
    return;
  }

  // Emit to battle room
  io.to(`battle:${event.battleId}`).emit('battle:stateChanged', event);
  console.log(`[Socket] Emitted battle:stateChanged for ${event.battleId}: ${event.previousStatus} -> ${event.newStatus}`);
}

/**
 * Emit vote cast event
 */
export function emitVoteCast(event: VoteCastEvent): void {
  if (!io) {
    console.warn('[Socket] Server not initialized, cannot emit battle:voteCast');
    return;
  }

  // Emit to battle room
  io.to(`battle:${event.battleId}`).emit('battle:voteCast', event);
  console.log(`[Socket] Emitted battle:voteCast for ${event.battleId}`);
}

/**
 * Emit battle completed event
 */
export function emitBattleCompleted(event: BattleCompletedEvent): void {
  if (!io) {
    console.warn('[Socket] Server not initialized, cannot emit battle:completed');
    return;
  }

  // Emit to battle room and all spectators
  io.to(`battle:${event.battleId}`).emit('battle:completed', event);
  io.emit('battle:completed', event); // Also emit globally for lobby updates
  console.log(`[Socket] Emitted battle:completed for ${event.battleId}`);
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get count of clients in a battle room
 */
export async function getBattleRoomSize(battleId: string): Promise<number> {
  if (!io) return 0;
  const room = io.sockets.adapter.rooms.get(`battle:${battleId}`);
  return room?.size ?? 0;
}

/**
 * Check if socket server is running
 */
export function isSocketServerRunning(): boolean {
  return io !== null;
}
