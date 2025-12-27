/**
 * Behavioral Modifier Computation
 *
 * Behavioral modifiers cut across all constellations, providing additional
 * differentiation based on how users engage with content.
 *
 * Examples:
 * - Early Adopter vs Late Wave
 * - Deep Diver vs Surface Explorer
 * - Ritual User vs Impulse Explorer
 * - High-Entropy vs Coherent Taste
 *
 * PATENT-ALIGNED: Modifiers are computed from multi-signal behavioral analysis,
 * not self-reported preferences. This enables taste prediction and recommendation
 * optimization beyond static personality typing.
 *
 * TODO: Replace heuristic computations with ML models trained on:
 * - User interaction sequences
 * - Content adoption timing relative to cluster emergence
 * - Session patterns and engagement depth
 */

import {
  BehavioralModifier,
  BehavioralProfile,
  InterpretationInput,
  BehavioralInput,
} from './types';

// =============================================================================
// Modifier Definitions
// =============================================================================

/**
 * Modifier dimension configuration
 */
interface ModifierDimension {
  id: string;
  highLabel: string;
  lowLabel: string;
  highDescription: string;
  lowDescription: string;
  balancedDescription: string;
  compute: (input: InterpretationInput) => number; // Returns 0-100
  generateInsight: (score: number, input: InterpretationInput) => string;
}

/**
 * All behavioral modifier dimensions
 */
