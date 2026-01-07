/**
 * PULSE Scoring System
 *
 * Computes archetype assignments and taste vectors based on battle history.
 */

import {
  TasteVector,
  PulseArchetypeId,
  BattleDecision,
  DEFAULT_TASTE_VECTOR,
  PulseProfile,
} from './types';
import { PULSE_ARCHETYPES, PulseArchetypeConfig } from './config';

// =============================================================================
// Genre to Taste Vector Mapping
// =============================================================================

const GENRE_TASTE_IMPACT: Record<string, Partial<TasteVector>> = {
  TRAP: {
    energy: 70,
    productionPolish: 65,
    culturalAlignment: 70,
    rhythmComplexity: 50,
  },
  HOUSE: {
    energy: 65,
    productionPolish: 75,
    rhythmComplexity: 60,
    vocalsPreference: 55,
  },
  DUBSTEP: {
    energy: 85,
    experimentalism: 60,
    productionPolish: 80,
    emotionalIntensity: 80,
    rhythmComplexity: 75,
  },
  PHONK: {
    energy: 75,
    culturalAlignment: 45,
    nostalgia: 70,
    emotionalIntensity: 70,
  },
  DRILL: {
    energy: 80,
    culturalAlignment: 50,
    emotionalIntensity: 85,
    vocalsPreference: 70,
  },
  HYPERPOP: {
    experimentalism: 90,
    energy: 85,
    genreFluidity: 95,
    productionPolish: 70,
    temporalTiming: 80,
  },
  JERSEY_CLUB: {
    energy: 90,
    rhythmComplexity: 85,
    culturalAlignment: 55,
    genreFluidity: 65,
  },
  AMBIENT: {
    energy: 20,
    emotionalIntensity: 40,
    productionPolish: 80,
    vocalsPreference: 20,
    rhythmComplexity: 40,
  },
};

// =============================================================================
// Update Taste Vector Based on Decision
// =============================================================================

/**
 * Updates a taste vector based on a battle decision.
 * Uses exponential moving average for smooth updates.
 */
export function updateTasteVector(
  currentVector: TasteVector,
  decision: BattleDecision,
  learningRate: number = 0.1
): TasteVector {
  const genreImpact = GENRE_TASTE_IMPACT[decision.selectedRemixGenre] || {};
  const updatedVector = { ...currentVector };

  for (const [key, targetValue] of Object.entries(genreImpact)) {
    const dimension = key as keyof TasteVector;
    const currentValue = currentVector[dimension];

    // Apply EMA update
    updatedVector[dimension] = currentValue + learningRate * (targetValue - currentValue);

    // Clamp to 0-100
    updatedVector[dimension] = Math.max(0, Math.min(100, updatedVector[dimension]));
  }

  // Winning affects temporal timing (winners might be trendsetters)
  if (decision.wasWinner && decision.crowdVoteMargin > 20) {
    // Significant wins push toward trendsetter behavior
    updatedVector.temporalTiming = updatedVector.temporalTiming - learningRate * 5;
    updatedVector.temporalTiming = Math.max(0, updatedVector.temporalTiming);
  }

  return updatedVector;
}

// =============================================================================
// Compute Archetype from Taste Vector
// =============================================================================

/**
 * Determines the best-matching archetype based on a taste vector.
 * Returns archetype ID and match score.
 */
export function computeArchetype(
  tasteVector: TasteVector
): { archetype: PulseArchetypeId; score: number; allScores: Record<PulseArchetypeId, number> } {
  const scores: Record<string, number> = {};

  for (const [archetypeId, config] of Object.entries(PULSE_ARCHETYPES)) {
    scores[archetypeId] = computeArchetypeMatchScore(tasteVector, config);
  }

  // Find best match
  let bestArchetype: PulseArchetypeId = 'crowd_surfer';
  let bestScore = 0;

  for (const [id, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestArchetype = id as PulseArchetypeId;
    }
  }

  return {
    archetype: bestArchetype,
    score: bestScore,
    allScores: scores as Record<PulseArchetypeId, number>,
  };
}

/**
 * Computes how well a taste vector matches an archetype's tendencies.
 */
