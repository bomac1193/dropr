/**
 * Blend Narrative Generation
 *
 * Transforms constellation blend weights into human-readable, niche narratives.
 * Avoids hybrid naming schemes in favor of descriptive meaning.
 *
 * PATENT-ALIGNED: Narratives are procedurally generated from weighted
 * constellation combinations, not pre-written for each possible combination.
 *
 * TODO: Replace heuristic phrase generation with ML-based narrative synthesis
 * using fine-tuned language models on taste/aesthetic corpora.
 */

import { ConstellationId, CONSTELLATION_IDS } from '../constellations/types';
import { constellationsConfig } from '../constellations/config';
import { BlendNarrative, SecondaryInfluence, InterpretationInput } from './types';

// =============================================================================
// Constellation Interaction Meanings
// =============================================================================

/**
 * How each constellation modifies others when present as secondary influence
 * These are the semantic "undertone" meanings
 *
 * TODO: Learn these relationships from user feedback and content co-occurrence
 */
const CONSTELLATION_MODIFIERS: Record<ConstellationId, {
  undertone: string;
  energyShift: string;
  aestheticInfluence: string;
}> = {
  somnexis: {
    undertone: 'dreamy introspection',
    energyShift: 'softening intensity into contemplation',
    aestheticInfluence: 'hazy, liminal qualities',
  },
  nycataria: {
    undertone: 'nocturnal mystery',
    energyShift: 'adding urban edge and shadow',
    aestheticInfluence: 'noir-tinged darkness',
  },
  holovain: {
    undertone: 'futuristic glamour',
    energyShift: 'amplifying synthetic sheen',
    aestheticInfluence: 'holographic, chrome surfaces',
  },
  obscyra: {
    undertone: 'theatrical darkness',
    energyShift: 'deepening emotional resonance',
    aestheticInfluence: 'gothic elegance',
  },
  holofern: {
    undertone: 'bio-digital fusion',
    energyShift: 'grounding tech in organic flow',
    aestheticInfluence: 'living technology aesthetics',
  },
  prismant: {
    undertone: 'geometric precision',
    energyShift: 'structuring chaos into pattern',
    aestheticInfluence: 'bold color blocking',
  },
  luminth: {
    undertone: 'warm radiance',
    energyShift: 'brightening mood with golden light',
    aestheticInfluence: 'sun-kissed warmth',
  },
  crysolen: {
    undertone: 'crystalline clarity',
    energyShift: 'sharpening focus to faceted precision',
    aestheticInfluence: 'mineral transparency',
  },
  nexyra: {
    undertone: 'networked awareness',
    energyShift: 'adding digital-native fluency',
    aestheticInfluence: 'interface aesthetics',
  },
  velocine: {
    undertone: 'kinetic energy',
    energyShift: 'accelerating momentum',
    aestheticInfluence: 'motion blur dynamics',
  },
  astryde: {
    undertone: 'cosmic vastness',
    energyShift: 'expanding scale to infinity',
    aestheticInfluence: 'celestial depth',
  },
  noctyra: {
    undertone: 'ritualistic mystery',
    energyShift: 'adding ceremonial weight',
    aestheticInfluence: 'occult symbolism',
  },
  glemyth: {
    undertone: 'folkloric imagination',
    energyShift: 'weaving narrative enchantment',
    aestheticInfluence: 'storybook wonder',
  },
  vireth: {
    undertone: 'earthen groundedness',
    energyShift: 'rooting energy in natural texture',
    aestheticInfluence: 'raw material beauty',
  },
  chromyne: {
    undertone: 'synesthetic sensation',
    energyShift: 'blending senses into color-sound',
    aestheticInfluence: 'cross-modal perception',
  },
  opalith: {
    undertone: 'subtle shifting',
    energyShift: 'adding gentle iridescence',
    aestheticInfluence: 'pearlescent delicacy',
  },
  fluxeris: {
    undertone: 'constant transformation',
    energyShift: 'destabilizing into fluid change',
    aestheticInfluence: 'morphing forms',
  },
  glovern: {
    undertone: 'botanical serenity',
    energyShift: 'cultivating gentle growth',
    aestheticInfluence: 'verdant abundance',
  },
  vantoryx: {
    undertone: 'avant-garde provocation',
    energyShift: 'pushing boundaries further',
    aestheticInfluence: 'challenging conventions',
  },
  silquor: {
    undertone: 'tactile luxury',
    energyShift: 'smoothing texture to silk',
    aestheticInfluence: 'flowing elegance',
  },
  iridrax: {
    undertone: 'prismatic intensity',
    energyShift: 'amplifying chromatic chaos',
    aestheticInfluence: 'oil-slick spectrum',
  },
  prismora: {
    undertone: 'architectural light',
    energyShift: 'refracting through structure',
    aestheticInfluence: 'glass and geometry',
  },
  lucidyne: {
    undertone: 'transparent clarity',
    energyShift: 'stripping to pure essence',
    aestheticInfluence: 'unfiltered truth',
  },
  velisynth: {
    undertone: 'deliberate artifice',
    energyShift: 'embracing synthetic beauty',
    aestheticInfluence: 'hyper-real plasticity',
  },
  aurivox: {
    undertone: 'golden resonance',
    energyShift: 'warming with vocal richness',
    aestheticInfluence: 'harmonic warmth',
  },
  glaceryl: {
    undertone: 'arctic stillness',
    energyShift: 'cooling to crystalline calm',
    aestheticInfluence: 'frozen clarity',
  },
  radianth: {
    undertone: 'explosive energy',
    energyShift: 'building to climactic release',
    aestheticInfluence: 'burst patterns',
  },
};

