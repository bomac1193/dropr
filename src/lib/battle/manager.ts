/**
 * Battle Manager
 *
 * Core battle logic for DROPR music battles.
 * Handles battle lifecycle, voting, and result computation.
 */

import { prisma } from '@/lib/prisma';
import { computePulseProfile, BattleDecision } from '@/lib/pulse';

// =============================================================================
// Types
// =============================================================================

export interface CreateBattleInput {
  player1Id: string;
  player2Id: string;
  soundId: string;
  scene?: string;
}

export interface BattleResult {
  battleId: string;
  winnerId: string | null;
  player1Votes: number;
  player2Votes: number;
  crowdEnergy: number;
  player1HypeEarned: number;
  player2HypeEarned: number;
}

// =============================================================================
// Battle Timing Constants
// =============================================================================

export const BATTLE_TIMING = {
  SELECTING_DURATION_MS: 10_000,    // 10 seconds to select remix
  PLAYING_DURATION_MS: 15_000,      // 15 seconds per remix playback
  VOTING_DURATION_MS: 15_000,       // 15 seconds to vote
} as const;

// =============================================================================
// Create Battle
// =============================================================================

export async function createBattle(input: CreateBattleInput) {
  const now = new Date();
  const selectingEndsAt = new Date(now.getTime() + BATTLE_TIMING.SELECTING_DURATION_MS);

  const battle = await prisma.battle.create({
    data: {
      player1Id: input.player1Id,
      player2Id: input.player2Id,
      soundId: input.soundId,
      scene: input.scene || 'warehouse_rave',
      status: 'SELECTING',
      selectingEndsAt,
    },
    include: {
      player1: true,
      player2: true,
      sound: {
        include: {
          remixes: true,
        },
      },
    },
  });

  // Increment sound use count
  await prisma.sound.update({
    where: { id: input.soundId },
    data: { useCount: { increment: 1 } },
  });

  return battle;
}

// =============================================================================
// Select Remix
// =============================================================================

export async function selectRemix(
  battleId: string,
  playerId: string,
  remixId: string
) {
  // Verify battle is in SELECTING state
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: { remixSelections: true },
  });

  if (!battle) {
    throw new Error('Battle not found');
  }

  if (battle.status !== 'SELECTING') {
    throw new Error('Battle is not in selection phase');
  }

  if (battle.player1Id !== playerId && battle.player2Id !== playerId) {
    throw new Error('Player is not part of this battle');
  }

  // Check if already selected
  const existingSelection = battle.remixSelections.find(s => s.playerId === playerId);
  if (existingSelection) {
    throw new Error('Player has already selected a remix');
  }

  // Create selection
  const selection = await prisma.remixSelection.create({
    data: {
      battleId,
      playerId,
      remixId,
    },
    include: {
      remix: true,
    },
  });

  // Increment remix select count
  await prisma.remix.update({
    where: { id: remixId },
    data: { selectCount: { increment: 1 } },
  });

  // Check if both players have selected
  const allSelections = await prisma.remixSelection.findMany({
    where: { battleId },
  });

  if (allSelections.length === 2) {
    // Advance to playing phase
    const playingEndsAt = new Date(
      Date.now() + BATTLE_TIMING.PLAYING_DURATION_MS * 2
    );

    await prisma.battle.update({
      where: { id: battleId },
      data: {
        status: 'PLAYING_P1',
        playingEndsAt,
      },
    });
  }

  return selection;
}

// =============================================================================
// Advance Battle State
// =============================================================================

export async function advanceBattleState(battleId: string) {
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
  });

  if (!battle) {
    throw new Error('Battle not found');
  }

  let newStatus: string;
  let updateData: Record<string, unknown> = {};

  switch (battle.status) {
    case 'PLAYING_P1':
      newStatus = 'PLAYING_P2';
      break;

    case 'PLAYING_P2':
      newStatus = 'VOTING';
      updateData.votingEndsAt = new Date(
        Date.now() + BATTLE_TIMING.VOTING_DURATION_MS
      );
      break;

    case 'VOTING':
      // Calculate results and complete
      return await completeBattle(battleId);

    default:
      throw new Error(`Cannot advance from status: ${battle.status}`);
  }

  return await prisma.battle.update({
    where: { id: battleId },
    data: {
      status: newStatus as 'PLAYING_P1' | 'PLAYING_P2' | 'VOTING',
      ...updateData,
    },
  });
}

// =============================================================================
// Cast Vote
// =============================================================================

