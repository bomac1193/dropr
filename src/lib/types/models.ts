/**
 * Subtaste Data Models - TypeScript Interfaces
 *
 * These interfaces define the multi-layer taste profile system:
 * 1. Psychometric Layer - Big Five + extended traits
 * 2. Aesthetic Layer - Visual and music preferences
 * 3. Constellation Layer - Archetypal mappings
 * 4. Behavioral Layer - Interaction and content scoring
 *
 * Together, these create a unified taste vector per user that enables
 * cross-modal content scoring and subculture cluster detection.
 */

import { ConstellationId } from '../constellations/types';

// =============================================================================
// User & Identity
// =============================================================================

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  // Relations (populated separately)
  psychometricProfile?: PsychometricProfile;
  aestheticPreference?: AestheticPreference;
  constellationProfile?: ConstellationProfile;
}

// =============================================================================
// Psychometric Layer
// =============================================================================

/**
 * PsychometricProfile captures validated psychological traits.
 *
 * Big Five (OCEAN) traits are well-established in psychology.
 * Extended traits (noveltySeeking, aestheticSensitivity, riskTolerance) capture
 * taste-relevant dimensions not fully covered by Big Five.
 *
 * All values are normalized 0-1:
 * - 0 = low expression
 * - 0.5 = average
 * - 1 = high expression
 */
export interface PsychometricProfile {
  id: string;
  userId: string;

  // Big Five (OCEAN)
  openness: number;           // curiosity, imagination, openness to experience
  conscientiousness: number;  // organization, discipline, goal-directed
  extraversion: number;       // sociability, assertiveness, positive emotions
  agreeableness: number;      // cooperation, trust, altruism
  neuroticism: number;        // emotional instability, anxiety, moodiness

  // Extended traits (taste-specific)
  noveltySeeking: number;        // preference for new/unfamiliar experiences
  aestheticSensitivity: number;  // sensitivity to beauty, art, design
  riskTolerance: number;         // comfort with uncertainty and risk

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Trait deltas used when processing quiz answers.
 * Values can be positive or negative adjustments.
 */
export interface TraitDeltas {
  openness?: number;
  conscientiousness?: number;
  extraversion?: number;
  agreeableness?: number;
  neuroticism?: number;
  noveltySeeking?: number;
  aestheticSensitivity?: number;
  riskTolerance?: number;
}

// =============================================================================
// Aesthetic Layer
// =============================================================================

/**
 * AestheticPreference captures visual and music preferences.
 *
 * This layer bridges psychometric traits to content features,
 * enabling cross-modal matching (same user preferences apply to
 * images, music, and symbolic artifacts).
 */
export interface AestheticPreference {
  id: string;
  userId: string;

  // Visual preferences
  colorPaletteVector: number[];  // learned embedding from liked colors/palettes
  darknessPreference: number;    // 0 = bright, 1 = dark
  complexityPreference: number;  // 0 = minimal, 1 = maximal/complex
  symmetryPreference: number;    // 0 = asymmetric, 1 = symmetric
  organicVsSynthetic: number;    // 0 = organic/natural, 1 = synthetic/artificial
  minimalVsMaximal: number;      // 0 = minimal, 1 = maximal

  // Music preferences
  tempoRangeMin: number;         // BPM lower bound preference
  tempoRangeMax: number;         // BPM upper bound preference
  energyRangeMin: number;        // 0-1 energy lower bound
  energyRangeMax: number;        // 0-1 energy upper bound
  harmonicDissonanceTolerance: number;  // 0 = consonant only, 1 = enjoys dissonance
  rhythmPreference: number;      // 0 = flowing/ambient, 1 = rhythmic/percussive
  acousticVsDigital: number;     // 0 = acoustic, 1 = digital/electronic

  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// Constellation Layer
// =============================================================================

/**
 * ConstellationProfile maps a user to archetypal taste clusters.
 *
 * Each user has a primary constellation and blend weights showing
 * affinity to all constellations. This enables:
 * - Clear user identity ("You are Somnexis")
 * - Nuanced content matching (blend weights)
 * - Creative prompt generation (constellation-specific hooks)
 */
export interface ConstellationProfile {
  id: string;
  userId: string;

  primaryConstellationId: ConstellationId;

