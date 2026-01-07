/**
 * Single Battle API Routes
 *
 * GET /api/battles/:id - Get battle details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBattle } from '@/lib/battle';

// =============================================================================
// GET /api/battles/:id - Get Battle Details
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const battle = await getBattle(id);

    if (!battle) {
      return NextResponse.json(
        { success: false, error: 'Battle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: battle,
    });
  } catch (error) {
    console.error('Get battle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get battle' },
      { status: 500 }
    );
  }
}
