import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processQuizResponses, QuizResponses } from '@/lib/quiz';
import { computeConstellationProfile } from '@/lib/scoring';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, responses } = body as { userId?: string; responses: QuizResponses };

    if (!responses || Object.keys(responses).length === 0) {
      return NextResponse.json(
        { error: 'No quiz responses provided' },
        { status: 400 }
      );
    }

    // Process quiz responses to get psychometric and aesthetic profiles
    const { psychometric, aesthetic, preliminaryConstellation } =
      processQuizResponses(responses);

    // Create or update user with profile data
    let user;
    if (userId) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new anonymous user
      user = await prisma.user.create({
        data: {},
      });
    }

    // Upsert psychometric profile
    await prisma.psychometricProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...psychometric,
      },
      update: psychometric,
    });

    // Upsert aesthetic preference
    await prisma.aestheticPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...aesthetic,
      },
      update: aesthetic,
    });

    // Compute constellation profile
    const { profile, result } = computeConstellationProfile(psychometric, aesthetic);

    // Upsert constellation profile
    await prisma.constellationProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        primaryConstellationId: profile.primaryConstellationId,
        blendWeights: profile.blendWeights,
        subtasteIndex: profile.subtasteIndex,
        explorerScore: profile.explorerScore,
        earlyAdopterScore: profile.earlyAdopterScore,
      },
      update: {
        primaryConstellationId: profile.primaryConstellationId,
        blendWeights: profile.blendWeights,
        subtasteIndex: profile.subtasteIndex,
        explorerScore: profile.explorerScore,
        earlyAdopterScore: profile.earlyAdopterScore,
      },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      preliminaryConstellation,
      result,
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process quiz' },
      { status: 500 }
    );
  }
}
