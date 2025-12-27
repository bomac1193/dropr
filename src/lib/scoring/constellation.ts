/**
 * Constellation Computation
 *
 * Maps psychometric traits, aesthetic preferences, and behavioral data
 * to constellation profiles. This is the core algorithm that creates
 * the unified taste vector per user.
 *
 * HEURISTIC IMPLEMENTATION: This is a rule-based approach designed to be
 * replaced with ML/embedding-based computation later. Clear comments mark
 * where learned models would plug in.
 */

import {
  PsychometricProfile,
  AestheticPreference,
  UserInteractionsSummary,
  ConstellationProfile,
} from '../types/models';
import {
  FullResult,
  ResultSummary,
  ResultDetails,
  ConstellationExplanation,
  TraitValues,
} from '../types/results';
import {
  ConstellationId,
  ConstellationsConfigMap,
  ConstellationConfig,
  TraitProfile,
  CONSTELLATION_IDS,
} from '../constellations/types';
import { constellationsConfig, getConstellationById } from '../constellations/config';
import { clamp, normalizeWeights, entropy } from '../utils';

// =============================================================================
// Types
// =============================================================================

interface ConstellationScore {
  id: ConstellationId;
  traitScore: number;      // 0-1, how well traits match
  aestheticScore: number;  // 0-1, how well aesthetics match
  behavioralScore: number; // 0-1, how well behavior patterns match
  combinedScore: number;   // 0-1, weighted combination
}

interface ComputedProfile {
  profile: Omit<ConstellationProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
  explanation: ConstellationExplanation;
  result: FullResult;
}

// =============================================================================
// Main Computation Function
// =============================================================================

/**
 * Compute constellation profile from psychometric, aesthetic, and behavioral data.
 *
 * @param psychometric - User's psychometric profile (Big Five + extended traits)
 * @param aesthetic - User's aesthetic preferences (visual + music)
 * @param interactionsSummary - Aggregated behavioral data (optional for initial computation)
 * @param config - Constellation configuration map
 * @returns Computed profile with explanation and full result for UI
 */
export function computeConstellationProfile(
  psychometric: Omit<PsychometricProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  aesthetic: Omit<AestheticPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  interactionsSummary?: UserInteractionsSummary,
  config: ConstellationsConfigMap = constellationsConfig
): ComputedProfile {
  // Step 1: Compute scores for each constellation
  const scores = computeAllConstellationScores(psychometric, aesthetic, interactionsSummary, config);

  // Step 2: Normalize scores to blend weights
  const blendWeights = computeBlendWeights(scores);

  // Step 3: Determine primary constellation
  const primaryConstellationId = scores.reduce((a, b) =>
    a.combinedScore > b.combinedScore ? a : b
  ).id;

  // Step 4: Compute derived scores
  const subtasteIndex = computeSubtasteIndex(blendWeights);
  const explorerScore = computeExplorerScore(psychometric, interactionsSummary);
  const earlyAdopterScore = computeEarlyAdopterScore(psychometric, interactionsSummary);

  // Step 5: Build explanation
  const explanation = buildExplanation(
    primaryConstellationId,
    scores,
    psychometric,
    aesthetic,
    interactionsSummary,
    config
  );

  // Step 6: Build full result for UI
  const result = buildFullResult(
    primaryConstellationId,
    blendWeights,
    { subtasteIndex, explorerScore, earlyAdopterScore },
    psychometric,
    aesthetic,
    explanation,
    config
  );

  return {
    profile: {
      primaryConstellationId,
      blendWeights,
      subtasteIndex,
      explorerScore,
      earlyAdopterScore,
    },
    explanation,
    result,
  };
}

// =============================================================================
// Scoring Functions
// =============================================================================

