import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeConstellationProfile } from '@/lib/scoring';
import { UserInteractionsSummary } from '@/lib/types/models';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user with all profiles
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        psychometricProfile: true,
        aestheticPreference: true,
        constellationProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// Recompute constellation profile with latest interaction data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user profiles
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        psychometricProfile: true,
        aestheticPreference: true,
      },
    });

    if (!user || !user.psychometricProfile || !user.aestheticPreference) {
      return NextResponse.json(
        { error: 'User profile incomplete' },
        { status: 400 }
      );
    }

    // Aggregate interaction data
    const interactionsSummary = await aggregateInteractions(userId);

    // Recompute constellation profile
    const { psychometricProfile, aestheticPreference } = user;
    const { profile, result } = computeConstellationProfile(
      {
        openness: psychometricProfile.openness,
        conscientiousness: psychometricProfile.conscientiousness,
        extraversion: psychometricProfile.extraversion,
        agreeableness: psychometricProfile.agreeableness,
        neuroticism: psychometricProfile.neuroticism,
        noveltySeeking: psychometricProfile.noveltySeeking,
        aestheticSensitivity: psychometricProfile.aestheticSensitivity,
        riskTolerance: psychometricProfile.riskTolerance,
      },
      {
        colorPaletteVector: aestheticPreference.colorPaletteVector,
        darknessPreference: aestheticPreference.darknessPreference,
        complexityPreference: aestheticPreference.complexityPreference,
        symmetryPreference: aestheticPreference.symmetryPreference,
        organicVsSynthetic: aestheticPreference.organicVsSynthetic,
        minimalVsMaximal: aestheticPreference.minimalVsMaximal,
        tempoRangeMin: aestheticPreference.tempoRangeMin,
        tempoRangeMax: aestheticPreference.tempoRangeMax,
        energyRangeMin: aestheticPreference.energyRangeMin,
        energyRangeMax: aestheticPreference.energyRangeMax,
        harmonicDissonanceTolerance: aestheticPreference.harmonicDissonanceTolerance,
        rhythmPreference: aestheticPreference.rhythmPreference,
        acousticVsDigital: aestheticPreference.acousticVsDigital,
      },
      interactionsSummary
    );

    // Update constellation profile
    await prisma.constellationProfile.upsert({
      where: { userId },
      create: {
        userId,
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
      result,
    });
  } catch (error) {
    console.error('Profile recomputation error:', error);
    return NextResponse.json(
      { error: 'Failed to recompute profile' },
      { status: 500 }
    );
  }
}

// Type for interaction with content included
interface InteractionWithContent {
  id: string;
  userId: string;
  contentId: string;
  interactionType: string;
  rating: number | null;
  dwellTimeMs: number | null;
  source: string;
  createdAt: Date;
  content: {
    id: string;
    type: string;
    title: string | null;
    description: string | null;
    thumbnailUrl: string | null;
    contentUrl: string | null;
    featureEmbedding: number[];
    tags: string[];
    subcultureId: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Aggregate user interactions into summary statistics.
 * This is a simplified version - production would use more sophisticated aggregation.
 */
async function aggregateInteractions(userId: string): Promise<UserInteractionsSummary> {
  const interactions = (await prisma.userContentInteraction.findMany({
    where: { userId },
    include: {
      content: true,
    },
    orderBy: { createdAt: 'desc' },
  })) as InteractionWithContent[];

  if (interactions.length === 0) {
    return {
      dominantColors: [],
      preferredDarkness: 0.5,
      preferredComplexity: 0.5,
      preferredTempoRange: [80, 140],
      preferredEnergyRange: [0.3, 0.7],
      dominantMoods: [],
      favoriteTags: [],
      favoriteScenes: [],
      totalInteractions: 0,
      likeRatio: 0.5,
      avgDwellTimeMs: 0,
      contentDiversity: 0.5,
    };
  }

  // Count interaction types
  const likes = interactions.filter((i) =>
    ['like', 'save', 'share'].includes(i.interactionType)
  ).length;
  const likeRatio = likes / interactions.length;

  // Average dwell time
  const dwellTimes = interactions
    .map((i) => i.dwellTimeMs)
    .filter((t): t is number => t !== null);
  const avgDwellTimeMs =
    dwellTimes.length > 0
      ? dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length
      : 0;

  // Aggregate tags from liked content
  const likedContent = interactions
    .filter((i) => ['like', 'save'].includes(i.interactionType))
    .map((i) => i.content);

  const tagCounts: Record<string, number> = {};
  for (const content of likedContent) {
    for (const tag of content.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  const favoriteTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  // Content diversity: ratio of unique content types
  const uniqueTypes = new Set(interactions.map((i) => i.content.type));
  const uniqueSubcultures = new Set(
    interactions.map((i) => i.content.subcultureId).filter(Boolean)
  );
  const contentDiversity =
    (uniqueTypes.size / 3 + uniqueSubcultures.size / Math.max(interactions.length / 5, 1)) /
    2;

  return {
    dominantColors: [], // Would be extracted from content embeddings
    preferredDarkness: 0.5, // Would be computed from visual analysis
    preferredComplexity: 0.5, // Would be computed from visual analysis
    preferredTempoRange: [80, 140], // Would be computed from audio analysis
    preferredEnergyRange: [0.3, 0.7], // Would be computed from audio analysis
    dominantMoods: [], // Would be computed from content tagging
    favoriteTags,
    favoriteScenes: [], // Would be mapped from constellation config
    totalInteractions: interactions.length,
    likeRatio,
    avgDwellTimeMs,
    contentDiversity: Math.min(contentDiversity, 1),
  };
}
