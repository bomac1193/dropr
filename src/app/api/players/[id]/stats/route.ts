/**
 * Player Stats API Route
 *
 * GET /api/players/:id/stats - Get detailed player statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        pulseProfile: true,
        tasteStakes: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
        votes: {
          orderBy: { votedAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }

    // Calculate statistics
    const totalStakeValue = player.tasteStakes.reduce(
      (sum, stake) => sum + stake.appreciationValue,
      0
    );

    const winsFromStakes = player.tasteStakes.filter(s => s.wasWinner).length;
    const correctPredictions = player.tasteStakes.filter(s => s.predictionCorrect).length;

    // Genre breakdown
    const genreCounts: Record<string, number> = {};
    for (const stake of player.tasteStakes) {
      genreCounts[stake.chosenRemixGenre] = (genreCounts[stake.chosenRemixGenre] || 0) + 1;
    }

    // Find favorite genre
    let favoriteGenre = 'NONE';
    let maxCount = 0;
    for (const [genre, count] of Object.entries(genreCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteGenre = genre;
      }
    }

    // Recent battles (from taste stakes)
    const recentBattleIds = player.tasteStakes.slice(0, 10).map(s => s.battleId);
    const recentBattles = await prisma.battle.findMany({
      where: { id: { in: recentBattleIds } },
      include: {
        sound: true,
        player1: true,
        player2: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      playerId: player.id,
      robloxUserId: player.robloxUserId.toString(),
      username: player.username,

      // Core stats
      battleCount: player.battleCount,
      winCount: player.winCount,
      winRate: player.battleCount > 0 ? (player.winCount / player.battleCount) * 100 : 0,
      hypePoints: player.hypePoints,
      influenceScore: player.influenceScore,

      // Taste stakes
      totalTasteStakes: player.tasteStakes.length,
      totalStakeValue,
      correctPredictions,
      predictionAccuracy: player.tasteStakes.length > 0
        ? (correctPredictions / player.tasteStakes.length) * 100
        : 50,

      // PULSE profile
      pulseProfile: player.pulseProfile,

      // Preferences
      genreBreakdown: genreCounts,
      favoriteGenre,

      // Recent activity
      recentBattles: recentBattles.map(b => ({
        id: b.id,
        sound: b.sound.name,
        opponent: b.player1Id === player.id
          ? b.player2.username
          : b.player1.username,
        won: b.winnerId === player.id,
        createdAt: b.createdAt,
      })),

      // Voting activity
      votescast: player.votes.length,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get player stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get player stats' },
      { status: 500 }
    );
  }
}
