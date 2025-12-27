/**
 * Representation Profile Computation
 *
 * Pure function that transforms psychometric traits, aesthetic preferences,
 * and behavioral signals into a universal representation profile.
 *
 * DESIGN PRINCIPLES:
 * - Deterministic: same inputs always produce same outputs
 * - No side effects: pure computation
 * - Composable: each dimension computed independently
 * - Extensible: easy to add new dimensions or modify weights
 */

import {
  RepresentationProfile,
  RepresentationInput,
  RepresentationConstraints,
  RepresentationResult,
  REPRESENTATION_VERSION,
} from './types';
import { classifyTemporalStyle } from './temporal';
import { createHash } from 'crypto';

// =============================================================================
// Dimension Computation Functions
// =============================================================================

/**
 * Compute energy level (0-1)
 *
 * Sources:
 * - energyRangeMin/Max from aesthetic preferences
 * - tempo preferences
 * - extraversion (energetic personality)
 */
function computeEnergy(input: RepresentationInput): number {
  const { psychometric, aesthetic } = input;

  // Primary: energy range from aesthetic preferences
  const energyCenter = (aesthetic.energyRangeMin + aesthetic.energyRangeMax) / 2;

  // Tempo contribution (normalized: 60-180 BPM → 0-1)
  const tempoCenter = (aesthetic.tempoRangeMin + aesthetic.tempoRangeMax) / 2;
  const tempoNormalized = clamp((tempoCenter - 60) / 120, 0, 1);

  // Personality contribution
  const extraversionBoost = (psychometric.extraversion - 0.5) * 0.2;

  // Weighted combination
  const energy = energyCenter * 0.5 + tempoNormalized * 0.3 + 0.5 + extraversionBoost * 0.2;

  return clamp(energy, 0, 1);
}

/**
 * Compute complexity tolerance (0-1)
 *
 * Sources:
 * - complexityPreference from aesthetic preferences
 * - harmonicDissonanceTolerance
 * - openness (cognitive complexity)
 */
function computeComplexity(input: RepresentationInput): number {
  const { psychometric, aesthetic } = input;

  // Primary: direct complexity preference
  const baseComplexity = aesthetic.complexityPreference;

  // Harmonic complexity tolerance
  const harmonicModifier = aesthetic.harmonicDissonanceTolerance * 0.3;

  // Cognitive complexity from openness
  const opennessModifier = (psychometric.openness - 0.5) * 0.2;

  // Aesthetic sensitivity adds appreciation for complexity
  const sensitivityModifier = (psychometric.aestheticSensitivity - 0.5) * 0.1;

  const complexity = baseComplexity * 0.6 + harmonicModifier + opennessModifier + sensitivityModifier + 0.4;

  return clamp(complexity, 0, 1);
}

/**
 * Compute sensory density preference (0-1)
 *
 * Sources:
 * - minimalVsMaximal from aesthetic preferences
 * - complexityPreference
 * - energy preferences
 */
function computeSensoryDensity(input: RepresentationInput): number {
  const { aesthetic } = input;

  // Primary: minimal vs maximal preference (0 = minimal, 1 = maximal)
  const baseDensity = aesthetic.minimalVsMaximal;

  // Complexity adds density
  const complexityModifier = aesthetic.complexityPreference * 0.2;

  // High energy often correlates with density
  const energyCenter = (aesthetic.energyRangeMin + aesthetic.energyRangeMax) / 2;
  const energyModifier = energyCenter * 0.15;

  // Rhythm preference (strong rhythm = more density)
  const rhythmModifier = aesthetic.rhythmPreference * 0.1;

  const density = baseDensity * 0.55 + complexityModifier + energyModifier + rhythmModifier;

  return clamp(density, 0, 1);
}

/**
 * Compute identity projection strength (0-1)
 *
 * Sources:
 * - extraversion (social orientation)
 * - shareRate from behavioral data
 * - agreeableness (social harmony seeking)
 */
function computeIdentityProjection(input: RepresentationInput): number {
  const { psychometric, behavioral } = input;

  // Primary: extraversion drives social signaling
  let projection = psychometric.extraversion * 0.4;

  // Agreeableness: wanting to connect through shared taste
  projection += psychometric.agreeableness * 0.2;

  // Behavioral: actual sharing behavior
  if (behavioral?.shareRate !== undefined) {
    projection += behavioral.shareRate * 0.3;
  } else {
    // Without behavioral data, extraversion carries more weight
    projection += psychometric.extraversion * 0.15;
  }

  // Low neuroticism = more comfortable projecting identity
  projection += (1 - psychometric.neuroticism) * 0.1;

  return clamp(projection, 0, 1);
}

/**
 * Compute ambiguity tolerance (0-1)
 *
 * Sources:
 * - openness (comfort with uncertainty)
 * - riskTolerance
 * - harmonicDissonanceTolerance
 * - noveltySeeking
 */
