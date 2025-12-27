/**
 * Constellation System Types
 *
 * Constellations are archetypal taste profiles derived from psychometric traits,
 * aesthetic preferences, and subculture embeddings. Each constellation represents
 * a coherent aesthetic-personality cluster that can be used for:
 * - User archetypes ("You are Somnexis")
 * - Scene/genre tags ("Somnexis club", "Obscyra couture")
 * - Creative prompt hooks ("Generate a Holovain runway look")
 */

export const CONSTELLATION_IDS = [
  'somnexis',
  'nycataria',
  'holovain',
  'obscyra',
  'holofern',
  'prismant',
  'luminth',
  'crysolen',
  'nexyra',
  'velocine',
  'astryde',
  'noctyra',
  'glemyth',
  'vireth',
  'chromyne',
  'opalith',
  'fluxeris',
  'glovern',
  'vantoryx',
  'silquor',
  'iridrax',
  'prismora',
  'lucidyne',
  'velisynth',
  'aurivox',
  'glaceryl',
  'radianth',
] as const;

export type ConstellationId = typeof CONSTELLATION_IDS[number];

/**
 * Trait range [min, max] where values are 0-1.
 * Users matching a constellation should fall within these ranges for each trait.
 */
export type TraitRange = [number, number];

export interface TraitProfile {
  openness: TraitRange;
  conscientiousness: TraitRange;
  extraversion: TraitRange;
  agreeableness: TraitRange;
  neuroticism: TraitRange;
  noveltySeeking: TraitRange;
  aestheticSensitivity: TraitRange;
  riskTolerance: TraitRange;
}

export interface ConstellationConfig {
  id: ConstellationId;
  displayName: string;
  shortDescription: string;
  visualProfile: string[];
  musicProfile: string[];
  traitProfile: TraitProfile;
  exampleScenes: string[];
}

export type ConstellationsConfigMap = {
  [K in ConstellationId]: ConstellationConfig;
};
