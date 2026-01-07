/**
 * Battle API Routes
 *
 * POST /api/battles - Create a new battle
 * GET /api/battles - Get active battles
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createBattle, getActiveBattles } from '@/lib/battle';

// =============================================================================
// Request Schemas
// =============================================================================

const CreateBattleSchema = z.object({
  player1Id: z.string(),
  player2Id: z.string(),
  soundId: z.string(),
  scene: z.string().optional(),
});

// =============================================================================
// POST /api/battles - Create Battle
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateBattleSchema.parse(body);

    const battle = await createBattle(data);

    return NextResponse.json({
      success: true,
      data: battle,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create battle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create battle' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/battles - Get Active Battles
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const battles = await getActiveBattles(limit);

    return NextResponse.json({
      success: true,
      data: battles,
    });
  } catch (error) {
    console.error('Get battles error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get battles' },
      { status: 500 }
    );
  }
}
