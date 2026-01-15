/**
 * Representation Layer Types
 *
 * Module 4: Converts measured taste and cognition vectors into
 * interpretable representation spaces for content generation and user feedback.
 *
 * This layer does NOT infer traits - it only translates outputs from the
 * constellation scoring system into universal, machine-usable dimensions.
 *
 * DESIGN PRINCIPLES:
 * - Representational dimensions, not archetypes
 * - Machine-readable constraints for AI content generation
 * - Cross-domain interoperability (music, fashion, visual, text)
 * - Pure deterministic computation
 */

// =============================================================================
// Core Representation Profile
// =============================================================================

/**
 * Temporal engagement style
 *
 * - looped: Prefers repetitive, cyclical patterns (loops, mantras, rituals)
 * - evolving: Prefers gradual transformation (builds, journeys, arcs)
 * - episodic: Prefers distinct segments (chapters, scenes, movements)
 */
export type TemporalStyle = 'looped' | 'evolving' | 'episodic';

/**
 * Universal representation profile
 *
 * These dimensions are domain-agnostic and can be used to:
 * - Condition AI music generation
 * - Guide visual content creation
 * - Inform recommendation engines
 * - Drive narrative/text systems
 */
export interface RepresentationProfile {
  /**
   * Energy level preference (0-1)
   * Low: calm, ambient, relaxed
   * High: intense, energetic, driving
   */
  energy: number;

  /**
   * Complexity tolerance (0-1)
   * Low: simple, minimal, clean
   * High: intricate, layered, dense
   */
  complexity: number;

  /**
   * Temporal engagement style
   * How the user prefers content to unfold over time
   */
  temporalStyle: TemporalStyle;

  /**
   * Sensory density preference (0-1)
   * Low: sparse, breathing room, negative space
   * High: maximal, saturated, overwhelming
   */
  sensoryDensity: number;

  /**
   * Identity projection strength (0-1)
   * Low: private, personal, introspective taste
   * High: social, signaling, externally-oriented taste
   */
  identityProjection: number;

  /**
   * Ambiguity tolerance (0-1)
   * Low: prefers clarity, resolution, familiarity
   * High: embraces uncertainty, dissonance, the unknown
   */
  ambiguityTolerance: number;

  /**
   * Schema version for future migrations
   */
  version: number;
}

// =============================================================================
// Computation Input Types
// =============================================================================

/**
 * Psychometric traits from quiz scoring
 */
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

/**
 * Aesthetic preferences from quiz scoring
 */
export interface AestheticInput {
  colorPaletteVector?: number[];
  darknessPreference: number;
  complexityPreference: number;
  symmetryPreference: number;
  organicVsSynthetic: number;
  minimalVsMaximal: number;
  tempoRangeMin: number;
  tempoRangeMax: number;
  energyRangeMin: number;
  energyRangeMax: number;
  harmonicDissonanceTolerance: number;
  rhythmPreference: number;
  acousticVsDigital: number;
}

/**
 * Optional behavioral signals from returning users
 */
export interface BehavioralInput {
  contentDiversity?: number;
  sessionDepth?: number;
  reengagementRate?: number;
  noveltyPreference?: number;
  saveRate?: number;
  shareRate?: number;
  sessionCount?: number;
}

/**
 * Complete input for representation computation
 */
export interface RepresentationInput {
  psychometric: PsychometricInput;
  aesthetic: AestheticInput;
  behavioral?: BehavioralInput;

  // From constellation profile
  subtasteIndex?: number;
  explorerScore?: number;
  earlyAdopterScore?: number;
}

// =============================================================================
// Output Types for AI Systems
// =============================================================================

/**
 * Numeric constraints for AI content generation
 * Used by music models, visual generators, etc.
 */
export interface RepresentationConstraints {
  energyRange: [number, number];
  complexityBias: 'low' | 'medium' | 'high';
  temporalStyle: TemporalStyle;
  densityRange: [number, number];
  ambiguityLevel: 'low' | 'medium' | 'high';
}

/**
 * Full representation output including constraints
 */
export interface RepresentationResult {
  profile: RepresentationProfile;
  constraints: RepresentationConstraints;

  // Metadata
  computedAt: string;
  inputHash: string; // For caching/deduplication
}

// =============================================================================
// Storage Types (for Phase 2)
// =============================================================================

/**
 * Stored representation profile with versioning
 * Maps to Postgres JSONB column
 */
export interface StoredRepresentationProfile {
  representation_profile: RepresentationProfile;
  representation_version: number;
  representation_computed_at: string;
}

export const REPRESENTATION_VERSION = 1;
