/**
 * Flavor State System
 *
 * Introduces stateful modifiers within constellations based on blend + behavior.
 * Examples: "Radianth — Volatile", "Somnexis — Ritual", "Lucidyne — Ascendant"
 *
 * FlavorStates are computed, not chosen. They emerge from:
 * - Secondary blend weights
 * - Interaction diversity
 * - Early-adopter score
 * - Consistency vs exploration patterns
 *
 * PATENT-ALIGNED: Flavors are procedurally derived from multi-signal computation,
 * not pre-assigned categories.
 *
 * TODO: Replace trigger thresholds with learned decision boundaries from user clustering
 */

import { ConstellationId } from '../constellations/types';
import { constellationsConfig } from '../constellations/config';
import {
  FlavorState,
  FlavorTriggers,
  BehavioralSignal,
  InterpretationInput,
  BehavioralInput,
} from './types';

// =============================================================================
// Flavor State Definitions
// =============================================================================

/**
 * Universal flavor states that can apply to any constellation
 * Each has specific triggers based on blend, traits, and behavior
 */
const UNIVERSAL_FLAVORS: Omit<FlavorState, 'fullLabel'>[] = [
  // Energy/Intensity Flavors
  {
    id: 'volatile',
    displayName: 'Volatile',
    triggers: {
      blendThresholds: { radianth: 0.15, velocine: 0.15, iridrax: 0.15 },
      traitThresholds: { riskTolerance: { min: 0.7 }, noveltySeeking: { min: 0.7 } },
    },
    description: 'Operating at high intensity with explosive energy bursts',
    tasteManifesto: 'You seek moments of maximum impact and aren\'t afraid of sensory overload.',
    icon: '⚡',
  },
  {
    id: 'serene',
    displayName: 'Serene',
    triggers: {
      blendThresholds: { somnexis: 0.15, opalith: 0.15, glaceryl: 0.15 },
      traitThresholds: { neuroticism: { max: 0.3 }, agreeableness: { min: 0.6 } },
    },
    description: 'Dwelling in calm contemplation and gentle aesthetics',
    tasteManifesto: 'You find depth in stillness and beauty in subtlety.',
    icon: '🌙',
  },

  // Exploration Flavors
  {
    id: 'pioneer',
    displayName: 'Pioneer',
    triggers: {
      minEarlyAdopterScore: 75,
      minExplorerScore: 70,
      behavioralSignals: ['trend_leading', 'rapid_exploration'],
    },
    description: 'Consistently at the frontier of emerging aesthetics',
    tasteManifesto: 'You don\'t follow trends—you find things before they become trends.',
    icon: '🔭',
  },
  {
    id: 'archaeologist',
    displayName: 'Archaeologist',
    triggers: {
      minSubtasteIndex: 65,
      behavioralSignals: ['deep_engagement', 'niche_drilling'],
      traitThresholds: { conscientiousness: { min: 0.6 }, openness: { min: 0.6 } },
    },
    description: 'Excavating deep into specific aesthetic territories',
    tasteManifesto: 'You go deep rather than wide, uncovering hidden layers others miss.',
    icon: '🔍',
  },

  // Pattern Flavors
  {
    id: 'ritual',
    displayName: 'Ritual',
    triggers: {
      blendThresholds: { noctyra: 0.12, obscyra: 0.12 },
      behavioralSignals: ['ritual_patterns', 'high_save_rate'],
      minSubtasteIndex: 60,
    },
    description: 'Engaging with taste as ceremonial practice',
    tasteManifesto: 'Your aesthetic experiences are intentional, almost sacred.',
    icon: '🕯️',
  },
  {
    id: 'flux',
    displayName: 'Flux',
    triggers: {
      blendThresholds: { fluxeris: 0.15, nexyra: 0.12 },
      maxSubtasteIndex: 40,
      behavioralSignals: ['high_interaction_diversity', 'cross_genre_bridging'],
    },
    description: 'Taste in constant transformation, resisting fixed identity',
    tasteManifesto: 'You contain multitudes and refuse to be pinned down.',
    icon: '🌊',
  },

  // Social Flavors
  {
    id: 'curator',
    displayName: 'Curator',
    triggers: {
      behavioralSignals: ['high_save_rate', 'high_share_rate'],
      traitThresholds: { aestheticSensitivity: { min: 0.75 }, conscientiousness: { min: 0.5 } },
    },
    description: 'Actively collecting and sharing aesthetic discoveries',
    tasteManifesto: 'You build collections with intention and share them generously.',
    icon: '🎨',
  },
  {
    id: 'hermit',
    displayName: 'Hermit',
    triggers: {
      traitThresholds: { extraversion: { max: 0.35 }, aestheticSensitivity: { min: 0.7 } },
      behavioralSignals: ['deep_engagement', 'low_interaction_diversity'],
    },
    description: 'Cultivating taste in solitude, unconcerned with external validation',
    tasteManifesto: 'Your aesthetic world is rich and private.',
    icon: '🏔️',
  },

  // Intensity Flavors
  {
    id: 'ascendant',
    displayName: 'Ascendant',
    triggers: {
      minExplorerScore: 80,
      minEarlyAdopterScore: 70,
      traitThresholds: { openness: { min: 0.8 }, riskTolerance: { min: 0.65 } },
    },
    description: 'On an upward trajectory of expanding taste horizons',
    tasteManifesto: 'Your taste is actively evolving toward new territories.',
    icon: '🚀',
  },
  {
    id: 'anchored',
    displayName: 'Anchored',
    triggers: {
      minSubtasteIndex: 75,
      traitThresholds: { conscientiousness: { min: 0.6 } },
      behavioralSignals: ['ritual_patterns'],
    },
    description: 'Deeply rooted in a stable, well-defined aesthetic identity',
    tasteManifesto: 'You know exactly what you like and why.',
    icon: '⚓',
  },

  // Edge Flavors
  {
    id: 'liminal',
    displayName: 'Liminal',
    triggers: {
      blendThresholds: { somnexis: 0.12, astryde: 0.12, chromyne: 0.12 },
      traitThresholds: { openness: { min: 0.7 }, neuroticism: { min: 0.4, max: 0.7 } },
    },
    description: 'Dwelling in threshold spaces between defined aesthetics',
    tasteManifesto: 'You\'re drawn to the in-between, the transitional, the not-quite.',
    icon: '🌫️',
  },
  {
    id: 'insurgent',
    displayName: 'Insurgent',
    triggers: {
      blendThresholds: { vantoryx: 0.15 },
      traitThresholds: { agreeableness: { max: 0.4 }, riskTolerance: { min: 0.75 } },
      behavioralSignals: ['trend_leading'],
    },
    description: 'Actively challenging aesthetic conventions',
    tasteManifesto: 'You don\'t just find new things—you question why things are the way they are.',
    icon: '🔥',
  },
];

