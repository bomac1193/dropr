/**
 * Constellation to Archetype Migration
 *
 * Maps the 27 existing constellations to the 8 new viral archetypes.
 * Provides migration utilities for existing user profiles.
 */

import { ConstellationId, CONSTELLATION_IDS } from '../constellations/types';
import { ArchetypeId, ARCHETYPE_IDS } from './types';

// =============================================================================
// Constellation → Archetype Mapping
// =============================================================================

/**
 * Primary mapping from 27 constellations to 8 archetypes
 * Based on trait profile similarity and aesthetic alignment
 */
export const CONSTELLATION_TO_ARCHETYPE: Record<ConstellationId, ArchetypeId> = {
  // VESPYR (The Sage) - dreamy, contemplative, twilight
  somnexis: 'vespyr',
  astryde: 'vespyr',
  opalith: 'vespyr',

  // IGNYX (The Rebel) - dark, intense, boundary-pushing
  vantoryx: 'ignyx',
  velocine: 'ignyx',
  nycataria: 'ignyx',

  // AURYN (The Enlightened) - warm, radiant, harmonious
  luminth: 'auryn',
  lucidyne: 'auryn',
  aurivox: 'auryn',

  // PRISMAE (The Artist) - colorful, expressive, creative
  chromyne: 'prismae',
  prismant: 'prismae',
  iridrax: 'prismae',
  holofern: 'prismae',

  // SOLARA (The Leader) - bold, powerful, radiant
  radianth: 'solara',
  holovain: 'solara',
  prismora: 'solara',

  // CRYPTA (The Hermit) - dark, mysterious, occult
  obscyra: 'crypta',
  noctyra: 'crypta',
  glaceryl: 'crypta',

  // VERTEX (The Visionary) - futuristic, digital, innovative
  nexyra: 'vertex',
  fluxeris: 'vertex',
  velisynth: 'vertex',

  // FLUXUS (The Connector) - fluid, organic, collaborative
  silquor: 'fluxus',
  glemyth: 'fluxus',
  vireth: 'fluxus',
  glovern: 'fluxus',
  crysolen: 'fluxus',
};

/**
 * Secondary archetype affinities for blend calculations
 * Each constellation has affinity weights to nearby archetypes
 */
export const CONSTELLATION_ARCHETYPE_AFFINITIES: Record<
  ConstellationId,
  Partial<Record<ArchetypeId, number>>
> = {
  // Somnexis: primarily VESPYR, secondary CRYPTA and PRISMAE
  somnexis: { vespyr: 0.7, crypta: 0.2, prismae: 0.1 },
  astryde: { vespyr: 0.6, auryn: 0.25, vertex: 0.15 },
  opalith: { vespyr: 0.65, prismae: 0.2, fluxus: 0.15 },

  // Dark/intense cluster
  vantoryx: { ignyx: 0.7, vertex: 0.2, prismae: 0.1 },
  velocine: { ignyx: 0.65, solara: 0.2, vertex: 0.15 },
  nycataria: { ignyx: 0.6, crypta: 0.3, vespyr: 0.1 },

  // Warm/radiant cluster
  luminth: { auryn: 0.7, solara: 0.2, fluxus: 0.1 },
  lucidyne: { auryn: 0.65, vertex: 0.2, vespyr: 0.15 },
  aurivox: { auryn: 0.6, solara: 0.25, fluxus: 0.15 },

  // Creative/colorful cluster
  chromyne: { prismae: 0.7, fluxus: 0.2, vespyr: 0.1 },
  prismant: { prismae: 0.65, solara: 0.2, vertex: 0.15 },
  iridrax: { prismae: 0.6, ignyx: 0.25, vertex: 0.15 },
  holofern: { prismae: 0.55, vertex: 0.3, fluxus: 0.15 },

  // Bold/leader cluster
  radianth: { solara: 0.7, ignyx: 0.2, auryn: 0.1 },
  holovain: { solara: 0.6, vertex: 0.25, prismae: 0.15 },
  prismora: { solara: 0.55, auryn: 0.25, prismae: 0.2 },

  // Dark/mysterious cluster
  obscyra: { crypta: 0.7, vespyr: 0.2, ignyx: 0.1 },
  noctyra: { crypta: 0.65, vespyr: 0.2, ignyx: 0.15 },
  glaceryl: { crypta: 0.6, vespyr: 0.25, vertex: 0.15 },

  // Futuristic/digital cluster
  nexyra: { vertex: 0.7, fluxus: 0.2, prismae: 0.1 },
  fluxeris: { vertex: 0.6, fluxus: 0.3, prismae: 0.1 },
  velisynth: { vertex: 0.65, prismae: 0.2, crypta: 0.15 },

  // Organic/connector cluster
  silquor: { fluxus: 0.65, prismae: 0.2, auryn: 0.15 },
  glemyth: { fluxus: 0.6, auryn: 0.25, vespyr: 0.15 },
  vireth: { fluxus: 0.65, auryn: 0.2, vespyr: 0.15 },
  glovern: { fluxus: 0.6, auryn: 0.25, prismae: 0.15 },
  crysolen: { fluxus: 0.55, vertex: 0.25, auryn: 0.2 },
};

