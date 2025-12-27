/**
 * Temporal Style Classification
 *
 * Classifies users into one of three temporal engagement styles:
 * - looped: Prefers repetitive, cyclical patterns
 * - evolving: Prefers gradual transformation over time
 * - episodic: Prefers distinct segments/chapters
 *
 * DESIGN NOTES:
 * - This is a derived label from continuous features, not a hard trait
 * - Rule-based for v1, can be replaced with learned embeddings later
 * - Works across music, visuals, video, narrative
 */

import { TemporalStyle, RepresentationInput } from './types';

// =============================================================================
// Temporal Style Scoring
// =============================================================================

interface TemporalScores {
  looped: number;
  evolving: number;
  episodic: number;
}

/**
 * Compute raw scores for each temporal style
 *
 * Scoring logic:
 *
 * LOOPED (ritual, repetition, mantra):
 * - High conscientiousness (routine-seeking)
 * - Low novelty seeking (comfort in repetition)
 * - High reengagement rate (returns to same content)
 * - Low content diversity (sticks to known territory)
 *
 * EVOLVING (journey, build, arc):
 * - High openness (appreciates transformation)
 * - Moderate novelty seeking (controlled exploration)
 * - High session depth (stays for the journey)
 * - Balanced diversity (explores within bounds)
 *
 * EPISODIC (chapters, scenes, variety):
 * - High novelty seeking (craves change)
 * - Low conscientiousness (resists routine)
 * - Low session depth (moves on quickly)
 * - High content diversity (wide-ranging)
 */
function computeTemporalScores(input: RepresentationInput): TemporalScores {
  const { psychometric, behavioral } = input;

  // Base scores from psychometric traits
  let looped = 0;
  let evolving = 0;
  let episodic = 0;

  // ==========================================================================
  // Conscientiousness: routine vs flexibility
  // ==========================================================================
  // High conscientiousness → looped (ritualistic)
  // Low conscientiousness → episodic (variety-seeking)
  looped += psychometric.conscientiousness * 0.3;
  episodic += (1 - psychometric.conscientiousness) * 0.25;
  evolving += Math.abs(psychometric.conscientiousness - 0.5) < 0.2 ? 0.15 : 0;

  // ==========================================================================
  // Novelty Seeking: repetition vs change
  // ==========================================================================
  // Low novelty → looped (comfort in repetition)
  // High novelty → episodic (craves new segments)
  // Moderate novelty → evolving (controlled transformation)
  looped += (1 - psychometric.noveltySeeking) * 0.3;
  episodic += psychometric.noveltySeeking * 0.3;
  evolving += (1 - Math.abs(psychometric.noveltySeeking - 0.5) * 2) * 0.2;

  // ==========================================================================
  // Openness: appreciation for transformation
  // ==========================================================================
  // High openness → evolving (journey appreciation)
  // Moderate effect on episodic
  evolving += psychometric.openness * 0.25;
  episodic += psychometric.openness * 0.1;

  // ==========================================================================
  // Risk Tolerance: comfort with uncertainty in progression
  // ==========================================================================
  // Low risk → looped (predictable patterns)
  // High risk → evolving or episodic
  looped += (1 - psychometric.riskTolerance) * 0.15;
  evolving += psychometric.riskTolerance * 0.1;
  episodic += psychometric.riskTolerance * 0.1;

  // ==========================================================================
  // Behavioral Signals (when available)
  // ==========================================================================
  if (behavioral) {
    // Session depth: how long they engage
    if (behavioral.sessionDepth !== undefined) {
      const normalizedDepth = Math.min(behavioral.sessionDepth / 20, 1);
      // Deep sessions → evolving (stays for the journey)
      evolving += normalizedDepth * 0.2;
      // Shallow sessions → episodic (moves on)
      episodic += (1 - normalizedDepth) * 0.15;
    }

    // Reengagement rate: returns to same content
    if (behavioral.reengagementRate !== undefined) {
      // High reengagement → looped (ritualistic return)
      looped += behavioral.reengagementRate * 0.2;
    }

    // Content diversity: range of exploration
    if (behavioral.contentDiversity !== undefined) {
      // Low diversity → looped (stays in lane)
      looped += (1 - behavioral.contentDiversity) * 0.15;
      // High diversity → episodic (wide-ranging)
      episodic += behavioral.contentDiversity * 0.15;
    }

    // Novelty preference (behavioral, not trait)
    if (behavioral.noveltyPreference !== undefined) {
      evolving += behavioral.noveltyPreference * 0.1;
      episodic += behavioral.noveltyPreference * 0.1;
    }
  }

  // Normalize scores to sum to 1
  const total = looped + evolving + episodic;
  if (total > 0) {
    return {
      looped: looped / total,
      evolving: evolving / total,
      episodic: episodic / total,
    };
  }

  // Fallback to balanced
  return { looped: 0.33, evolving: 0.34, episodic: 0.33 };
}

// =============================================================================
// Main Classification Function
// =============================================================================

/**
 * Classify user into a temporal style
 *
 * @param input - Psychometric, aesthetic, and behavioral data
 * @returns The dominant temporal style
 */
export function classifyTemporalStyle(input: RepresentationInput): TemporalStyle {
  const scores = computeTemporalScores(input);

  // Find dominant style
  if (scores.looped >= scores.evolving && scores.looped >= scores.episodic) {
    return 'looped';
  } else if (scores.evolving >= scores.looped && scores.evolving >= scores.episodic) {
    return 'evolving';
  } else {
    return 'episodic';
  }
}

/**
 * Get detailed temporal style analysis
 * Useful for debugging and UI display
 */
export function analyzeTemporalStyle(input: RepresentationInput): {
  style: TemporalStyle;
  scores: TemporalScores;
  confidence: number;
  description: string;
} {
  const scores = computeTemporalScores(input);
  const style = classifyTemporalStyle(input);

  // Confidence is how much the winner dominates
  const sortedScores = Object.values(scores).sort((a, b) => b - a);
  const confidence = sortedScores[0] - sortedScores[1]; // Gap to second place

  const descriptions: Record<TemporalStyle, string> = {
    looped:
      'You find comfort in repetition and ritual. Loops, mantras, and cyclical patterns resonate with your engagement style.',
    evolving:
      'You appreciate gradual transformation. Builds, journeys, and arcs that unfold over time match your temporal preferences.',
    episodic:
      'You thrive on variety and distinct segments. Chapters, scenes, and movements keep you engaged.',
  };

  return {
    style,
    scores,
    confidence,
    description: descriptions[style],
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get temporal style as a numeric vector
 * Useful for ML pipelines and clustering
 */
export function temporalStyleToVector(style: TemporalStyle): [number, number, number] {
  switch (style) {
    case 'looped':
      return [1, 0, 0];
    case 'evolving':
      return [0, 1, 0];
    case 'episodic':
      return [0, 0, 1];
  }
}

/**
 * Get soft temporal style vector (probabilities)
 * More nuanced than hard classification
 */
export function getTemporalProbabilities(input: RepresentationInput): TemporalScores {
  return computeTemporalScores(input);
}

export default classifyTemporalStyle;