function computeAllConstellationScores(
  psychometric: Omit<PsychometricProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  aesthetic: Omit<AestheticPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  interactionsSummary: UserInteractionsSummary | undefined,
  config: ConstellationsConfigMap
): ConstellationScore[] {
  return CONSTELLATION_IDS.map((id) => {
    const constellation = config[id];

    const traitScore = computeTraitSimilarity(psychometric, constellation.traitProfile);
    const aestheticScore = computeAestheticSimilarity(aesthetic, constellation);
    const behavioralScore = interactionsSummary
      ? computeBehavioralSimilarity(interactionsSummary, constellation)
      : 0.5; // Neutral score if no behavioral data

    // Weights for combining scores
    // TODO: These weights should be learned from user feedback
    const TRAIT_WEIGHT = 0.4;
    const AESTHETIC_WEIGHT = 0.35;
    const BEHAVIORAL_WEIGHT = 0.25;

    const combinedScore =
      traitScore * TRAIT_WEIGHT +
      aestheticScore * AESTHETIC_WEIGHT +
      behavioralScore * BEHAVIORAL_WEIGHT;

    return {
      id,
      traitScore,
      aestheticScore,
      behavioralScore,
      combinedScore,
    };
  });
}

/**
 * Compute how well a user's traits match a constellation's trait profile.
 *
 * For each trait, we check if the user's value falls within the constellation's
 * acceptable range. If yes, score is 1.0. If close, score decreases linearly.
 *
 * TODO: Replace with learned embedding distance in ML version
 */
function computeTraitSimilarity(
  psychometric: Omit<PsychometricProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  traitProfile: TraitProfile
): number {
  const traitKeys = [
    'openness',
    'conscientiousness',
    'extraversion',
    'agreeableness',
    'neuroticism',
    'noveltySeeking',
    'aestheticSensitivity',
    'riskTolerance',
  ] as const;

  let totalScore = 0;

  for (const trait of traitKeys) {
    const userValue = psychometric[trait];
    const [min, max] = traitProfile[trait];

    // Calculate score based on distance from range
    let traitScore: number;
    if (userValue >= min && userValue <= max) {
      // Within range: perfect score
      traitScore = 1.0;
    } else if (userValue < min) {
      // Below range: score decreases with distance
      traitScore = Math.max(0, 1 - (min - userValue) * 2);
    } else {
      // Above range: score decreases with distance
      traitScore = Math.max(0, 1 - (userValue - max) * 2);
    }

    totalScore += traitScore;
  }

  return totalScore / traitKeys.length;
}

/**
 * Compute how well a user's aesthetic preferences match a constellation.
 *
 * Maps visual and music profile keywords to aesthetic preference values.
 *
 * TODO: Replace with cross-modal embedding similarity in ML version
 */
