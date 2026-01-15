/**
 * Socket.io React Hooks
 *
 * React hooks for using real-time battle updates in components.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getSocket,
  connectSocket,
  disconnectSocket,
  joinBattle,
  leaveBattle,
  isConnected,
  type SocketClient,
} from './client';
import type {
  BattleCreatedEvent,
  RemixSelectedEvent,
  BattleStateChangedEvent,
  VoteCastEvent,
  BattleCompletedEvent,
} from './types';

// =============================================================================
// useSocket Hook
// =============================================================================

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<SocketClient | null>(null);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);

    // Connect if not already connected
    if (!s.connected) {
      connectSocket();
    } else {
      setConnected(true);
    }

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
    };
  }, []);

  return { socket, connected };
}

// =============================================================================
// useBattle Hook
// =============================================================================

export interface BattleState {
  status: string;
  player1Votes: number;
  player2Votes: number;
  remixSelections: Array<{ playerId: string; remixId: string }>;
  winner: string | null;
  crowdEnergy: number;
}

export interface UseBattleOptions {
  battleId: string;
  playerId?: string;
  onStateChange?: (event: BattleStateChangedEvent) => void;
  onVote?: (event: VoteCastEvent) => void;
  onCompleted?: (event: BattleCompletedEvent) => void;
  onRemixSelected?: (event: RemixSelectedEvent) => void;
}

export function useBattle({
  battleId,
  playerId,
  onStateChange,
  onVote,
  onCompleted,
  onRemixSelected,
}: UseBattleOptions) {
  const { socket, connected } = useSocket();
  const [battleState, setBattleState] = useState<BattleState>({
    status: 'UNKNOWN',
    player1Votes: 0,
    player2Votes: 0,
    remixSelections: [],
    winner: null,
    crowdEnergy: 0,
  });

  // Join battle room on mount
  useEffect(() => {
    if (!connected || !battleId) return;

    joinBattle(battleId, playerId);

    return () => {
      leaveBattle(battleId);
    };
  }, [connected, battleId, playerId]);

  // Handle state change events
  useEffect(() => {
    if (!socket) return;

    const handleStateChange = (event: BattleStateChangedEvent) => {
      if (event.battleId !== battleId) return;

      setBattleState((prev) => ({
        ...prev,
        status: event.newStatus,
      }));

      onStateChange?.(event);
    };

    socket.on('battle:stateChanged', handleStateChange);

    return () => {
      socket.off('battle:stateChanged', handleStateChange);
    };
  }, [socket, battleId, onStateChange]);

  // Handle vote events
  useEffect(() => {
    if (!socket) return;

    const handleVote = (event: VoteCastEvent) => {
      if (event.battleId !== battleId) return;

      setBattleState((prev) => ({
        ...prev,
        player1Votes: event.player1VoteCount,
        player2Votes: event.player2VoteCount,
      }));

      onVote?.(event);
    };

    socket.on('battle:voteCast', handleVote);

    return () => {
      socket.off('battle:voteCast', handleVote);
    };
  }, [socket, battleId, onVote]);

  // Handle completed events
  useEffect(() => {
    if (!socket) return;

    const handleCompleted = (event: BattleCompletedEvent) => {
      if (event.battleId !== battleId) return;

      setBattleState((prev) => ({
        ...prev,
        status: 'COMPLETED',
        player1Votes: event.player1Votes,
        player2Votes: event.player2Votes,
        winner: event.winnerId,
        crowdEnergy: event.crowdEnergy,
      }));

      onCompleted?.(event);
    };

    socket.on('battle:completed', handleCompleted);

    return () => {
      socket.off('battle:completed', handleCompleted);
    };
  }, [socket, battleId, onCompleted]);

  // Handle remix selected events
  useEffect(() => {
    if (!socket) return;

    const handleRemixSelected = (event: RemixSelectedEvent) => {
      if (event.battleId !== battleId) return;

      setBattleState((prev) => ({
        ...prev,
        remixSelections: [
          ...prev.remixSelections.filter((s) => s.playerId !== event.playerId),
          { playerId: event.playerId, remixId: event.remixId },
        ],
      }));

      onRemixSelected?.(event);
    };

    socket.on('battle:remixSelected', handleRemixSelected);

    return () => {
      socket.off('battle:remixSelected', handleRemixSelected);
    };
  }, [socket, battleId, onRemixSelected]);

  return {
    connected,
    battleState,
    setBattleState,
  };
}

// =============================================================================
// useBattleLobby Hook
// =============================================================================

export interface UseBattleLobbyOptions {
  onBattleCreated?: (event: BattleCreatedEvent) => void;
  onBattleCompleted?: (event: BattleCompletedEvent) => void;
}

export function useBattleLobby({
  onBattleCreated,
  onBattleCompleted,
}: UseBattleLobbyOptions = {}) {
  const { socket, connected } = useSocket();
  const [recentBattles, setRecentBattles] = useState<BattleCreatedEvent[]>([]);

  // Handle battle created events
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (event: BattleCreatedEvent) => {
      setRecentBattles((prev) => [event, ...prev.slice(0, 9)]);
      onBattleCreated?.(event);
    };

    socket.on('battle:created', handleCreated);

    return () => {
      socket.off('battle:created', handleCreated);
    };
  }, [socket, onBattleCreated]);

  // Handle battle completed events
  useEffect(() => {
    if (!socket) return;

    const handleCompleted = (event: BattleCompletedEvent) => {
      setRecentBattles((prev) =>
        prev.filter((b) => b.battleId !== event.battleId)
      );
      onBattleCompleted?.(event);
    };

    socket.on('battle:completed', handleCompleted);

    return () => {
      socket.off('battle:completed', handleCompleted);
    };
  }, [socket, onBattleCompleted]);

  return {
    connected,
    recentBattles,
  };
}
