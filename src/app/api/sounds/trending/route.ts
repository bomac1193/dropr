/**
 * Trending Sounds API Route
 *
 * GET /api/sounds/trending - Get trending sounds
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const period = searchParams.get('period') || '24h';

    // Calculate time window
    let since: Date;
    switch (period) {
      case '1h':
        since = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case '24h':
        since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    // Get sounds with battle counts in the time window
    const sounds = await prisma.sound.findMany({
      where: {
        battles: {
          some: {
            createdAt: { gte: since },
          },
        },
      },
      include: {
        remixes: true,
        _count: {
          select: { battles: true },
        },
      },
      orderBy: [
        { viralScore: 'desc' },
        { useCount: 'desc' },
      ],
      take: limit,
    });

    // Calculate trending score for each sound
    const trendingData = sounds.map(sound => {
      // Simple trending score: recent battles * viral score
      const recentBattles = sound._count.battles;
      const trendingScore = recentBattles * (sound.viralScore / 100 + 1);

      return {
        ...sound,
        trendingScore,
        recentBattles,
      };
    });

    // Sort by trending score
    trendingData.sort((a, b) => b.trendingScore - a.trendingScore);

    return NextResponse.json({
      success: true,
      data: trendingData,
      period,
    });
  } catch (error) {
    console.error('Get trending sounds error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get trending sounds' },
      { status: 500 }
    );
  }
}
