/**
 * Archetype Scoring
 *
 * Computes archetype assignments from psychometric and aesthetic profiles.
 * Direct scoring without going through constellations.
 */

import { ARCHETYPES, getArchetype } from './config';
import { ArchetypeId, ArchetypeProfile, ARCHETYPE_IDS } from './types';

// =============================================================================
// Types
// =============================================================================

export interface PsychometricInput {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  noveltySeeking: number;
  aestheticSensitivity: number;
  riskTolerance: number;
}

export interface AestheticInput {
  darknessPreference?: number;
  complexityPreference?: number;
  organicVsSynthetic?: number;
  tempoCenter?: number;
  energyCenter?: number;
}

export interface ScoringInput {
  psychometric: PsychometricInput;
  aesthetic?: AestheticInput;
  enneagramPrimary?: number;
  enneagramWing?: number;
}

// =============================================================================
// Scoring Functions
// =============================================================================

/**
 * Compute trait similarity score for an archetype
 * Returns 0-1 where 1 = perfect match
 */
function computeTraitSimilarity(
  traits: PsychometricInput,
  archetypeId: ArchetypeId
): number {
  const archetype = getArchetype(archetypeId);
  const profile = archetype.traitProfile;

  let totalScore = 0;
  let traitCount = 0;

  const traitMap: [keyof PsychometricInput, keyof typeof profile][] = [
    ['openness', 'openness'],
    ['conscientiousness', 'conscientiousness'],
    ['extraversion', 'extraversion'],
    ['agreeableness', 'agreeableness'],
    ['neuroticism', 'neuroticism'],
    ['noveltySeeking', 'noveltySeeking'],
    ['aestheticSensitivity', 'aestheticSensitivity'],
    ['riskTolerance', 'riskTolerance'],
  ];

  for (const [userTrait, archTrait] of traitMap) {
    const userValue = traits[userTrait];
    const [min, max] = profile[archTrait];

    // Score based on distance from range
    let score: number;
    if (userValue >= min && userValue <= max) {
      // Within range: perfect score
      score = 1.0;
    } else if (userValue < min) {
      // Below range: linear penalty
      score = Math.max(0, 1 - (min - userValue) * 2);
    } else {
      // Above range: linear penalty
      score = Math.max(0, 1 - (userValue - max) * 2);
    }

    // Weight aesthetic-related traits more heavily
    const weight = ['aestheticSensitivity', 'openness', 'noveltySeeking'].includes(userTrait)
      ? 1.5
      : 1.0;

    totalScore += score * weight;
    traitCount += weight;
  }

  return totalScore / traitCount;
}

/**
 * Compute Enneagram affinity bonus for an archetype
 */
function computeEnneagramBonus(
  enneagramPrimary: number | undefined,
  enneagramWing: number | undefined,
  archetypeId: ArchetypeId
): number {
  if (!enneagramPrimary) return 0;

  const archetype = getArchetype(archetypeId);
  const affinities = archetype.enneagramAffinities;

  let bonus = 0;

  // Primary type match
  if (affinities.primary.includes(enneagramPrimary as 1|2|3|4|5|6|7|8|9)) {
    bonus += 0.15;
  } else if (affinities.secondary.includes(enneagramPrimary as 1|2|3|4|5|6|7|8|9)) {
    bonus += 0.08;
  }

  // Wing match
  if (enneagramWing) {
    if (affinities.primary.includes(enneagramWing as 1|2|3|4|5|6|7|8|9)) {
      bonus += 0.05;
    } else if (affinities.secondary.includes(enneagramWing as 1|2|3|4|5|6|7|8|9)) {
      bonus += 0.02;
    }
  }

  return bonus;
}

/**
 * Compute scores for all archetypes
 */
export function computeArchetypeScores(input: ScoringInput): Record<ArchetypeId, number> {
  const scores: Partial<Record<ArchetypeId, number>> = {};

  for (const archetypeId of ARCHETYPE_IDS) {
    // Base trait similarity (0-1)
    let score = computeTraitSimilarity(input.psychometric, archetypeId);

    // Enneagram bonus (0-0.2)
    score += computeEnneagramBonus(
      input.enneagramPrimary,
      input.enneagramWing,
      archetypeId
    );

    scores[archetypeId] = Math.min(1, score);
  }

  return scores as Record<ArchetypeId, number>;
}

/**
 * Convert raw scores to blend weights using softmax
 */
