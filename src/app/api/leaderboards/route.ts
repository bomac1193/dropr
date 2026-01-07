/**
 * Leaderboards API Route
 *
 * GET /api/leaderboards - Get various leaderboards
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');

    const leaderboards: Record<string, unknown[]> = {};

    // Global Influence Leaderboard
    if (type === 'all' || type === 'influence') {
      const influenceLeaders = await prisma.player.findMany({
        orderBy: { influenceScore: 'desc' },
        take: limit,
        include: { pulseProfile: true },
      });

      leaderboards.influence = influenceLeaders.map((p, i) => ({
        rank: i + 1,
        playerId: p.id,
        username: p.username,
        robloxUserId: p.robloxUserId.toString(),
        score: p.influenceScore,
        archetype: p.pulseProfile?.archetype,
      }));
    }

    // Taste Makers (by prediction accuracy)
    if (type === 'all' || type === 'tastemakers') {
      const tasteMakers = await prisma.player.findMany({
        where: { battleCount: { gte: 10 } }, // Minimum 10 battles
        include: { pulseProfile: true },
        take: limit * 2, // Get more to filter
      });

      const scoredTasteMakers = tasteMakers
        .map(p => ({
          ...p,
          predictionAccuracy: p.pulseProfile?.predictionAccuracy || 50,
        }))
        .sort((a, b) => b.predictionAccuracy - a.predictionAccuracy)
        .slice(0, limit);

      leaderboards.tastemakers = scoredTasteMakers.map((p, i) => ({
        rank: i + 1,
        playerId: p.id,
        username: p.username,
        robloxUserId: p.robloxUserId.toString(),
        score: p.predictionAccuracy,
        archetype: p.pulseProfile?.archetype,
      }));
    }

    // Stakes Leaderboard (by total stake value)
    if (type === 'all' || type === 'stakes') {
      const stakePlayers = await prisma.player.findMany({
        orderBy: { totalTasteStakes: 'desc' },
        take: limit,
        include: { pulseProfile: true },
      });

      leaderboards.stakes = stakePlayers.map((p, i) => ({
        rank: i + 1,
        playerId: p.id,
        username: p.username,
        robloxUserId: p.robloxUserId.toString(),
        score: p.totalTasteStakes,
        archetype: p.pulseProfile?.archetype,
      }));
    }

    // Hype Leaderboard
    if (type === 'all' || type === 'hype') {
      const hypePlayers = await prisma.player.findMany({
        orderBy: { hypePoints: 'desc' },
        take: limit,
        include: { pulseProfile: true },
      });

      leaderboards.hype = hypePlayers.map((p, i) => ({
        rank: i + 1,
        playerId: p.id,
        username: p.username,
        robloxUserId: p.robloxUserId.toString(),
        score: p.hypePoints,
        archetype: p.pulseProfile?.archetype,
      }));
    }

    // Win Rate Leaderboard (minimum 10 battles)
    if (type === 'all' || type === 'winrate') {
      const winRatePlayers = await prisma.player.findMany({
        where: { battleCount: { gte: 10 } },
        take: limit * 2,
        include: { pulseProfile: true },
      });

      const scoredWinRate = winRatePlayers
        .map(p => ({
          ...p,
          winRate: p.battleCount > 0 ? (p.winCount / p.battleCount) * 100 : 0,
        }))
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, limit);

      leaderboards.winrate = scoredWinRate.map((p, i) => ({
        rank: i + 1,
        playerId: p.id,
        username: p.username,
        robloxUserId: p.robloxUserId.toString(),
        score: p.winRate,
        battles: p.battleCount,
        archetype: p.pulseProfile?.archetype,
      }));
    }

    return NextResponse.json({
      success: true,
      data: leaderboards,
    });
  } catch (error) {
    console.error('Get leaderboards error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get leaderboards' },
      { status: 500 }
    );
  }
}
