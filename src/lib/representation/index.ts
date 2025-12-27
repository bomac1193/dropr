/**
 * Representation Layer (Module 4)
 *
 * Converts measured taste and cognition vectors into interpretable
 * representation spaces for content generation and user feedback.
 *
 * This layer does NOT infer traits - it only translates outputs from
 * the constellation scoring system into universal, machine-usable dimensions.
 *
 * USAGE:
 *
 * ```typescript
 * import { computeRepresentationProfile, computeFullProfile } from '@/lib/representation';
 *
 * // From existing scoring results
 * const representation = computeRepresentationProfile({
 *   psychometric: scoringResult.traits,
 *   aesthetic: scoringResult.aesthetic,
 *   behavioral: userBehavior, // optional
 * });
 *
 * // Or as part of full pipeline
 * const fullResult = computeFullProfile(psychometric, aesthetic, behavioral);
 * // Returns: { constellation, enhanced, representation }
 * ```
 *
 * OUTPUTS:
 * - energy: 0-1 energy level preference
 * - complexity: 0-1 complexity tolerance
 * - temporalStyle: 'looped' | 'evolving' | 'episodic'
 * - sensoryDensity: 0-1 density preference
 * - identityProjection: 0-1 social signaling strength
 * - ambiguityTolerance: 0-1 comfort with uncertainty
 */

// Re-export types
export * from './types';

// Re-export computation functions
export {
  computeRepresentationProfile,
  computeRepresentationProfileOnly,
  compareProfiles,
  profileToVector,
} from './compute';

// Re-export temporal classification
export {
  classifyTemporalStyle,
  analyzeTemporalStyle,
  getTemporalProbabilities,
  temporalStyleToVector,
} from './temporal';

// =============================================================================
// Integration with Constellation Scoring
// =============================================================================

import { computeEnhancedConstellationProfile, ComputedProfile } from '../scoring/constellation';
import { computeRepresentationProfile, computeRepresentationProfileOnly } from './compute';
import {
  RepresentationProfile,
  RepresentationResult,
  RepresentationInput,
  PsychometricInput,
  AestheticInput,
  BehavioralInput,
} from './types';

/**
 * Full profile computation result
 * Combines constellation + enhanced interpretation + representation
 */
export interface FullProfileResult {
  constellation: ComputedProfile;
  representation: RepresentationResult;
}

/**
 * Compute full profile including representation layer
 *
 * This is the recommended entry point for computing a complete user profile.
 * It runs both the constellation scoring and representation computation.
 *
 * @param psychometric - Trait scores from quiz (0-1)
 * @param aesthetic - Aesthetic preferences from quiz
 * @param behavioral - Optional behavioral data for returning users
 * @returns Complete profile with constellation, enhanced interpretation, and representation
 */
export function computeFullProfile(
  psychometric: PsychometricInput,
  aesthetic: AestheticInput,
  behavioral?: BehavioralInput
): FullProfileResult {
  // Compute constellation profile (includes enhanced interpretation)
  const constellation = computeEnhancedConstellationProfile(
    psychometric,
    aesthetic,
    undefined, // No existing profile
    behavioral
  );

  // Build representation input
  const representationInput: RepresentationInput = {
    psychometric,
    aesthetic,
    behavioral,
    subtasteIndex: constellation.profile.subtasteIndex,
    explorerScore: constellation.profile.explorerScore,
    earlyAdopterScore: constellation.profile.earlyAdopterScore,
  };

  // Compute representation profile
  const representation = computeRepresentationProfile(representationInput);

  return {
    constellation,
    representation,
  };
}

/**
 * Add representation to existing constellation profile
 *
 * Use this when you already have a computed constellation profile
 * and want to add the representation layer.
 *
 * @param constellationProfile - Existing computed profile
 * @param psychometric - Original psychometric input
 * @param aesthetic - Original aesthetic input
 * @param behavioral - Optional behavioral data
 * @returns Representation profile
 */
export function addRepresentationToProfile(
  constellationProfile: ComputedProfile,
  psychometric: PsychometricInput,
  aesthetic: AestheticInput,
  behavioral?: BehavioralInput
): RepresentationResult {
  const input: RepresentationInput = {
    psychometric,
    aesthetic,
    behavioral,
    subtasteIndex: constellationProfile.profile.subtasteIndex,
    explorerScore: constellationProfile.profile.explorerScore,
    earlyAdopterScore: constellationProfile.profile.earlyAdopterScore,
  };

  return computeRepresentationProfile(input);
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if a representation profile is valid
 */
export function isValidRepresentationProfile(profile: RepresentationProfile): boolean {
  return (
    typeof profile.energy === 'number' &&
    profile.energy >= 0 &&
    profile.energy <= 1 &&
    typeof profile.complexity === 'number' &&
    profile.complexity >= 0 &&
    profile.complexity <= 1 &&
    ['looped', 'evolving', 'episodic'].includes(profile.temporalStyle) &&
    typeof profile.sensoryDensity === 'number' &&
    profile.sensoryDensity >= 0 &&
    profile.sensoryDensity <= 1 &&
    typeof profile.identityProjection === 'number' &&
    profile.identityProjection >= 0 &&
    profile.identityProjection <= 1 &&
    typeof profile.ambiguityTolerance === 'number' &&
    profile.ambiguityTolerance >= 0 &&
    profile.ambiguityTolerance <= 1 &&
    typeof profile.version === 'number'
  );
}

/**
 * Format representation profile for display
 */
export function formatRepresentationProfile(profile: RepresentationProfile): string {
  const lines = [
    `Energy: ${(profile.energy * 100).toFixed(0)}%`,
    `Complexity: ${(profile.complexity * 100).toFixed(0)}%`,
    `Temporal Style: ${profile.temporalStyle}`,
    `Sensory Density: ${(profile.sensoryDensity * 100).toFixed(0)}%`,
    `Identity Projection: ${(profile.identityProjection * 100).toFixed(0)}%`,
    `Ambiguity Tolerance: ${(profile.ambiguityTolerance * 100).toFixed(0)}%`,
  ];
  return lines.join('\n');
}

/**
 * Get human-readable summary of representation profile
 */
export function getRepresentationSummary(profile: RepresentationProfile): string {
  const parts: string[] = [];

  // Energy
  if (profile.energy > 0.7) {
    parts.push('high-energy');
  } else if (profile.energy < 0.3) {
    parts.push('calm');
  }

  // Complexity
  if (profile.complexity > 0.7) {
    parts.push('complexity-seeking');
  } else if (profile.complexity < 0.3) {
    parts.push('minimalist');
  }

  // Temporal
  parts.push(profile.temporalStyle);

  // Density
  if (profile.sensoryDensity > 0.7) {
    parts.push('maximal');
  } else if (profile.sensoryDensity < 0.3) {
    parts.push('sparse');
  }

  // Identity
  if (profile.identityProjection > 0.7) {
    parts.push('taste-sharer');
  } else if (profile.identityProjection < 0.3) {
    parts.push('private');
  }

  // Ambiguity
  if (profile.ambiguityTolerance > 0.7) {
    parts.push('ambiguity-embracing');
  } else if (profile.ambiguityTolerance < 0.3) {
    parts.push('clarity-seeking');
  }

  return parts.join(', ');
}

export default computeFullProfile;