const MODIFIER_DIMENSIONS: ModifierDimension[] = [
  // ==========================================================================
  // Adoption Timing
  // ==========================================================================
  {
    id: 'adoption_timing',
    highLabel: 'Early Adopter',
    lowLabel: 'Late Wave',
    highDescription: 'You discover trends before they peak, often while they\'re still underground.',
    lowDescription: 'You prefer validated aesthetics with established communities.',
    balancedDescription: 'You balance discovery with cultural establishment.',
    compute: (input) => {
      // Primary: earlyAdopterScore from profile
      let score = input.earlyAdopterScore;

      // Adjust based on traits
      score += (input.traits.noveltySeeking - 0.5) * 20;
      score += (input.traits.riskTolerance - 0.5) * 10;
      score -= (input.traits.conscientiousness - 0.5) * 10;

      // Behavioral adjustment if available
      if (input.behavioral?.noveltyPreference !== undefined) {
        score += (input.behavioral.noveltyPreference - 0.5) * 20;
      }

      return clamp(score, 0, 100);
    },
    generateInsight: (score, input) => {
      if (score >= 70) {
        return 'You\'re likely among the first 10% to engage with emerging scenes and sounds.';
      } else if (score <= 30) {
        return 'You prefer waiting until something proves its staying power before diving in.';
      }
      return 'You balance openness to new things with appreciation for the proven.';
    },
  },

  // ==========================================================================
  // Engagement Depth
  // ==========================================================================
  {
    id: 'engagement_depth',
    highLabel: 'Deep Diver',
    lowLabel: 'Surface Explorer',
    highDescription: 'You go deep into specific aesthetics, becoming an expert in your niches.',
    lowDescription: 'You prefer broad exploration across many aesthetic territories.',
    balancedDescription: 'You balance depth and breadth in your aesthetic explorations.',
    compute: (input) => {
      // High subtaste index = coherent/focused = deep diver tendency
      let score = input.subtasteIndex;

      // Adjust based on traits
      score += (input.traits.conscientiousness - 0.5) * 20;
      score += (input.traits.openness - 0.5) * -10; // High openness = more surface exploring
      score += (1 - input.traits.noveltySeeking - 0.5) * 15;

      // Behavioral adjustment
      if (input.behavioral?.sessionDepth !== undefined) {
        const depthBonus = Math.min(input.behavioral.sessionDepth / 20, 1) * 20;
        score += depthBonus - 10;
      }

      if (input.behavioral?.contentDiversity !== undefined) {
        // Low diversity = deep diver
        score += (1 - input.behavioral.contentDiversity - 0.5) * 20;
      }

      return clamp(score, 0, 100);
    },
    generateInsight: (score, input) => {
      if (score >= 70) {
        return 'You tend to become a connoisseur of specific aesthetics rather than a generalist.';
      } else if (score <= 30) {
        return 'Your strength is connecting disparate aesthetic worlds through broad exploration.';
      }
      return 'You know when to go deep and when to explore wide.';
    },
  },

  // ==========================================================================
  // Engagement Pattern
  // ==========================================================================
  {
    id: 'engagement_pattern',
    highLabel: 'Ritual Engager',
    lowLabel: 'Impulse Explorer',
    highDescription: 'Your aesthetic engagement follows intentional patterns and routines.',
    lowDescription: 'You discover through spontaneous, intuition-led exploration.',
    balancedDescription: 'You mix intentional curation with spontaneous discovery.',
    compute: (input) => {
      let score = 50; // Start neutral

      // Traits
      score += (input.traits.conscientiousness - 0.5) * 30;
      score += (1 - input.traits.noveltySeeking - 0.5) * 20;
      score += (1 - input.traits.riskTolerance - 0.5) * 15;

      // Behavioral signals
      if (input.behavioral?.reengagementRate !== undefined) {
        score += (input.behavioral.reengagementRate - 0.5) * 30;
      }

      if (input.behavioral?.saveRate !== undefined) {
        score += input.behavioral.saveRate * 20;
      }

      return clamp(score, 0, 100);
    },
    generateInsight: (score, input) => {
      if (score >= 70) {
        return 'You build lasting relationships with your aesthetic preferences through repeated engagement.';
      } else if (score <= 30) {
        return 'You thrive on the thrill of unexpected discoveries and follow your curiosity freely.';
      }
      return 'You create structure for your favorites while staying open to serendipity.';
    },
  },

  // ==========================================================================
  // Taste Coherence
  // ==========================================================================
  {
    id: 'taste_coherence',
    highLabel: 'Coherent Taste',
    lowLabel: 'High-Entropy Taste',
    highDescription: 'Your preferences form a unified, internally consistent aesthetic identity.',
    lowDescription: 'Your taste spans many seemingly contradictory territories with ease.',
    balancedDescription: 'Your taste has a recognizable core with interesting outliers.',
    compute: (input) => {
      // Direct mapping from subtaste index
      let score = input.subtasteIndex;

      // Adjust based on blend weight distribution
      const weights = Object.values(input.blendWeights).filter(w => w !== undefined) as number[];
      if (weights.length > 0) {
        const max = Math.max(...weights);
        const variance = calculateVariance(weights);
        // Higher max weight and lower variance = more coherent
        score = score * 0.7 + (max * 100) * 0.2 + ((1 - Math.min(variance * 4, 1)) * 100) * 0.1;
      }

      return clamp(score, 0, 100);
    },
    generateInsight: (score, input) => {
      if (score >= 70) {
        return 'Someone could identify your taste from a random sample of your favorites.';
      } else if (score <= 30) {
        return 'You contain multitudes—your taste defies easy categorization.';
      }
      return 'You have a recognizable aesthetic center with room for exploration.';
    },
  },

  // ==========================================================================
  // Social Orientation
  // ==========================================================================
  {
    id: 'social_orientation',
    highLabel: 'Taste Sharer',
    lowLabel: 'Taste Keeper',
    highDescription: 'You actively share and discuss your aesthetic discoveries with others.',
    lowDescription: 'Your aesthetic world is primarily personal and private.',
    balancedDescription: 'You share selectively with those who will appreciate it.',
    compute: (input) => {
      let score = 50;

      // Traits
      score += (input.traits.extraversion - 0.5) * 30;
      score += (input.traits.agreeableness - 0.5) * 20;

      // Behavioral
      if (input.behavioral?.shareRate !== undefined) {
        score += input.behavioral.shareRate * 50;
      }

      return clamp(score, 0, 100);
    },
    generateInsight: (score, input) => {
      if (score >= 70) {
        return 'You likely curate playlists for friends and share finds enthusiastically.';
      } else if (score <= 30) {
        return 'Your aesthetic experiences are intimate—you don\'t need external validation.';
      }
      return 'You share with intention, choosing your audience carefully.';
    },
  },

  // ==========================================================================
  // Intensity Preference
  // ==========================================================================
  {
    id: 'intensity_preference',
    highLabel: 'Intensity Seeker',
    lowLabel: 'Subtlety Appreciator',
    highDescription: 'You\'re drawn to bold, maximal, high-impact aesthetics.',
    lowDescription: 'You appreciate nuance, understatement, and quiet beauty.',
    balancedDescription: 'You appreciate both bombast and subtlety in their proper contexts.',
    compute: (input) => {
      let score = 50;

      // Aesthetic preferences
      score += (input.aesthetic.energyCenter - 0.5) * 40;
      score += (input.aesthetic.complexityPreference - 0.5) * 20;
      score += (input.aesthetic.minimalVsMaximal - 0.5) * 20;

      // Traits
      score += (input.traits.extraversion - 0.5) * 10;
      score += (input.traits.noveltySeeking - 0.5) * 10;

      return clamp(score, 0, 100);
    },
    generateInsight: (score, input) => {
      if (score >= 70) {
        return 'You want aesthetics that make an impact and aren\'t afraid of sensory intensity.';
      } else if (score <= 30) {
        return 'You find beauty in restraint and notice details others overlook.';
      }
      return 'You can appreciate a whisper and a shout, each in its moment.';
    },
  },
];

