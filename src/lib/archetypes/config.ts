/**
 * Archetype Configurations
 *
 * 8 viral archetypes with full aesthetic and psychometric profiles.
 * Designed for social sharing, memorable identity, and TikTok virality.
 */

import { ArchetypeConfig, ArchetypeId } from './types';

// Re-export types for convenience
export type { ArchetypeConfig, ArchetypeId } from './types';

// =============================================================================
// VESPYR — The Sage
// =============================================================================

const VESPYR: ArchetypeConfig = {
  id: 'vespyr',
  displayName: 'VESPYR',
  title: 'The Sage',
  emoji: '🌙',
  tagline: 'Twilight vision. Evening star.',
  shortDescription: 'Not quite vesper, not quite whisper. Dark academia meets mysticism.',
  longDescription: `VESPYR dwells in the liminal hours between day and night, finding wisdom in shadows and meaning in silence. You're drawn to depth over spectacle, substance over flash. Your aesthetic sense gravitates toward the mysterious, the timeless, the quietly profound.`,

  coreMotivation: 'To understand the hidden patterns beneath surface reality',
  coreStrength: 'Depth of insight and contemplative wisdom',
  coreShadow: 'Can become detached or lost in abstraction',

  visualKeywords: ['twilight', 'muted', 'layered', 'atmospheric', 'moody', 'soft-focus', 'candlelit'],
  musicKeywords: ['ambient', 'ethereal', 'sparse', 'reverb-heavy', 'contemplative', 'drone'],
  colorPalette: ['#2D2D44', '#4A4A6A', '#8B7E9B', '#C9B8D4', '#E8DFF0'],
  icon: 'moon',

  traitProfile: {
    openness: [0.7, 1.0],
    conscientiousness: [0.4, 0.7],
    extraversion: [0.1, 0.4],
    agreeableness: [0.5, 0.8],
    neuroticism: [0.3, 0.6],
    noveltySeeking: [0.3, 0.6],
    aestheticSensitivity: [0.8, 1.0],
    riskTolerance: [0.2, 0.5],
  },

  enneagramAffinities: {
    primary: [4, 5, 9],
    secondary: [1, 6],
  },

  shareableHandle: '@vespyr.sage',
  hashTags: ['#VespyrEnergy', '#TheSage', '#DarkAcademia', '#TwilightVibes'],
  viralHook: 'You see what others miss in the quiet moments',

  exampleScenes: [
    'Reading by candlelight in a room full of old books',
    'Watching fog roll over a moonlit landscape',
    'A quiet café at dusk with rain on the windows',
  ],
  creativePompts: [
    'Design a meditation space for VESPYR',
    'Create a playlist for late-night contemplation',
    'Photograph the golden hour transitioning to blue hour',
  ],
};

// =============================================================================
// IGNYX — The Rebel
// =============================================================================

