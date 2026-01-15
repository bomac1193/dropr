/**
 * Socket.io Module
 *
 * Real-time communication for DROPR battles.
 */

// Types
export type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  BattleCreatedEvent,
  RemixSelectedEvent,
  BattleStateChangedEvent,
  VoteCastEvent,
  BattleCompletedEvent,
  JoinBattleRoomPayload,
  LeaveBattleRoomPayload,
} from './types';

// Server (for custom server integration - most use cases should use emit.ts instead)
export {
  initSocketServer,
  getIO,
  getBattleRoomSize,
  isSocketServerRunning,
} from './server';
export type { IOServer } from './server';

// Client (use in React components)
export {
  getSocket,
  connectSocket,
  disconnectSocket,
  joinBattle,
  leaveBattle,
  isConnected,
} from './client';
export type { SocketClient } from './client';

// Hooks (use in React components)
export { useSocket, useBattle, useBattleLobby } from './hooks';
export type { BattleState, UseBattleOptions, UseBattleLobbyOptions } from './hooks';

// API Route Emitters (for triggering events from API routes)
export {
  emitBattleCreated,
  emitRemixSelected,
  emitBattleStateChanged,
  emitVoteCast,
  emitBattleCompleted,
} from './emit';
