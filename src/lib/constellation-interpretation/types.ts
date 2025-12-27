/**
 * Enhanced Constellation Interpretation Types
 *
 * These types support the blend narrative, flavor state, and behavioral modifier
 * systems that provide depth without increasing archetype count.
 *
 * PATENT-ALIGNED: Identity is procedurally generated from psychometrics,
 * cross-modal embeddings, and behavioral signals. Labels are outputs, not fixed classes.
 */

import { ConstellationId } from '../constellations/types';

// =============================================================================
// Blend Narrative Types
// =============================================================================

/**
 * Secondary constellation influence with semantic meaning
 */
export interface SecondaryInfluence {
  /** Constellation ID */
  id: ConstellationId;
  /** Blend weight (0-1) */
  weight: number;
  /** Human-readable meaning of this influence */
  meaning: string;
  /** How this modifies the primary constellation */
  modifierPhrase: string;
}

/**
 * Complete blend narrative turning constellation weights into prose
 */
export interface BlendNarrative {
  /** Primary constellation anchor */
  primary: ConstellationId;
  /** Primary constellation display name */
  primaryName: string;
  /** Secondary influences (top 1-3 by weight) */
  secondary: SecondaryInfluence[];
  /** Full narrative summary */
  summary: string;
  /** Short tagline (1 sentence) */
  tagline: string;
  /** Aesthetic DNA description */
  aestheticDNA: string;
}

// =============================================================================
// Flavor State Types (Sub-Dimensions Within a Constellation)
// =============================================================================

/**
 * Triggers that activate a flavor state
 */
export interface FlavorTriggers {
  /** Minimum blend weights for specific constellations */
  blendThresholds?: Partial<Record<ConstellationId, number>>;
  /** Behavioral signals that activate this flavor */
  behavioralSignals?: BehavioralSignal[];
  /** Trait thresholds (e.g., { openness: { min: 0.8 } }) */
  traitThresholds?: Partial<Record<string, { min?: number; max?: number }>>;
  /** Minimum explorer score */
  minExplorerScore?: number;
  /** Minimum early adopter score */
  minEarlyAdopterScore?: number;
  /** Minimum subtaste index (coherence) */
  minSubtasteIndex?: number;
  /** Maximum subtaste index (eclecticism) */
  maxSubtasteIndex?: number;
}

/**
 * A flavor state represents a sub-dimension within a constellation
 * Example: "Radianth — Volatile" or "Somnexis — Ritual"
 */
export interface FlavorState {
  /** Unique identifier */
  id: string;
  /** Display name (e.g., "Volatile", "Ritual", "Ascendant") */
  displayName: string;
  /** Full label with constellation (e.g., "Radianth — Volatile") */
  fullLabel: string;
  /** Conditions that activate this flavor */
  triggers: FlavorTriggers;
  /** Description of what this flavor means */
  description: string;
  /** How this flavor manifests in taste */
  tasteManifesto: string;
  /** Emoji or icon hint */
  icon?: string;
}

/**
 * Behavioral signals used in flavor triggers
 */
export type BehavioralSignal =
  | 'high_interaction_diversity'
  | 'low_interaction_diversity'
  | 'rapid_exploration'
  | 'deep_engagement'
  | 'ritual_patterns'
  | 'impulse_discovery'
  | 'cross_genre_bridging'
  | 'niche_drilling'
  | 'trend_leading'
  | 'trend_following'
  | 'high_save_rate'
  | 'high_share_rate';

// =============================================================================
// Behavioral Modifier Types
// =============================================================================

/**
 * A behavioral modifier that cuts across all constellations
 */
export interface BehavioralModifier {
  /** Unique identifier */
  id: string;
  /** Human-readable label */
  label: string;
  /** Score from 0-100 */
  score: number;
  /** Which end of the spectrum this user is on */
  pole: 'high' | 'low' | 'balanced';
  /** Explanation of what this means for the user */
  explanation: string;
  /** Brief phrase for UI (e.g., "Early Adopter") */
  shortPhrase: string;
  /** Detailed behavioral insight */
  insight: string;
}

/**
 * Complete set of behavioral modifiers for a user
 */
export interface BehavioralProfile {
  /** All computed modifiers */
  modifiers: BehavioralModifier[];
  /** Overall behavioral archetype phrase */
  archetype: string;
  /** Key behavioral traits summary */
  summary: string;
}

// =============================================================================
// Enhanced Result Types
// =============================================================================

/**
 * Enhanced result combining all interpretation layers
 */
export interface EnhancedConstellationResult {
  /** Blend narrative with semantic meaning */
  blendNarrative: BlendNarrative;
  /** Current flavor state (if any activated) */
  flavorState?: FlavorState;
  /** All behavioral modifiers */
  behavioralProfile: BehavioralProfile;
  /** Subculture fit predictions */
  subcultureFit: SubcultureFitPrediction[];
  /** Complete identity statement */
  identityStatement: string;
  /** Procedurally generated identity components */
  identityComponents: IdentityComponent[];
}

/**
 * Subculture fit prediction
 */
export interface SubcultureFitPrediction {
  /** Subculture/scene name */
  name: string;
  /** Fit score (0-100) */
  fitScore: number;
  /** Adoption timing prediction */
  adoptionTiming: 'early_wave' | 'growth_phase' | 'mainstream' | 'late_discovery';
  /** Why this is a good fit */
  reasoning: string;
}

/**
 * Component of procedurally generated identity
 * PATENT-ALIGNED: Shows identity emerges from computation, not fixed classes
 */
export interface IdentityComponent {
  /** Component type */
  type: 'psychometric' | 'aesthetic' | 'behavioral' | 'temporal' | 'cross_modal';
  /** Component name */
  name: string;
  /** Value or description */
  value: string;
  /** Contribution to identity (0-1) */
  weight: number;
  /** Source of this component */
  source: string;
}

// =============================================================================
// Input Types for Computation
// =============================================================================

/**
 * Behavioral data input for modifier computation
 * TODO: Replace with actual UserInteractionsSummary when available
 */
export interface BehavioralInput {
  /** Content diversity score (0-1) */
  contentDiversity?: number;
  /** Average session depth (interactions per session) */
  sessionDepth?: number;
  /** Re-engagement rate (0-1) */
  reengagementRate?: number;
  /** Novelty vs familiarity preference (0=familiar, 1=novel) */
  noveltyPreference?: number;
  /** Interaction timestamps for timing analysis */
  interactionTimestamps?: Date[];
  /** Content categories interacted with */
  contentCategories?: string[];
  /** Save/bookmark rate (0-1) */
  saveRate?: number;
  /** Share rate (0-1) */
  shareRate?: number;
  /** Session count */
  sessionCount?: number;
  /** Days since first interaction */
  daysSinceFirst?: number;
}

/**
 * Complete input for enhanced interpretation
 */
export interface InterpretationInput {
  /** Primary constellation ID */
  primaryConstellationId: ConstellationId;
  /** All blend weights */
  blendWeights: Partial<Record<ConstellationId, number>>;
  /** Key scores */
  subtasteIndex: number;
  explorerScore: number;
  earlyAdopterScore: number;
  /** Trait scores (0-1) */
  traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    noveltySeeking: number;
    aestheticSensitivity: number;
    riskTolerance: number;
  };
  /** Aesthetic preferences */
  aesthetic: {
    darknessPreference: number;
    complexityPreference: number;
    organicVsSynthetic: number;
    minimalVsMaximal: number;
    tempoCenter: number;
    energyCenter: number;
    acousticVsDigital: number;
  };
  /** Behavioral data (optional, for returning users) */
  behavioral?: BehavioralInput;
}
