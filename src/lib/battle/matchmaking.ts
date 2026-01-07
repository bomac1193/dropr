/**
 * Matchmaking System
 *
 * Finds opponents for players based on influence score and taste similarity.
 */

import { prisma } from '@/lib/prisma';
import { computeTasteSimilarity, findTasteMatches, TasteVector } from '@/lib/pulse';

// =============================================================================
// Types
// =============================================================================

export interface MatchmakingOptions {
  mode?: 'similar' | 'opposite' | 'balanced';
  influenceRange?: number;  // % range around player's influence
  queueTimeout?: number;    // ms before expanding search
}

export interface MatchResult {
  player1Id: string;
  player2Id: string;
  soundId: string;
  tasteSimilarity: number;
  influenceGap: number;
}

// =============================================================================
// Default Options
// =============================================================================

const DEFAULT_OPTIONS: Required<MatchmakingOptions> = {
  mode: 'balanced',
  influenceRange: 30,
  queueTimeout: 30_000,
};

// =============================================================================
// Join Matchmaking Queue
// =============================================================================

export async function joinQueue(
  playerId: string,
  options: MatchmakingOptions = {}
): Promise<{ queueId: string; position: number }> {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    throw new Error('Player not found');
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Calculate influence range
  const influence = player.influenceScore;
  const range = (opts.influenceRange / 100) * Math.max(influence, 100);
  const minInfluence = Math.max(0, influence - range);
  const maxInfluence = influence + range;

  // Remove any existing queue entry
  await prisma.matchmakingQueue.deleteMany({
    where: { playerId },
  });

  // Add to queue
  const queueEntry = await prisma.matchmakingQueue.create({
    data: {
      playerId,
      minInfluence,
      maxInfluence,
      expiresAt: new Date(Date.now() + opts.queueTimeout),
    },
  });

  // Get queue position
  const position = await prisma.matchmakingQueue.count({
    where: {
      joinedAt: { lte: queueEntry.joinedAt },
    },
  });

  return {
    queueId: queueEntry.id,
    position,
  };
}

// =============================================================================
// Leave Matchmaking Queue
// =============================================================================

export async function leaveQueue(playerId: string): Promise<void> {
  await prisma.matchmakingQueue.deleteMany({
    where: { playerId },
  });
}

// =============================================================================
// Find Match
// =============================================================================

