/**
 * Enneagram Types
 *
 * The Enneagram is a system of 9 personality types based on
 * core motivations, fears, and patterns.
 */

// =============================================================================
// Core Types
// =============================================================================

export const ENNEAGRAM_TYPES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export type EnneagramType = typeof ENNEAGRAM_TYPES[number];

export const ENNEAGRAM_CENTERS = {
  heart: [2, 3, 4] as const,  // Feeling/shame
  head: [5, 6, 7] as const,   // Thinking/fear
  gut: [8, 9, 1] as const,    // Instinct/anger
};

export type EnneagramCenter = 'heart' | 'head' | 'gut';

// =============================================================================
// Type Descriptions
// =============================================================================

export interface EnneagramTypeInfo {
  type: EnneagramType;
  name: string;
  title: string;
  center: EnneagramCenter;
  coreMotivation: string;
  coreFear: string;
  coreDesire: string;
  keywords: string[];
  growthDirection: EnneagramType;    // Integration
  stressDirection: EnneagramType;    // Disintegration
  wings: [EnneagramType, EnneagramType];
}

export const ENNEAGRAM_TYPE_INFO: Record<EnneagramType, EnneagramTypeInfo> = {
  1: {
    type: 1,
    name: 'One',
    title: 'The Reformer',
    center: 'gut',
    coreMotivation: 'To be good, right, and virtuous',
    coreFear: 'Being corrupt, evil, or defective',
    coreDesire: 'Integrity and improvement',
    keywords: ['principled', 'purposeful', 'self-controlled', 'perfectionist'],
    growthDirection: 7,
    stressDirection: 4,
    wings: [9, 2],
  },
  2: {
    type: 2,
    name: 'Two',
    title: 'The Helper',
    center: 'heart',
    coreMotivation: 'To feel loved and needed',
    coreFear: 'Being unwanted or unworthy of love',
    coreDesire: 'To be loved unconditionally',
    keywords: ['generous', 'people-pleasing', 'possessive', 'warm'],
    growthDirection: 4,
    stressDirection: 8,
    wings: [1, 3],
  },
  3: {
    type: 3,
    name: 'Three',
    title: 'The Achiever',
    center: 'heart',
    coreMotivation: 'To be valuable and worthwhile',
    coreFear: 'Being worthless or a failure',
    coreDesire: 'To feel valuable and accepted',
    keywords: ['success-oriented', 'adaptive', 'image-conscious', 'driven'],
    growthDirection: 6,
    stressDirection: 9,
    wings: [2, 4],
  },
  4: {
    type: 4,
    name: 'Four',
    title: 'The Individualist',
    center: 'heart',
    coreMotivation: 'To find identity and significance',
    coreFear: 'Having no identity or significance',
    coreDesire: 'To discover and express uniqueness',
    keywords: ['expressive', 'dramatic', 'self-absorbed', 'temperamental'],
    growthDirection: 1,
    stressDirection: 2,
    wings: [3, 5],
  },
  5: {
    type: 5,
    name: 'Five',
    title: 'The Investigator',
    center: 'head',
    coreMotivation: 'To understand and be capable',
    coreFear: 'Being useless, helpless, or overwhelmed',
    coreDesire: 'To be competent and capable',
    keywords: ['perceptive', 'innovative', 'secretive', 'isolated'],
    growthDirection: 8,
    stressDirection: 7,
    wings: [4, 6],
  },
  6: {
    type: 6,
    name: 'Six',
    title: 'The Loyalist',
    center: 'head',
    coreMotivation: 'To have security and support',
    coreFear: 'Being without guidance or support',
    coreDesire: 'To have security and certainty',
    keywords: ['committed', 'security-oriented', 'anxious', 'suspicious'],
    growthDirection: 9,
    stressDirection: 3,
    wings: [5, 7],
  },
  7: {
    type: 7,
    name: 'Seven',
    title: 'The Enthusiast',
    center: 'head',
    coreMotivation: 'To be satisfied and content',
    coreFear: 'Being deprived or trapped in pain',
    coreDesire: 'To experience all life has to offer',
    keywords: ['spontaneous', 'versatile', 'scattered', 'acquisitive'],
    growthDirection: 5,
    stressDirection: 1,
    wings: [6, 8],
  },
  8: {
    type: 8,
    name: 'Eight',
    title: 'The Challenger',
    center: 'gut',
    coreMotivation: 'To protect self and control environment',
    coreFear: 'Being harmed or controlled by others',
    coreDesire: 'To be self-reliant and in control',
    keywords: ['self-confident', 'decisive', 'confrontational', 'willful'],
    growthDirection: 2,
    stressDirection: 5,
    wings: [7, 9],
  },
  9: {
    type: 9,
    name: 'Nine',
    title: 'The Peacemaker',
    center: 'gut',
    coreMotivation: 'To have inner stability and peace',
    coreFear: 'Loss of connection and fragmentation',
    coreDesire: 'To have inner harmony and peace',
    keywords: ['receptive', 'reassuring', 'complacent', 'resigned'],
    growthDirection: 3,
    stressDirection: 6,
    wings: [8, 1],
  },
};

