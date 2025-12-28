/**
 * Enneagram Scoring
 *
 * Computes Enneagram type assignments from quiz responses
 * and Big Five trait correlations.
 */

import {
  EnneagramType,
  EnneagramProfile,
  ENNEAGRAM_TYPES,
  BIG_FIVE_ENNEAGRAM_CORRELATIONS,
  computeTritype,
  getWings,
} from './types';
import { EnneagramQuestion, ENNEAGRAM_QUESTIONS } from './questions';

// =============================================================================
// Types
// =============================================================================

export interface BigFiveInput {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface EnneagramAnswer {
  questionId: string;
  value: number; // -1 to 1 for AB, 0 to 1 for multiple
}

export interface EnneagramScoringResult {
  profile: EnneagramProfile;
  rawScores: Record<EnneagramType, number>;
  bigFiveContribution: Record<EnneagramType, number>;
  questionContribution: Record<EnneagramType, number>;
  confidence: number;
}

// =============================================================================
// Big Five Bootstrap Scoring
// =============================================================================

/**
 * Estimate Enneagram scores from Big Five traits using correlation matrix.
 * Returns scores from 0-1 for each type.
 */
export function estimateFromBigFive(bigFive: BigFiveInput): Record<EnneagramType, number> {
  const scores: Partial<Record<EnneagramType, number>> = {};

  for (const type of ENNEAGRAM_TYPES) {
    const correlations = BIG_FIVE_ENNEAGRAM_CORRELATIONS[type];

    // Compute correlation-weighted score
    let score = 0.5; // Start at neutral

    // Each correlation shifts the score
    score += correlations.o * (bigFive.openness - 0.5);
    score += correlations.c * (bigFive.conscientiousness - 0.5);
    score += correlations.e * (bigFive.extraversion - 0.5);
    score += correlations.a * (bigFive.agreeableness - 0.5);
    score += correlations.n * (bigFive.neuroticism - 0.5);

    // Clamp to 0-1
    scores[type] = Math.max(0, Math.min(1, score));
  }

  return scores as Record<EnneagramType, number>;
}

// =============================================================================
// Question-Based Scoring
// =============================================================================

/**
 * Score Enneagram types from quiz answers.
 */
export function scoreFromAnswers(
  answers: EnneagramAnswer[]
): Record<EnneagramType, number> {
  const scores: Record<EnneagramType, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
  };
  const counts: Record<EnneagramType, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
  };

  // Build question lookup
  const questionMap = new Map<string, EnneagramQuestion>();
  for (const q of ENNEAGRAM_QUESTIONS) {
    questionMap.set(q.id, q);
  }

  // Process each answer
  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue;

    // Apply loadings based on answer value
    for (const [typeStr, loading] of Object.entries(question.enneagramLoadings)) {
      const type = parseInt(typeStr) as EnneagramType;

      // Normalize answer value to 0-1
      const normalizedValue = question.type === 'ab'
        ? (answer.value + 1) / 2  // -1 to 1 → 0 to 1
        : answer.value;           // Already 0 to 1

      // Contribution = loading * (value for positive loading, 1-value for negative)
      const contribution = loading > 0
        ? loading * normalizedValue
        : Math.abs(loading) * (1 - normalizedValue);

      scores[type] += contribution;
      counts[type] += Math.abs(loading);
    }
  }

  // Normalize by count
  for (const type of ENNEAGRAM_TYPES) {
    if (counts[type] > 0) {
      scores[type] /= counts[type];
    } else {
      scores[type] = 0.5; // Default to neutral
    }
  }

  return scores;
}

// =============================================================================
// Combined Scoring
// =============================================================================

/**
 * Combine Big Five and question-based scores.
 * Big Five provides a bootstrap, questions refine.
 */
export function combineScores(
  bigFiveScores: Record<EnneagramType, number>,
  questionScores: Record<EnneagramType, number>,
  questionWeight: number = 0.6
): Record<EnneagramType, number> {
  const bigFiveWeight = 1 - questionWeight;
  const combined: Record<EnneagramType, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
  };

  for (const type of ENNEAGRAM_TYPES) {
    combined[type] = bigFiveWeight * bigFiveScores[type] + questionWeight * questionScores[type];
  }

  return combined;
}

// =============================================================================
// Profile Computation
// =============================================================================

/**
 * Determine primary type from scores.
 */
function determinePrimaryType(scores: Record<EnneagramType, number>): EnneagramType {
  let maxType: EnneagramType = 1;
  let maxScore = 0;

  for (const type of ENNEAGRAM_TYPES) {
    if (scores[type] > maxScore) {
      maxScore = scores[type];
      maxType = type;
    }
  }

  return maxType;
}