  /**
   * Blend weights map each constellation to an affinity score 0-1.
   * Sum should approximate 1 (can be slightly off due to rounding).
   * Only constellations with meaningful affinity need to be included.
   */
  blendWeights: { [K in ConstellationId]?: number };

  /**
   * Subtaste Index (0-100): Measures coherence/distinctiveness of taste.
   * High = very specific, consistent preferences.
   * Low = eclectic, broad preferences.
   */
  subtasteIndex: number;

  /**
   * Explorer Score (0-100): How actively the user seeks new experiences.
   * Derived from openness, noveltySeeking, and interaction diversity.
   */
  explorerScore: number;

  /**
   * Early Adopter Score (0-100): Tendency to adopt trends early.
   * Derived from subculture timing analysis and risk tolerance.
   */
  earlyAdopterScore: number;

  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// Subculture Clusters
// =============================================================================

/**
 * SubcultureCluster represents an emergent or defined subculture.
 *
 * Clusters can be discovered through content clustering or defined manually.
 * They enable early-adopter detection and trend prediction.
 */
export interface SubcultureCluster {
  id: string;
  name: string;
  tags: string[];              // descriptive tags
  embeddingVector: number[];   // learned embedding for similarity
  constellationHints?: ConstellationId[];  // constellations with high affinity
  createdAt: Date;
  updatedAt: Date;
}

/**
 * UserSubcultureFit tracks a user's relationship to a subculture over time.
 */
export interface UserSubcultureFit {
  id: string;
  userId: string;
  subcultureId: string;

  affinityScore: number;       // 0-100, how well user fits this subculture
  earlyAdopterScore: number;   // 0-100, how early they adopted
  adoptionStage: 'early' | 'mid' | 'late';

  firstSeenAt: Date;           // when user first engaged with this subculture
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// Content & Interactions
// =============================================================================

/**
 * ContentItem represents any piece of content that can be scored.
 */
export interface ContentItem {
  id: string;
  type: 'image' | 'track' | 'ai_artifact';
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  contentUrl?: string;

  featureEmbedding: number[];  // learned embedding for similarity
  tags: string[];
  subcultureId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type InteractionType = 'view' | 'like' | 'dislike' | 'save' | 'share' | 'skip';
export type InteractionSource = 'quiz' | 'swipe' | 'feed';

/**
 * UserContentInteraction logs every user-content touchpoint.
 *
 * This is the behavioral foundation of taste learning.
 */
export interface UserContentInteraction {
  id: string;
  userId: string;
  contentId: string;

  interactionType: InteractionType;
  rating?: 1 | 2 | 3 | 4 | 5;   // optional star rating
  dwellTimeMs?: number;         // time spent viewing
  source: InteractionSource;

  createdAt: Date;
}

/**
 * ContentScore is the computed alignment between a user and content.
 *
 * Multiple scores are computed and combined to create the overall score.
 */
export interface ContentScore {
  id: string;
  userId: string;
  contentId: string;

  // Component scores (0-100)
  psychAlignmentScore: number;     // how well content matches psychometric profile
  aestheticAlignmentScore: number; // how well content matches aesthetic preferences
  behavioralScore: number;         // how similar to previously-liked content
  subcultureFitScore: number;      // how well content fits user's subculture affinities

  // Combined score
  overallScore: number;            // 0-100, weighted combination

  // User-facing representations
  stars: 1 | 2 | 3 | 4 | 5;
  highlight: boolean;              // should this content be prominently featured?
  deleteRecommended: boolean;      // should this content be hidden?

  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// Aggregated Stats (for constellation computation)
// =============================================================================

/**
 * UserInteractionsSummary aggregates interaction data for constellation computation.
 *
 * This is a derived structure, not stored directly in DB.
 */
export interface UserInteractionsSummary {
  // Visual aggregates
  dominantColors: string[];
  preferredDarkness: number;       // average darkness of liked content
  preferredComplexity: number;     // average complexity of liked content

  // Music aggregates
  preferredTempoRange: [number, number];
  preferredEnergyRange: [number, number];
  dominantMoods: string[];

  // Tag/scene aggregates
  favoriteTags: { tag: string; count: number }[];
  favoriteScenes: string[];

  // Engagement stats
  totalInteractions: number;
  likeRatio: number;              // likes / total interactions
  avgDwellTimeMs: number;
  contentDiversity: number;        // 0-1, how varied are interactions
}