const IGNYX: ArchetypeConfig = {
  id: 'ignyx',
  displayName: 'IGNYX',
  title: 'The Rebel',
  emoji: '🔥',
  tagline: 'Ignition crystallized. Fire turned to stone.',
  shortDescription: 'Sounds dangerous. Looks cool spelled out. Breaks rules with purpose.',
  longDescription: `IGNYX carries the spark of revolution—not for destruction, but for transformation. You're drawn to edges, to friction, to the places where the old order gives way to something new. Your aesthetic defies easy categorization.`,

  coreMotivation: 'To challenge conventions and forge new paths',
  coreStrength: 'Courage to break molds and authentic self-expression',
  coreShadow: 'Can become contrarian for its own sake',

  visualKeywords: ['dark', 'sharp', 'industrial', 'neon-accent', 'distorted', 'gritty', 'urban'],
  musicKeywords: ['aggressive', 'distorted', 'industrial', 'punk', 'experimental', 'harsh'],
  colorPalette: ['#0D0D0D', '#1A1A2E', '#E63946', '#FF6B35', '#FFBA08'],
  icon: 'flame',

  traitProfile: {
    openness: [0.6, 0.9],
    conscientiousness: [0.1, 0.4],
    extraversion: [0.5, 0.8],
    agreeableness: [0.1, 0.4],
    neuroticism: [0.3, 0.7],
    noveltySeeking: [0.7, 1.0],
    aestheticSensitivity: [0.5, 0.8],
    riskTolerance: [0.8, 1.0],
  },

  enneagramAffinities: {
    primary: [8, 4, 7],
    secondary: [3, 5],
  },

  shareableHandle: '@ignyx.rebel',
  hashTags: ['#IgnyxEnergy', '#TheRebel', '#BurnItDown', '#CounterCulture'],
  viralHook: 'Rules exist to be questioned, not obeyed',

  exampleScenes: [
    'Neon signs flickering in a rain-soaked alley',
    'Underground club at 3am with strobing lights',
    'Graffiti-covered walls in an abandoned warehouse',
  ],
  creativePompts: [
    'Design a protest poster for IGNYX',
    'Create a sound collage from urban noise',
    'Photograph decay and renewal side by side',
  ],
};

// =============================================================================
// AURYN — The Enlightened
// =============================================================================

const AURYN: ArchetypeConfig = {
  id: 'auryn',
  displayName: 'AURYN',
  title: 'The Enlightened',
  emoji: '✨',
  tagline: 'Golden light with mythic weight.',
  shortDescription: 'Neverending Story nostalgia for millennials, fresh for Gen-Z.',
  longDescription: `AURYN radiates warmth and wisdom without pretension. You seek harmony between the practical and the transcendent, finding beauty in growth and transformation. Your aesthetic draws from ancient wisdom reinterpreted for modern times.`,

  coreMotivation: 'To grow, heal, and help others do the same',
  coreStrength: 'Wisdom balanced with warmth and accessibility',
  coreShadow: 'Can become preachy or spiritually bypassing',

  visualKeywords: ['golden', 'warm', 'radiant', 'natural', 'sacred', 'luminous', 'harmonious'],
  musicKeywords: ['uplifting', 'acoustic', 'world', 'healing', 'melodic', 'organic'],
  colorPalette: ['#FFF8E7', '#FFD700', '#F4A460', '#DAA520', '#8B7355'],
  icon: 'sun',

  traitProfile: {
    openness: [0.8, 1.0],
    conscientiousness: [0.5, 0.8],
    extraversion: [0.4, 0.7],
    agreeableness: [0.7, 1.0],
    neuroticism: [0.1, 0.4],
    noveltySeeking: [0.5, 0.8],
    aestheticSensitivity: [0.7, 1.0],
    riskTolerance: [0.4, 0.7],
  },

  enneagramAffinities: {
    primary: [2, 9, 7],
    secondary: [1, 4],
  },

  shareableHandle: '@auryn.light',
  hashTags: ['#AurynEnergy', '#TheEnlightened', '#GoldenHour', '#InnerGlow'],
  viralHook: "Your light isn't for dimming",

  exampleScenes: [
    'Sunrise over ancient temple ruins',
    'Meditation garden with golden afternoon light',
    'Gathering around a fire under starlit sky',
  ],
  creativePompts: [
    'Design a sanctuary space for AURYN',
    'Create a morning ritual playlist',
    'Capture light streaming through leaves',
  ],
};

// =============================================================================
// PRISMAE — The Artist
// =============================================================================

