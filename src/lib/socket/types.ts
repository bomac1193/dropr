/**
 * Socket.io Event Types
 *
 * Defines all real-time events for the DROPR battle system.
 */

// =============================================================================
// Server to Client Events
// =============================================================================

export interface BattleCreatedEvent {
  battleId: string;
  player1Id: string;
  player2Id: string;
  soundId: string;
  scene: string;
  selectingEndsAt: string;
}

export interface RemixSelectedEvent {
  battleId: string;
  playerId: string;
  remixId: string;
  bothSelected: boolean;
}

export interface BattleStateChangedEvent {
  battleId: string;
  previousStatus: string;
  newStatus: string;
  playingEndsAt?: string;
  votingEndsAt?: string;
}

export interface VoteCastEvent {
  battleId: string;
  voterId: string;
  votedFor: 'PLAYER_1' | 'PLAYER_2';
  player1VoteCount: number;
  player2VoteCount: number;
}

export interface BattleCompletedEvent {
  battleId: string;
  winnerId: string | null;
  player1Votes: number;
  player2Votes: number;
  crowdEnergy: number;
  player1HypeEarned: number;
  player2HypeEarned: number;
}

export interface ServerToClientEvents {
  'battle:created': (event: BattleCreatedEvent) => void;
  'battle:remixSelected': (event: RemixSelectedEvent) => void;
  'battle:stateChanged': (event: BattleStateChangedEvent) => void;
  'battle:voteCast': (event: VoteCastEvent) => void;
  'battle:completed': (event: BattleCompletedEvent) => void;
  'error': (message: string) => void;
}

// =============================================================================
// Client to Server Events
// =============================================================================

export interface JoinBattleRoomPayload {
  battleId: string;
  playerId?: string;
}

export interface LeaveBattleRoomPayload {
  battleId: string;
}

export interface ClientToServerEvents {
  'battle:join': (payload: JoinBattleRoomPayload) => void;
  'battle:leave': (payload: LeaveBattleRoomPayload) => void;
}

// =============================================================================
// Inter-server Events
// =============================================================================

export interface InterServerEvents {
  ping: () => void;
}

// =============================================================================
// Socket Data
// =============================================================================

export interface SocketData {
  playerId?: string;
  battleId?: string;
}
