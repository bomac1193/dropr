/**
 * Vote API Route
 *
 * POST /api/battles/:id/vote - Cast a vote in a battle
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { castVote } from '@/lib/battle';

const VoteSchema = z.object({
  voterId: z.string(),
  votedFor: z.enum(['PLAYER_1', 'PLAYER_2']),
  confidence: z.number().min(0).max(100).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: battleId } = await params;
    const body = await request.json();
    const data = VoteSchema.parse(body);

    const vote = await castVote(
      battleId,
      data.voterId,
      data.votedFor,
      data.confidence
    );

    return NextResponse.json({
      success: true,
      data: vote,
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

    console.error('Vote error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cast vote' },
      { status: 500 }
    );
  }
}
