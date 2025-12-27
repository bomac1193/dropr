/**
 * Supabase Storage Layer
 *
 * Provides typed CRUD operations for all Subtaste profile tables.
 *
 * USAGE:
 * ```typescript
 * import { createClient } from '@supabase/supabase-js';
 * import { createStorageClient } from '@/lib/storage';
 *
 * const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 * const storage = createStorageClient(supabase);
 *
 * // Save representation profile
 * await storage.representation.save(userId, profile, constraints);
 *
 * // Get full user profile
 * const fullProfile = await storage.profile.getFullProfile(userId);
 *
 * // Save history snapshot
 * await storage.history.save(userId, 'representation', profileData, 1);
 * ```
 *
 * TABLES:
 * - users: Core user identity
 * - psychometric_profiles: Big Five + extended traits
 * - aesthetic_preferences: Visual and music preferences
 * - constellation_profiles: Archetypal mappings
 * - representation_profiles: Universal dimensions (Module 4)
 * - profile_history: Versioned snapshots for drift analysis
 * - quiz_sessions: Quiz state management
 */

// Export storage client
export { createStorageClient, StorageClient, StorageError } from './client';

// Export types
export * from './types';

// =============================================================================
// Profile Saving Utilities
// =============================================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { createStorageClient } from './client';
import { computeFullProfile } from '../representation';
import { PsychometricInput, AestheticInput, BehavioralInput } from '../representation/types';

/**
 * Save all profiles after quiz completion
 *
 * This is the main entry point for saving a user's complete profile
 * after they complete the quiz. It:
 * 1. Computes constellation + representation profiles
 * 2. Saves all layers to database
 * 3. Creates history snapshots for drift analysis
 */
export async function saveCompleteProfile(
  supabase: SupabaseClient,
  userId: string,
  psychometric: PsychometricInput,
  aesthetic: AestheticInput,
  behavioral?: BehavioralInput
): Promise<{
  success: boolean;
  error?: string;
}> {
  const storage = createStorageClient(supabase);

  try {
    // Compute full profile
    const result = computeFullProfile(psychometric, aesthetic, behavioral);

    // Save psychometric profile
    await storage.psychometric.save({
      user_id: userId,
      openness: psychometric.openness,
      conscientiousness: psychometric.conscientiousness,
      extraversion: psychometric.extraversion,
      agreeableness: psychometric.agreeableness,
      neuroticism: psychometric.neuroticism,
      novelty_seeking: psychometric.noveltySeeking,
      aesthetic_sensitivity: psychometric.aestheticSensitivity,
      risk_tolerance: psychometric.riskTolerance,
      trait_confidence: {},
      overall_confidence: 0.8, // TODO: Get from IRT scoring
    });

    // Save aesthetic preferences
    await storage.aesthetic.save({
      user_id: userId,
      color_palette_vector: [],
      darkness_preference: aesthetic.darknessPreference,
      complexity_preference: aesthetic.complexityPreference,
      symmetry_preference: aesthetic.symmetryPreference,
      organic_vs_synthetic: aesthetic.organicVsSynthetic,
      minimal_vs_maximal: aesthetic.minimalVsMaximal,
      tempo_range_min: aesthetic.tempoRangeMin,
      tempo_range_max: aesthetic.tempoRangeMax,
      energy_range_min: aesthetic.energyRangeMin,
      energy_range_max: aesthetic.energyRangeMax,
      harmonic_dissonance_tolerance: aesthetic.harmonicDissonanceTolerance,
      rhythm_preference: aesthetic.rhythmPreference,
      acoustic_vs_digital: aesthetic.acousticVsDigital,
    });

    // Save constellation profile
    await storage.constellation.save({
      user_id: userId,
      primary_constellation_id: result.constellation.profile.primaryConstellationId,
      blend_weights: result.constellation.profile.blendWeights,
      subtaste_index: result.constellation.profile.subtasteIndex,
      explorer_score: result.constellation.profile.explorerScore,
      early_adopter_score: result.constellation.profile.earlyAdopterScore,
      enhanced_interpretation: result.constellation.enhanced ?? null,
    });

    // Save representation profile
    await storage.representation.save(
      userId,
      result.representation.profile,
      result.representation.constraints,
      result.representation.inputHash
    );

    // Save history snapshots
    await Promise.all([
      storage.history.save(userId, 'psychometric', psychometric, 1),
      storage.history.save(userId, 'aesthetic', aesthetic, 1),
      storage.history.save(
        userId,
        'constellation',
        {
          primaryConstellationId: result.constellation.profile.primaryConstellationId,
          blendWeights: result.constellation.profile.blendWeights,
          subtasteIndex: result.constellation.profile.subtasteIndex,
        },
        1
      ),
      storage.history.save(
        userId,
        'representation',
        result.representation.profile,
        result.representation.profile.version
      ),
    ]);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Update representation profile if inputs have changed
 *
 * Uses input hash to skip redundant computation
 */
export async function updateRepresentationIfNeeded(
  supabase: SupabaseClient,
  userId: string,
  psychometric: PsychometricInput,
  aesthetic: AestheticInput,
  behavioral?: BehavioralInput
): Promise<boolean> {
  const storage = createStorageClient(supabase);

  // Compute new profile to get input hash
  const result = computeFullProfile(psychometric, aesthetic, behavioral);

  // Check if update needed
  const needsUpdate = await storage.representation.needsUpdate(
    userId,
    result.representation.inputHash
  );

  if (needsUpdate) {
    await storage.representation.save(
      userId,
      result.representation.profile,
      result.representation.constraints,
      result.representation.inputHash
    );

    // Save history snapshot
    await storage.history.save(
      userId,
      'representation',
      result.representation.profile,
      result.representation.profile.version,
      'profile_update'
    );

    return true;
  }

  return false;
}

export default createStorageClient;
