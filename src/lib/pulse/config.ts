/**
 * PULSE Archetype Configurations
 *
 * 6 taste archetypes for DROPR music battles.
 * Each archetype has distinct battle behavior and taste patterns.
 */

import { PulseArchetypeConfig, PulseArchetypeId } from './types';

// Re-export types for convenience
export type { PulseArchetypeConfig, PulseArchetypeId } from './types';

// =============================================================================
// TRENDSETTER
// =============================================================================

const TRENDSETTER: PulseArchetypeConfig = {
  id: 'trendsetter',
  displayName: 'TRENDSETTER',
  title: 'The Prophet',
  emoji: '🔮',
  tagline: 'First to feel it. Last to explain it.',
  description: `You don't follow trends—you ARE the trend before anyone knows it exists. Your choices consistently win battles weeks before they become popular. The algorithm wishes it had your instincts.`,

  battleStyle: 'Picks winners before they trend. High-risk, high-reward choices.',
  winCondition: 'Wins when your "weird" pick becomes everyone\'s favorite',

  colorPrimary: '#7B2FF7',
  colorSecondary: '#00D4FF',
  icon: 'crystal-ball',

  traitTendencies: {
    temporalTiming: 85,      // Very early adopter
    experimentalism: 75,     // Tries new things
    culturalAlignment: 40,   // Underground-leaning
    genreFluidity: 70,       // Open to fusion
  },

  preferredGenres: ['HYPERPOP', 'PHONK', 'JERSEY_CLUB'],

  shareableHandle: '@trendsetter.pulse',
  hashTags: ['#TrendsetterPulse', '#FirstToKnow', '#BeforeItWasCool'],
  viralHook: "I knew about this sound 3 weeks ago",
};

// =============================================================================
// PURIST
// =============================================================================

const PURIST: PulseArchetypeConfig = {
  id: 'purist',
  displayName: 'PURIST',
  title: 'The Scholar',
  emoji: '📚',
  tagline: 'Deep roots. High standards.',
  description: `You know the history. You respect the craft. While others chase novelty, you appreciate the fundamentals that make great music timeless. Your taste is refined, consistent, and uncompromising.`,

  battleStyle: 'Consistent genre-specific choices. Values craft over hype.',
  winCondition: 'Wins when quality beats gimmicks',

  colorPrimary: '#1A1A2E',
  colorSecondary: '#C4A000',
  icon: 'book',

  traitTendencies: {
    experimentalism: 25,     // Traditional
    productionPolish: 80,    // Values quality
    genreFluidity: 20,       // Sticks to genres
    nostalgia: 75,           // Appreciates classics
  },

  preferredGenres: ['HOUSE', 'TRAP', 'DUBSTEP'],

  shareableHandle: '@purist.pulse',
  hashTags: ['#PuristPulse', '#RealRecognizesReal', '#KnowYourRoots'],
  viralHook: "The remix that actually respects the original",
};

// =============================================================================
// CHAOS_AGENT
// =============================================================================

const CHAOS_AGENT: PulseArchetypeConfig = {
  id: 'chaos_agent',
  displayName: 'CHAOS AGENT',
  title: 'The Wildcard',
  emoji: '🎲',
  tagline: 'Embrace the unexpected.',
  description: `You live for the upset. The underdog. The choice that makes everyone say "wait, what?" Your unpredictability is your superpower—when you win, it's legendary.`,

  battleStyle: 'Unpredictable picks. Loves causing upsets and surprising outcomes.',
  winCondition: 'Wins when the underdog remix dominates',

  colorPrimary: '#FF006E',
  colorSecondary: '#8338EC',
  icon: 'dice',

  traitTendencies: {
    experimentalism: 90,     // Maximum experimentation
    culturalAlignment: 30,   // Counter-mainstream
    emotionalIntensity: 85,  // Goes hard
    genreFluidity: 95,       // No rules
  },

  preferredGenres: ['HYPERPOP', 'DRILL', 'JERSEY_CLUB'],

  shareableHandle: '@chaos.pulse',
  hashTags: ['#ChaosAgentPulse', '#ExpectTheUnexpected', '#WildcardWins'],
  viralHook: "Nobody saw that coming except me",
};

// =============================================================================
// CROWD_SURFER
// =============================================================================

