/**
 * Supabase Storage Client
 *
 * Provides typed CRUD operations for all profile tables.
 * Handles conversion between app types and database row types.
 *
 * USAGE:
 * ```typescript
 * import { createStorageClient } from '@/lib/storage';
 *
 * const storage = createStorageClient(supabaseClient);
 * await storage.representation.save(userId, profile, constraints);
 * const profile = await storage.representation.get(userId);
 * ```
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  UserRow,
  UserInsert,
  PsychometricProfileRow,
  PsychometricProfileInsert,
  AestheticPreferenceRow,
  AestheticPreferenceInsert,
  ConstellationProfileRow,
  ConstellationProfileInsert,
  RepresentationProfileRow,
  RepresentationProfileInsert,
  ProfileHistoryRow,
  QuizSessionRow,
  FullUserProfile,
  toRepresentationRow,
  fromRepresentationRow,
} from './types';
import { RepresentationProfile, RepresentationConstraints } from '../representation/types';

// =============================================================================
// Storage Error
// =============================================================================

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

// =============================================================================
// User Storage
// =============================================================================

function createUserStorage(supabase: SupabaseClient) {
  return {
    async get(userId: string): Promise<UserRow | null> {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new StorageError('Failed to get user', error.code, error);
      }

      return data;
    },

    async create(user: UserInsert & { id?: string }): Promise<UserRow> {
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();

      if (error) {
        throw new StorageError('Failed to create user', error.code, error);
      }

      return data;
    },

    async update(userId: string, updates: Partial<UserInsert>): Promise<UserRow> {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new StorageError('Failed to update user', error.code, error);
      }

      return data;
    },
  };
}

// =============================================================================
// Psychometric Storage
// =============================================================================

function createPsychometricStorage(supabase: SupabaseClient) {
  return {
    async get(userId: string): Promise<PsychometricProfileRow | null> {
      const { data, error } = await supabase
        .from('psychometric_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new StorageError('Failed to get psychometric profile', error.code, error);
      }

      return data;
    },

    async save(profile: PsychometricProfileInsert): Promise<PsychometricProfileRow> {
      const { data, error } = await supabase
        .from('psychometric_profiles')
        .upsert(profile, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        throw new StorageError('Failed to save psychometric profile', error.code, error);
      }

      return data;
    },
  };
}

// =============================================================================
// Aesthetic Storage
// =============================================================================

function createAestheticStorage(supabase: SupabaseClient) {
  return {
    async get(userId: string): Promise<AestheticPreferenceRow | null> {
      const { data, error } = await supabase
        .from('aesthetic_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new StorageError('Failed to get aesthetic preferences', error.code, error);
      }

      return data;
    },

    async save(preferences: AestheticPreferenceInsert): Promise<AestheticPreferenceRow> {
      const { data, error } = await supabase
        .from('aesthetic_preferences')
        .upsert(preferences, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        throw new StorageError('Failed to save aesthetic preferences', error.code, error);
      }

      return data;
    },
  };
}

// =============================================================================
// Constellation Storage
// =============================================================================

function createConstellationStorage(supabase: SupabaseClient) {
  return {
    async get(userId: string): Promise<ConstellationProfileRow | null> {
      const { data, error } = await supabase
        .from('constellation_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new StorageError('Failed to get constellation profile', error.code, error);
      }

      return data;
    },

    async save(profile: ConstellationProfileInsert): Promise<ConstellationProfileRow> {
      const { data, error } = await supabase
        .from('constellation_profiles')
        .upsert(profile, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        throw new StorageError('Failed to save constellation profile', error.code, error);
      }

      return data;
    },
  };
}

// =============================================================================
// Representation Storage
// =============================================================================

function createRepresentationStorage(supabase: SupabaseClient) {
  return {
    /**
     * Get representation profile for a user
     */
    async get(userId: string): Promise<RepresentationProfileRow | null> {
      const { data, error } = await supabase
        .from('representation_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new StorageError('Failed to get representation profile', error.code, error);
      }

      return data;
    },

    /**
     * Get representation profile as app type
     */
    async getProfile(userId: string): Promise<RepresentationProfile | null> {
      const row = await this.get(userId);
      return row ? fromRepresentationRow(row) : null;
    },

    /**
     * Save representation profile (upsert)
     */
    async save(
      userId: string,
      profile: RepresentationProfile,
      constraints: RepresentationConstraints,
      inputHash?: string
    ): Promise<RepresentationProfileRow> {
      const row = toRepresentationRow(userId, profile, constraints, inputHash);

      const { data, error } = await supabase
        .from('representation_profiles')
        .upsert(row, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        throw new StorageError('Failed to save representation profile', error.code, error);
      }

      return data;
    },

    /**
     * Check if profile needs update based on input hash
     */
    async needsUpdate(userId: string, inputHash: string): Promise<boolean> {
      const existing = await this.get(userId);
      if (!existing) return true;
      return existing.input_hash !== inputHash;
    },

    /**
     * Get all profiles for clustering (admin/batch operation)
     */
    async getAll(limit = 1000, offset = 0): Promise<RepresentationProfileRow[]> {
      const { data, error } = await supabase
        .from('representation_profiles')
        .select('*')
        .range(offset, offset + limit - 1);

      if (error) {
        throw new StorageError('Failed to get representation profiles', error.code, error);
      }

      return data ?? [];
    },

    /**
     * Get profiles by temporal style
     */
    async getByTemporalStyle(style: string): Promise<RepresentationProfileRow[]> {
      const { data, error } = await supabase
        .from('representation_profiles')
        .select('*')
        .eq('temporal_style', style);

      if (error) {
        throw new StorageError('Failed to get profiles by temporal style', error.code, error);
      }

      return data ?? [];
    },

    /**
     * Get count of profiles
     */
    async count(): Promise<number> {
      const { count, error } = await supabase
        .from('representation_profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new StorageError('Failed to count profiles', error.code, error);
      }

      return count ?? 0;
    },
  };
}