// =============================================================================
// Narrative Generation Functions
// =============================================================================

/**
 * Generate a complete blend narrative from interpretation input
 *
 * @param input - Full interpretation input with blend weights
 * @returns Complete blend narrative
 */
export function generateBlendNarrative(input: InterpretationInput): BlendNarrative {
  const primary = input.primaryConstellationId;
  const primaryConfig = constellationsConfig[primary];

  // Get top secondary influences (weight > 0.05, max 3)
  const secondaryInfluences = getSecondaryInfluences(
    primary,
    input.blendWeights
  );

  // Generate narrative components
  const tagline = generateTagline(primary, secondaryInfluences);
  const summary = generateSummary(primary, secondaryInfluences, input);
  const aestheticDNA = generateAestheticDNA(primary, secondaryInfluences, input);

  return {
    primary,
    primaryName: primaryConfig.displayName,
    secondary: secondaryInfluences,
    summary,
    tagline,
    aestheticDNA,
  };
}

/**
 * Extract and annotate secondary influences from blend weights
 */
function getSecondaryInfluences(
  primary: ConstellationId,
  blendWeights: Partial<Record<ConstellationId, number>>
): SecondaryInfluence[] {
  // Sort by weight, exclude primary, filter low weights
  const sorted = Object.entries(blendWeights)
    .filter(([id, weight]) => id !== primary && (weight ?? 0) > 0.05)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .slice(0, 3);

  return sorted.map(([id, weight]) => {
    const constellationId = id as ConstellationId;
    const config = constellationsConfig[constellationId];
    const modifier = CONSTELLATION_MODIFIERS[constellationId];

    return {
      id: constellationId,
      weight: weight ?? 0,
      meaning: generateInfluenceMeaning(constellationId, weight ?? 0),
      modifierPhrase: modifier.undertone,
    };
  });
}

/**
 * Generate meaning description for a secondary influence
 */
function generateInfluenceMeaning(
  constellation: ConstellationId,
  weight: number
): string {
  const config = constellationsConfig[constellation];
  const modifier = CONSTELLATION_MODIFIERS[constellation];

  const intensity = weight > 0.25 ? 'strong' : weight > 0.15 ? 'notable' : 'subtle';

  return `A ${intensity} thread of ${modifier.undertone}, ${modifier.energyShift}`;
}

/**
 * Generate the main tagline
 *
 * TODO: Replace with ML-generated taglines trained on aesthetic descriptions
 */