function computeAestheticSimilarity(
  aesthetic: Omit<AestheticPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  constellation: ConstellationConfig
): number {
  let score = 0;
  let factors = 0;

  // Visual profile matching
  const visualKeywords = constellation.visualProfile;

  // Dark keywords
  if (visualKeywords.some((k) => ['dark', 'noir', 'shadowy', 'moody', 'gothic'].includes(k))) {
    score += aesthetic.darknessPreference > 0.6 ? 1 : aesthetic.darknessPreference;
    factors++;
  } else if (visualKeywords.some((k) => ['bright', 'golden', 'warm-light', 'glowing'].includes(k))) {
    score += aesthetic.darknessPreference < 0.4 ? 1 : 1 - aesthetic.darknessPreference;
    factors++;
  }

  // Complexity keywords
  if (visualKeywords.some((k) => ['maximal', 'layered', 'complex', 'rich', 'baroque'].includes(k))) {
    score += aesthetic.complexityPreference > 0.6 ? 1 : aesthetic.complexityPreference;
    factors++;
  } else if (visualKeywords.some((k) => ['minimal', 'clean', 'sparse', 'simple'].includes(k))) {
    score += aesthetic.minimalVsMaximal < 0.4 ? 1 : 1 - aesthetic.minimalVsMaximal;
    factors++;
  }

  // Organic vs synthetic keywords
  if (visualKeywords.some((k) => ['organic', 'natural', 'earthy', 'botanical', 'verdant'].includes(k))) {
    score += aesthetic.organicVsSynthetic < 0.4 ? 1 : 1 - aesthetic.organicVsSynthetic;
    factors++;
  } else if (visualKeywords.some((k) => ['synthetic', 'chrome', 'holographic', 'digital', 'neon'].includes(k))) {
    score += aesthetic.organicVsSynthetic > 0.6 ? 1 : aesthetic.organicVsSynthetic;
    factors++;
  }

  // Music profile matching
  const musicKeywords = constellation.musicProfile;

  // Tempo
  if (musicKeywords.some((k) => ['slow', 'ambient', 'gentle', 'flowing'].includes(k))) {
    const prefersSlow = aesthetic.tempoRangeMax < 100;
    score += prefersSlow ? 1 : 0.5;
    factors++;
  } else if (musicKeywords.some((k) => ['fast', 'driving', 'energetic', 'high-energy'].includes(k))) {
    const prefersFast = aesthetic.tempoRangeMin > 120;
    score += prefersFast ? 1 : 0.5;
    factors++;
  }

  // Energy
  if (musicKeywords.some((k) => ['intense', 'powerful', 'explosive', 'maximalist'].includes(k))) {
    score += aesthetic.energyRangeMax > 0.7 ? 1 : aesthetic.energyRangeMax;
    factors++;
  } else if (musicKeywords.some((k) => ['subtle', 'gentle', 'soft', 'delicate'].includes(k))) {
    score += aesthetic.energyRangeMax < 0.5 ? 1 : 1 - aesthetic.energyRangeMax;
    factors++;
  }

  // Acoustic vs digital
  if (musicKeywords.some((k) => ['acoustic', 'organic', 'folk', 'natural'].includes(k))) {
    score += aesthetic.acousticVsDigital < 0.4 ? 1 : 1 - aesthetic.acousticVsDigital;
    factors++;
  } else if (musicKeywords.some((k) => ['electronic', 'synthetic', 'digital', 'processed'].includes(k))) {
    score += aesthetic.acousticVsDigital > 0.6 ? 1 : aesthetic.acousticVsDigital;
    factors++;
  }

  return factors > 0 ? score / factors : 0.5;
}

/**
 * Compute how well a user's behavior patterns match a constellation.
 *
 * Uses aggregated interaction data like favorite tags, dominant colors, etc.
 *
 * TODO: Replace with behavioral embedding similarity in ML version
 */
function computeBehavioralSimilarity(
  summary: UserInteractionsSummary,
  constellation: ConstellationConfig
): number {
  let score = 0;
  let factors = 0;

  // Check tag overlap with visual and music profiles
  const constellationTags = [
    ...constellation.visualProfile,
    ...constellation.musicProfile,
  ];

  const userTags = summary.favoriteTags.map((t) => t.tag.toLowerCase());

  const tagOverlap = constellationTags.filter((tag) =>
    userTags.some((ut) => ut.includes(tag) || tag.includes(ut))
  ).length;

  if (constellationTags.length > 0) {
    score += Math.min(tagOverlap / constellationTags.length, 1);
    factors++;
  }

  // Check mood alignment
  // TODO: Implement mood-to-constellation mapping

  // Check engagement pattern alignment
  // High diversity might indicate explorer/avant-garde types
  if (
    constellation.id === 'vantoryx' ||
    constellation.id === 'fluxeris' ||
    constellation.id === 'nexyra'
  ) {
    score += summary.contentDiversity > 0.7 ? 1 : summary.contentDiversity;
    factors++;
  }

  return factors > 0 ? score / factors : 0.5;
}

// =============================================================================
// Derived Score Computation
// =============================================================================

