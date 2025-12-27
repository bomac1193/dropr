/**
 * Enhanced Constellation Interpretation System
 *
 * This module provides depth without increasing archetype count by:
 * 1. Blend Narratives - Semantic interpretation of constellation blends
 * 2. Flavor States - Sub-dimensions within constellations
 * 3. Behavioral Modifiers - Cross-cutting behavioral dimensions
 * 4. Subculture Fit - Dynamic scene alignment predictions
 *
 * PATENT-ALIGNED: All identity components are procedurally generated from:
 * - Psychometric trait computation
 * - Cross-modal aesthetic embeddings (TODO: integrate ML)
 * - Behavioral signal analysis
 * - Temporal adoption patterns
 *
 * Labels are outputs of computation, not fixed classes.
 */

import { ConstellationId } from '../constellations/types';
import { constellationsConfig } from '../constellations/config';
import { ConstellationProfile } from '../types/models';

import {
  EnhancedConstellationResult,
  InterpretationInput,
  BlendNarrative,
  FlavorState,
  BehavioralProfile,
  SubcultureFitPrediction,
  IdentityComponent,
  BehavioralInput,
} from './types';

import { generateBlendNarrative, generateBlendBadge } from './blend-narrative';
import { computeFlavorState, getAllFlavorStates } from './flavor-states';
import { computeBehavioralModifiers, getBehavioralModeString } from './behavioral-modifiers';

// =============================================================================
// Main Interpretation Function
// =============================================================================

/**
 * Generate enhanced constellation interpretation from profile data
 *
 * @param profile - Computed constellation profile
 * @param traits - User trait scores (0-1)
 * @param aesthetic - Aesthetic preferences
 * @param behavioral - Optional behavioral data for returning users
 * @returns Complete enhanced interpretation
 */
export function generateEnhancedInterpretation(
  profile: Omit<ConstellationProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  traits: InterpretationInput['traits'],
  aesthetic: InterpretationInput['aesthetic'],
  behavioral?: BehavioralInput
): EnhancedConstellationResult {
  // Build interpretation input
  const input: InterpretationInput = {
    primaryConstellationId: profile.primaryConstellationId as ConstellationId,
    blendWeights: profile.blendWeights as Partial<Record<ConstellationId, number>>,
    subtasteIndex: profile.subtasteIndex,
    explorerScore: profile.explorerScore,
    earlyAdopterScore: profile.earlyAdopterScore,
    traits,
    aesthetic,
    behavioral,
  };

  // Generate all interpretation layers
  const blendNarrative = generateBlendNarrative(input);
  const flavorState = computeFlavorState(input);
  const behavioralProfile = computeBehavioralModifiers(input);
  const subcultureFit = predictSubcultureFit(input);
  const identityComponents = extractIdentityComponents(input, blendNarrative, flavorState);
  const identityStatement = generateIdentityStatement(
    blendNarrative,
    flavorState,
    behavioralProfile
  );

  return {
    blendNarrative,
    flavorState,
    behavioralProfile,
    subcultureFit,
    identityStatement,
    identityComponents,
  };
}

// =============================================================================
// Subculture Fit Prediction
// =============================================================================

/**
 * Predict subculture/scene fit based on profile
 *
 * TODO: Replace with ML model trained on:
 * - User-subculture co-occurrence data
 * - Subculture emergence timing
 * - Cross-modal content clustering
 */
