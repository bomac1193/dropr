/**
 * Constellation Configuration
 *
 * Complete configuration for all 27 constellations. Each constellation has:
 * - Trait profile ranges (psychometric compatibility)
 * - Visual and music profiles (aesthetic DNA)
 * - Short descriptions and example scenes (UX and prompt generation)
 *
 * Trait values are 0-1 where:
 * - 0 = low expression of trait
 * - 1 = high expression of trait
 */

import { ConstellationConfig, ConstellationsConfigMap, ConstellationId } from './types';

export const constellationsConfig: ConstellationsConfigMap = {
  somnexis: {
    id: 'somnexis',
    displayName: 'Somnexis',
    shortDescription:
      'Dreamy and introspective, drawn to liminal spaces and hazy aesthetics. You find beauty in the threshold between waking and sleeping.',
    visualProfile: ['hazy', 'soft-focus', 'desaturated', 'liminal', 'twilight'],
    musicProfile: ['ambient', 'slow', 'ethereal', 'reverb-heavy', 'atmospheric'],
    traitProfile: {
      openness: [0.7, 1.0],
      conscientiousness: [0.2, 0.5],
      extraversion: [0.1, 0.4],
      agreeableness: [0.5, 0.8],
      neuroticism: [0.4, 0.7],
      noveltySeeking: [0.5, 0.8],
      aestheticSensitivity: [0.8, 1.0],
      riskTolerance: [0.3, 0.6],
    },
    exampleScenes: [
      'Somnexis club night: fog machines and slowed-down tracks',
      'Somnexis AI cover art: dreamlike portraits with soft blur',
      'Somnexis bedroom setup: fairy lights and gauze curtains',
    ],
  },

  nycataria: {
    id: 'nycataria',
    displayName: 'Nycataria',
    shortDescription:
      'Nocturnal and mysterious, thriving in dark urban environments. You are the night owl who finds clarity after midnight.',
    visualProfile: ['dark', 'urban', 'neon-accents', 'noir', 'shadowy'],
    musicProfile: ['bass-heavy', 'industrial', 'dark-electronic', 'brooding', 'nocturnal'],
    traitProfile: {
      openness: [0.6, 0.9],
      conscientiousness: [0.3, 0.6],
      extraversion: [0.2, 0.5],
      agreeableness: [0.3, 0.6],
      neuroticism: [0.5, 0.8],
      noveltySeeking: [0.6, 0.9],
      aestheticSensitivity: [0.7, 0.95],
      riskTolerance: [0.5, 0.8],
    },
    exampleScenes: [
      'Nycataria street photography: rain-slicked streets at 3am',
      'Nycataria DJ set: dark techno in a basement venue',
      'Nycataria fashion: black layers with subtle metallic details',
    ],
  },

  holovain: {
    id: 'holovain',
    displayName: 'Holovain',
    shortDescription:
      'Futuristic and glamorous, embracing holographic and iridescent aesthetics. You see fashion as technology and art as armor.',
    visualProfile: ['holographic', 'chrome', 'high-gloss', 'futuristic', 'iridescent'],
    musicProfile: ['hyperpop', 'glitchy', 'synthetic', 'high-energy', 'processed-vocals'],
    traitProfile: {
      openness: [0.8, 1.0],
      conscientiousness: [0.4, 0.7],
      extraversion: [0.6, 0.9],
      agreeableness: [0.4, 0.7],
      neuroticism: [0.3, 0.6],
      noveltySeeking: [0.8, 1.0],
      aestheticSensitivity: [0.85, 1.0],
      riskTolerance: [0.7, 1.0],
    },
    exampleScenes: [
      'Holovain runway look: chrome bodysuit with prismatic overlays',
      'Holovain album art: 3D-rendered abstract forms',
      'Holovain rave: UV lights and holographic projections',
    ],
  },

  obscyra: {
    id: 'obscyra',
    displayName: 'Obscyra',
    shortDescription:
      'Refined darkness with theatrical flair. You find elegance in shadow and sophistication in the macabre.',
    visualProfile: ['gothic', 'velvet', 'dramatic', 'baroque', 'deep-colors'],
    musicProfile: ['orchestral', 'darkwave', 'dramatic', 'operatic', 'cinematic'],
    traitProfile: {
      openness: [0.7, 0.95],
      conscientiousness: [0.5, 0.8],
      extraversion: [0.3, 0.6],
      agreeableness: [0.3, 0.6],
      neuroticism: [0.5, 0.8],
      noveltySeeking: [0.5, 0.8],
      aestheticSensitivity: [0.9, 1.0],
      riskTolerance: [0.4, 0.7],
    },
    exampleScenes: [
      'Obscyra couture: velvet gowns with Victorian silhouettes',
      'Obscyra soirée: candlelit gathering with chamber music',
      'Obscyra interior: dark wood, antiques, and moody lighting',
    ],
  },

  holofern: {
    id: 'holofern',
    displayName: 'Holofern',
    shortDescription:
      'Where nature meets technology. You are drawn to organic-digital hybrids and bio-futuristic aesthetics.',
    visualProfile: ['bio-tech', 'organic-digital', 'verdant', 'alien-nature', 'bioluminescent'],
    musicProfile: ['nature-samples', 'organic-electronic', 'textured', 'evolving', 'ambient-techno'],
    traitProfile: {
      openness: [0.75, 1.0],
      conscientiousness: [0.4, 0.7],
      extraversion: [0.3, 0.6],
      agreeableness: [0.6, 0.9],
      neuroticism: [0.3, 0.6],
      noveltySeeking: [0.7, 0.95],
      aestheticSensitivity: [0.8, 1.0],
      riskTolerance: [0.5, 0.8],
    },
    exampleScenes: [
      'Holofern installation: living walls with embedded LEDs',
      'Holofern wearables: 3D-printed jewelry inspired by coral',
      'Holofern soundscape: forest recordings layered with synths',
    ],
  },

  prismant: {
    id: 'prismant',
    displayName: 'Prismant',
    shortDescription:
      'Bold color maximalist with a love for geometric precision. You see the world in vivid, carefully composed palettes.',
    visualProfile: ['geometric', 'bold-colors', 'precise', 'graphic', 'high-contrast'],
    musicProfile: ['rhythmic', 'structured', 'colorful', 'bright', 'percussive'],
    traitProfile: {
      openness: [0.6, 0.9],
      conscientiousness: [0.6, 0.9],
      extraversion: [0.5, 0.8],
      agreeableness: [0.5, 0.8],
      neuroticism: [0.2, 0.5],
      noveltySeeking: [0.5, 0.8],
      aestheticSensitivity: [0.75, 1.0],
      riskTolerance: [0.4, 0.7],
    },
    exampleScenes: [
      'Prismant graphic design: bold shapes and Memphis-style palettes',
      'Prismant architecture: color-blocked interiors',
      'Prismant playlist: upbeat electronic with strong hooks',
    ],
  },

  luminth: {
    id: 'luminth',
    displayName: 'Luminth',
    shortDescription:
      'Light-obsessed and optimistic, drawn to radiance and warmth. You find joy in golden hour and luminous spaces.',
    visualProfile: ['golden', 'warm-light', 'glowing', 'soft-radiance', 'sunrise'],
    musicProfile: ['uplifting', 'melodic', 'warm', 'hopeful', 'acoustic-electronic'],
    traitProfile: {
      openness: [0.6, 0.9],
      conscientiousness: [0.5, 0.8],
      extraversion: [0.6, 0.9],
      agreeableness: [0.7, 1.0],
      neuroticism: [0.1, 0.4],
      noveltySeeking: [0.4, 0.7],
      aestheticSensitivity: [0.7, 0.95],
      riskTolerance: [0.3, 0.6],
    },
    exampleScenes: [
      'Luminth photography: golden hour portraits',
      'Luminth interior: warm wood and natural light flooding in',
      'Luminth festival: sunrise sets on the beach',
    ],
  },

  crysolen: {
    id: 'crysolen',
    displayName: 'Crysolen',
    shortDescription:
      'Crystalline and precise, valuing clarity and structure. You are drawn to mineral aesthetics and faceted forms.',
    visualProfile: ['crystalline', 'faceted', 'transparent', 'mineral', 'sharp'],
    musicProfile: ['precise', 'clean', 'digital', 'metallic', 'structured'],
    traitProfile: {
      openness: [0.5, 0.8],
      conscientiousness: [0.7, 1.0],
      extraversion: [0.3, 0.6],
      agreeableness: [0.4, 0.7],
      neuroticism: [0.3, 0.6],
      noveltySeeking: [0.4, 0.7],
      aestheticSensitivity: [0.7, 0.95],
      riskTolerance: [0.3, 0.6],
    },
    exampleScenes: [
      'Crysolen jewelry: geometric cut gemstones in minimal settings',
      'Crysolen product design: glass and crystal objects',
      'Crysolen sound: crisp, bell-like tones and precise beats',
    ],
  },

  nexyra: {
    id: 'nexyra',
    displayName: 'Nexyra',
    shortDescription:
      'Connected and networked, thriving at the intersection of digital culture. You see patterns in social dynamics and data flows.',
    visualProfile: ['digital-native', 'connected', 'interface', 'network', 'data-viz'],
    musicProfile: ['internet-culture', 'meme-aware', 'remix', 'post-internet', 'genre-fluid'],
    traitProfile: {
      openness: [0.7, 1.0],
      conscientiousness: [0.3, 0.6],
      extraversion: [0.5, 0.8],
      agreeableness: [0.5, 0.8],
      neuroticism: [0.4, 0.7],
      noveltySeeking: [0.8, 1.0],
      aestheticSensitivity: [0.6, 0.9],
      riskTolerance: [0.6, 0.9],
    },
    exampleScenes: [
      'Nexyra moodboard: screenshot aesthetics and interface design',
      'Nexyra playlist: genre-hopping with heavy sampling',
      'Nexyra social: curated chaos across platforms',
    ],
  },

  velocine: {
    id: 'velocine',
    displayName: 'Velocine',
    shortDescription:
      'Speed-obsessed and kinetic, drawn to motion and momentum. You find beauty in velocity and the blur of movement.',
    visualProfile: ['motion-blur', 'dynamic', 'streamlined', 'racing', 'kinetic'],
    musicProfile: ['fast-tempo', 'driving', 'energetic', 'adrenaline', 'drum-heavy'],
    traitProfile: {
      openness: [0.5, 0.8],
      conscientiousness: [0.4, 0.7],
      extraversion: [0.7, 1.0],
      agreeableness: [0.4, 0.7],
      neuroticism: [0.2, 0.5],
      noveltySeeking: [0.7, 1.0],
      aestheticSensitivity: [0.5, 0.8],
      riskTolerance: [0.8, 1.0],
    },
    exampleScenes: [
      'Velocine photography: long exposure car lights',
      'Velocine fashion: aerodynamic sportswear',
      'Velocine rave: 160+ BPM sets and constant motion',
    ],
  },

  astryde: {
    id: 'astryde',
    displayName: 'Astryde',
    shortDescription:
      'Cosmic and vast, drawn to space aesthetics and celestial themes. You feel small under the stars and find comfort in infinity.',
    visualProfile: ['cosmic', 'celestial', 'vast', 'starfield', 'nebular'],
    musicProfile: ['spacey', 'expansive', 'synth-pads', 'cosmic-ambient', 'otherworldly'],
    traitProfile: {
      openness: [0.8, 1.0],
      conscientiousness: [0.3, 0.6],
      extraversion: [0.2, 0.5],
      agreeableness: [0.5, 0.8],
      neuroticism: [0.4, 0.7],
      noveltySeeking: [0.6, 0.9],
      aestheticSensitivity: [0.8, 1.0],
      riskTolerance: [0.5, 0.8],
    },
    exampleScenes: [
      'Astryde visual: nebula photography and cosmic renders',
      'Astryde ambient: space-themed listening sessions',
      'Astryde fashion: iridescent fabrics evoking aurora',
    ],
  },

  noctyra: {
    id: 'noctyra',
    displayName: 'Noctyra',
    shortDescription:
      'Ritualistic and mystical, drawn to occult aesthetics and ceremonial beauty. You find power in symbols and intention.',
    visualProfile: ['occult', 'ceremonial', 'candlelit', 'symbolic', 'ritual'],
    musicProfile: ['ritualistic', 'drone', 'tribal', 'hypnotic', 'sacred'],
    traitProfile: {
      openness: [0.7, 1.0],
      conscientiousness: [0.4, 0.7],
      extraversion: [0.2, 0.5],
      agreeableness: [0.3, 0.6],
      neuroticism: [0.5, 0.8],
      noveltySeeking: [0.5, 0.8],
      aestheticSensitivity: [0.85, 1.0],
      riskTolerance: [0.5, 0.8],
    },
    exampleScenes: [
      'Noctyra altar: curated objects and candlelight',
      'Noctyra gathering: drone music and incense',
      'Noctyra aesthetic: sigils and sacred geometry',
    ],
  },

  glemyth: {
    id: 'glemyth',
    displayName: 'Glemyth',
    shortDescription:
      'Fantastical and narrative-driven, living between folklore and imagination. You see myth in everyday moments.',
    visualProfile: ['mythical', 'storybook', 'enchanted', 'illustrative', 'whimsical'],
    musicProfile: ['folk-influenced', 'storytelling', 'acoustic', 'medieval', 'fairy-tale'],
    traitProfile: {
      openness: [0.8, 1.0],
      conscientiousness: [0.3, 0.6],
      extraversion: [0.3, 0.6],
      agreeableness: [0.6, 0.9],
      neuroticism: [0.4, 0.7],
      noveltySeeking: [0.5, 0.8],
      aestheticSensitivity: [0.8, 1.0],
      riskTolerance: [0.3, 0.6],
    },
    exampleScenes: [
      'Glemyth illustration: enchanted forest scenes',
      'Glemyth fashion: flowing fabrics and handmade jewelry',
      'Glemyth music: folk ballads with fantastical lyrics',
    ],
  },

  vireth: {
    id: 'vireth',
    displayName: 'Vireth',
    shortDescription:
      'Earthy and grounded, connected to natural materials and textures. You find beauty in raw, unprocessed aesthetics.',
    visualProfile: ['earthy', 'textured', 'raw', 'natural-materials', 'organic'],
    musicProfile: ['organic', 'acoustic', 'world-music', 'earthy', 'unprocessed'],
    traitProfile: {
      openness: [0.5, 0.8],
      conscientiousness: [0.5, 0.8],
      extraversion: [0.3, 0.6],
      agreeableness: [0.7, 1.0],
      neuroticism: [0.2, 0.5],
      noveltySeeking: [0.3, 0.6],
      aestheticSensitivity: [0.7, 0.95],
      riskTolerance: [0.2, 0.5],
    },
    exampleScenes: [
      'Vireth interior: clay, wood, and linen textiles',
      'Vireth craft: hand-thrown ceramics and natural dyes',
      'Vireth sound: field recordings and acoustic instruments',
    ],
  },

  chromyne: {
    id: 'chromyne',
    displayName: 'Chromyne',
    shortDescription:
      'Color-synesthetic and sensation-driven, experiencing music as color. You live in a world of cross-modal perception.',
    visualProfile: ['synesthetic', 'color-fields', 'gradient', 'fluid', 'sensory'],
    musicProfile: ['colorful', 'layered', 'textural', 'synth-rich', 'immersive'],
    traitProfile: {
      openness: [0.8, 1.0],
      conscientiousness: [0.3, 0.6],
      extraversion: [0.4, 0.7],
      agreeableness: [0.5, 0.8],
      neuroticism: [0.4, 0.7],
      noveltySeeking: [0.6, 0.9],
      aestheticSensitivity: [0.9, 1.0],
      riskTolerance: [0.4, 0.7],
    },
    exampleScenes: [
      'Chromyne visual: abstract color gradients and flows',
      'Chromyne installation: multi-sensory immersive experience',
      'Chromyne playlist: tracks chosen by their "color"',
    ],
  },

  opalith: {
    id: 'opalith',
    displayName: 'Opalith',
    shortDescription:
      'Subtle and shifting, drawn to iridescence and gentle transformation. You appreciate beauty that reveals itself slowly.',
    visualProfile: ['opalescent', 'shifting', 'subtle', 'pearl', 'delicate'],
    musicProfile: ['subtle', 'shifting', 'gentle', 'evolving', 'ambient-pop'],
    traitProfile: {
      openness: [0.6, 0.9],
      conscientiousness: [0.5, 0.8],
      extraversion: [0.3, 0.6],
      agreeableness: [0.6, 0.9],
      neuroticism: [0.3, 0.6],
      noveltySeeking: [0.4, 0.7],
      aestheticSensitivity: [0.85, 1.0],
      riskTolerance: [0.2, 0.5],
    },
    exampleScenes: [
      'Opalith jewelry: pearl and moonstone pieces',
      'Opalith interior: soft whites with hints of color',
      'Opalith ambient: slowly shifting soundscapes',
    ],
  },

  fluxeris: {
    id: 'fluxeris',
    displayName: 'Fluxeris',
    shortDescription:
      'Change-embracing and fluid, thriving in transformation. You see beauty in becoming rather than being.',
    visualProfile: ['fluid', 'morphing', 'transitional', 'liquid', 'adaptive'],
    musicProfile: ['evolving', 'generative', 'shape-shifting', 'experimental', 'unpredictable'],
    traitProfile: {
      openness: [0.8, 1.0],
      conscientiousness: [0.2, 0.5],
      extraversion: [0.4, 0.7],
      agreeableness: [0.5, 0.8],
      neuroticism: [0.4, 0.7],
      noveltySeeking: [0.85, 1.0],
      aestheticSensitivity: [0.7, 0.95],
      riskTolerance: [0.7, 1.0],
    },
    exampleScenes: [
      'Fluxeris installation: reactive projections that morph',
      'Fluxeris fashion: modular clothing with transformable shapes',
      'Fluxeris music: generative compositions that never repeat',
    ],
  },

  glovern: {
    id: 'glovern',
    displayName: 'Glovern',
    shortDescription:
      'Botanical and lush, drawn to verdant growth and plant aesthetics. You find peace in greenery and living spaces.',
    visualProfile: ['botanical', 'lush', 'green', 'plant-life', 'greenhouse'],
    musicProfile: ['organic', 'gentle', 'nature-inspired', 'pastoral', 'garden'],
    traitProfile: {
      openness: [0.6, 0.9],
      conscientiousness: [0.5, 0.8],
      extraversion: [0.3, 0.6],
      agreeableness: [0.7, 1.0],
      neuroticism: [0.2, 0.5],
      noveltySeeking: [0.3, 0.6],
      aestheticSensitivity: [0.7, 0.95],
      riskTolerance: [0.2, 0.5],
    },
    exampleScenes: [
      'Glovern interior: plant-filled rooms and botanical prints',
      'Glovern photography: macro shots of leaves and flowers',
      'Glovern ambient: morning garden soundscapes',
    ],
  },

  vantoryx: {
    id: 'vantoryx',
    displayName: 'Vantoryx',
    shortDescription:
      'Vanguard and boundary-pushing, always at the cutting edge. You define trends before they have names.',
    visualProfile: ['avant-garde', 'experimental', 'boundary-pushing', 'unconventional', 'provocative'],
    musicProfile: ['experimental', 'avant-garde', 'boundary-pushing', 'challenging', 'innovative'],
    traitProfile: {
      openness: [0.9, 1.0],
      conscientiousness: [0.3, 0.6],
      extraversion: [0.5, 0.8],
      agreeableness: [0.3, 0.6],
      neuroticism: [0.4, 0.7],
      noveltySeeking: [0.9, 1.0],
      aestheticSensitivity: [0.8, 1.0],
      riskTolerance: [0.85, 1.0],
    },
    exampleScenes: [
      'Vantoryx runway: designs that challenge the definition of clothing',
      'Vantoryx sound: noise compositions and deconstructed beats',
      'Vantoryx art: work that provokes and questions',
    ],
  },

  silquor: {
    id: 'silquor',
    displayName: 'Silquor',
    shortDescription:
      'Luxurious and tactile, drawn to silk and flowing fabrics. You appreciate sensual textures and effortless elegance.',
    visualProfile: ['silky', 'flowing', 'luxurious', 'draped', 'tactile'],
    musicProfile: ['smooth', 'sultry', 'flowing', 'sensual', 'sophisticated'],
    traitProfile: {
      openness: [0.5, 0.8],
      conscientiousness: [0.5, 0.8],
      extraversion: [0.5, 0.8],
      agreeableness: [0.5, 0.8],
      neuroticism: [0.3, 0.6],
      noveltySeeking: [0.3, 0.6],
      aestheticSensitivity: [0.8, 1.0],
      riskTolerance: [0.3, 0.6],
    },
    exampleScenes: [
      'Silquor fashion: flowing silk garments in muted tones',
      'Silquor interior: velvet and satin textures throughout',
      'Silquor lounge: sophisticated cocktail music',
    ],
  },

  iridrax: {
    id: 'iridrax',
    displayName: 'Iridrax',
    shortDescription:
      'Prismatic and intense, drawn to extreme iridescence and color shifting. You are maximally chromatic and unapologetic.',
    visualProfile: ['prismatic', 'intense-iridescent', 'oil-slick', 'multi-spectral', 'dazzling'],
    musicProfile: ['intense', 'maximalist', 'colorful', 'overwhelming', 'euphoric'],
    traitProfile: {
      openness: [0.7, 1.0],
      conscientiousness: [0.3, 0.6],
      extraversion: [0.7, 1.0],
      agreeableness: [0.4, 0.7],
      neuroticism: [0.3, 0.6],
      noveltySeeking: [0.8, 1.0],
      aestheticSensitivity: [0.8, 1.0],
      riskTolerance: [0.7, 1.0],
    },
    exampleScenes: [
      'Iridrax fashion: oil-slick fabrics and beetle-wing textures',
      'Iridrax rave: full-spectrum laser shows',
      'Iridrax makeup: extreme chromatic eye looks',
    ],
  },

  prismora: {
    id: 'prismora',
    displayName: 'Prismora',
    shortDescription:
      'Light-refracting and architectural, drawn to structural prisms and clean geometry. You see light as a building material.',
    visualProfile: ['refractive', 'architectural', 'clean-lines', 'light-play', 'glass'],
    musicProfile: ['precise', 'angular', 'clean', 'geometric', 'minimal-electronic'],
    traitProfile: {
      openness: [0.6, 0.9],
      conscientiousness: [0.7, 1.0],
      extraversion: [0.4, 0.7],
      agreeableness: [0.4, 0.7],
      neuroticism: [0.2, 0.5],
      noveltySeeking: [0.5, 0.8],
      aestheticSensitivity: [0.75, 1.0],
      riskTolerance: [0.4, 0.7],
    },
    exampleScenes: [
      'Prismora architecture: glass structures with light-catching angles',
      'Prismora design: crystal awards and transparent objects',
      'Prismora sound: precise, crystalline electronic music',
    ],
  },

  lucidyne: {
    id: 'lucidyne',
    displayName: 'Lucidyne',
    shortDescription:
      'Clarity-seeking and transparent, drawn to pure light and unfiltered truth. You value seeing things as they truly are.',
    visualProfile: ['clear', 'transparent', 'pure-light', 'unfiltered', 'pristine'],
    musicProfile: ['clear', 'pure-tones', 'unprocessed', 'transparent', 'honest'],
    traitProfile: {
      openness: [0.6, 0.9],
      conscientiousness: [0.7, 1.0],
      extraversion: [0.4, 0.7],
      agreeableness: [0.6, 0.9],
      neuroticism: [0.2, 0.5],
      noveltySeeking: [0.4, 0.7],
      aestheticSensitivity: [0.7, 0.95],
      riskTolerance: [0.3, 0.6],
    },
    exampleScenes: [
      'Lucidyne interior: white spaces with natural light',
      'Lucidyne photography: clean, unedited captures',
      'Lucidyne music: acoustic performances, minimal production',
    ],
  },

  velisynth: {
    id: 'velisynth',
    displayName: 'Velisynth',
    shortDescription:
      'Synthetic and deliberately artificial, embracing the beauty of the unnatural. You find authenticity in artifice.',
    visualProfile: ['synthetic', 'artificial', 'plastic', 'deliberately-fake', 'hyper-real'],
    musicProfile: ['synthetic', 'artificial', 'vocoder', 'robotic', 'post-human'],
    traitProfile: {
      openness: [0.7, 1.0],
      conscientiousness: [0.4, 0.7],
      extraversion: [0.5, 0.8],
      agreeableness: [0.3, 0.6],
      neuroticism: [0.3, 0.6],
      noveltySeeking: [0.7, 1.0],
      aestheticSensitivity: [0.7, 0.95],
      riskTolerance: [0.6, 0.9],
    },
    exampleScenes: [
      'Velisynth fashion: PVC and latex in candy colors',
      'Velisynth art: hyper-real 3D renders',
      'Velisynth music: heavily processed, obviously synthetic',
    ],
  },

  aurivox: {
    id: 'aurivox',
    displayName: 'Aurivox',
    shortDescription:
      'Voice-centered and golden, drawn to the power of sound and vocal expression. You find gold in timbre and resonance.',
    visualProfile: ['golden', 'vocal-inspired', 'resonant', 'warm', 'rich'],
    musicProfile: ['voice-focused', 'choral', 'golden-timbre', 'resonant', 'harmonic'],
    traitProfile: {
      openness: [0.6, 0.9],
      conscientiousness: [0.5, 0.8],
      extraversion: [0.5, 0.8],
      agreeableness: [0.6, 0.9],
      neuroticism: [0.3, 0.6],
      noveltySeeking: [0.4, 0.7],
      aestheticSensitivity: [0.8, 1.0],
      riskTolerance: [0.3, 0.6],
    },
    exampleScenes: [
      'Aurivox concert: choral performance in golden hall',
      'Aurivox interior: warm metallics and acoustic treatments',
      'Aurivox playlist: voice-forward tracks across genres',
    ],
  },

  glaceryl: {
    id: 'glaceryl',
    displayName: 'Glaceryl',
    shortDescription:
      'Cool and crystalline, drawn to ice aesthetics and arctic beauty. You find clarity in cold and beauty in frost.',
    visualProfile: ['icy', 'arctic', 'crystalline-cold', 'frost', 'pale-blue'],
    musicProfile: ['cold', 'sparse', 'frozen', 'minimal', 'distant'],
    traitProfile: {
      openness: [0.5, 0.8],
      conscientiousness: [0.6, 0.9],
      extraversion: [0.2, 0.5],
      agreeableness: [0.4, 0.7],
      neuroticism: [0.3, 0.6],
      noveltySeeking: [0.4, 0.7],
      aestheticSensitivity: [0.75, 1.0],
      riskTolerance: [0.3, 0.6],
    },
    exampleScenes: [
      'Glaceryl photography: arctic landscapes and ice formations',
      'Glaceryl interior: pale blues and crystalline accents',
      'Glaceryl ambient: cold, sparse soundscapes',
    ],
  },

  radianth: {
    id: 'radianth',
    displayName: 'Radianth',
    shortDescription:
      'Radiating and centerless, drawn to burst patterns and explosive light. You are energy moving outward in all directions.',
    visualProfile: ['radiating', 'burst-pattern', 'explosive', 'centerless', 'emanating'],
    musicProfile: ['building', 'explosive', 'crescendo', 'drop-heavy', 'climactic'],
    traitProfile: {
      openness: [0.7, 1.0],
      conscientiousness: [0.3, 0.6],
      extraversion: [0.8, 1.0],
      agreeableness: [0.5, 0.8],
      neuroticism: [0.3, 0.6],
      noveltySeeking: [0.7, 1.0],
      aestheticSensitivity: [0.7, 0.95],
      riskTolerance: [0.7, 1.0],
    },
    exampleScenes: [
      'Radianth festival: main stage drop with pyrotechnics',
      'Radianth art: radial explosion patterns',
      'Radianth fashion: burst prints and starburst jewelry',
    ],
  },
};

export const getConstellationById = (id: ConstellationId): ConstellationConfig => {
  return constellationsConfig[id];
};

export const getAllConstellations = (): ConstellationConfig[] => {
  return Object.values(constellationsConfig);
};

export default constellationsConfig;
