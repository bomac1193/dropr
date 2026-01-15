/**
 * Select Remix API Route
 *
 * POST /api/battles/:id/select-remix - Player selects a remix
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { selectRemix, getBattle } from '@/lib/battle';
import { emitRemixSelected, emitBattleStateChanged } from '@/lib/socket';

const SelectRemixSchema = z.object({
  playerId: z.string(),
  remixId: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: battleId } = await params;
    const body = await request.json();
    const data = SelectRemixSchema.parse(body);

    const selection = await selectRemix(battleId, data.playerId, data.remixId);

    // Get updated battle to check selection state
    const battle = await getBattle(battleId);
    const bothSelected = (battle?.remixSelections.length ?? 0) >= 2;

    // Emit remix selected event (non-blocking)
    emitRemixSelected({
      battleId,
      playerId: data.playerId,
      remixId: data.remixId,
      bothSelected,
    }).catch(() => {});

    // If both selected, emit state change to PLAYING_P1
    if (bothSelected && battle && battle.status === 'PLAYING_P1') {
      emitBattleStateChanged({
        battleId,
        previousStatus: 'SELECTING',
        newStatus: 'PLAYING_P1',
        playingEndsAt: battle.playingEndsAt?.toISOString(),
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: selection,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.error('Select remix error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to select remix' },
      { status: 500 }
    );
  }
}
