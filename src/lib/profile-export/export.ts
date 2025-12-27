/**
 * Profile Export Module - Core Export Function
 *
 * Pure function that transforms internal profile representation
 * into machine-readable format for external consumption.
 *
 * USAGE:
 * ```typescript
 * import { exportAestheticProfile } from '@/lib/profile-export';
 *
 * const profile = exportAestheticProfile(enhancedProfile, psychometric, aesthetic);
 * // Send to photo arranger, music discovery, AI generator, etc.
 * ```
 */

import {
  AestheticProfileV1,
  ArchetypeSummary,
  VisualAestheticVector,
  SonicAestheticVector,
  BehavioralVector,
  ConfidenceMetadata,
  RawScoreExport,
  ExportConfig,
  DEFAULT_EXPORT_CONFIG,
} from './types';

import { ComputedProfile } from '../scoring/constellation';
import { RepresentationProfile } from '../representation/types';
import { constellationsConfig } from '../constellations/config';
import { ConstellationId } from '../constellations/types';

// =============================================================================
// Input Types
// =============================================================================

/**
 * Psychometric input for export
 */
interface PsychometricInput {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  noveltySeeking: number;
  aestheticSensitivity: number;
  riskTolerance: number;
}

/**
 * Aesthetic input for export
 */
interface AestheticInput {
  darknessPreference: number;
  complexityPreference: number;
  symmetryPreference: number;
  organicVsSynthetic: number;
  minimalVsMaximal: number;
  tempoRangeMin: number;
  tempoRangeMax: number;
  energyRangeMin: number;
  energyRangeMax: number;
  harmonicDissonanceTolerance: number;
  rhythmPreference: number;
  acousticVsDigital: number;
}

/**
 * Optional behavioral input
 */
interface BehavioralInput {
  contentDiversity?: number;
  sessionDepth?: number;
  reengagementRate?: number;
  noveltyPreference?: number;
  saveRate?: number;
  shareRate?: number;
  sessionCount?: number;
}

/**
 * Optional confidence input from IRT scoring
 */
interface ConfidenceInput {
  overall?: number;
  questionsAnswered?: number;
  traitConfidence?: Record<string, number>;
  variance?: number;
  profileCreatedAt?: string;
}

// =============================================================================
// Main Export Function
// =============================================================================

/**
 * Export aesthetic profile in machine-readable format
 *
 * This is the main entry point for profile export.
 * It transforms internal profile data into a versioned, documented format
 * that external applications can consume.
 *
 * @param computedProfile - Full computed constellation profile with enhanced interpretation
 * @param psychometric - Psychometric trait scores (0-1)
 * @param aesthetic - Aesthetic preferences
 * @param representation - Optional representation profile (Module 4)
 * @param behavioral - Optional behavioral signals
 * @param confidence - Optional confidence metadata from IRT
 * @param config - Export configuration
 * @returns Machine-readable aesthetic profile
 */
export function exportAestheticProfile(
  computedProfile: ComputedProfile,
  psychometric: PsychometricInput,
  aesthetic: AestheticInput,
  representation?: RepresentationProfile,
  behavioral?: BehavioralInput,
  confidence?: ConfidenceInput,
  config: ExportConfig = DEFAULT_EXPORT_CONFIG
): AestheticProfileV1 {
  const now = new Date().toISOString();

  // Build each section
  const archetype = buildArchetypeSummary(computedProfile, psychometric);
  const visual = buildVisualVector(aesthetic, psychometric);
  const sonic = buildSonicVector(aesthetic, representation);
  const behavioralVector = buildBehavioralVector(
    psychometric,
    representation,
    behavioral,
    computedProfile
  );
  const confidenceMetadata = buildConfidenceMetadata(confidence, behavioral);

  const profile: AestheticProfileV1 = {
    version: '1.0',
    exportedAt: now,
    archetype,
    visual,
    sonic,
    behavioral: behavioralVector,
    confidence: confidenceMetadata,
  };

  // Optionally include raw scores
  if (config.includeRaw) {
    profile.raw = buildRawExport(computedProfile, psychometric);
  }

  return profile;
}

// =============================================================================
// Section Builders
// =============================================================================

/**
 * Build archetype summary from computed profile
 */