function predictSubcultureFit(input: InterpretationInput): SubcultureFitPrediction[] {
  const predictions: SubcultureFitPrediction[] = [];

  // Define subculture affinities based on constellation blends
  // In production, these would be learned clusters
  const SUBCULTURE_PROFILES: {
    name: string;
    affinityConstellations: ConstellationId[];
    traitWeights: Partial<Record<keyof InterpretationInput['traits'], number>>;
    description: string;
  }[] = [
    {
      name: 'Underground Electronic',
      affinityConstellations: ['nycataria', 'velocine', 'radianth', 'iridrax'],
      traitWeights: { noveltySeeking: 1, riskTolerance: 0.8, extraversion: 0.6 },
      description: 'Late-night clubs, warehouse parties, experimental sounds',
    },
    {
      name: 'Digital Art & Generative',
      affinityConstellations: ['holovain', 'chromyne', 'nexyra', 'prismora'],
      traitWeights: { openness: 1, aestheticSensitivity: 0.9, noveltySeeking: 0.7 },
      description: 'NFT galleries, creative coding, algorithmic beauty',
    },
    {
      name: 'Ambient & Contemplative',
      affinityConstellations: ['somnexis', 'astryde', 'glaceryl', 'opalith'],
      traitWeights: { openness: 0.8, aestheticSensitivity: 1, neuroticism: 0.5 },
      description: 'Drone concerts, meditation spaces, liminal soundscapes',
    },
    {
      name: 'Dark/Gothic Scene',
      affinityConstellations: ['obscyra', 'nycataria', 'noctyra'],
      traitWeights: { aestheticSensitivity: 1, openness: 0.7, agreeableness: -0.3 },
      description: 'Industrial nights, darkwave, Victorian aesthetics',
    },
    {
      name: 'Cottagecore & Folk',
      affinityConstellations: ['vireth', 'glovern', 'glemyth', 'luminth'],
      traitWeights: { agreeableness: 1, conscientiousness: 0.7, neuroticism: -0.5 },
      description: 'Folk festivals, craft communities, nature aesthetics',
    },
    {
      name: 'Hyperpop & Post-Internet',
      affinityConstellations: ['holovain', 'nexyra', 'fluxeris', 'velisynth'],
      traitWeights: { noveltySeeking: 1, riskTolerance: 0.8, openness: 0.9 },
      description: 'Discord servers, glitchy aesthetics, ironic sincerity',
    },
    {
      name: 'Avant-Garde & Experimental',
      affinityConstellations: ['vantoryx', 'fluxeris', 'chromyne'],
      traitWeights: { openness: 1, riskTolerance: 0.9, agreeableness: -0.2 },
      description: 'Gallery openings, noise shows, conceptual art',
    },
    {
      name: 'Minimalist Design',
      affinityConstellations: ['crysolen', 'lucidyne', 'prismora', 'glaceryl'],
      traitWeights: { conscientiousness: 1, aestheticSensitivity: 0.8, noveltySeeking: -0.3 },
      description: 'Design exhibitions, architecture tours, clean aesthetics',
    },
  ];

  for (const subculture of SUBCULTURE_PROFILES) {
    // Calculate constellation affinity
    let constellationScore = 0;
    for (const constellation of subculture.affinityConstellations) {
      const weight = input.blendWeights[constellation] ?? 0;
      constellationScore += weight;
    }
    constellationScore = Math.min(constellationScore * 2, 1); // Normalize

    // Calculate trait affinity
    let traitScore = 0;
    let traitCount = 0;
    for (const [trait, weight] of Object.entries(subculture.traitWeights)) {
      const traitValue = input.traits[trait as keyof InterpretationInput['traits']];
      if (traitValue !== undefined && weight !== undefined) {
        if (weight >= 0) {
          traitScore += traitValue * weight;
        } else {
          traitScore += (1 - traitValue) * Math.abs(weight);
        }
        traitCount += Math.abs(weight);
      }
    }
    traitScore = traitCount > 0 ? traitScore / traitCount : 0.5;

    // Combined fit score
    const fitScore = Math.round((constellationScore * 0.6 + traitScore * 0.4) * 100);

    if (fitScore >= 40) {
      // Determine adoption timing based on early adopter score
      let adoptionTiming: SubcultureFitPrediction['adoptionTiming'];
      if (input.earlyAdopterScore >= 75) {
        adoptionTiming = 'early_wave';
      } else if (input.earlyAdopterScore >= 50) {
        adoptionTiming = 'growth_phase';
      } else if (input.earlyAdopterScore >= 30) {
        adoptionTiming = 'mainstream';
      } else {
        adoptionTiming = 'late_discovery';
      }

      predictions.push({
        name: subculture.name,
        fitScore,
        adoptionTiming,
        reasoning: subculture.description,
      });
    }
  }

  // Sort by fit score and return top 5
  return predictions
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 5);
}

// =============================================================================
// Identity Component Extraction
// =============================================================================

/**
 * Extract identity components for patent-aligned documentation
 * Shows that identity emerges from computation, not fixed classes
 */