function computeBlendWeights(scores: ConstellationScore[]): { [K in ConstellationId]?: number } {
  // Convert scores to weights using softmax-like normalization
  const maxScore = Math.max(...scores.map((s) => s.combinedScore));
  const expScores = scores.map((s) => ({
    id: s.id,
    exp: Math.exp((s.combinedScore - maxScore) * 5), // Temperature parameter = 5
  }));

  const sumExp = expScores.reduce((sum, s) => sum + s.exp, 0);

  const weights: { [K in ConstellationId]?: number } = {};
  for (const s of expScores) {
    const weight = s.exp / sumExp;
    // Only include weights above threshold
    if (weight > 0.01) {
      weights[s.id] = Math.round(weight * 1000) / 1000; // 3 decimal places
    }
  }

  return weights;
}

/**
 * Subtaste Index: Measures coherence/distinctiveness of taste.
 *
 * High = very specific, consistent preferences (low entropy in blend weights)
 * Low = eclectic, broad preferences (high entropy in blend weights)
 */
function computeSubtasteIndex(blendWeights: { [K in ConstellationId]?: number }): number {
  const weights = Object.values(blendWeights);
  if (weights.length === 0) return 50;

  // Normalize weights
  const sum = weights.reduce((a, b) => a + b, 0);
  const normalized = weights.map((w) => w / sum);

  // Calculate entropy
  const ent = entropy(normalized);

  // Max entropy for comparison (uniform distribution over all constellations)
  const maxEntropy = Math.log2(CONSTELLATION_IDS.length);

  // Convert entropy to index (high entropy = low index)
  const entropyRatio = ent / maxEntropy;
  const subtasteIndex = (1 - entropyRatio) * 100;

  return Math.round(clamp(subtasteIndex, 0, 100));
}

/**
 * Explorer Score: How actively the user seeks new experiences.
 *
 * Derived from openness, noveltySeeking, and interaction diversity.
 */
function computeExplorerScore(
  psychometric: Omit<PsychometricProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  interactionsSummary?: UserInteractionsSummary
): number {
  let score =
    psychometric.openness * 0.35 +
    psychometric.noveltySeeking * 0.35 +
    psychometric.riskTolerance * 0.15 +
    (1 - psychometric.neuroticism) * 0.15;

  // Adjust based on behavioral diversity if available
  if (interactionsSummary) {
    score = score * 0.7 + interactionsSummary.contentDiversity * 0.3;
  }

  return Math.round(clamp(score * 100, 0, 100));
}

/**
 * Early Adopter Score: Tendency to adopt trends early.
 *
 * Placeholder heuristic based on traits. In production, would use
 * UserSubcultureFit timing analysis.
 */
function computeEarlyAdopterScore(
  psychometric: Omit<PsychometricProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  _interactionsSummary?: UserInteractionsSummary
): number {
  // Heuristic: early adopters are high in openness, novelty seeking, and risk tolerance
  const score =
    psychometric.openness * 0.3 +
    psychometric.noveltySeeking * 0.35 +
    psychometric.riskTolerance * 0.25 +
    psychometric.aestheticSensitivity * 0.1;

  // TODO: Incorporate actual subculture timing data from UserSubcultureFit
  // Early adopters would have early firstSeenAt relative to cluster emergence

  return Math.round(clamp(score * 100, 0, 100));
}

// =============================================================================
// Explanation Building
// =============================================================================

function buildExplanation(
  primaryId: ConstellationId,
  scores: ConstellationScore[],
  psychometric: Omit<PsychometricProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  aesthetic: Omit<AestheticPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  _interactionsSummary: UserInteractionsSummary | undefined,
  config: ConstellationsConfigMap
): ConstellationExplanation {
  const primary = config[primaryId];

  // Build score maps
  const traitSimilarityScores: { [K in ConstellationId]?: number } = {};
  const aestheticSimilarityScores: { [K in ConstellationId]?: number } = {};

  for (const score of scores) {
    traitSimilarityScores[score.id] = Math.round(score.traitScore * 100);
    aestheticSimilarityScores[score.id] = Math.round(score.aestheticScore * 100);
  }

  // Generate narratives
  const personalityNarrative = generatePersonalityNarrative(psychometric, primary);
  const aestheticNarrative = generateAestheticNarrative(aesthetic, primary);
  const subcultureNarrative = generateSubcultureNarrative(primaryId, scores, config);

  // Generate prompts
  const creativeHooks = generateCreativeHooks(primaryId, config);
  const contentPrompts = generateContentPrompts(primaryId, aesthetic, config);

  return {
    primaryRationale: `Based on your psychometric profile and aesthetic preferences, ${primary.displayName} is your closest match. ${primary.shortDescription}`,
    traitSimilarityScores,
    aestheticSimilarityScores,
    personalityNarrative,
    aestheticNarrative,
    subcultureNarrative,
    creativeHooks,
    contentPrompts,
  };
}

