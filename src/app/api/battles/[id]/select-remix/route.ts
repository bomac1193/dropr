/**
 * Select Remix API Route
 *
 * POST /api/battles/:id/select-remix - Player selects a remix
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { selectRemix } from '@/lib/battle';

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