export async function castVote(
  battleId: string,
  voterId: string,
  votedFor: 'PLAYER_1' | 'PLAYER_2',
  confidence: number = 50
) {
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
  });

  if (!battle) {
    throw new Error('Battle not found');
  }

  if (battle.status !== 'VOTING') {
    throw new Error('Battle is not in voting phase');
  }

  // Players cannot vote in their own battle
  if (voterId === battle.player1Id || voterId === battle.player2Id) {
    throw new Error('Players cannot vote in their own battle');
  }

  const vote = await prisma.vote.create({
    data: {
      battleId,
      voterId,
      votedFor,
      confidence: Math.max(0, Math.min(100, confidence)),
    },
  });

  return vote;
}

// =============================================================================
// Complete Battle
// =============================================================================

export async function completeBattle(battleId: string): Promise<BattleResult> {
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: {
      votes: true,
      remixSelections: {
        include: { remix: true },
      },
      player1: { include: { pulseProfile: true } },
      player2: { include: { pulseProfile: true } },
    },
  });

  if (!battle) {
    throw new Error('Battle not found');
  }

  // Count votes
  const player1Votes = battle.votes.filter(v => v.votedFor === 'PLAYER_1').length;
  const player2Votes = battle.votes.filter(v => v.votedFor === 'PLAYER_2').length;
  const totalVotes = player1Votes + player2Votes;

  // Determine winner
  let winnerId: string | null = null;
  if (player1Votes > player2Votes) {
    winnerId = battle.player1Id;
  } else if (player2Votes > player1Votes) {
    winnerId = battle.player2Id;
  }
  // Tie = no winner

  // Calculate crowd energy (engagement metric)
  const crowdEnergy = Math.min(100, totalVotes * 10);

  // Calculate hype rewards
  const baseHype = 50;
  const winnerBonus = 100;
  const participationHype = 25;

  const player1HypeEarned = winnerId === battle.player1Id
    ? baseHype + winnerBonus + Math.floor(crowdEnergy / 2)
    : baseHype + participationHype;

  const player2HypeEarned = winnerId === battle.player2Id
    ? baseHype + winnerBonus + Math.floor(crowdEnergy / 2)
    : baseHype + participationHype;

  // Update battle with results
  await prisma.battle.update({
    where: { id: battleId },
    data: {
      status: 'COMPLETED',
      winnerId,
      player1Votes,
      player2Votes,
      crowdEnergy,
      completedAt: new Date(),
    },
  });

  // Update player stats
  await prisma.player.update({
    where: { id: battle.player1Id },
    data: {
      battleCount: { increment: 1 },
      winCount: winnerId === battle.player1Id ? { increment: 1 } : undefined,
      hypePoints: { increment: player1HypeEarned },
    },
  });

  await prisma.player.update({
    where: { id: battle.player2Id },
    data: {
      battleCount: { increment: 1 },
      winCount: winnerId === battle.player2Id ? { increment: 1 } : undefined,
      hypePoints: { increment: player2HypeEarned },
    },
  });

  // Update remix win stats
  for (const selection of battle.remixSelections) {
    const isWinner = selection.playerId === winnerId;
    await prisma.remix.update({
      where: { id: selection.remixId },
      data: {
        winCount: isWinner ? { increment: 1 } : undefined,
      },
    });
  }

  // Create taste stakes for both players
  for (const selection of battle.remixSelections) {
    const isWinner = selection.playerId === winnerId;
    const player = selection.playerId === battle.player1Id
      ? battle.player1
      : battle.player2;

    await prisma.tasteStake.create({
      data: {
        playerId: selection.playerId,
        battleId,
        influenceWeight: player.influenceScore / 100 + 1,
        chosenRemixGenre: selection.remix.genre,
        wasWinner: isWinner,
        predictionCorrect: isWinner,
      },
    });
  }

  // Update PULSE profiles
  await updatePlayerPulseProfile(battle.player1Id);
  await updatePlayerPulseProfile(battle.player2Id);

  return {
    battleId,
    winnerId,
    player1Votes,
    player2Votes,
    crowdEnergy,
    player1HypeEarned,
    player2HypeEarned,
  };
}

// =============================================================================
// Update Player PULSE Profile
// =============================================================================