// =============================================================================
// Flavor State Computation
// =============================================================================

/**
 * Compute the active flavor state for a user
 * Returns the best-matching flavor or undefined if none qualify
 *
 * @param input - Full interpretation input
 * @returns Best matching flavor state or undefined
 */
export function computeFlavorState(input: InterpretationInput): FlavorState | undefined {
  const primaryConfig = constellationsConfig[input.primaryConstellationId];

  // Score each flavor against input
  const scoredFlavors = UNIVERSAL_FLAVORS.map(flavor => ({
    flavor,
    score: scoreFlavor(flavor, input),
  }));

  // Get best match above threshold
  const bestMatch = scoredFlavors
    .filter(sf => sf.score >= 0.6) // Minimum 60% trigger match
    .sort((a, b) => b.score - a.score)[0];

  if (!bestMatch) {
    return undefined;
  }

  // Build full flavor state with constellation context
  return {
    ...bestMatch.flavor,
    fullLabel: `${primaryConfig.displayName} — ${bestMatch.flavor.displayName}`,
  };
}

/**
 * Score how well a flavor matches the input
 * Returns 0-1 score based on trigger satisfaction
 */
function scoreFlavor(
  flavor: Omit<FlavorState, 'fullLabel'>,
  input: InterpretationInput
): number {
  const triggers = flavor.triggers;
  let totalChecks = 0;
  let passedChecks = 0;

  // Check blend thresholds
  if (triggers.blendThresholds) {
    const blendEntries = Object.entries(triggers.blendThresholds);
    totalChecks += blendEntries.length;

    for (const [constellationId, threshold] of blendEntries) {
      const weight = input.blendWeights[constellationId as ConstellationId] ?? 0;
      if (weight >= (threshold ?? 0)) {
        passedChecks += 1;
      } else if (weight >= (threshold ?? 0) * 0.7) {
        passedChecks += 0.5; // Partial credit for close
      }
    }
  }

  // Check trait thresholds
  if (triggers.traitThresholds) {
    const traitEntries = Object.entries(triggers.traitThresholds);
    totalChecks += traitEntries.length;

    for (const [trait, bounds] of traitEntries) {
      const value = input.traits[trait as keyof typeof input.traits];
      if (value !== undefined) {
        const minOk = bounds?.min === undefined || value >= bounds.min;
        const maxOk = bounds?.max === undefined || value <= bounds.max;
        if (minOk && maxOk) {
          passedChecks += 1;
        }
      }
    }
  }

  // Check score thresholds
  if (triggers.minExplorerScore !== undefined) {
    totalChecks += 1;
    if (input.explorerScore >= triggers.minExplorerScore) {
      passedChecks += 1;
    }
  }

  if (triggers.minEarlyAdopterScore !== undefined) {
    totalChecks += 1;
    if (input.earlyAdopterScore >= triggers.minEarlyAdopterScore) {
      passedChecks += 1;
    }
  }

  if (triggers.minSubtasteIndex !== undefined) {
    totalChecks += 1;
    if (input.subtasteIndex >= triggers.minSubtasteIndex) {
      passedChecks += 1;
    }
  }

  if (triggers.maxSubtasteIndex !== undefined) {
    totalChecks += 1;
    if (input.subtasteIndex <= triggers.maxSubtasteIndex) {
      passedChecks += 1;
    }
  }

  // Check behavioral signals (if behavioral data available)
  if (triggers.behavioralSignals && input.behavioral) {
    const detectedSignals = detectBehavioralSignals(input.behavioral);
    const signalCount = triggers.behavioralSignals.length;
    totalChecks += signalCount;

    for (const signal of triggers.behavioralSignals) {
      if (detectedSignals.includes(signal)) {
        passedChecks += 1;
      }
    }
  }

  if (totalChecks === 0) return 0;
  return passedChecks / totalChecks;
}

