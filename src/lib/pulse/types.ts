/**
 * PULSE Archetype Types
 *
 * 6 taste archetypes for DROPR music battles.
 * Each represents a distinct music taste profile and battle behavior pattern.
 */

// =============================================================================
// Archetype IDs
// =============================================================================

export const PULSE_ARCHETYPE_IDS = [
  'trendsetter',
  'purist',
  'chaos_agent',
  'crowd_surfer',
  'architect',
  'mood_shifter',
] as const;

export type PulseArchetypeId = typeof PULSE_ARCHETYPE_IDS[number];

// =============================================================================
// Taste Vector (10 dimensions)
// =============================================================================

export interface TasteVector {
  energy: number;              // 0-100: Low energy → High energy
  experimentalism: number;     // 0-100: Traditional → Experimental
  culturalAlignment: number;   // 0-100: Underground → Mainstream
  temporalTiming: number;      // 0-100: Early adopter → Late majority
  emotionalIntensity: number;  // 0-100: Chill → Intense
  rhythmComplexity: number;    // 0-100: Simple → Complex
  productionPolish: number;    // 0-100: Lo-fi → Hi-fi
  vocalsPreference: number;    // 0-100: Instrumental → Vocal-heavy
  genreFluidity: number;       // 0-100: Purist → Genre-fluid
  nostalgia: number;           // 0-100: Forward-looking → Retro
}

// =============================================================================
// Archetype Configuration
// =============================================================================

export interface PulseArchetypeConfig {
  id: PulseArchetypeId;
  displayName: string;
  title: string;
  emoji: string;
  tagline: string;
  description: string;

  // Behavior patterns
  battleStyle: string;
  winCondition: string;

  // Visual identity
  colorPrimary: string;
  colorSecondary: string;
  icon: string;

  // Trait tendencies (what taste vector looks like for this archetype)
  traitTendencies: Partial<TasteVector>;

  // Genre preferences
  preferredGenres: string[];

  // Social elements
  shareableHandle: string;
  hashTags: string[];
  viralHook: string;
}

// =============================================================================
// Player PULSE Profile
// =============================================================================

export interface PulseProfile {
  archetype: PulseArchetypeId;
  tasteVector: TasteVector;
  predictionAccuracy: number;  // 0-100
  trendsetterScore: number;    // 0-100
  tasteCoherence: number;      // 0-100
  battlesSinceUpdate: number;
}

// =============================================================================
// Battle Decision
// =============================================================================

export interface BattleDecision {
  playerId: string;
  battleId: string;
  soundId: string;
  selectedRemixGenre: string;
  wasWinner: boolean;
  crowdVoteMargin: number;  // Positive = won by this margin
  timestamp: Date;
}

// =============================================================================
// Type Guards
// =============================================================================

export function isPulseArchetypeId(value: string): value is PulseArchetypeId {
  return PULSE_ARCHETYPE_IDS.includes(value as PulseArchetypeId);
}

export function assertPulseArchetypeId(value: string): asserts value is PulseArchetypeId {
  if (!isPulseArchetypeId(value)) {
    throw new Error(`Invalid PULSE archetype ID: ${value}`);
  }
}

// =============================================================================
// Default Taste Vector
// =============================================================================

export const DEFAULT_TASTE_VECTOR: TasteVector = {
  energy: 50,
  experimentalism: 50,
  culturalAlignment: 50,
  temporalTiming: 50,
  emotionalIntensity: 50,
  rhythmComplexity: 50,
  productionPolish: 50,
  vocalsPreference: 50,
  genreFluidity: 50,
  nostalgia: 50,
};
