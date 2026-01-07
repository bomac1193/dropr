/**
 * Players API Routes
 *
 * POST /api/players - Create or get player by Roblox ID
 * GET /api/players - List players (leaderboard)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// =============================================================================
// Request Schemas
// =============================================================================

const CreatePlayerSchema = z.object({
  robloxUserId: z.number(),
  username: z.string(),
  displayName: z.string().optional(),
  avatarUrl: z.string().optional(),
});

// =============================================================================
// POST /api/players - Create or Get Player
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreatePlayerSchema.parse(body);

    // Check if player exists
    let player = await prisma.player.findUnique({
      where: { robloxUserId: BigInt(data.robloxUserId) },
      include: { pulseProfile: true },
    });

    if (player) {
      // Update last active
      player = await prisma.player.update({
        where: { id: player.id },
        data: {
          lastActiveAt: new Date(),
          username: data.username,
          displayName: data.displayName,
          avatarUrl: data.avatarUrl,
        },
        include: { pulseProfile: true },
      });
    } else {
      // Create new player with default PULSE profile
      player = await prisma.player.create({
        data: {
          robloxUserId: BigInt(data.robloxUserId),
          username: data.username,
          displayName: data.displayName,
          avatarUrl: data.avatarUrl,
          pulseProfile: {
            create: {
              archetype: 'CROWD_SURFER',
            },
          },
        },
        include: { pulseProfile: true },
      });
    }

    // Convert BigInt to string for JSON serialization
    const playerResponse = {
      ...player,
      robloxUserId: player.robloxUserId.toString(),
    };

    return NextResponse.json({
      success: true,
      data: playerResponse,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create player error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create player' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/players - List Players
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const orderBy = searchParams.get('orderBy') || 'influenceScore';

    const players = await prisma.player.findMany({
      include: { pulseProfile: true },
      orderBy: { [orderBy]: 'desc' },
      take: limit,
    });

    // Convert BigInt to string
    const playersResponse = players.map(p => ({
      ...p,
      robloxUserId: p.robloxUserId.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: playersResponse,
    });
  } catch (error) {
    console.error('Get players error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get players' },
      { status: 500 }
    );
  }
}
