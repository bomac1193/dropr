/**
 * Result Data Structures
 *
 * These structures define the output format of constellation computation,
 * designed for a two-tier display: concise summary + expandable deep-dive.
 */

import { ConstellationId } from '../constellations/types';

// =============================================================================
// Result Summary (always visible)
// =============================================================================

export interface ResultSummary {
  primaryConstellationId: ConstellationId;
  primaryName: string;
  tagline: string;
  keyScores: {
    subtasteIndex: number;    // 0-100
    explorerScore: number;    // 0-100
    earlyAdopterScore: number; // 0-100
  };
  topScenes: string[];  // 2-4 scene strings from exampleScenes
}

// =============================================================================
// Result Details (expandable deep-dive)
// =============================================================================

export interface TraitValues {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  noveltySeeking: number;
  aestheticSensitivity: number;
  riskTolerance: number;
}

export interface PersonalityDetails {
  traits: TraitValues;
  narrative: string;  // plain-language explanation
}

export interface VisualSliders {
  darkToBright: number;       // 0 = dark, 1 = bright
  minimalToMaximal: number;   // 0 = minimal, 1 = maximal
  organicToSynthetic: number; // 0 = organic, 1 = synthetic
}

export interface MusicSliders {
  slowToFast: number;         // 0 = slow, 1 = fast
  softToIntense: number;      // 0 = soft, 1 = intense
  acousticToDigital: number;  // 0 = acoustic, 1 = digital
}

export interface AestheticDetails {
  visualSliders: VisualSliders;
  musicSliders: MusicSliders;
  narrative: string;
}

export interface ConstellationSummary {
  id: ConstellationId;
  name: string;
  affinityScore: number;      // 0-100
  earlyAdopterScore: number;  // 0-100
  summary: string;
}

export interface SubcultureDetails {
  topConstellations: ConstellationSummary[];
  narrative: string;
}

export interface PromptsDetails {
  creativeHooks: string[];    // e.g., "Design a Somnexis-inspired bedroom"
  contentPrompts: string[];   // e.g., "Find more dreamy, hazy photography"
}

export interface ResultDetails {
  personality: PersonalityDetails;
  aesthetic: AestheticDetails;
  subculture: SubcultureDetails;
  prompts: PromptsDetails;
}

// =============================================================================
// Full Result (combined)
// =============================================================================

export interface FullResult {
  summary: ResultSummary;
  details: ResultDetails;
}

// =============================================================================
// Constellation Explanation (internal, for computation)
// =============================================================================

/**
 * ConstellationExplanation provides structured data for building the result UI.
 * Generated during constellation computation.
 */
export interface ConstellationExplanation {
  // Why this primary constellation was chosen
  primaryRationale: string;

  // Score breakdowns
  traitSimilarityScores: { [K in ConstellationId]?: number };
  aestheticSimilarityScores: { [K in ConstellationId]?: number };
  behavioralSimilarityScores?: { [K in ConstellationId]?: number };

  // Narratives for UI sections
  personalityNarrative: string;
  aestheticNarrative: string;
  subcultureNarrative: string;

  // Generated prompts
  creativeHooks: string[];
  contentPrompts: string[];
}
