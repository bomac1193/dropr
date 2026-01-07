/**
 * Sound Remixes API Routes
 *
 * GET /api/sounds/:id/remixes - Get remixes for a sound
 * POST /api/sounds/:id/remixes - Generate new remixes
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateAllRemixes, RemixGenre } from '@/lib/audio';

// =============================================================================
// GET /api/sounds/:id/remixes - Get Remixes
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: soundId } = await params;

    const sound = await prisma.sound.findUnique({
      where: { id: soundId },
      include: { remixes: true },
    });

    if (!sound) {
      return NextResponse.json(
        { success: false, error: 'Sound not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sound.remixes,
    });
  } catch (error) {
    console.error('Get remixes error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get remixes' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/sounds/:id/remixes - Generate Remixes
// =============================================================================

const GenerateRemixesSchema = z.object({
  genres: z.array(z.enum([
    'TRAP', 'HOUSE', 'DUBSTEP', 'PHONK',
    'DRILL', 'HYPERPOP', 'JERSEY_CLUB', 'AMBIENT',
  ])).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: soundId } = await params;
    const body = await request.json();
    const data = GenerateRemixesSchema.parse(body);

    const sound = await prisma.sound.findUnique({
      where: { id: soundId },
    });

    if (!sound) {
      return NextResponse.json(
        { success: false, error: 'Sound not found' },
        { status: 404 }
      );
    }

    // Generate remixes
    const genres = (data.genres || ['TRAP', 'HOUSE', 'DUBSTEP', 'PHONK']) as RemixGenre[];
    const generatedRemixes = await generateAllRemixes(
      sound.name,
      sound.description || undefined,
      genres
    );

    // Save remixes to database
    const remixes = await Promise.all(
      generatedRemixes.map(async (remix) => {
        // Check if remix for this genre already exists
        const existing = await prisma.remix.findUnique({
          where: {
            soundId_genre: {
              soundId,
              genre: remix.genre,
            },
          },
        });

        if (existing) {
          // Update existing
          return prisma.remix.update({
            where: { id: existing.id },
            data: {
              audioUrl: remix.audioUrl,
              name: remix.name,
              description: remix.description,
              generatedBy: remix.generatedBy,
              prompt: remix.prompt,
            },
          });
        }

        // Create new
        return prisma.remix.create({
          data: {
            soundId,
            genre: remix.genre,
            name: remix.name,
            description: remix.description,
            audioUrl: remix.audioUrl,
            duration: remix.duration,
            generatedBy: remix.generatedBy,
            prompt: remix.prompt,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      data: remixes,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Generate remixes error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate remixes' },
      { status: 500 }
    );
  }
}