const PRISMAE: ArchetypeConfig = {
  id: 'prismae',
  displayName: 'PRISMAE',
  title: 'The Artist',
  emoji: '🎨',
  tagline: 'Refracted reality. Every angle shows different colors.',
  shortDescription: 'Aesthetic profiles will tattoo this. Pure creative energy.',
  longDescription: `PRISMAE sees the world through a kaleidoscope of possibility. Every surface is a canvas, every moment a potential creation. You're driven by an insatiable urge to express, transform, and reimagine what exists into what could be.`,

  coreMotivation: 'To create beauty and express inner worlds',
  coreStrength: 'Boundless creativity and emotional depth',
  coreShadow: 'Can become lost in creation at the expense of connection',

  visualKeywords: ['colorful', 'layered', 'abstract', 'textured', 'expressive', 'bold', 'saturated'],
  musicKeywords: ['complex', 'emotional', 'dynamic', 'layered', 'experimental', 'melodic'],
  colorPalette: ['#FF6B9D', '#9B5DE5', '#00BBF9', '#00F5D4', '#FEE440'],
  icon: 'palette',

  traitProfile: {
    openness: [0.9, 1.0],
    conscientiousness: [0.2, 0.5],
    extraversion: [0.4, 0.7],
    agreeableness: [0.4, 0.7],
    neuroticism: [0.4, 0.8],
    noveltySeeking: [0.7, 1.0],
    aestheticSensitivity: [0.9, 1.0],
    riskTolerance: [0.5, 0.8],
  },

  enneagramAffinities: {
    primary: [4, 7, 5],
    secondary: [2, 9],
  },

  shareableHandle: '@prismae.art',
  hashTags: ['#PrismaeEnergy', '#TheArtist', '#CreativeFlow', '#ColorTheory'],
  viralHook: "You don't just see the world—you remix it",

  exampleScenes: [
    'Paint-splattered studio bathed in natural light',
    'Gallery opening with immersive installations',
    'Street art transforming urban concrete',
  ],
  creativePompts: [
    'Create a mood board with only found colors',
    'Design an album cover for your inner soundtrack',
    'Transform mundane objects into art',
  ],
};

// =============================================================================
// SOLARA — The Leader
// =============================================================================

const SOLARA: ArchetypeConfig = {
  id: 'solara',
  displayName: 'SOLARA',
  title: 'The Leader',
  emoji: '👑',
  tagline: 'Solar royalty. Feminine power.',
  shortDescription: '"Solara energy" = main character who lifts others.',
  longDescription: `SOLARA commands attention not through force, but through radiance. You naturally draw others into your orbit, inspiring and elevating those around you. Your aesthetic speaks of confidence, abundance, and the power of presence.`,

  coreMotivation: 'To inspire, lead, and create lasting impact',
  coreStrength: 'Charisma that empowers rather than dominates',
  coreShadow: 'Can become ego-driven or image-obsessed',

  visualKeywords: ['bold', 'luxe', 'bright', 'confident', 'polished', 'powerful', 'radiant'],
  musicKeywords: ['anthem', 'powerful', 'upbeat', 'confident', 'production-heavy', 'pop'],
  colorPalette: ['#FFD700', '#FF8C00', '#DC143C', '#4B0082', '#000000'],
  icon: 'crown',

  traitProfile: {
    openness: [0.5, 0.8],
    conscientiousness: [0.7, 1.0],
    extraversion: [0.8, 1.0],
    agreeableness: [0.4, 0.7],
    neuroticism: [0.1, 0.4],
    noveltySeeking: [0.4, 0.7],
    aestheticSensitivity: [0.5, 0.8],
    riskTolerance: [0.6, 0.9],
  },

  enneagramAffinities: {
    primary: [3, 8, 7],
    secondary: [1, 2],
  },

  shareableHandle: '@solara.queen',
  hashTags: ['#SolaraEnergy', '#TheLeader', '#MainCharacter', '#BossEnergy'],
  viralHook: "You don't follow the light—you are the light",

  exampleScenes: [
    'Commanding a stage with spotlights blazing',
    'Penthouse view at sunset with champagne',
    'Leading a team through creative breakthrough',
  ],
  creativePompts: [
    "Design your empire's visual identity",
    'Create a power anthem playlist',
    'Photograph yourself in your element',
  ],
};