// =============================================================================
// Migration Functions
// =============================================================================

/**
 * Convert constellation blend weights to archetype blend weights
 */
export function migrateBlendWeights(
  constellationWeights: Partial<Record<ConstellationId, number>>
): Partial<Record<ArchetypeId, number>> {
  const archetypeWeights: Partial<Record<ArchetypeId, number>> = {};

  // Accumulate weights from constellation affinities
  for (const [constellationId, weight] of Object.entries(constellationWeights)) {
    if (weight === undefined || weight <= 0) continue;

    const affinities = CONSTELLATION_ARCHETYPE_AFFINITIES[constellationId as ConstellationId];
    if (!affinities) continue;

    for (const [archetypeId, affinity] of Object.entries(affinities)) {
      const contribution = weight * (affinity || 0);
      archetypeWeights[archetypeId as ArchetypeId] =
        (archetypeWeights[archetypeId as ArchetypeId] || 0) + contribution;
    }
  }

  // Normalize to sum to 1
  const total = Object.values(archetypeWeights).reduce((sum, w) => sum + (w || 0), 0);
  if (total > 0) {
    for (const key of Object.keys(archetypeWeights) as ArchetypeId[]) {
      archetypeWeights[key] = (archetypeWeights[key] || 0) / total;
    }
  }

  // Filter out very small weights
  const filtered: Partial<Record<ArchetypeId, number>> = {};
  for (const [key, value] of Object.entries(archetypeWeights)) {
    if (value && value >= 0.05) {
      filtered[key as ArchetypeId] = value;
    }
  }

  return filtered;
}

/**
 * Get primary archetype from constellation
 */
export function getArchetypeFromConstellation(
  constellationId: ConstellationId
): ArchetypeId {
  return CONSTELLATION_TO_ARCHETYPE[constellationId];
}

/**
 * Migrate a full constellation profile to archetype profile
 */
export function migrateConstellationProfile(profile: {
  primaryConstellationId: ConstellationId;
  blendWeights: Partial<Record<ConstellationId, number>>;
  subtasteIndex: number;
  explorerScore: number;
  earlyAdopterScore: number;
}): {
  primaryArchetypeId: ArchetypeId;
  archetypeBlendWeights: Partial<Record<ArchetypeId, number>>;
  subtasteIndex: number;
  explorerScore: number;
  earlyAdopterScore: number;
} {
  const primaryArchetypeId = getArchetypeFromConstellation(
    profile.primaryConstellationId
  );
  const archetypeBlendWeights = migrateBlendWeights(profile.blendWeights);

  return {
    primaryArchetypeId,
    archetypeBlendWeights,
    subtasteIndex: profile.subtasteIndex,
    explorerScore: profile.explorerScore,
    earlyAdopterScore: profile.earlyAdopterScore,
  };
}

/**
 * Get all constellations that map to a given archetype
 */
export function getConstellationsForArchetype(
  archetypeId: ArchetypeId
): ConstellationId[] {
  return Object.entries(CONSTELLATION_TO_ARCHETYPE)
    .filter(([_, archetype]) => archetype === archetypeId)
    .map(([constellation]) => constellation as ConstellationId);
}

/**
 * Validate that all constellations are mapped
 */
export function validateMapping(): { valid: boolean; unmapped: string[] } {
  const unmapped: string[] = [];

  for (const constellationId of CONSTELLATION_IDS) {
    if (!CONSTELLATION_TO_ARCHETYPE[constellationId]) {
      unmapped.push(constellationId);
    }
  }

  return {
    valid: unmapped.length === 0,
    unmapped,
  };
}

export default {
  CONSTELLATION_TO_ARCHETYPE,
  CONSTELLATION_ARCHETYPE_AFFINITIES,
  migrateBlendWeights,
  getArchetypeFromConstellation,
  migrateConstellationProfile,
  getConstellationsForArchetype,
  validateMapping,
};
