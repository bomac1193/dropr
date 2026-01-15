/**
 * Socket.io Client
 *
 * Client-side utilities for connecting to the DROPR real-time server.
 */

'use client';

import { io, Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from './types';

// =============================================================================
// Types
// =============================================================================

export type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

// =============================================================================
// Singleton Socket Client
// =============================================================================

let socket: SocketClient | null = null;

/**
 * Get or create socket client
 */
export function getSocket(): SocketClient {
  if (socket) {
    return socket;
  }

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

  socket = io(socketUrl, {
    autoConnect: false,
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });

  // Log connection events
  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
  });

  return socket;
}

/**
 * Connect to socket server
 */
export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
}

/**
 * Disconnect from socket server
 */
export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

/**
 * Join a battle room
 */
export function joinBattle(battleId: string, playerId?: string): void {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  s.emit('battle:join', { battleId, playerId });
}

/**
 * Leave a battle room
 */
export function leaveBattle(battleId: string): void {
  const s = getSocket();
  s.emit('battle:leave', { battleId });
}

/**
 * Check if socket is connected
 */
export function isConnected(): boolean {
  return socket?.connected ?? false;
}