function softmax(
  scores: Record<ArchetypeId, number>,
  temperature: number = 5
): Partial<Record<ArchetypeId, number>> {
  const entries = Object.entries(scores) as [ArchetypeId, number][];

  // Compute exp(score * temperature)
  const exps = entries.map(([id, score]) => ({
    id,
    exp: Math.exp(score * temperature),
  }));

  // Sum for normalization
  const sumExp = exps.reduce((sum, { exp }) => sum + exp, 0);

  // Normalize and filter small weights
  const weights: Partial<Record<ArchetypeId, number>> = {};
  for (const { id, exp } of exps) {
    const weight = exp / sumExp;
    if (weight >= 0.01) {
      weights[id] = weight;
    }
  }

  return weights;
}

/**
 * Compute derived scores
 */
function computeDerivedScores(input: ScoringInput): {
  subtasteIndex: number;
  explorerScore: number;
  earlyAdopterScore: number;
} {
  const { psychometric } = input;

  // Explorer score: openness + novelty + risk - neuroticism
  const explorerScore = Math.round(
    (psychometric.openness * 0.35 +
      psychometric.noveltySeeking * 0.35 +
      psychometric.riskTolerance * 0.15 +
      (1 - psychometric.neuroticism) * 0.15) *
      100
  );

  // Early adopter score
  const earlyAdopterScore = Math.round(
    (psychometric.openness * 0.3 +
      psychometric.noveltySeeking * 0.35 +
      psychometric.riskTolerance * 0.25 +
      psychometric.aestheticSensitivity * 0.1) *
      100
  );

  // Subtaste index will be computed from blend entropy
  // Placeholder for now
  const subtasteIndex = 50;

  return {
    subtasteIndex: Math.max(0, Math.min(100, subtasteIndex)),
    explorerScore: Math.max(0, Math.min(100, explorerScore)),
    earlyAdopterScore: Math.max(0, Math.min(100, earlyAdopterScore)),
  };
}

/**
 * Generate identity statement
 */
function generateIdentityStatement(
  primaryId: ArchetypeId,
  blendWeights: Partial<Record<ArchetypeId, number>>
): string {
  const primary = getArchetype(primaryId);

  // Get secondary influences
  const secondaries = Object.entries(blendWeights)
    .filter(([id, weight]) => id !== primaryId && (weight || 0) >= 0.15)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))
    .slice(0, 2)
    .map(([id]) => getArchetype(id as ArchetypeId));

  let statement = `You are ${primary.displayName}, ${primary.title}. ${primary.tagline}`;

  if (secondaries.length > 0) {
    const secondaryNames = secondaries.map((s) => s.displayName).join(' and ');
    statement += ` With undertones of ${secondaryNames}.`;
  }

  return statement;
}

/**
 * Compute subtaste index from blend entropy
 */
function computeSubtasteIndex(
  blendWeights: Partial<Record<ArchetypeId, number>>
): number {
  const weights = Object.values(blendWeights).filter((w) => w && w > 0) as number[];

  if (weights.length <= 1) return 100; // Completely coherent

  // Shannon entropy
  let entropy = 0;
  for (const w of weights) {
    if (w > 0) {
      entropy -= w * Math.log2(w);
    }
  }

  // Max entropy for 8 archetypes
  const maxEntropy = Math.log2(8);

  // Invert: low entropy = high subtaste index (coherent)
  const normalizedEntropy = entropy / maxEntropy;
  return Math.round((1 - normalizedEntropy) * 100);
}

// =============================================================================
// Main Scoring Function
// =============================================================================

/**
 * Compute complete archetype profile from input
 */
export function computeArchetypeProfile(input: ScoringInput): ArchetypeProfile {
  // Compute raw scores
  const scores = computeArchetypeScores(input);

  // Find primary archetype
  let primaryId: ArchetypeId = 'vespyr';
  let maxScore = 0;
  for (const [id, score] of Object.entries(scores) as [ArchetypeId, number][]) {
    if (score > maxScore) {
      maxScore = score;
      primaryId = id;
    }
  }

  // Compute blend weights
  const archetypeBlendWeights = softmax(scores);

  // Compute subtaste index from blend entropy
  const subtasteIndex = computeSubtasteIndex(archetypeBlendWeights);

  // Compute other derived scores
  const { explorerScore, earlyAdopterScore } = computeDerivedScores(input);

  // Generate identity statement
  const identityStatement = generateIdentityStatement(primaryId, archetypeBlendWeights);

  // Get shareable handle
  const primary = getArchetype(primaryId);

  return {
    primaryArchetypeId: primaryId,
    archetypeBlendWeights,
    subtasteIndex,
    explorerScore,
    earlyAdopterScore,
    identityStatement,
    shareableHandle: primary.shareableHandle,
  };
}

export default {
  computeArchetypeScores,
  computeArchetypeProfile,
};