// =============================================================================
// Computation Functions
// =============================================================================

/**
 * Compute all behavioral modifiers for a user
 *
 * @param input - Full interpretation input
 * @returns Complete behavioral profile with all modifiers
 */
export function computeBehavioralModifiers(input: InterpretationInput): BehavioralProfile {
  const modifiers: BehavioralModifier[] = MODIFIER_DIMENSIONS.map(dimension => {
    const score = dimension.compute(input);
    const pole = score >= 65 ? 'high' : score <= 35 ? 'low' : 'balanced';

    const label = pole === 'high' ? dimension.highLabel :
                  pole === 'low' ? dimension.lowLabel :
                  `${dimension.highLabel}/${dimension.lowLabel}`;

    const explanation = pole === 'high' ? dimension.highDescription :
                        pole === 'low' ? dimension.lowDescription :
                        dimension.balancedDescription;

    const shortPhrase = pole === 'high' ? dimension.highLabel :
                        pole === 'low' ? dimension.lowLabel :
                        'Balanced';

    return {
      id: dimension.id,
      label,
      score,
      pole,
      explanation,
      shortPhrase,
      insight: dimension.generateInsight(score, input),
    };
  });

  // Generate archetype phrase from top modifiers
  const archetype = generateArchetype(modifiers);

  // Generate summary
  const summary = generateBehavioralSummary(modifiers, input);

  return {
    modifiers,
    archetype,
    summary,
  };
}

/**
 * Generate behavioral archetype phrase from modifiers
 */
function generateArchetype(modifiers: BehavioralModifier[]): string {
  // Get the strongest non-balanced modifiers
  const strong = modifiers
    .filter(m => m.pole !== 'balanced')
    .sort((a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50))
    .slice(0, 2);

  if (strong.length === 0) {
    return 'Balanced Explorer';
  }

  if (strong.length === 1) {
    return strong[0].shortPhrase;
  }

  return `${strong[0].shortPhrase}, ${strong[1].shortPhrase}`;
}

/**
 * Generate behavioral summary
 */
function generateBehavioralSummary(
  modifiers: BehavioralModifier[],
  input: InterpretationInput
): string {
  const phrases: string[] = [];

  // Find the most distinctive modifiers (furthest from 50)
  const sorted = [...modifiers].sort(
    (a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50)
  );

  // Take top 2-3 for summary
  const top = sorted.slice(0, 3);

  for (const mod of top) {
    if (mod.pole === 'balanced') continue;
    phrases.push(mod.insight);
  }

  if (phrases.length === 0) {
    return 'You engage with aesthetics in a balanced, adaptable way.';
  }

  return phrases.join(' ');
}

/**
 * Get a single-line behavioral mode string for UI
 * Example: "Early-Adopter, High-Entropy mode"
 */
export function getBehavioralModeString(profile: BehavioralProfile): string {
  const parts: string[] = [];

  // Find key modifiers
  const earlyAdopter = profile.modifiers.find(m => m.id === 'adoption_timing');
  const coherence = profile.modifiers.find(m => m.id === 'taste_coherence');
  const depth = profile.modifiers.find(m => m.id === 'engagement_depth');

  if (earlyAdopter && earlyAdopter.pole === 'high') {
    parts.push('Early-Adopter');
  } else if (earlyAdopter && earlyAdopter.pole === 'low') {
    parts.push('Late-Wave');
  }

  if (coherence && coherence.pole === 'low') {
    parts.push('High-Entropy');
  } else if (coherence && coherence.pole === 'high') {
    parts.push('Coherent');
  }

  if (depth && depth.pole === 'high') {
    parts.push('Deep-Diver');
  } else if (depth && depth.pole === 'low') {
    parts.push('Explorer');
  }

  if (parts.length === 0) {
    return 'Adaptive mode';
  }

  return parts.join(', ') + ' mode';
}

// =============================================================================
// Utility Functions
// =============================================================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

export default computeBehavioralModifiers;