function buildArchetypeSummary(
  computedProfile: ComputedProfile,
  psychometric: PsychometricInput
): ArchetypeSummary {
  const primaryId = computedProfile.profile.primaryConstellationId as ConstellationId;
  const primaryConfig = constellationsConfig[primaryId];

  // Get secondary constellations from blend weights
  const blendWeights = computedProfile.profile.blendWeights;
  const sortedWeights = Object.entries(blendWeights)
    .filter(([id]) => id !== primaryId)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .slice(0, 3);

  const secondary = sortedWeights.map(([id, weight]) => {
    const config = constellationsConfig[id as ConstellationId];
    return {
      id,
      name: config.displayName,
      weight: weight ?? 0,
      modifierPhrase: getModifierPhrase(id as ConstellationId),
    };
  });

  // Build identity statement
  let identityStatement = `You are a ${primaryConfig.displayName}`;
  if (secondary.length > 0) {
    identityStatement += ` with ${secondary[0].modifierPhrase} undertones`;
  }
  identityStatement += '.';

  // Extract enhanced data if available
  const enhanced = computedProfile.enhanced;
  const behavioralArchetype = enhanced?.behavioralProfile?.archetype ?? 'Adaptive Explorer';
  const flavorState = enhanced?.flavorState
    ? {
        id: enhanced.flavorState.id,
        name: enhanced.flavorState.displayName,
        description: enhanced.flavorState.description,
      }
    : undefined;

  // Generate keywords from constellation config
  const keywords = [
    ...primaryConfig.visualProfile.slice(0, 5),
    ...primaryConfig.musicProfile.slice(0, 5),
  ];

  // Generate style descriptors
  const styleDescriptors = generateStyleDescriptors(primaryConfig, psychometric);

  return {
    primary: {
      id: primaryId,
      name: primaryConfig.displayName,
      tagline: primaryConfig.shortDescription.split('.')[0],
    },
    secondary,
    identityStatement,
    behavioralArchetype,
    flavorState,
    keywords,
    styleDescriptors,
  };
}

/**
 * Build visual aesthetic vector
 */
function buildVisualVector(
  aesthetic: AestheticInput,
  psychometric: PsychometricInput
): VisualAestheticVector {
  // Calculate derived values
  const colorContrast = calculateColorContrast(aesthetic, psychometric);
  const warmth = calculateWarmth(aesthetic);
  const saturation = calculateSaturation(aesthetic, psychometric);
  const texture = calculateTexture(aesthetic, psychometric);

  return {
    darkness: aesthetic.darknessPreference,
    symmetry: aesthetic.symmetryPreference,
    complexity: aesthetic.complexityPreference,
    colorContrast,
    minimalMaximal: aesthetic.minimalVsMaximal,
    organicSynthetic: aesthetic.organicVsSynthetic,
    warmth,
    saturation,
    texture,
  };
}

/**
 * Build sonic aesthetic vector
 */
function buildSonicVector(
  aesthetic: AestheticInput,
  representation?: RepresentationProfile
): SonicAestheticVector {
  // Normalize tempo to 0-1 (60-180 BPM range)
  const tempoCenter = (aesthetic.tempoRangeMin + aesthetic.tempoRangeMax) / 2;
  const tempoNormalized = clamp((tempoCenter - 60) / 120, 0, 1);

  // Energy from aesthetic or representation
  const energyCenter = (aesthetic.energyRangeMin + aesthetic.energyRangeMax) / 2;
  const energy = representation?.energy ?? energyCenter;

  // Calculate density from representation or derive
  const density = representation?.sensoryDensity ?? aesthetic.minimalVsMaximal;

  // Vocal preference is derived (we don't have direct data)
  // Estimate from acoustic preference and energy
  const vocalInstrumental = clamp(
    0.5 + (1 - aesthetic.acousticVsDigital) * 0.2 - aesthetic.harmonicDissonanceTolerance * 0.1,
    0,
    1
  );

  return {
    tempo: tempoNormalized,
    tempoRange: {
      min: aesthetic.tempoRangeMin,
      max: aesthetic.tempoRangeMax,
    },
    energy,
    energyRange: {
      min: aesthetic.energyRangeMin,
      max: aesthetic.energyRangeMax,
    },
    harmonicTension: aesthetic.harmonicDissonanceTolerance,
    rhythm: aesthetic.rhythmPreference,
    acousticDigital: aesthetic.acousticVsDigital,
    vocalInstrumental,
    density,
  };
}

/**
 * Build behavioral vector
 */
