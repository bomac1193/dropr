import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');

    // Build query
    const where: Record<string, unknown> = {};
    if (type) {
      where.contentType = type;
    }

    // Exclude content the user has already interacted with
    if (userId) {
      const interactedIds = await prisma.userContentInteraction.findMany({
        where: { userId },
        select: { contentId: true },
      });

      if (interactedIds.length > 0) {
        where.id = {
          notIn: interactedIds.map((i: { contentId: string }) => i.contentId),
        };
      }
    }

    const items = await prisma.contentItem.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        subculture: {
          select: {
            id: true,
            name: true,
            tags: true,
          },
        },
      },
    });

    const total = await prisma.contentItem.count({ where });

    return NextResponse.json({
      items,
      total,
      hasMore: offset + items.length < total,
    });
  } catch (error) {
    console.error('Content fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// Create new content (for seeding/admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type: contentType, title, description, thumbnailUrl, contentUrl, tags, subcultureId } = body;

    if (!contentType) {
      return NextResponse.json(
        { error: 'Content type is required' },
        { status: 400 }
      );
    }

    const item = await prisma.contentItem.create({
      data: {
        contentType,
        title,
        description,
        thumbnailUrl,
        contentUrl,
        tags: tags || [],
        subcultureId,
        featureEmbedding: [], // Would be computed by ML pipeline
      },
    });

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error('Content creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}