function generateTagline(
  primary: ConstellationId,
  secondary: SecondaryInfluence[]
): string {
  const primaryConfig = constellationsConfig[primary];

  if (secondary.length === 0) {
    return `Pure ${primaryConfig.displayName} — ${primaryConfig.shortDescription.split('.')[0]}.`;
  }

  const topSecondary = secondary[0];
  const modifier = CONSTELLATION_MODIFIERS[topSecondary.id];

  // Generate undertone phrase based on weight
  const undertonePhrase = topSecondary.weight > 0.2
    ? `with strong ${modifier.undertone}`
    : `with ${modifier.undertone} undertones`;

  return `${primaryConfig.displayName} ${undertonePhrase}.`;
}

/**
 * Generate the full summary narrative
 */
function generateSummary(
  primary: ConstellationId,
  secondary: SecondaryInfluence[],
  input: InterpretationInput
): string {
  const primaryConfig = constellationsConfig[primary];
  const primaryModifier = CONSTELLATION_MODIFIERS[primary];

  // Start with primary description
  let summary = `You are anchored in ${primaryConfig.displayName}'s essence: ${primaryConfig.shortDescription}`;

  // Add secondary influences
  if (secondary.length > 0) {
    const influenceDescriptions = secondary.map((s, i) => {
      const config = constellationsConfig[s.id];
      const intensity = s.weight > 0.2 ? 'significant' : 'subtle';

      if (i === 0) {
        return `Your taste carries a ${intensity} influence from ${config.displayName}, ${s.meaning.toLowerCase()}`;
      }
      return `${config.displayName} adds ${CONSTELLATION_MODIFIERS[s.id].aestheticInfluence}`;
    });

    summary += ' ' + influenceDescriptions.join('. ') + '.';
  }

  // Add behavioral context if available
  if (input.explorerScore > 70) {
    summary += ' You actively seek out the edges of your taste space.';
  } else if (input.subtasteIndex > 70) {
    summary += ' Your preferences form a coherent, focused aesthetic identity.';
  }

  return summary;
}

/**
 * Generate aesthetic DNA description
 */
function generateAestheticDNA(
  primary: ConstellationId,
  secondary: SecondaryInfluence[],
  input: InterpretationInput
): string {
  const primaryConfig = constellationsConfig[primary];

  // Visual DNA
  const visualTraits = [...primaryConfig.visualProfile.slice(0, 3)];
  secondary.forEach(s => {
    const config = constellationsConfig[s.id];
    if (s.weight > 0.15) {
      visualTraits.push(config.visualProfile[0]);
    }
  });

  // Music DNA
  const musicTraits = [...primaryConfig.musicProfile.slice(0, 2)];
  secondary.forEach(s => {
    const config = constellationsConfig[s.id];
    if (s.weight > 0.15) {
      musicTraits.push(config.musicProfile[0]);
    }
  });

  // Add aesthetic preference modifiers
  const aestheticModifiers: string[] = [];
  if (input.aesthetic.darknessPreference > 0.7) {
    aestheticModifiers.push('shadow-leaning');
  } else if (input.aesthetic.darknessPreference < 0.3) {
    aestheticModifiers.push('light-seeking');
  }

  if (input.aesthetic.organicVsSynthetic > 0.7) {
    aestheticModifiers.push('synthetic-drawn');
  } else if (input.aesthetic.organicVsSynthetic < 0.3) {
    aestheticModifiers.push('organic-rooted');
  }

  const visualDNA = [...new Set(visualTraits)].slice(0, 5).join(', ');
  const musicDNA = [...new Set(musicTraits)].slice(0, 4).join(', ');
  const modifierStr = aestheticModifiers.length > 0
    ? ` Your aesthetic leans ${aestheticModifiers.join(' and ')}.`
    : '';

  return `Visual DNA: ${visualDNA}. Sonic DNA: ${musicDNA}.${modifierStr}`;
}

/**
 * Generate a short blend descriptor for UI badges
 */
export function generateBlendBadge(
  primary: ConstellationId,
  secondary: SecondaryInfluence[]
): string {
  const primaryConfig = constellationsConfig[primary];

  if (secondary.length === 0) {
    return primaryConfig.displayName;
  }

  const topSecondary = secondary[0];
  const modifier = CONSTELLATION_MODIFIERS[topSecondary.id];

  // Use modifier phrase, not constellation name
  return `${primaryConfig.displayName} · ${modifier.undertone}`;
}

export default generateBlendNarrative;
