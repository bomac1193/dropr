/**
 * Single Player API Routes
 *
 * GET /api/players/:id - Get player details
 * PATCH /api/players/:id - Update player
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// =============================================================================
// GET /api/players/:id - Get Player Details
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to find by ID or Roblox user ID
    let player = await prisma.player.findUnique({
      where: { id },
      include: {
        pulseProfile: true,
        tasteStakes: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    // If not found by ID, try Roblox user ID
    if (!player) {
      const robloxId = BigInt(id);
      player = await prisma.player.findUnique({
        where: { robloxUserId: robloxId },
        include: {
          pulseProfile: true,
          tasteStakes: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
    }

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }

    // Calculate win rate
    const winRate = player.battleCount > 0
      ? (player.winCount / player.battleCount) * 100
      : 0;

    // Convert BigInt to string
    const playerResponse = {
      ...player,
      robloxUserId: player.robloxUserId.toString(),
      winRate,
    };

    return NextResponse.json({
      success: true,
      data: playerResponse,
    });
  } catch (error) {
    console.error('Get player error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get player' },
      { status: 500 }
    );
  }
}

// =============================================================================
// PATCH /api/players/:id - Update Player
// =============================================================================

const UpdatePlayerSchema = z.object({
  displayName: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = UpdatePlayerSchema.parse(body);

    const player = await prisma.player.update({
      where: { id },
      data: {
        ...data,
        lastActiveAt: new Date(),
      },
      include: { pulseProfile: true },
    });

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

    console.error('Update player error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update player' },
      { status: 500 }
    );
  }
}