function computeAmbiguityTolerance(input: RepresentationInput): number {
  const { psychometric, aesthetic } = input;

  // Primary: openness is core to ambiguity tolerance
  let tolerance = psychometric.openness * 0.35;

  // Risk tolerance: comfort with uncertain outcomes
  tolerance += psychometric.riskTolerance * 0.25;

  // Harmonic dissonance: tolerance for unresolved tension
  tolerance += aesthetic.harmonicDissonanceTolerance * 0.2;

  // Novelty seeking: embracing the unknown
  tolerance += psychometric.noveltySeeking * 0.15;

  // Low conscientiousness = less need for clarity
  tolerance += (1 - psychometric.conscientiousness) * 0.05;

  return clamp(tolerance, 0, 1);
}

// =============================================================================
// Constraint Generation
// =============================================================================

/**
 * Generate machine-readable constraints from profile
 * Used by AI content generation systems
 */
function generateConstraints(profile: RepresentationProfile): RepresentationConstraints {
  // Energy range (±0.15 from center)
  const energyRange: [number, number] = [
    clamp(profile.energy - 0.15, 0, 1),
    clamp(profile.energy + 0.15, 0, 1),
  ];

  // Complexity as categorical
  const complexityBias: 'low' | 'medium' | 'high' =
    profile.complexity < 0.35 ? 'low' : profile.complexity > 0.65 ? 'high' : 'medium';

  // Density range
  const densityRange: [number, number] = [
    clamp(profile.sensoryDensity - 0.2, 0, 1),
    clamp(profile.sensoryDensity + 0.2, 0, 1),
  ];

  // Ambiguity as categorical
  const ambiguityLevel: 'low' | 'medium' | 'high' =
    profile.ambiguityTolerance < 0.35 ? 'low' : profile.ambiguityTolerance > 0.65 ? 'high' : 'medium';

  return {
    energyRange,
    complexityBias,
    temporalStyle: profile.temporalStyle,
    densityRange,
    ambiguityLevel,
  };
}

// =============================================================================
// Main Computation Function
// =============================================================================

/**
 * Compute complete representation profile from input data
 *
 * @param input - Psychometric, aesthetic, and behavioral data
 * @returns Full representation profile with constraints
 */
export function computeRepresentationProfile(input: RepresentationInput): RepresentationResult {
  // Compute each dimension
  const profile: RepresentationProfile = {
    energy: computeEnergy(input),
    complexity: computeComplexity(input),
    temporalStyle: classifyTemporalStyle(input),
    sensoryDensity: computeSensoryDensity(input),
    identityProjection: computeIdentityProjection(input),
    ambiguityTolerance: computeAmbiguityTolerance(input),
    version: REPRESENTATION_VERSION,
  };

  // Generate constraints for AI systems
  const constraints = generateConstraints(profile);

  // Create input hash for caching
  const inputHash = createInputHash(input);

  return {
    profile,
    constraints,
    computedAt: new Date().toISOString(),
    inputHash,
  };
}

/**
 * Compute representation profile only (without constraints)
 * Lighter-weight for storage
 */
export function computeRepresentationProfileOnly(input: RepresentationInput): RepresentationProfile {
  return {
    energy: computeEnergy(input),
    complexity: computeComplexity(input),
    temporalStyle: classifyTemporalStyle(input),
    sensoryDensity: computeSensoryDensity(input),
    identityProjection: computeIdentityProjection(input),
    ambiguityTolerance: computeAmbiguityTolerance(input),
    version: REPRESENTATION_VERSION,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Create hash of input for caching/deduplication
 */
function createInputHash(input: RepresentationInput): string {
  const normalized = JSON.stringify({
    p: input.psychometric,
    a: input.aesthetic,
    b: input.behavioral || null,
  });

  return createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

/**
 * Compare two profiles for similarity
 * Returns 0-1 where 1 is identical
 */
export function compareProfiles(a: RepresentationProfile, b: RepresentationProfile): number {
  // Numeric dimensions
  const energyDiff = Math.abs(a.energy - b.energy);
  const complexityDiff = Math.abs(a.complexity - b.complexity);
  const densityDiff = Math.abs(a.sensoryDensity - b.sensoryDensity);
  const projectionDiff = Math.abs(a.identityProjection - b.identityProjection);
  const ambiguityDiff = Math.abs(a.ambiguityTolerance - b.ambiguityTolerance);

  // Categorical dimension
  const temporalMatch = a.temporalStyle === b.temporalStyle ? 1 : 0;

  // Weighted average (temporal style weighted less since it's categorical)
  const numericSimilarity =
    1 - (energyDiff + complexityDiff + densityDiff + projectionDiff + ambiguityDiff) / 5;

  return numericSimilarity * 0.8 + temporalMatch * 0.2;
}

/**
 * Get profile as a flat numeric vector
 * Useful for clustering and ML
 */
export function profileToVector(profile: RepresentationProfile): number[] {
  const temporalVector =
    profile.temporalStyle === 'looped' ? 0 : profile.temporalStyle === 'evolving' ? 0.5 : 1;

  return [
    profile.energy,
    profile.complexity,
    temporalVector,
    profile.sensoryDensity,
    profile.identityProjection,
    profile.ambiguityTolerance,
  ];
}

export default computeRepresentationProfile;