// =============================================================================
// Enneagram Profile
// =============================================================================

export interface EnneagramProfile {
  primaryType: EnneagramType;
  wing: EnneagramType | null;
  tritype: [EnneagramType, EnneagramType, EnneagramType]; // [heart, head, gut]
  typeScores: Record<EnneagramType, number>; // 0-1 affinity for each type
  confidence: number; // 0-1
  integrationLevel: 'stress' | 'average' | 'growth';
}

// =============================================================================
// Big Five Correlation Matrix
// =============================================================================

/**
 * Empirical correlations between Big Five traits and Enneagram types.
 * Values represent correlation coefficients (-1 to 1).
 * Source: Various meta-analyses of Enneagram-Big Five research.
 */
export const BIG_FIVE_ENNEAGRAM_CORRELATIONS: Record<
  EnneagramType,
  { o: number; c: number; e: number; a: number; n: number }
> = {
  1: { o: 0.10, c: 0.55, e: -0.05, a: 0.15, n: 0.30 },
  2: { o: 0.15, c: 0.20, e: 0.40, a: 0.60, n: 0.20 },
  3: { o: 0.05, c: 0.35, e: 0.45, a: -0.10, n: -0.15 },
  4: { o: 0.55, c: -0.15, e: -0.25, a: 0.10, n: 0.60 },
  5: { o: 0.45, c: 0.10, e: -0.55, a: -0.20, n: 0.15 },
  6: { o: -0.10, c: 0.30, e: -0.15, a: 0.25, n: 0.55 },
  7: { o: 0.60, c: -0.30, e: 0.65, a: 0.05, n: -0.20 },
  8: { o: 0.10, c: 0.15, e: 0.35, a: -0.55, n: -0.25 },
  9: { o: 0.15, c: -0.20, e: -0.15, a: 0.50, n: -0.35 },
};

// =============================================================================
// Archetype Affinities
// =============================================================================

/**
 * Maps Enneagram types to archetype affinities.
 * Used for cross-validation between systems.
 */
export const ENNEAGRAM_ARCHETYPE_AFFINITIES: Record<
  EnneagramType,
  { primary: string[]; secondary: string[] }
> = {
  1: { primary: ['auryn', 'solara'], secondary: ['vespyr', 'vertex'] },
  2: { primary: ['auryn', 'fluxus'], secondary: ['solara', 'prismae'] },
  3: { primary: ['solara', 'vertex'], secondary: ['ignyx', 'prismae'] },
  4: { primary: ['prismae', 'crypta'], secondary: ['vespyr', 'ignyx'] },
  5: { primary: ['vespyr', 'crypta'], secondary: ['vertex', 'prismae'] },
  6: { primary: ['vespyr', 'fluxus'], secondary: ['crypta', 'auryn'] },
  7: { primary: ['fluxus', 'ignyx'], secondary: ['vertex', 'prismae'] },
  8: { primary: ['ignyx', 'solara'], secondary: ['vertex', 'crypta'] },
  9: { primary: ['vespyr', 'fluxus'], secondary: ['auryn', 'prismae'] },
};

// =============================================================================
// Utility Functions
// =============================================================================

export function getTypeInfo(type: EnneagramType): EnneagramTypeInfo {
  return ENNEAGRAM_TYPE_INFO[type];
}

export function getCenter(type: EnneagramType): EnneagramCenter {
  return ENNEAGRAM_TYPE_INFO[type].center;
}

export function getWings(type: EnneagramType): [EnneagramType, EnneagramType] {
  return ENNEAGRAM_TYPE_INFO[type].wings;
}

export function isValidType(value: number): value is EnneagramType {
  return ENNEAGRAM_TYPES.includes(value as EnneagramType);
}

export function getTypeFromCenter(
  center: EnneagramCenter,
  typeScores: Record<EnneagramType, number>
): EnneagramType {
  const centerTypes = ENNEAGRAM_CENTERS[center];
  let maxType: EnneagramType = centerTypes[0];
  let maxScore = typeScores[maxType] || 0;

  for (const type of centerTypes) {
    const score = typeScores[type] || 0;
    if (score > maxScore) {
      maxScore = score;
      maxType = type;
    }
  }

  return maxType;
}

export function computeTritype(
  typeScores: Record<EnneagramType, number>
): [EnneagramType, EnneagramType, EnneagramType] {
  return [
    getTypeFromCenter('heart', typeScores),
    getTypeFromCenter('head', typeScores),
    getTypeFromCenter('gut', typeScores),
  ];
}