export async function findMatch(
  playerId: string,
  options: MatchmakingOptions = {}
): Promise<MatchResult | null> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Get player with profile
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { pulseProfile: true },
  });

  if (!player) {
    throw new Error('Player not found');
  }

  // Get queue entry
  const queueEntry = await prisma.matchmakingQueue.findUnique({
    where: { playerId },
  });

  if (!queueEntry) {
    throw new Error('Player is not in queue');
  }

  // Find potential opponents in queue
  const candidates = await prisma.matchmakingQueue.findMany({
    where: {
      playerId: { not: playerId },
      minInfluence: { lte: player.influenceScore + 50 },
      maxInfluence: { gte: player.influenceScore - 50 },
      expiresAt: { gt: new Date() },
    },
    include: {
      // We need to join with Player, but Prisma doesn't have direct relation
      // So we'll fetch players separately
    },
    orderBy: { joinedAt: 'asc' },
    take: 20,
  });

  if (candidates.length === 0) {
    return null;
  }

  // Get player data for candidates
  const candidatePlayers = await prisma.player.findMany({
    where: {
      id: { in: candidates.map(c => c.playerId) },
    },
    include: { pulseProfile: true },
  });

  // Build taste vectors for matching
  const playerVector: TasteVector = player.pulseProfile
    ? {
        energy: player.pulseProfile.energy,
        experimentalism: player.pulseProfile.experimentalism,
        culturalAlignment: player.pulseProfile.culturalAlignment,
        temporalTiming: player.pulseProfile.temporalTiming,
        emotionalIntensity: player.pulseProfile.emotionalIntensity,
        rhythmComplexity: player.pulseProfile.rhythmComplexity,
        productionPolish: player.pulseProfile.productionPolish,
        vocalsPreference: player.pulseProfile.vocalsPreference,
        genreFluidity: player.pulseProfile.genreFluidity,
        nostalgia: player.pulseProfile.nostalgia,
      }
    : {
        energy: 50, experimentalism: 50, culturalAlignment: 50,
        temporalTiming: 50, emotionalIntensity: 50, rhythmComplexity: 50,
        productionPolish: 50, vocalsPreference: 50, genreFluidity: 50,
        nostalgia: 50,
      };

  const candidateVectors = candidatePlayers.map(cp => ({
    playerId: cp.id,
    vector: cp.pulseProfile
      ? {
          energy: cp.pulseProfile.energy,
          experimentalism: cp.pulseProfile.experimentalism,
          culturalAlignment: cp.pulseProfile.culturalAlignment,
          temporalTiming: cp.pulseProfile.temporalTiming,
          emotionalIntensity: cp.pulseProfile.emotionalIntensity,
          rhythmComplexity: cp.pulseProfile.rhythmComplexity,
          productionPolish: cp.pulseProfile.productionPolish,
          vocalsPreference: cp.pulseProfile.vocalsPreference,
          genreFluidity: cp.pulseProfile.genreFluidity,
          nostalgia: cp.pulseProfile.nostalgia,
        }
      : {
          energy: 50, experimentalism: 50, culturalAlignment: 50,
          temporalTiming: 50, emotionalIntensity: 50, rhythmComplexity: 50,
          productionPolish: 50, vocalsPreference: 50, genreFluidity: 50,
          nostalgia: 50,
        },
  }));

  // Find best match based on mode
  const matches = findTasteMatches(playerVector, candidateVectors, {
    mode: opts.mode,
    limit: 1,
  });

  if (matches.length === 0) {
    return null;
  }

  const opponent = candidatePlayers.find(p => p.id === matches[0].playerId);
  if (!opponent) {
    return null;
  }

  // Select a random sound for the battle
  const sound = await prisma.sound.findFirst({
    where: {
      remixes: { some: {} }, // Has at least one remix
    },
    orderBy: {
      viralScore: 'desc',
    },
  });

  if (!sound) {
    throw new Error('No sounds available for battle');
  }

  // Remove both players from queue
  await prisma.matchmakingQueue.deleteMany({
    where: {
      playerId: { in: [playerId, opponent.id] },
    },
  });

  return {
    player1Id: playerId,
    player2Id: opponent.id,
    soundId: sound.id,
    tasteSimilarity: matches[0].similarity,
    influenceGap: Math.abs(player.influenceScore - opponent.influenceScore),
  };
}

// =============================================================================
// Process Matchmaking Queue (Background Job)
// =============================================================================

export async function processMatchmakingQueue(): Promise<MatchResult[]> {
  const results: MatchResult[] = [];

  // Get all players in queue
  const queueEntries = await prisma.matchmakingQueue.findMany({
    where: {
      expiresAt: { gt: new Date() },
    },
    orderBy: { joinedAt: 'asc' },
  });

  // Track matched players
  const matchedPlayerIds = new Set<string>();

  for (const entry of queueEntries) {
    if (matchedPlayerIds.has(entry.playerId)) {
      continue;
    }

    try {
      const match = await findMatch(entry.playerId);
      if (match) {
        results.push(match);
        matchedPlayerIds.add(match.player1Id);
        matchedPlayerIds.add(match.player2Id);
      }
    } catch {
      // Skip this player if matching fails
      continue;
    }
  }

  // Clean up expired entries
  await prisma.matchmakingQueue.deleteMany({
    where: {
      expiresAt: { lte: new Date() },
    },
  });

  return results;
}

// =============================================================================
// Get Queue Status
// =============================================================================

export async function getQueueStatus(playerId: string) {
  const entry = await prisma.matchmakingQueue.findUnique({
    where: { playerId },
  });

  if (!entry) {
    return { inQueue: false };
  }

  const position = await prisma.matchmakingQueue.count({
    where: {
      joinedAt: { lte: entry.joinedAt },
    },
  });

  const totalInQueue = await prisma.matchmakingQueue.count({
    where: {
      expiresAt: { gt: new Date() },
    },
  });

  return {
    inQueue: true,
    position,
    totalInQueue,
    expiresAt: entry.expiresAt,
    waitTimeMs: Date.now() - entry.joinedAt.getTime(),
  };
}