// =============================================================================
// CRYPTA — The Hermit
// =============================================================================

const CRYPTA: ArchetypeConfig = {
  id: 'crypta',
  displayName: 'CRYPTA',
  title: 'The Hermit',
  emoji: '🔮',
  tagline: 'Hidden chamber. Encrypted soul.',
  shortDescription: 'Goth-mystical but also cyber. Mystery you can pronounce.',
  longDescription: `CRYPTA treasures the unseen, the encrypted, the deliberately obscured. You find power in mystery and depth in solitude. Your aesthetic embraces the occult, the digital underground, and the beauty of things not meant for everyone.`,

  coreMotivation: 'To protect and explore hidden knowledge',
  coreStrength: 'Deep self-knowledge and protective boundaries',
  coreShadow: 'Can become isolated or overly secretive',

  visualKeywords: ['dark', 'mysterious', 'occult', 'cyber', 'gothic', 'encrypted', 'shadowy'],
  musicKeywords: ['dark', 'minimal', 'ritualistic', 'electronic', 'haunting', 'industrial'],
  colorPalette: ['#0A0A0A', '#1C1C3C', '#4A0E4E', '#7B68EE', '#C0C0C0'],
  icon: 'lock',

  traitProfile: {
    openness: [0.5, 0.8],
    conscientiousness: [0.4, 0.7],
    extraversion: [0.0, 0.3],
    agreeableness: [0.3, 0.6],
    neuroticism: [0.4, 0.7],
    noveltySeeking: [0.3, 0.6],
    aestheticSensitivity: [0.7, 1.0],
    riskTolerance: [0.2, 0.5],
  },

  enneagramAffinities: {
    primary: [5, 4, 6],
    secondary: [8, 9],
  },

  shareableHandle: '@crypta.hidden',
  hashTags: ['#CryptaEnergy', '#TheHermit', '#DigitalOccult', '#HiddenDepths'],
  viralHook: "Some things are precious because they're protected",

  exampleScenes: [
    'Candlelit ritual in a velvet-draped room',
    'Coding in a dark room with multiple monitors',
    'Ancient library with forbidden sections',
  ],
  creativePompts: [
    "Design a secret society's visual language",
    'Create an encrypted mood board',
    'Photograph light piercing total darkness',
  ],
};

// =============================================================================
// VERTEX — The Visionary
// =============================================================================

const VERTEX: ArchetypeConfig = {
  id: 'vertex',
  displayName: 'VERTEX',
  title: 'The Visionary',
  emoji: '🚀',
  tagline: 'Apex point where futures converge.',
  shortDescription: 'Math-cool. Tech without trying too hard.',
  longDescription: `VERTEX lives at the intersection of imagination and possibility. You're drawn to the cutting edge, the not-yet-realized, the blueprints of tomorrow. Your aesthetic blends futurism with function, innovation with intention.`,

  coreMotivation: 'To envision and build the future',
  coreStrength: 'Seeing possibilities before they materialize',
  coreShadow: 'Can become disconnected from present reality',

  visualKeywords: ['futuristic', 'clean', 'geometric', 'tech', 'minimal', 'holographic', 'precise'],
  musicKeywords: ['electronic', 'glitchy', 'synth', 'progressive', 'IDM', 'forward-thinking'],
  colorPalette: ['#00FFFF', '#00FF00', '#0000FF', '#FFFFFF', '#1A1A2E'],
  icon: 'rocket',

  traitProfile: {
    openness: [0.8, 1.0],
    conscientiousness: [0.4, 0.7],
    extraversion: [0.4, 0.7],
    agreeableness: [0.3, 0.6],
    neuroticism: [0.2, 0.5],
    noveltySeeking: [0.8, 1.0],
    aestheticSensitivity: [0.6, 0.9],
    riskTolerance: [0.7, 1.0],
  },

  enneagramAffinities: {
    primary: [5, 7, 3],
    secondary: [1, 8],
  },

  shareableHandle: '@vertex.future',
  hashTags: ['#VertexEnergy', '#TheVisionary', '#FutureTech', '#Innovation'],
  viralHook: "You're not ahead of your time—the time hasn't caught up yet",

  exampleScenes: [
    'Minimalist workspace with holographic displays',
    'Geometric architecture against digital sunset',
    'Laboratory where ideas become prototypes',
  ],
  creativePompts: [
    'Design an interface for 2050',
    'Create a soundtrack for space exploration',
    'Visualize data as art',
  ],
};

