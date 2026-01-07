/**
 * Matchmaking API Routes
 *
 * POST /api/matchmaking/join - Join the matchmaking queue
 * POST /api/matchmaking/leave - Leave the matchmaking queue
 * GET /api/matchmaking/status - Get queue status
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { joinQueue, leaveQueue, getQueueStatus, findMatch } from '@/lib/battle';
import { createBattle } from '@/lib/battle';

// =============================================================================
// POST /api/matchmaking/join - Join Queue
// =============================================================================

const JoinQueueSchema = z.object({
  playerId: z.string(),
  mode: z.enum(['similar', 'opposite', 'balanced']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'join') {
      const data = JoinQueueSchema.parse(body);
      const result = await joinQueue(data.playerId, { mode: data.mode });

      // Immediately try to find a match
      const match = await findMatch(data.playerId);

      if (match) {
        // Create the battle
        const battle = await createBattle({
          player1Id: match.player1Id,
          player2Id: match.player2Id,
          soundId: match.soundId,
        });

        return NextResponse.json({
          success: true,
          data: {
            matched: true,
            battle,
            tasteSimilarity: match.tasteSimilarity,
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          matched: false,
          queueId: result.queueId,
          position: result.position,
        },
      });
    }

    if (action === 'leave') {
      const { playerId } = body;
      await leaveQueue(playerId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Matchmaking error:', error);
    return NextResponse.json(
      { success: false, error: 'Matchmaking failed' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/matchmaking/status - Get Queue Status
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: 'playerId required' },
        { status: 400 }
      );
    }

    const status = await getQueueStatus(playerId);

    // If in queue, try to find a match
    if (status.inQueue) {
      const match = await findMatch(playerId);

      if (match) {
        const battle = await createBattle({
          player1Id: match.player1Id,
          player2Id: match.player2Id,
          soundId: match.soundId,
        });

        return NextResponse.json({
          success: true,
          data: {
            ...status,
            matched: true,
            battle,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        matched: false,
      },
    });
  } catch (error) {
    console.error('Get queue status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get queue status' },
      { status: 500 }
    );
  }
}