function buildBehavioralVector(
  psychometric: PsychometricInput,
  representation?: RepresentationProfile,
  behavioral?: BehavioralInput,
  computedProfile?: ComputedProfile
): BehavioralVector {
  // Temporal style from representation or derive
  const temporalStyle = representation?.temporalStyle ?? deriveTemporalStyle(psychometric);

  // Novelty seeking
  const noveltySeeking = behavioral?.noveltyPreference ?? psychometric.noveltySeeking;

  // Early adopter from computed profile or derive
  const earlyAdopterScore =
    (computedProfile?.profile.earlyAdopterScore ?? deriveEarlyAdopterScore(psychometric)) / 100;

  // Diversity from behavioral or derive
  const diversityPreference =
    behavioral?.contentDiversity ??
    (psychometric.openness * 0.6 + psychometric.noveltySeeking * 0.4);

  // Social sharing from behavioral or derive
  const socialSharing =
    behavioral?.shareRate ??
    (psychometric.extraversion * 0.5 + (1 - psychometric.neuroticism) * 0.3 + 0.2);

  // Engagement depth from behavioral or derive
  const engagementDepth =
    behavioral?.sessionDepth !== undefined
      ? Math.min(behavioral.sessionDepth / 20, 1)
      : psychometric.conscientiousness * 0.5 + (1 - psychometric.noveltySeeking) * 0.3;

  return {
    temporalStyle,
    noveltySeeking,
    earlyAdopterScore,
    diversityPreference: clamp(diversityPreference, 0, 1),
    socialSharing: clamp(socialSharing, 0, 1),
    engagementDepth: clamp(engagementDepth, 0, 1),
  };
}

/**
 * Build confidence metadata
 */