async function updatePlayerPulseProfile(playerId: string) {
  // Get recent battle decisions
  const recentStakes = await prisma.tasteStake.findMany({
    where: { playerId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      battle: {
        include: {
          votes: true,
        },
      },
    },
  });

  const decisions: BattleDecision[] = recentStakes.map(stake => ({
    playerId,
    battleId: stake.battleId,
    soundId: stake.battle.soundId,
    selectedRemixGenre: stake.chosenRemixGenre,
    wasWinner: stake.wasWinner,
    crowdVoteMargin: stake.wasWinner
      ? Math.abs(stake.battle.player1Votes - stake.battle.player2Votes)
      : -Math.abs(stake.battle.player1Votes - stake.battle.player2Votes),
    timestamp: stake.createdAt,
  }));

  if (decisions.length === 0) {
    return;
  }

  // Get existing profile
  const existingProfile = await prisma.pulseProfile.findUnique({
    where: { playerId },
  });

  // Compute new profile
  const profile = computePulseProfile(decisions, existingProfile ? {
    archetype: existingProfile.archetype.toLowerCase() as 'trendsetter' | 'purist' | 'chaos_agent' | 'crowd_surfer' | 'architect' | 'mood_shifter',
    tasteVector: {
      energy: existingProfile.energy,
      experimentalism: existingProfile.experimentalism,
      culturalAlignment: existingProfile.culturalAlignment,
      temporalTiming: existingProfile.temporalTiming,
      emotionalIntensity: existingProfile.emotionalIntensity,
      rhythmComplexity: existingProfile.rhythmComplexity,
      productionPolish: existingProfile.productionPolish,
      vocalsPreference: existingProfile.vocalsPreference,
      genreFluidity: existingProfile.genreFluidity,
      nostalgia: existingProfile.nostalgia,
    },
    predictionAccuracy: existingProfile.predictionAccuracy,
    trendsetterScore: existingProfile.trendsetterScore,
    tasteCoherence: existingProfile.tasteCoherence,
    battlesSinceUpdate: existingProfile.battlesSinceUpdate,
  } : undefined);

  // Map archetype ID to enum value
  const archetypeEnumMap: Record<string, 'TRENDSETTER' | 'PURIST' | 'CHAOS_AGENT' | 'CROWD_SURFER' | 'ARCHITECT' | 'MOOD_SHIFTER'> = {
    trendsetter: 'TRENDSETTER',
    purist: 'PURIST',
    chaos_agent: 'CHAOS_AGENT',
    crowd_surfer: 'CROWD_SURFER',
    architect: 'ARCHITECT',
    mood_shifter: 'MOOD_SHIFTER',
  };

  // Upsert profile
  await prisma.pulseProfile.upsert({
    where: { playerId },
    create: {
      playerId,
      archetype: archetypeEnumMap[profile.archetype],
      energy: profile.tasteVector.energy,
      experimentalism: profile.tasteVector.experimentalism,
      culturalAlignment: profile.tasteVector.culturalAlignment,
      temporalTiming: profile.tasteVector.temporalTiming,
      emotionalIntensity: profile.tasteVector.emotionalIntensity,
      rhythmComplexity: profile.tasteVector.rhythmComplexity,
      productionPolish: profile.tasteVector.productionPolish,
      vocalsPreference: profile.tasteVector.vocalsPreference,
      genreFluidity: profile.tasteVector.genreFluidity,
      nostalgia: profile.tasteVector.nostalgia,
      predictionAccuracy: profile.predictionAccuracy,
      trendsetterScore: profile.trendsetterScore,
      tasteCoherence: profile.tasteCoherence,
      lastComputedAt: new Date(),
    },
    update: {
      archetype: archetypeEnumMap[profile.archetype],
      energy: profile.tasteVector.energy,
      experimentalism: profile.tasteVector.experimentalism,
      culturalAlignment: profile.tasteVector.culturalAlignment,
      temporalTiming: profile.tasteVector.temporalTiming,
      emotionalIntensity: profile.tasteVector.emotionalIntensity,
      rhythmComplexity: profile.tasteVector.rhythmComplexity,
      productionPolish: profile.tasteVector.productionPolish,
      vocalsPreference: profile.tasteVector.vocalsPreference,
      genreFluidity: profile.tasteVector.genreFluidity,
      nostalgia: profile.tasteVector.nostalgia,
      predictionAccuracy: profile.predictionAccuracy,
      trendsetterScore: profile.trendsetterScore,
      tasteCoherence: profile.tasteCoherence,
      battlesSinceUpdate: 0,
      lastComputedAt: new Date(),
    },
  });
}

// =============================================================================
// Get Active Battles
// =============================================================================

export async function getActiveBattles(limit: number = 10) {
  return await prisma.battle.findMany({
    where: {
      status: {
        in: ['SELECTING', 'PLAYING_P1', 'PLAYING_P2', 'VOTING'],
      },
    },
    include: {
      player1: true,
      player2: true,
      sound: true,
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// =============================================================================
// Get Battle by ID
// =============================================================================

export async function getBattle(battleId: string) {
  return await prisma.battle.findUnique({
    where: { id: battleId },
    include: {
      player1: { include: { pulseProfile: true } },
      player2: { include: { pulseProfile: true } },
      sound: { include: { remixes: true } },
      remixSelections: { include: { remix: true } },
      votes: true,
    },
  });
}
