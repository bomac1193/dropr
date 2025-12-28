/**
 * Archetype Types
 *
 * 8 viral archetypes designed for social sharing and TikTok virality.
 * These replace the 27-constellation system with more memorable identities.
 */

// =============================================================================
// Archetype IDs
// =============================================================================

export const ARCHETYPE_IDS = [
  'vespyr',   // The Sage
  'ignyx',    // The Rebel
  'auryn',    // The Enlightened
  'prismae',  // The Artist
  'solara',   // The Leader
  'crypta',   // The Hermit
  'vertex',   // The Visionary
  'fluxus',   // The Connector
] as const;

export type ArchetypeId = typeof ARCHETYPE_IDS[number];

// =============================================================================
// Trait Profile
// =============================================================================

export interface TraitProfile {
  openness: [number, number];           // [min, max] range
  conscientiousness: [number, number];
  extraversion: [number, number];
  agreeableness: [number, number];
  neuroticism: [number, number];
  noveltySeeking: [number, number];
  aestheticSensitivity: [number, number];
  riskTolerance: [number, number];
}

// =============================================================================
// Enneagram Affinities
// =============================================================================

export type EnneagramType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface EnneagramAffinity {
  primary: EnneagramType[];
  secondary: EnneagramType[];
}

// =============================================================================
// Archetype Configuration
// =============================================================================

export interface ArchetypeConfig {
  id: ArchetypeId;
  displayName: string;
  title: string;
  emoji: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;

  // Core identity
  coreMotivation: string;
  coreStrength: string;
  coreShadow: string;

  // Aesthetic profiles
  visualKeywords: string[];
  musicKeywords: string[];
  colorPalette: string[];
  icon: string;

  // Psychometric mapping
  traitProfile: TraitProfile;
  enneagramAffinities: EnneagramAffinity;

  // Social sharing
  shareableHandle: string;
  hashTags: string[];
  viralHook: string;

  // Example scenes/content
  exampleScenes: string[];
  creativePompts: string[];
}

// =============================================================================
// Archetype Result
// =============================================================================

export interface ArchetypeResult {
  primary: ArchetypeId;
  primaryScore: number;
  blendWeights: Partial<Record<ArchetypeId, number>>;
  identityStatement: string;
  flavorModifier?: string;
}

// =============================================================================
// Computed Archetype Profile
// =============================================================================

export interface ArchetypeProfile {
  primaryArchetypeId: ArchetypeId;
  archetypeBlendWeights: Partial<Record<ArchetypeId, number>>;
  subtasteIndex: number;      // 0-100, taste coherence
  explorerScore: number;      // 0-100, novelty seeking
  earlyAdopterScore: number;  // 0-100, trend adoption
  identityStatement: string;
  shareableHandle: string;
}

// =============================================================================
// Type Guards
// =============================================================================

export function isArchetypeId(value: string): value is ArchetypeId {
  return ARCHETYPE_IDS.includes(value as ArchetypeId);
}

export function assertArchetypeId(value: string): asserts value is ArchetypeId {
  if (!isArchetypeId(value)) {
    throw new Error(`Invalid archetype ID: ${value}`);
  }
}