function buildConfidenceMetadata(
  confidence?: ConfidenceInput,
  behavioral?: BehavioralInput
): ConfidenceMetadata {
  const overall = confidence?.overall ?? 0.7;
  const questionsAnswered = confidence?.questionsAnswered ?? 15;
  const variance = confidence?.variance ?? 0.1;

  // Calculate profile age
  const profileCreatedAt = confidence?.profileCreatedAt ?? new Date().toISOString();
  const createdDate = new Date(profileCreatedAt);
  const now = new Date();
  const profileAgeDays = Math.floor(
    (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determine reliability tier
  let reliabilityTier: ConfidenceMetadata['reliabilityTier'];
  if (overall >= 0.8 && questionsAnswered >= 20 && variance < 0.15) {
    reliabilityTier = 'high';
  } else if (overall >= 0.6 && questionsAnswered >= 12) {
    reliabilityTier = 'medium';
  } else if (overall >= 0.4 && questionsAnswered >= 8) {
    reliabilityTier = 'low';
  } else {
    reliabilityTier = 'provisional';
  }

  return {
    overall,
    questionsAnswered,
    hasBehavioralData: behavioral !== undefined && (behavioral.sessionCount ?? 0) >= 3,
    traitConfidence: confidence?.traitConfidence ?? {},
    variance,
    profileAgeDays,
    lastUpdated: new Date().toISOString(),
    reliabilityTier,
  };
}

/**
 * Build raw score export
 */
function buildRawExport(
  computedProfile: ComputedProfile,
  psychometric: PsychometricInput
): RawScoreExport {
  return {
    psychometric: { ...psychometric },
    blendWeights: { ...computedProfile.profile.blendWeights },
    derived: {
      subtasteIndex: computedProfile.profile.subtasteIndex,
      explorerScore: computedProfile.profile.explorerScore,
      earlyAdopterScore: computedProfile.profile.earlyAdopterScore,
    },
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get modifier phrase for constellation undertones
 */
function getModifierPhrase(constellationId: ConstellationId): string {
  // Map of constellation IDs to their modifier phrases
  const modifiers: Record<string, string> = {
    somnexis: 'dreamy depth',
    nycataria: 'nocturnal allure',
    holovain: 'holographic shimmer',
    obscyra: 'shadowy mystery',
    radianth: 'radiant energy',
    velocine: 'kinetic momentum',
    crysolen: 'crystalline clarity',
    prismora: 'prismatic beauty',
    luminth: 'golden warmth',
    glaceryl: 'icy stillness',
    vireth: 'earthen groundedness',
    glemyth: 'mythic wonder',
    nexyra: 'digital fluidity',
    astryde: 'cosmic vastness',
    fluxeris: 'chaotic flux',
    opalith: 'opalescent softness',
    velisynth: 'synthetic precision',
    chromyne: 'chromatic vibrancy',
    iridrax: 'iridescent intensity',
    noctyra: 'twilight mystique',
    vantoryx: 'avant-garde edge',
    glovern: 'verdant growth',
    arctonis: 'arctic precision',
    lucidyne: 'lucid clarity',
    holofern: 'bio-digital fusion',
    prismant: 'refractive wonder',
    velorium: 'momentum drive',
  };

  return modifiers[constellationId] ?? 'subtle influence';
}

/**
 * Generate style descriptors from constellation config
 */
function generateStyleDescriptors(
  config: (typeof constellationsConfig)[ConstellationId],
  psychometric: PsychometricInput
): string[] {
  const descriptors: string[] = [];

  // Add visual descriptors
  if (config.visualProfile.length > 0) {
    descriptors.push(...config.visualProfile.slice(0, 3));
  }

  // Add personality-based descriptors
  if (psychometric.openness > 0.7) descriptors.push('experimental');
  if (psychometric.extraversion > 0.7) descriptors.push('bold');
  if (psychometric.extraversion < 0.3) descriptors.push('introspective');
  if (psychometric.aestheticSensitivity > 0.7) descriptors.push('refined');
  if (psychometric.riskTolerance > 0.7) descriptors.push('edgy');

  return [...new Set(descriptors)].slice(0, 8);
}

/**
 * Calculate color contrast preference
 */
function calculateColorContrast(
  aesthetic: AestheticInput,
  psychometric: PsychometricInput
): number {
  // Higher complexity and extraversion suggest higher contrast preference
  return clamp(
    aesthetic.complexityPreference * 0.4 +
      psychometric.extraversion * 0.3 +
      (1 - aesthetic.minimalVsMaximal) * 0.3,
    0,
    1
  );
}

/**
 * Calculate warmth preference (we don't have direct data, so derive)
 */
function calculateWarmth(aesthetic: AestheticInput): number {
  // Dark preference often correlates with cooler tones
  // Organic preference often correlates with warmer tones
  return clamp(
    (1 - aesthetic.darknessPreference) * 0.4 + (1 - aesthetic.organicVsSynthetic) * 0.3 + 0.3,
    0,
    1
  );
}

/**
 * Calculate saturation preference
 */
function calculateSaturation(
  aesthetic: AestheticInput,
  psychometric: PsychometricInput
): number {
  // Higher energy and extraversion suggest higher saturation
  const energyCenter = (aesthetic.energyRangeMin + aesthetic.energyRangeMax) / 2;
  return clamp(
    energyCenter * 0.3 + psychometric.extraversion * 0.3 + aesthetic.complexityPreference * 0.2 + 0.2,
    0,
    1
  );
}

/**
 * Calculate texture preference
 */
function calculateTexture(aesthetic: AestheticInput, psychometric: PsychometricInput): number {
  // Organic and complex preferences suggest more texture
  return clamp(
    (1 - aesthetic.organicVsSynthetic) * 0.4 +
      aesthetic.complexityPreference * 0.3 +
      psychometric.openness * 0.2 +
      0.1,
    0,
    1
  );
}

/**
 * Derive temporal style from psychometric traits
 */
function deriveTemporalStyle(
  psychometric: PsychometricInput
): 'looped' | 'evolving' | 'episodic' {
  const loopedScore =
    psychometric.conscientiousness * 0.4 + (1 - psychometric.noveltySeeking) * 0.4 + 0.2;

  const evolvingScore =
    psychometric.openness * 0.4 +
    (1 - Math.abs(psychometric.noveltySeeking - 0.5) * 2) * 0.3 +
    0.3;

  const episodicScore =
    psychometric.noveltySeeking * 0.4 + (1 - psychometric.conscientiousness) * 0.3 + 0.3;

  if (loopedScore >= evolvingScore && loopedScore >= episodicScore) return 'looped';
  if (evolvingScore >= loopedScore && evolvingScore >= episodicScore) return 'evolving';
  return 'episodic';
}

/**
 * Derive early adopter score from psychometric traits
 */
function deriveEarlyAdopterScore(psychometric: PsychometricInput): number {
  return Math.round(
    (psychometric.openness * 0.3 +
      psychometric.noveltySeeking * 0.35 +
      psychometric.riskTolerance * 0.25 +
      psychometric.aestheticSensitivity * 0.1) *
      100
  );
}

/**
 * Clamp value to range
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default exportAestheticProfile;