function generatePersonalityNarrative(
  psychometric: Omit<PsychometricProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  constellation: ConstellationConfig
): string {
  const traits: string[] = [];

  if (psychometric.openness > 0.7) traits.push('deeply curious');
  if (psychometric.aestheticSensitivity > 0.7) traits.push('highly attuned to beauty');
  if (psychometric.noveltySeeking > 0.7) traits.push('drawn to the new and unexplored');
  if (psychometric.extraversion < 0.4) traits.push('introspective and internally rich');
  if (psychometric.extraversion > 0.7) traits.push('energized by connection');

  const traitList = traits.length > 0 ? traits.join(', ') : 'balanced across dimensions';

  return `You are ${traitList}. This aligns with ${constellation.displayName}'s essence of ${constellation.visualProfile.slice(0, 2).join(' and ')} aesthetics.`;
}

function generateAestheticNarrative(
  aesthetic: Omit<AestheticPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  constellation: ConstellationConfig
): string {
  const visualTraits: string[] = [];
  const musicTraits: string[] = [];

  // Visual
  if (aesthetic.darknessPreference > 0.6) visualTraits.push('moody, dark visuals');
  else if (aesthetic.darknessPreference < 0.4) visualTraits.push('bright, luminous imagery');

  if (aesthetic.complexityPreference > 0.6) visualTraits.push('layered complexity');
  else if (aesthetic.minimalVsMaximal < 0.4) visualTraits.push('clean minimalism');

  if (aesthetic.organicVsSynthetic < 0.4) visualTraits.push('natural, organic forms');
  else if (aesthetic.organicVsSynthetic > 0.6) visualTraits.push('synthetic, artificial textures');

  // Music
  const avgTempo = (aesthetic.tempoRangeMin + aesthetic.tempoRangeMax) / 2;
  if (avgTempo < 90) musicTraits.push('slow, contemplative tempos');
  else if (avgTempo > 130) musicTraits.push('fast, driving rhythms');

  if (aesthetic.acousticVsDigital < 0.4) musicTraits.push('acoustic warmth');
  else if (aesthetic.acousticVsDigital > 0.6) musicTraits.push('electronic production');

  const visual = visualTraits.length > 0 ? visualTraits.join(', ') : 'balanced visual preferences';
  const music = musicTraits.length > 0 ? musicTraits.join(', ') : 'eclectic music taste';

  return `Your aesthetic DNA centers on ${visual}. Sonically, you gravitate toward ${music}. This maps to ${constellation.displayName}'s profile: ${constellation.musicProfile.slice(0, 3).join(', ')}.`;
}

function generateSubcultureNarrative(
  primaryId: ConstellationId,
  scores: ConstellationScore[],
  config: ConstellationsConfigMap
): string {
  // Get top 3 constellations
  const sorted = [...scores].sort((a, b) => b.combinedScore - a.combinedScore);
  const top3 = sorted.slice(0, 3);

  const names = top3.map((s) => config[s.id].displayName).join(', ');

  const primary = config[primaryId];

  return `Your taste constellation centers on ${primary.displayName}, with threads connecting to ${names}. You're likely to resonate with scenes like ${primary.exampleScenes[0].split(':')[0]}.`;
}