const CROWD_SURFER: PulseArchetypeConfig = {
  id: 'crowd_surfer',
  displayName: 'CROWD SURFER',
  title: 'The Vibe Reader',
  emoji: '🌊',
  tagline: 'Feel the room. Ride the wave.',
  description: `You have an uncanny ability to read the crowd. Your choices align with what the masses want—not because you follow, but because you genuinely feel what everyone's feeling.`,

  battleStyle: 'Reads crowd energy. Picks what will resonate with voters.',
  winCondition: 'Wins through mass appeal and social intuition',

  colorPrimary: '#00B4D8',
  colorSecondary: '#90E0EF',
  icon: 'waves',

  traitTendencies: {
    culturalAlignment: 80,   // Mainstream-aware
    emotionalIntensity: 60,  // Balanced
    temporalTiming: 55,      // Middle of adoption curve
    energy: 70,              // Upbeat
    vocalsPreference: 65,    // Likes vocals
  },

  preferredGenres: ['TRAP', 'HOUSE', 'PHONK'],

  shareableHandle: '@crowdsurfer.pulse',
  hashTags: ['#CrowdSurferPulse', '#VibeCheck', '#ReadTheRoom'],
  viralHook: "I just knew that's what everyone wanted",
};

// =============================================================================
// ARCHITECT
// =============================================================================

const ARCHITECT: PulseArchetypeConfig = {
  id: 'architect',
  displayName: 'ARCHITECT',
  title: 'The Sound Engineer',
  emoji: '🔧',
  tagline: 'Built different. Sounds different.',
  description: `You hear the layers others miss. Production quality, sound design, technical excellence—these matter to you. You appreciate the craft behind the sound, not just the vibe.`,

  battleStyle: 'Analyzes production quality. Picks technically superior remixes.',
  winCondition: 'Wins when production value is recognized',

  colorPrimary: '#2D3436',
  colorSecondary: '#00CEC9',
  icon: 'wrench',

  traitTendencies: {
    productionPolish: 95,    // Maximum quality focus
    rhythmComplexity: 85,    // Appreciates complexity
    experimentalism: 60,     // Open to innovation
    vocalsPreference: 30,    // Prefers instrumentals
    energy: 65,              // Moderate energy
  },

  preferredGenres: ['DUBSTEP', 'HOUSE', 'AMBIENT'],

  shareableHandle: '@architect.pulse',
  hashTags: ['#ArchitectPulse', '#BuiltDifferent', '#SoundDesign'],
  viralHook: "Listen to that bassline engineering though",
};

// =============================================================================
// MOOD_SHIFTER
// =============================================================================

const MOOD_SHIFTER: PulseArchetypeConfig = {
  id: 'mood_shifter',
  displayName: 'MOOD SHIFTER',
  title: 'The Empath',
  emoji: '🎭',
  tagline: 'Every moment needs its sound.',
  description: `You don't just pick sounds—you curate moments. Your choices depend on the energy of the battle, the crowd, the time. You're a musical chameleon with impeccable emotional intelligence.`,

  battleStyle: 'Context-aware choices. Adapts to battle energy and crowd mood.',
  winCondition: 'Wins by matching the perfect sound to the moment',

  colorPrimary: '#6C5CE7',
  colorSecondary: '#FD79A8',
  icon: 'mask',

  traitTendencies: {
    emotionalIntensity: 70,  // High EQ
    genreFluidity: 80,       // Adaptable
    culturalAlignment: 50,   // Balanced
    energy: 50,              // Context-dependent
  },

  preferredGenres: ['AMBIENT', 'HOUSE', 'TRAP', 'PHONK'],

  shareableHandle: '@moodshifter.pulse',
  hashTags: ['#MoodShifterPulse', '#RightSoundRightTime', '#MoodReader'],
  viralHook: "That was exactly what this moment needed",
};

// =============================================================================
// Export All Archetypes
// =============================================================================

export const PULSE_ARCHETYPES: Record<PulseArchetypeId, PulseArchetypeConfig> = {
  trendsetter: TRENDSETTER,
  purist: PURIST,
  chaos_agent: CHAOS_AGENT,
  crowd_surfer: CROWD_SURFER,
  architect: ARCHITECT,
  mood_shifter: MOOD_SHIFTER,
};

export const PULSE_ARCHETYPE_LIST: PulseArchetypeConfig[] = Object.values(PULSE_ARCHETYPES);

/**
 * Get archetype config by ID
 */
export function getPulseArchetype(id: PulseArchetypeId): PulseArchetypeConfig {
  return PULSE_ARCHETYPES[id];
}

/**
 * Get all archetype IDs
 */
export function getPulseArchetypeIds(): PulseArchetypeId[] {
  return Object.keys(PULSE_ARCHETYPES) as PulseArchetypeId[];
}

export default PULSE_ARCHETYPES;
