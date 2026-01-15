/**
 * Socket Event Emitter (for API routes)
 *
 * Sends events to the standalone socket server.
 * Use this from Next.js API routes to trigger real-time updates.
 */

import type {
  BattleCreatedEvent,
  RemixSelectedEvent,
  BattleStateChangedEvent,
  VoteCastEvent,
  BattleCompletedEvent,
} from './types';

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || 'http://localhost:3001';

/**
 * Send event to socket server
 */
async function emitToSocketServer(eventPath: string, data: unknown): Promise<boolean> {
  try {
    const response = await fetch(`${SOCKET_SERVER_URL}/emit/${eventPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.warn(`[Socket] Failed to emit ${eventPath}:`, response.status);
      return false;
    }

    return true;
  } catch (error) {
    // Socket server might not be running - that's okay
    console.warn(`[Socket] Cannot reach socket server for ${eventPath}:`, error);
    return false;
  }
}

/**
 * Emit battle created event
 */
export async function emitBattleCreated(event: BattleCreatedEvent): Promise<boolean> {
  return emitToSocketServer('battle/created', event);
}

/**
 * Emit remix selected event
 */
export async function emitRemixSelected(event: RemixSelectedEvent): Promise<boolean> {
  return emitToSocketServer('battle/remixSelected', event);
}

/**
 * Emit battle state changed event
 */
export async function emitBattleStateChanged(event: BattleStateChangedEvent): Promise<boolean> {
  return emitToSocketServer('battle/stateChanged', event);
}

/**
 * Emit vote cast event
 */
export async function emitVoteCast(event: VoteCastEvent): Promise<boolean> {
  return emitToSocketServer('battle/voteCast', event);
}

/**
 * Emit battle completed event
 */
export async function emitBattleCompleted(event: BattleCompletedEvent): Promise<boolean> {
  return emitToSocketServer('battle/completed', event);
}
