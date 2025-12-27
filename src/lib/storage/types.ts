/**
 * Storage Layer Types
 *
 * TypeScript types that map to Supabase database schema.
 * These are the "row" types returned from database queries.
 */

import { ConstellationId } from '../constellations/types';
import { TemporalStyle, RepresentationProfile, RepresentationConstraints } from '../representation/types';

// =============================================================================
// Database Row Types
// =============================================================================

/**
 * User row from users table
 */
export interface UserRow {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Psychometric profile row
 */
export interface PsychometricProfileRow {
  id: string;
  user_id: string;
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  novelty_seeking: number;
  aesthetic_sensitivity: number;
  risk_tolerance: number;
  trait_confidence: Record<string, number>;
  overall_confidence: number;
  created_at: string;
  updated_at: string;
}

/**
 * Aesthetic preferences row
 */
export interface AestheticPreferenceRow {
  id: string;
  user_id: string;
  color_palette_vector: number[];
  darkness_preference: number;
  complexity_preference: number;
  symmetry_preference: number;
  organic_vs_synthetic: number;
  minimal_vs_maximal: number;
  tempo_range_min: number;
  tempo_range_max: number;
  energy_range_min: number;
  energy_range_max: number;
  harmonic_dissonance_tolerance: number;
  rhythm_preference: number;
  acoustic_vs_digital: number;
  created_at: string;
  updated_at: string;
}

/**
 * Constellation profile row
 */
export interface ConstellationProfileRow {
  id: string;
  user_id: string;
  primary_constellation_id: ConstellationId;
  blend_weights: Record<string, number>;
  subtaste_index: number;
  explorer_score: number;
  early_adopter_score: number;
  enhanced_interpretation: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Representation profile row
 */
export interface RepresentationProfileRow {
  id: string;
  user_id: string;
  energy: number;
  complexity: number;
  temporal_style: TemporalStyle;
  sensory_density: number;
  identity_projection: number;
  ambiguity_tolerance: number;
  constraints: RepresentationConstraints;
  version: number;
  input_hash: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Profile history row
 */
export interface ProfileHistoryRow {
  id: string;
  user_id: string;
  profile_type: 'psychometric' | 'aesthetic' | 'constellation' | 'representation';
  profile_data: Record<string, unknown>;
  version: number;
  trigger: string;
  created_at: string;
}

/**
 * Quiz session row
 */
export interface QuizSessionRow {
  id: string;
  user_id: string | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  selected_questions: string[];
  answers: Array<{ questionId: string; answerId: string; timestamp: string }>;
  current_question_index: number;
  estimated_confidence: number;
  started_at: string;
  completed_at: string | null;
  is_returning_user: boolean;
  previous_profile_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Subculture cluster row (future Module 5)
 */
export interface SubcultureClusterRow {
  id: string;
  cluster_id: string;
  name: string | null;
  stage: 'forming' | 'stable' | 'dissolving' | 'mainstreaming';
  coherence: number;
  member_count: number;
  aesthetic_constraints: Record<string, unknown>;
  centroid: Record<string, number> | null;
  tags: string[];
  constellation_hints: string[];
  embedding_vector: number[] | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Insert/Update Types (omit auto-generated fields)
// =============================================================================

export type UserInsert = Omit<UserRow, 'id' | 'created_at' | 'updated_at'>;
export type UserUpdate = Partial<UserInsert>;

export type PsychometricProfileInsert = Omit<PsychometricProfileRow, 'id' | 'created_at' | 'updated_at'>;
export type PsychometricProfileUpdate = Partial<Omit<PsychometricProfileInsert, 'user_id'>>;

export type AestheticPreferenceInsert = Omit<AestheticPreferenceRow, 'id' | 'created_at' | 'updated_at'>;
export type AestheticPreferenceUpdate = Partial<Omit<AestheticPreferenceInsert, 'user_id'>>;

export type ConstellationProfileInsert = Omit<ConstellationProfileRow, 'id' | 'created_at' | 'updated_at'>;
export type ConstellationProfileUpdate = Partial<Omit<ConstellationProfileInsert, 'user_id'>>;

export type RepresentationProfileInsert = Omit<RepresentationProfileRow, 'id' | 'created_at' | 'updated_at'>;
export type RepresentationProfileUpdate = Partial<Omit<RepresentationProfileInsert, 'user_id'>>;

// =============================================================================
// Conversion Utilities
// =============================================================================

/**
 * Convert RepresentationProfile (app type) to database row format
 */
export function toRepresentationRow(
  userId: string,
  profile: RepresentationProfile,
  constraints: RepresentationConstraints,
  inputHash?: string
): RepresentationProfileInsert {
  return {
    user_id: userId,
    energy: profile.energy,
    complexity: profile.complexity,
    temporal_style: profile.temporalStyle,
    sensory_density: profile.sensoryDensity,
    identity_projection: profile.identityProjection,
    ambiguity_tolerance: profile.ambiguityTolerance,
    constraints,
    version: profile.version,
    input_hash: inputHash ?? null,
  };
}

/**
 * Convert database row to RepresentationProfile (app type)
 */
export function fromRepresentationRow(row: RepresentationProfileRow): RepresentationProfile {
  return {
    energy: row.energy,
    complexity: row.complexity,
    temporalStyle: row.temporal_style,
    sensoryDensity: row.sensory_density,
    identityProjection: row.identity_projection,
    ambiguityTolerance: row.ambiguity_tolerance,
    version: row.version,
  };
}

// =============================================================================
// Full User Profile (joined data)
// =============================================================================

/**
 * Complete user profile with all layers
 */
export interface FullUserProfile {
  user: UserRow;
  psychometric: PsychometricProfileRow | null;
  aesthetic: AestheticPreferenceRow | null;
  constellation: ConstellationProfileRow | null;
  representation: RepresentationProfileRow | null;
}

/**
 * Minimal profile for listing/search
 */
export interface UserProfileSummary {
  id: string;
  displayName: string | null;
  primaryConstellation: ConstellationId | null;
  temporalStyle: TemporalStyle | null;
  energy: number | null;
  createdAt: string;
}
