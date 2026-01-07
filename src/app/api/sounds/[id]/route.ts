/**
 * Single Sound API Routes
 *
 * GET /api/sounds/:id - Get sound details
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sound = await prisma.sound.findUnique({
      where: { id },
      include: {
        remixes: true,
        _count: {
          select: { battles: true },
        },
      },
    });

    if (!sound) {
      return NextResponse.json(
        { success: false, error: 'Sound not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sound,
    });
  } catch (error) {
    console.error('Get sound error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get sound' },
      { status: 500 }
    );
  }
}