function generateCreativeHooks(
  primaryId: ConstellationId,
  config: ConstellationsConfigMap
): string[] {
  const primary = config[primaryId];

  return [
    `Design a ${primary.displayName}-inspired room`,
    `Create a ${primary.displayName} mood playlist`,
    `Generate ${primary.displayName} AI artwork: ${primary.visualProfile.slice(0, 2).join(', ')}`,
    `Style a ${primary.displayName} look for ${primary.exampleScenes[0].split(':')[0]}`,
  ];
}

function generateContentPrompts(
  primaryId: ConstellationId,
  aesthetic: Omit<AestheticPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  config: ConstellationsConfigMap
): string[] {
  const primary = config[primaryId];

  const prompts = [
    `Find more ${primary.visualProfile[0]} imagery`,
    `Discover ${primary.musicProfile[0]} music`,
  ];

  if (aesthetic.darknessPreference > 0.6) {
    prompts.push('Explore darker, moodier aesthetics');
  } else if (aesthetic.darknessPreference < 0.4) {
    prompts.push('Find more bright, luminous content');
  }

  prompts.push(`Explore ${primary.displayName}-adjacent constellations`);

  return prompts;
}

// =============================================================================
// Full Result Building
// =============================================================================

function buildFullResult(
  primaryId: ConstellationId,
  blendWeights: { [K in ConstellationId]?: number },
  keyScores: { subtasteIndex: number; explorerScore: number; earlyAdopterScore: number },
  psychometric: Omit<PsychometricProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  aesthetic: Omit<AestheticPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  explanation: ConstellationExplanation,
  config: ConstellationsConfigMap
): FullResult {
  const primary = config[primaryId];

  // Build summary
  const summary: ResultSummary = {
    primaryConstellationId: primaryId,
    primaryName: primary.displayName,
    tagline: primary.shortDescription,
    keyScores,
    topScenes: primary.exampleScenes.slice(0, 3),
  };

  // Build traits object
  const traits: TraitValues = {
    openness: psychometric.openness,
    conscientiousness: psychometric.conscientiousness,
    extraversion: psychometric.extraversion,
    agreeableness: psychometric.agreeableness,
    neuroticism: psychometric.neuroticism,
    noveltySeeking: psychometric.noveltySeeking,
    aestheticSensitivity: psychometric.aestheticSensitivity,
    riskTolerance: psychometric.riskTolerance,
  };

  // Build top constellations list
  const sortedWeights = Object.entries(blendWeights)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .slice(0, 5);

  const topConstellations = sortedWeights.map(([id, weight]) => {
    const constellation = config[id as ConstellationId];
    return {
      id: id as ConstellationId,
      name: constellation.displayName,
      affinityScore: Math.round((weight ?? 0) * 100),
      earlyAdopterScore: keyScores.earlyAdopterScore, // Same for now, could be constellation-specific
      summary: constellation.shortDescription.split('.')[0] + '.',
    };
  });

  // Build details
  const details: ResultDetails = {
    personality: {
      traits,
      narrative: explanation.personalityNarrative,
    },
    aesthetic: {
      visualSliders: {
        darkToBright: 1 - aesthetic.darknessPreference,
        minimalToMaximal: aesthetic.minimalVsMaximal,
        organicToSynthetic: aesthetic.organicVsSynthetic,
      },
      musicSliders: {
        slowToFast: clamp((aesthetic.tempoRangeMax - 60) / 140, 0, 1),
        softToIntense: aesthetic.energyRangeMax,
        acousticToDigital: aesthetic.acousticVsDigital,
      },
      narrative: explanation.aestheticNarrative,
    },
    subculture: {
      topConstellations,
      narrative: explanation.subcultureNarrative,
    },
    prompts: {
      creativeHooks: explanation.creativeHooks,
      contentPrompts: explanation.contentPrompts,
    },
  };

  return { summary, details };
}

export default computeConstellationProfile;