// =============================================================================
// Profile History Storage
// =============================================================================

function createHistoryStorage(supabase: SupabaseClient) {
  return {
    /**
     * Save a profile snapshot to history
     */
    async save(
      userId: string,
      profileType: ProfileHistoryRow['profile_type'],
      profileData: Record<string, unknown>,
      version: number,
      trigger = 'quiz_complete'
    ): Promise<ProfileHistoryRow> {
      const { data, error } = await supabase
        .from('profile_history')
        .insert({
          user_id: userId,
          profile_type: profileType,
          profile_data: profileData,
          version,
          trigger,
        })
        .select()
        .single();

      if (error) {
        throw new StorageError('Failed to save profile history', error.code, error);
      }

      return data;
    },

    /**
     * Get history for a user
     */
    async getForUser(
      userId: string,
      profileType?: ProfileHistoryRow['profile_type'],
      limit = 10
    ): Promise<ProfileHistoryRow[]> {
      let query = supabase
        .from('profile_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (profileType) {
        query = query.eq('profile_type', profileType);
      }

      const { data, error } = await query;

      if (error) {
        throw new StorageError('Failed to get profile history', error.code, error);
      }

      return data ?? [];
    },

    /**
     * Get profile drift over time
     */
    async getDrift(
      userId: string,
      profileType: ProfileHistoryRow['profile_type']
    ): Promise<{ timestamp: string; data: Record<string, unknown> }[]> {
      const history = await this.getForUser(userId, profileType, 50);

      return history.map((h) => ({
        timestamp: h.created_at,
        data: h.profile_data,
      }));
    },
  };
}

// =============================================================================
// Quiz Session Storage
// =============================================================================

function createQuizStorage(supabase: SupabaseClient) {
  return {
    async get(sessionId: string): Promise<QuizSessionRow | null> {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new StorageError('Failed to get quiz session', error.code, error);
      }

      return data;
    },

    async create(userId?: string): Promise<QuizSessionRow> {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: userId,
          status: 'in_progress',
          selected_questions: [],
          answers: [],
        })
        .select()
        .single();

      if (error) {
        throw new StorageError('Failed to create quiz session', error.code, error);
      }

      return data;
    },

    async update(
      sessionId: string,
      updates: Partial<QuizSessionRow>
    ): Promise<QuizSessionRow> {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        throw new StorageError('Failed to update quiz session', error.code, error);
      }

      return data;
    },

    async complete(sessionId: string): Promise<QuizSessionRow> {
      return this.update(sessionId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
    },
  };
}

// =============================================================================
// Full Profile Operations
// =============================================================================

function createFullProfileOperations(supabase: SupabaseClient) {
  const user = createUserStorage(supabase);
  const psychometric = createPsychometricStorage(supabase);
  const aesthetic = createAestheticStorage(supabase);
  const constellation = createConstellationStorage(supabase);
  const representation = createRepresentationStorage(supabase);

  return {
    /**
     * Get complete user profile with all layers
     */
    async getFullProfile(userId: string): Promise<FullUserProfile | null> {
      const userData = await user.get(userId);
      if (!userData) return null;

      const [psychometricData, aestheticData, constellationData, representationData] =
        await Promise.all([
          psychometric.get(userId),
          aesthetic.get(userId),
          constellation.get(userId),
          representation.get(userId),
        ]);

      return {
        user: userData,
        psychometric: psychometricData,
        aesthetic: aestheticData,
        constellation: constellationData,
        representation: representationData,
      };
    },

    /**
     * Check if user has completed onboarding
     */
    async hasCompletedOnboarding(userId: string): Promise<boolean> {
      const [psychometricData, constellationData] = await Promise.all([
        psychometric.get(userId),
        constellation.get(userId),
      ]);

      return psychometricData !== null && constellationData !== null;
    },
  };
}

// =============================================================================
// Main Storage Client
// =============================================================================

export interface StorageClient {
  user: ReturnType<typeof createUserStorage>;
  psychometric: ReturnType<typeof createPsychometricStorage>;
  aesthetic: ReturnType<typeof createAestheticStorage>;
  constellation: ReturnType<typeof createConstellationStorage>;
  representation: ReturnType<typeof createRepresentationStorage>;
  history: ReturnType<typeof createHistoryStorage>;
  quiz: ReturnType<typeof createQuizStorage>;
  profile: ReturnType<typeof createFullProfileOperations>;
}

/**
 * Create a storage client from a Supabase client
 */
export function createStorageClient(supabase: SupabaseClient): StorageClient {
  return {
    user: createUserStorage(supabase),
    psychometric: createPsychometricStorage(supabase),
    aesthetic: createAestheticStorage(supabase),
    constellation: createConstellationStorage(supabase),
    representation: createRepresentationStorage(supabase),
    history: createHistoryStorage(supabase),
    quiz: createQuizStorage(supabase),
    profile: createFullProfileOperations(supabase),
  };
}

export default createStorageClient;