/**
 * Determine wing from primary type and scores.
 */
function determineWing(
  primaryType: EnneagramType,
  scores: Record<EnneagramType, number>
): EnneagramType | null {
  const [wing1, wing2] = getWings(primaryType);
  const wing1Score = scores[wing1];
  const wing2Score = scores[wing2];

  // Must have at least 0.1 difference to call a wing
  if (Math.abs(wing1Score - wing2Score) < 0.1) {
    return null; // Balanced wings
  }

  return wing1Score > wing2Score ? wing1 : wing2;
}

/**
 * Determine integration level based on trait patterns.
 */
function determineIntegrationLevel(
  primaryType: EnneagramType,
  bigFive: BigFiveInput
): 'stress' | 'average' | 'growth' {
  // High neuroticism + low conscientiousness suggests stress
  if (bigFive.neuroticism > 0.7 && bigFive.conscientiousness < 0.3) {
    return 'stress';
  }

  // High openness + balanced other traits suggests growth
  if (bigFive.openness > 0.6 && bigFive.neuroticism < 0.5) {
    return 'growth';
  }

  return 'average';
}

/**
 * Calculate confidence based on score distribution.
 */
function calculateConfidence(scores: Record<EnneagramType, number>): number {
  const values = Object.values(scores);
  const max = Math.max(...values);
  const secondMax = values.sort((a, b) => b - a)[1];

  // Confidence is based on gap between top two scores
  const gap = max - secondMax;

  // Also factor in the absolute value of the max score
  const absoluteConfidence = max;

  return Math.min(1, (gap * 2 + absoluteConfidence) / 2);
}

// =============================================================================
// Main Scoring Function
// =============================================================================

/**
 * Compute complete Enneagram profile.
 */
export function computeEnneagramProfile(
  bigFive: BigFiveInput,
  answers: EnneagramAnswer[] = []
): EnneagramScoringResult {
  // Bootstrap from Big Five
  const bigFiveScores = estimateFromBigFive(bigFive);

  // Score from questions (if any)
  const questionScores = answers.length > 0
    ? scoreFromAnswers(answers)
    : { 1: 0.5, 2: 0.5, 3: 0.5, 4: 0.5, 5: 0.5, 6: 0.5, 7: 0.5, 8: 0.5, 9: 0.5 };

  // Determine question weight based on answer count
  // More answers = more weight on questions
  const answeredEnneagramQuestions = answers.filter((a) =>
    ENNEAGRAM_QUESTIONS.some((q) => q.id === a.questionId)
  ).length;
  const maxQuestions = ENNEAGRAM_QUESTIONS.length;
  const questionWeight = Math.min(0.8, 0.3 + (answeredEnneagramQuestions / maxQuestions) * 0.5);

  // Combine scores
  const combinedScores = combineScores(bigFiveScores, questionScores, questionWeight);

  // Determine primary type
  const primaryType = determinePrimaryType(combinedScores);

  // Determine wing
  const wing = determineWing(primaryType, combinedScores);

  // Compute tritype
  const tritype = computeTritype(combinedScores);

  // Determine integration level
  const integrationLevel = determineIntegrationLevel(primaryType, bigFive);

  // Calculate confidence
  const confidence = calculateConfidence(combinedScores);

  const profile: EnneagramProfile = {
    primaryType,
    wing,
    tritype,
    typeScores: combinedScores,
    confidence,
    integrationLevel,
  };

  return {
    profile,
    rawScores: combinedScores,
    bigFiveContribution: bigFiveScores,
    questionContribution: questionScores,
    confidence,
  };
}

/**
 * Quick estimate from Big Five only (no questions).
 */
export function quickEstimate(bigFive: BigFiveInput): EnneagramProfile {
  const scores = estimateFromBigFive(bigFive);
  const primaryType = determinePrimaryType(scores);
  const wing = determineWing(primaryType, scores);
  const tritype = computeTritype(scores);
  const integrationLevel = determineIntegrationLevel(primaryType, bigFive);
  const confidence = calculateConfidence(scores) * 0.7; // Lower confidence for bootstrap only

  return {
    primaryType,
    wing,
    tritype,
    typeScores: scores,
    confidence,
    integrationLevel,
  };
}

export default {
  estimateFromBigFive,
  scoreFromAnswers,
  combineScores,
  computeEnneagramProfile,
  quickEstimate,
};