/**
 * Detect behavioral signals from behavioral input
 *
 * TODO: Replace with ML-based signal detection from interaction patterns
 */
function detectBehavioralSignals(behavioral: BehavioralInput): BehavioralSignal[] {
  const signals: BehavioralSignal[] = [];

  // Diversity signals
  if (behavioral.contentDiversity !== undefined) {
    if (behavioral.contentDiversity > 0.7) {
      signals.push('high_interaction_diversity');
    } else if (behavioral.contentDiversity < 0.3) {
      signals.push('low_interaction_diversity');
    }
  }

  // Engagement signals
  if (behavioral.sessionDepth !== undefined) {
    if (behavioral.sessionDepth > 10) {
      signals.push('deep_engagement');
    }
  }

  // Exploration signals
  if (behavioral.noveltyPreference !== undefined) {
    if (behavioral.noveltyPreference > 0.7) {
      signals.push('rapid_exploration');
    }
  }

  // Save/share signals
  if (behavioral.saveRate !== undefined && behavioral.saveRate > 0.3) {
    signals.push('high_save_rate');
  }
  if (behavioral.shareRate !== undefined && behavioral.shareRate > 0.2) {
    signals.push('high_share_rate');
  }

  // Pattern signals - would need more data in production
  if (behavioral.sessionCount !== undefined && behavioral.sessionCount > 10) {
    if (behavioral.reengagementRate !== undefined && behavioral.reengagementRate > 0.6) {
      signals.push('ritual_patterns');
    }
  }

  // Genre bridging - would need category analysis in production
  if (behavioral.contentCategories && behavioral.contentCategories.length > 5) {
    signals.push('cross_genre_bridging');
  } else if (behavioral.contentCategories && behavioral.contentCategories.length <= 2) {
    signals.push('niche_drilling');
  }

  return signals;
}

/**
 * Get all possible flavor states (for documentation/testing)
 */
export function getAllFlavorStates(): Omit<FlavorState, 'fullLabel'>[] {
  return UNIVERSAL_FLAVORS;
}

/**
 * Get flavor states that might apply to a specific constellation
 * based on common blend patterns
 */
export function getConstellationFlavors(
  constellation: ConstellationId
): Omit<FlavorState, 'fullLabel'>[] {
  // Return flavors that could reasonably apply
  // In production, this would be learned from user data
  return UNIVERSAL_FLAVORS.filter(flavor => {
    // Check if this constellation could trigger the flavor
    const blendThresholds = flavor.triggers.blendThresholds;
    if (blendThresholds && blendThresholds[constellation]) {
      return true;
    }

    // Most flavors can apply to most constellations
    // based on behavioral/trait triggers
    return true;
  });
}

export default computeFlavorState;
