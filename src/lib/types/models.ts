/**
 * Model Types
 *
 * Re-exports Prisma types for use in API routes.
 */

export {
  InteractionType,
  InteractionSource,
  ContentType,
  AdoptionStage,
  SubcultureStage,
} from "@prisma/client";

import type { ConstellationId } from "@/lib/constellations/types";

// Re-export ConstellationId for convenience
export type { ConstellationId } from "@/lib/constellations/types";

// Re-export Supabase types (snake_case, for DB operations)
export type {
  PsychometricProfile as PsychometricProfileDB,
  AestheticPreference as AestheticPreferenceDB,
  QuizSession,
  ProfileHistory,
} from "@/lib/supabase/types";

/**
 * App-level PsychometricProfile (camelCase)
 */
export interface PsychometricProfile {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  noveltySeeking: number;
  aestheticSensitivity: number;
  riskTolerance: number;
  traitConfidence?: Record<string, number>;
  overallConfidence?: number;
}

/**
 * App-level AestheticPreference (camelCase)
 */
export interface AestheticPreference {
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
 * ContentItem type for feed/content display
 */
export interface ContentItem {
  id: string;
  type: "image" | "track" | "ai_artifact";
  title?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  contentUrl?: string | null;
  featureEmbedding?: number[];
  tags?: string[];
  subcultureId?: string | null;
  subculture?: {
    id: string;
    name: string | null;
    tags: string[];
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TraitDeltas for quiz scoring
 */
export type TraitId =
  | 'openness'
  | 'conscientiousness'
  | 'extraversion'
  | 'agreeableness'
  | 'neuroticism'
  | 'noveltySeeking'
  | 'aestheticSensitivity'
  | 'riskTolerance';

export type TraitDeltas = Partial<Record<TraitId, number>>;

/**
 * User interactions summary for behavioral analysis
 */
export interface UserInteractionsSummary {
  dominantColors: string[];
  preferredDarkness: number;
  preferredComplexity: number;
  preferredTempoRange: [number, number];
  preferredEnergyRange: [number, number];
  dominantMoods: Array<{ mood: string; count: number }>;
  favoriteTags: Array<{ tag: string; count: number }>;
  favoriteScenes: string[];
  totalInteractions: number;
  likeRatio: number;
  avgDwellTimeMs: number;
  contentDiversity: number;
}

/**
 * ConstellationProfile for taste profiling
 */
export interface ConstellationProfile {
  id?: string;
  userId?: string;
  primaryConstellationId: ConstellationId;
  blendWeights: Record<string, number>;
  subtasteIndex: number;
  explorerScore: number;
  earlyAdopterScore: number;
  enhancedInterpretation?: Record<string, unknown> | null;
  createdAt?: Date;
  updatedAt?: Date;
}
