/**
 * Sounds API Routes
 *
 * GET /api/sounds - List sounds
 * POST /api/sounds - Create a new sound
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// =============================================================================
// Request Schemas
// =============================================================================

const CreateSoundSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  category: z.enum(['BRAIN_ROT', 'VIRAL', 'CLASSIC', 'RARE', 'SEASONAL']),
  rarity: z.enum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']).optional(),
  audioUrl: z.string().url(),
  duration: z.number(),
  bpm: z.number().optional(),
  key: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// =============================================================================
// GET /api/sounds - List Sounds
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');
    const limit = parseInt(searchParams.get('limit') || '20');
    const orderBy = searchParams.get('orderBy') || 'viralScore';

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (rarity) where.rarity = rarity;

    const sounds = await prisma.sound.findMany({
      where,
      include: {
        remixes: true,
        _count: {
          select: { battles: true },
        },
      },
      orderBy: { [orderBy]: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: sounds,
    });
  } catch (error) {
    console.error('Get sounds error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get sounds' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/sounds - Create Sound
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateSoundSchema.parse(body);

    const sound = await prisma.sound.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        rarity: data.rarity || 'COMMON',
        audioUrl: data.audioUrl,
        duration: data.duration,
        bpm: data.bpm,
        key: data.key,
        tags: data.tags || [],
      },
    });

    return NextResponse.json({
      success: true,
      data: sound,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create sound error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sound' },
      { status: 500 }
    );
  }
}