function computeArchetypeMatchScore(
  tasteVector: TasteVector,
  archetype: PulseArchetypeConfig
): number {
  const tendencies = archetype.traitTendencies;
  let totalWeight = 0;
  let weightedScore = 0;

  for (const [key, targetValue] of Object.entries(tendencies)) {
    const dimension = key as keyof TasteVector;
    const actualValue = tasteVector[dimension];

    // Calculate similarity (closer = higher score)
    const distance = Math.abs(actualValue - targetValue);
    const similarity = Math.max(0, 100 - distance);

    // Weight by how extreme the archetype's tendency is
    const extremity = Math.abs(targetValue - 50);
    const weight = 1 + extremity / 50; // 1-2x weight

    weightedScore += similarity * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? weightedScore / totalWeight : 50;
}

// =============================================================================
// Compute Full PULSE Profile
// =============================================================================

/**
 * Computes a complete PULSE profile from battle history.
 */
export function computePulseProfile(
  decisions: BattleDecision[],
  existingProfile?: Partial<PulseProfile>
): PulseProfile {
  // Start with existing or default taste vector
  let tasteVector = existingProfile?.tasteVector || { ...DEFAULT_TASTE_VECTOR };

  // Update taste vector with each decision
  for (const decision of decisions) {
    tasteVector = updateTasteVector(tasteVector, decision);
  }

  // Compute archetype
  const { archetype, score } = computeArchetype(tasteVector);

  // Compute derived scores
  const wins = decisions.filter(d => d.wasWinner);
  const predictionAccuracy = decisions.length > 0
    ? (wins.length / decisions.length) * 100
    : 50;

  // Trendsetter score: based on how early they picked sounds that later won big
  const earlyWins = wins.filter(d => d.crowdVoteMargin > 30);
  const trendsetterScore = Math.min(100, 50 + earlyWins.length * 5);

  // Taste coherence: how consistent are their genre choices?
  const genreCounts: Record<string, number> = {};
  for (const d of decisions) {
    genreCounts[d.selectedRemixGenre] = (genreCounts[d.selectedRemixGenre] || 0) + 1;
  }
  const maxGenreCount = Math.max(...Object.values(genreCounts), 1);
  const tasteCoherence = (maxGenreCount / Math.max(decisions.length, 1)) * 100;

  return {
    archetype,
    tasteVector,
    predictionAccuracy,
    trendsetterScore,
    tasteCoherence,
    battlesSinceUpdate: 0,
  };
}

// =============================================================================
// Match Players by Taste Similarity
// =============================================================================

/**
 * Computes taste similarity between two players.
 * Returns 0-100 score (higher = more similar).
 */
export function computeTasteSimilarity(
  vector1: TasteVector,
  vector2: TasteVector
): number {
  let totalDistance = 0;
  let dimensions = 0;

  for (const key of Object.keys(DEFAULT_TASTE_VECTOR)) {
    const dimension = key as keyof TasteVector;
    const distance = Math.abs(vector1[dimension] - vector2[dimension]);
    totalDistance += distance;
    dimensions++;
  }

  const avgDistance = totalDistance / dimensions;
  return Math.max(0, 100 - avgDistance);
}

/**
 * Finds players with similar (or opposite) taste for matchmaking.
 */
export function findTasteMatches(
  targetVector: TasteVector,
  candidates: Array<{ playerId: string; vector: TasteVector }>,
  options: {
    mode: 'similar' | 'opposite' | 'balanced';
    limit?: number;
  } = { mode: 'balanced', limit: 10 }
): Array<{ playerId: string; similarity: number }> {
  const scored = candidates.map(c => ({
    playerId: c.playerId,
    similarity: computeTasteSimilarity(targetVector, c.vector),
  }));

  // Sort based on mode
  if (options.mode === 'similar') {
    scored.sort((a, b) => b.similarity - a.similarity);
  } else if (options.mode === 'opposite') {
    scored.sort((a, b) => a.similarity - b.similarity);
  } else {
    // Balanced: prefer middle-ground similarity (40-60)
    scored.sort((a, b) => {
      const distA = Math.abs(a.similarity - 50);
      const distB = Math.abs(b.similarity - 50);
      return distA - distB;
    });
  }

  return scored.slice(0, options.limit);
}
