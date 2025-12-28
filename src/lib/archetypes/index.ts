/**
 * Archetypes Module
 *
 * 8 viral archetypes for taste profiling.
 */

// Types
export * from './types';

// Configuration
export {
  ARCHETYPES,
  ARCHETYPE_LIST,
  getArchetype,
  getArchetypeIds,
} from './config';

// Migration from constellations
export {
  CONSTELLATION_TO_ARCHETYPE,
  CONSTELLATION_ARCHETYPE_AFFINITIES,
  migrateBlendWeights,
  getArchetypeFromConstellation,
  migrateConstellationProfile,
  getConstellationsForArchetype,
  validateMapping,
} from './migration';

// Scoring
export {
  computeArchetypeScores,
  computeArchetypeProfile,
} from './scoring';
export type { PsychometricInput, AestheticInput, ScoringInput } from './scoring';