// =============================================================================
// FLUXUS — The Connector
// =============================================================================

const FLUXUS: ArchetypeConfig = {
  id: 'fluxus',
  displayName: 'FLUXUS',
  title: 'The Connector',
  emoji: '🌊',
  tagline: 'Constant flow. Art movement meets adaptability.',
  shortDescription: 'Sounds like a superpower. Because it is.',
  longDescription: `FLUXUS thrives in the in-between, the transitional, the ever-changing. You see connections others miss and bridge worlds that seem separate. Your aesthetic celebrates fluidity, collaboration, and the beauty of change.`,

  coreMotivation: 'To connect, adapt, and facilitate flow',
  coreStrength: 'Seeing bridges between disparate things',
  coreShadow: 'Can become scattered or lack firm identity',

  visualKeywords: ['fluid', 'organic', 'flowing', 'collaborative', 'eclectic', 'transitional', 'mixed'],
  musicKeywords: ['fusion', 'world', 'jazz', 'eclectic', 'collaborative', 'groove-based'],
  colorPalette: ['#3498DB', '#1ABC9C', '#9B59B6', '#F39C12', '#ECF0F1'],
  icon: 'waves',

  traitProfile: {
    openness: [0.6, 0.9],
    conscientiousness: [0.3, 0.6],
    extraversion: [0.7, 1.0],
    agreeableness: [0.6, 0.9],
    neuroticism: [0.3, 0.6],
    noveltySeeking: [0.5, 0.8],
    aestheticSensitivity: [0.5, 0.8],
    riskTolerance: [0.4, 0.7],
  },

  enneagramAffinities: {
    primary: [7, 9, 2],
    secondary: [3, 6],
  },

  shareableHandle: '@fluxus.flow',
  hashTags: ['#FluxusEnergy', '#TheConnector', '#GoWithTheFlow', '#BridgeBuilder'],
  viralHook: "You don't fit in boxes—you dissolve them",

  exampleScenes: [
    'Global gathering where cultures collide and create',
    'Collaborative art project with diverse creators',
    'River meeting ocean at golden hour',
  ],
  creativePompts: [
    'Create a fusion playlist from 5 genres',
    'Design a space for unlikely collaborations',
    'Document a day of serendipitous connections',
  ],
};

// =============================================================================
// Export All Archetypes
// =============================================================================

export const ARCHETYPES: Record<ArchetypeId, ArchetypeConfig> = {
  vespyr: VESPYR,
  ignyx: IGNYX,
  auryn: AURYN,
  prismae: PRISMAE,
  solara: SOLARA,
  crypta: CRYPTA,
  vertex: VERTEX,
  fluxus: FLUXUS,
};

// Alias for backward compatibility
export const ARCHETYPE_CONFIG = ARCHETYPES;

export const ARCHETYPE_LIST: ArchetypeConfig[] = Object.values(ARCHETYPES);

/**
 * Get archetype config by ID
 */
export function getArchetype(id: ArchetypeId): ArchetypeConfig {
  return ARCHETYPES[id];
}

/**
 * Get all archetype IDs
 */
export function getArchetypeIds(): ArchetypeId[] {
  return Object.keys(ARCHETYPES) as ArchetypeId[];
}

export default ARCHETYPES;