function extractIdentityComponents(
  input: InterpretationInput,
  narrative: BlendNarrative,
  flavor?: FlavorState
): IdentityComponent[] {
  const components: IdentityComponent[] = [];

  // Psychometric components
  const dominantTraits = Object.entries(input.traits)
    .filter(([, value]) => value >= 0.7 || value <= 0.3)
    .sort((a, b) => Math.abs(b[1] - 0.5) - Math.abs(a[1] - 0.5));

  for (const [trait, value] of dominantTraits.slice(0, 3)) {
    components.push({
      type: 'psychometric',
      name: trait,
      value: value >= 0.7 ? 'high' : 'low',
      weight: Math.abs(value - 0.5) * 2,
      source: 'IRT-scored quiz responses',
    });
  }

  // Aesthetic components
  if (input.aesthetic.darknessPreference > 0.7 || input.aesthetic.darknessPreference < 0.3) {
    components.push({
      type: 'aesthetic',
      name: 'darkness_preference',
      value: input.aesthetic.darknessPreference > 0.7 ? 'dark' : 'bright',
      weight: Math.abs(input.aesthetic.darknessPreference - 0.5) * 2,
      source: 'Quiz aesthetic questions',
    });
  }

  if (input.aesthetic.organicVsSynthetic > 0.7 || input.aesthetic.organicVsSynthetic < 0.3) {
    components.push({
      type: 'aesthetic',
      name: 'organic_synthetic',
      value: input.aesthetic.organicVsSynthetic > 0.7 ? 'synthetic' : 'organic',
      weight: Math.abs(input.aesthetic.organicVsSynthetic - 0.5) * 2,
      source: 'Quiz aesthetic questions',
    });
  }

  // Behavioral components (if available)
  if (input.behavioral) {
    if (input.behavioral.contentDiversity !== undefined) {
      components.push({
        type: 'behavioral',
        name: 'content_diversity',
        value: input.behavioral.contentDiversity > 0.6 ? 'high' : input.behavioral.contentDiversity < 0.4 ? 'low' : 'moderate',
        weight: 0.7,
        source: 'Interaction pattern analysis',
      });
    }

    if (input.behavioral.sessionDepth !== undefined) {
      components.push({
        type: 'behavioral',
        name: 'session_depth',
        value: input.behavioral.sessionDepth > 10 ? 'deep' : 'shallow',
        weight: 0.6,
        source: 'Session engagement metrics',
      });
    }
  }

  // Temporal components
  components.push({
    type: 'temporal',
    name: 'adoption_tendency',
    value: input.earlyAdopterScore >= 70 ? 'early_adopter' : input.earlyAdopterScore <= 30 ? 'late_wave' : 'mainstream',
    weight: input.earlyAdopterScore / 100,
    source: 'Trait-derived prediction',
  });

  // Cross-modal components (placeholder for ML integration)
  components.push({
    type: 'cross_modal',
    name: 'constellation_anchor',
    value: narrative.primaryName,
    weight: input.blendWeights[input.primaryConstellationId] ?? 0,
    source: 'Multi-trait constellation matching',
  });

  return components;
}

// =============================================================================
// Identity Statement Generation
// =============================================================================

/**
 * Generate complete identity statement
 * Example: "You are a Radianth with Iridrax undertones, operating in an Early-Adopter, High-Entropy mode."
 */
function generateIdentityStatement(
  narrative: BlendNarrative,
  flavor: FlavorState | undefined,
  behavioral: BehavioralProfile
): string {
  const parts: string[] = [];

  // Primary identity
  if (narrative.secondary.length > 0) {
    const topSecondary = narrative.secondary[0];
    parts.push(`You are a ${narrative.primaryName} with ${topSecondary.modifierPhrase} undertones`);
  } else {
    parts.push(`You are a ${narrative.primaryName}`);
  }

  // Flavor state
  if (flavor) {
    parts[0] += ` (${flavor.displayName})`;
  }

  // Behavioral mode
  const modeString = getBehavioralModeString(behavioral);
  if (modeString !== 'Adaptive mode') {
    parts.push(`operating in ${modeString}`);
  }

  return parts.join(', ') + '.';
}

// =============================================================================
// Utility Exports
// =============================================================================

/**
 * Generate short identity badge for UI
 */
export function generateIdentityBadge(
  narrative: BlendNarrative,
  flavor?: FlavorState
): string {
  const badge = generateBlendBadge(narrative.primary, narrative.secondary);
  if (flavor) {
    return `${badge} · ${flavor.displayName}`;
  }
  return badge;
}

/**
 * Check if behavioral data is sufficient for enhanced analysis
 */
export function hasSufficientBehavioralData(behavioral?: BehavioralInput): boolean {
  if (!behavioral) return false;

  const hasCore = behavioral.sessionCount !== undefined && behavioral.sessionCount >= 3;
  const hasEngagement = behavioral.contentDiversity !== undefined ||
                        behavioral.sessionDepth !== undefined;

  return hasCore && hasEngagement;
}

// Re-export types and sub-modules
export * from './types';
export { generateBlendNarrative, generateBlendBadge } from './blend-narrative';
export { computeFlavorState, getAllFlavorStates } from './flavor-states';
export { computeBehavioralModifiers, getBehavioralModeString } from './behavioral-modifiers';

export default generateEnhancedInterpretation;
