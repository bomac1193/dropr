/**
 * Profile Export Module - Type Definitions
 *
 * Machine-readable profile format for external app consumption.
 *
 * CONSUMERS:
 * - Photo arranger → visual aesthetic curation
 * - AI content generator → style-consistent prompt generation
 * - Music discovery → audio feature-based recommendations
 *
 * VERSIONING:
 * - All outputs include version field for backwards compatibility
 * - Breaking changes increment major version
 * - New fields increment minor version
 */

// =============================================================================
// Core Export Types
// =============================================================================

/**
 * Complete aesthetic profile export
 * This is the main output consumed by external applications
 */
export interface AestheticProfileV1 {
  /** Schema version for compatibility checking */
  version: '1.0';

  /** When this profile was generated */
  exportedAt: string;

  /** Archetype information for identity/branding */
  archetype: ArchetypeSummary;

  /** Visual aesthetic preference vectors */
  visual: VisualAestheticVector;

  /** Sonic/audio preference vectors */
  sonic: SonicAestheticVector;

  /** Behavioral and temporal preferences */
  behavioral: BehavioralVector;

  /** Confidence and reliability metadata */
  confidence: ConfidenceMetadata;

  /** Raw scores for ML pipelines (optional) */
  raw?: RawScoreExport;
}

// =============================================================================
// Archetype Summary
// =============================================================================

/**
 * Archetype identity summary
 * Used for branding, prompt generation, and style descriptions
 */
export interface ArchetypeSummary {
  /** Primary constellation identifier */
  primary: {
    id: string;
    name: string;
    tagline: string;
  };

  /** Secondary influences with blend weights */
  secondary: Array<{
    id: string;
    name: string;
    weight: number; // 0-1
    modifierPhrase: string;
  }>;

  /** Human-readable identity statement */
  identityStatement: string;

  /** Behavioral archetype label */
  behavioralArchetype: string;

  /** Flavor state if activated */
  flavorState?: {
    id: string;
    name: string;
    description: string;
  };

  /** Keywords for prompt generation */
  keywords: string[];

  /** Style descriptors for AI content generation */
  styleDescriptors: string[];
}

// =============================================================================
// Visual Aesthetic Vector
// =============================================================================

/**
 * Visual aesthetic preferences as continuous vectors
 * All values normalized to 0-1 range
 */
export interface VisualAestheticVector {
  /**
   * Darkness preference
   * 0 = bright, luminous, high-key
   * 1 = dark, moody, low-key
   */
  darkness: number;

  /**
   * Symmetry preference
   * 0 = asymmetric, organic layouts
   * 1 = symmetric, balanced compositions
   */
  symmetry: number;

  /**
   * Visual complexity
   * 0 = minimal, clean, sparse
   * 1 = maximal, detailed, busy
   */
  complexity: number;

  /**
   * Color contrast preference
   * 0 = muted, low contrast, analogous
   * 1 = high contrast, bold, complementary
   */
  colorContrast: number;

  /**
   * Minimal vs maximal aesthetic
   * 0 = minimal, negative space
   * 1 = maximal, filled space
   */
  minimalMaximal: number;

  /**
   * Organic vs synthetic aesthetic
   * 0 = organic, natural, flowing
   * 1 = synthetic, artificial, geometric
   */
  organicSynthetic: number;

  /**
   * Warmth preference
   * 0 = cool tones (blue, cyan)
   * 1 = warm tones (red, orange, yellow)
   */
  warmth: number;

  /**
   * Saturation preference
   * 0 = desaturated, muted colors
   * 1 = saturated, vivid colors
   */
  saturation: number;

  /**
   * Texture preference
   * 0 = smooth, clean surfaces
   * 1 = textured, grainy, tactile
   */
  texture: number;
}

// =============================================================================
// Sonic Aesthetic Vector
// =============================================================================

/**
 * Sonic/audio preferences as continuous vectors
 * Used for music discovery and audio content matching
 */
export interface SonicAestheticVector {
  /**
   * Tempo preference (normalized)
   * 0 = slow (60 BPM)
   * 1 = fast (180 BPM)
   * Actual BPM = 60 + (value * 120)
   */
  tempo: number;

  /**
   * Preferred tempo range for filtering
   */
  tempoRange: {
    min: number; // BPM
    max: number; // BPM
  };

  /**
   * Energy level preference
   * 0 = calm, ambient, relaxed
   * 1 = intense, energetic, powerful
   */
  energy: number;

  /**
   * Energy range for filtering
   */
  energyRange: {
    min: number; // 0-1
    max: number; // 0-1
  };

  /**
   * Harmonic tension tolerance
   * 0 = consonant, resolved, simple harmonies
   * 1 = dissonant, unresolved, complex harmonies
   */
  harmonicTension: number;

  /**
   * Rhythm preference
   * 0 = flowing, ambient, arhythmic
   * 1 = rhythmic, percussive, groovy
   */
  rhythm: number;

  /**
   * Acoustic vs digital production
   * 0 = acoustic, organic instruments
   * 1 = digital, electronic, synthesized
   */
  acousticDigital: number;

  /**
   * Vocal preference
   * 0 = instrumental only
   * 1 = vocal-heavy
   */
  vocalInstrumental: number;

  /**
   * Density/layering
   * 0 = sparse, minimal arrangement
   * 1 = dense, layered arrangement
   */
  density: number;
}

// =============================================================================
// Behavioral Vector
// =============================================================================

/**
 * Behavioral and engagement preferences
 * Affects content pacing, discovery strategy, and social features
 */
export interface BehavioralVector {
  /**
   * Temporal engagement style
   * How the user prefers content to unfold
   */
  temporalStyle: 'looped' | 'evolving' | 'episodic';

  /**
   * Novelty seeking (0-1)
   * 0 = prefers familiar content
   * 1 = seeks new/unknown content
   */
  noveltySeeking: number;

  /**
   * Early adopter tendency (0-1)
   * 0 = waits for mainstream validation
   * 1 = seeks emerging/underground content
   */
  earlyAdopterScore: number;

  /**
   * Content diversity preference (0-1)
   * 0 = narrow, focused interests
   * 1 = broad, eclectic interests
   */
  diversityPreference: number;

  /**
   * Social sharing tendency (0-1)
   * 0 = private taste keeper
   * 1 = active taste sharer
   */
  socialSharing: number;

  /**
   * Engagement depth (0-1)
   * 0 = surface exploration
   * 1 = deep diving into niches
   */
  engagementDepth: number;
}

// =============================================================================
// Confidence Metadata
// =============================================================================

/**
 * Confidence and reliability information
 * Used to weight profile influence in recommendations
 */
export interface ConfidenceMetadata {
  /** Overall confidence score (0-1) */
  overall: number;

  /** Number of quiz questions answered */
  questionsAnswered: number;

  /** Whether user has behavioral data */
  hasBehavioralData: boolean;

  /** Per-trait confidence scores */
  traitConfidence: Record<string, number>;

  /** Score variance (lower = more consistent) */
  variance: number;

  /** Profile age in days */
  profileAgeDays: number;

  /** Last updated timestamp */
  lastUpdated: string;

  /** Reliability tier for downstream systems */
  reliabilityTier: 'high' | 'medium' | 'low' | 'provisional';
}

// =============================================================================
// Raw Score Export
// =============================================================================

/**
 * Raw scores for ML pipelines
 * Used when downstream systems need unprocessed values
 */
export interface RawScoreExport {
  /** Big Five + extended traits */
  psychometric: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    noveltySeeking: number;
    aestheticSensitivity: number;
    riskTolerance: number;
  };

  /** Constellation blend weights */
  blendWeights: Record<string, number>;

  /** Derived scores */
  derived: {
    subtasteIndex: number;
    explorerScore: number;
    earlyAdopterScore: number;
  };
}

// =============================================================================
// ML Embedding Types
// =============================================================================

/**
 * Image embedding for visual similarity
 * Generated by TensorFlow.js MobileNet, CLIP, or similar
 */
export interface ImageEmbedding {
  /** Model used to generate embedding */
  model: 'mobilenet' | 'clip' | 'resnet' | 'custom';

  /** Model version for compatibility */
  modelVersion: string;

  /** Embedding vector (typically 512-2048 dimensions) */
  vector: number[];

  /** Dimensionality of the vector */
  dimensions: number;

  /** Timestamp of embedding generation */
  generatedAt: string;
}

/**
 * Audio embedding for music similarity
 * Generated by Essentia, MusicNN, or similar
 */
export interface AudioEmbedding {
  /** Model used to generate embedding */
  model: 'essentia' | 'musicnn' | 'openl3' | 'custom';

  /** Model version */
  modelVersion: string;

  /** Embedding vector */
  vector: number[];

  /** Dimensionality */
  dimensions: number;

  /** Audio features extracted */
  features?: {
    tempo: number;
    energy: number;
    danceability: number;
    valence: number;
    instrumentalness: number;
  };

  /** Timestamp */
  generatedAt: string;
}

// =============================================================================
// Similarity Search Types
// =============================================================================

/**
 * Query for visual content similarity
 */
export interface VisualSimilarityQuery {
  /** User's visual aesthetic vector */
  aestheticVector: VisualAestheticVector;

  /** Optional: specific image embedding to match */
  referenceEmbedding?: ImageEmbedding;

  /** Number of results to return */
  topK: number;

  /** Minimum similarity threshold (0-1) */
  threshold?: number;

  /** Filters */
  filters?: {
    excludeIds?: string[];
    tags?: string[];
    dateRange?: { start: string; end: string };
  };
}

/**
 * Query for audio content similarity
 */
export interface AudioSimilarityQuery {
  /** User's sonic aesthetic vector */
  aestheticVector: SonicAestheticVector;

  /** Optional: specific audio embedding to match */
  referenceEmbedding?: AudioEmbedding;

  /** Number of results to return */
  topK: number;

  /** Minimum similarity threshold */
  threshold?: number;

  /** Filters */
  filters?: {
    excludeIds?: string[];
    genres?: string[];
    releaseYear?: { min: number; max: number };
  };
}

/**
 * Similarity search result
 */
export interface SimilarityResult<T = unknown> {
  /** Content item ID */
  id: string;

  /** Similarity score (0-1) */
  score: number;

  /** Distance in embedding space */
  distance: number;

  /** Content metadata */
  metadata: T;
}

// =============================================================================
// AI Content Generation Types
// =============================================================================

/**
 * Prompt generation request
 */
export interface PromptGenerationRequest {
  /** User's aesthetic profile */
  profile: AestheticProfileV1;

  /** Type of content to generate */
  contentType: 'image' | 'music' | 'text' | 'video';

  /** Style intensity (how strongly to apply aesthetic) */
  styleIntensity: number; // 0-1

  /** Additional context or requirements */
  context?: string;

  /** Negative prompts (what to avoid) */
  avoid?: string[];
}

/**
 * Generated prompt for AI systems
 */
export interface GeneratedPrompt {
  /** Main prompt text */
  prompt: string;

  /** Negative prompt */
  negativePrompt: string;

  /** Style keywords */
  styleKeywords: string[];

  /** Recommended model parameters */
  parameters?: {
    // Image parameters
    cfgScale?: number;
    steps?: number;
    sampler?: string;
    aspectRatio?: string;
    // Music parameters
    duration?: number;
    bpm?: number;
    model?: string;
  };

  /** Archetype-based style modifiers */
  styleModifiers: string[];
}

// =============================================================================
// Export Configuration
// =============================================================================

/**
 * Configuration for profile export
 */
export interface ExportConfig {
  /** Include raw scores */
  includeRaw?: boolean;

  /** Include embedding placeholders */
  includeEmbeddingSlots?: boolean;

  /** Specific vectors to include */
  vectors?: ('visual' | 'sonic' | 'behavioral')[];

  /** Confidence threshold for export */
  minConfidence?: number;
}

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  includeRaw: false,
  includeEmbeddingSlots: false,
  vectors: ['visual', 'sonic', 'behavioral'],
  minConfidence: 0,
};

/** Profile schema version */
export const PROFILE_VERSION = '2.0';

/** Export options alias */
export type ExportOptions = ExportConfig;

/** Prompt style for AI generation */
export type PromptStyle = 'stable-diffusion' | 'dalle' | 'midjourney' | 'musicgen' | 'generic';

// =============================================================================
// V2 Profile Export (with Archetypes + Enneagram)
// =============================================================================

/**
 * V2 Aesthetic Profile Export
 * Includes 8 viral archetypes, Enneagram, and cross-modal taste embeddings
 */
export interface AestheticProfileV2 {
  /** Schema version */
  version: '2.0';

  /** Export timestamp */
  exportedAt: string;

  /** New archetype system (8 viral types) */
  archetype: ArchetypeProfileV2;

  /** Enneagram personality type */
  enneagram: EnneagramProfileV2;

  /** Cross-modal taste embedding for ML (128-dim) */
  tasteEmbedding: TasteEmbedding;

  /** Visual aesthetic preferences */
  visual: VisualAestheticVector;

  /** Sonic/audio preferences */
  sonic: SonicAestheticVector;

  /** Behavioral preferences */
  behavioral: BehavioralVector;

  /** Confidence metadata */
  confidence: ConfidenceMetadataV2;

  /** Raw scores for ML pipelines */
  raw?: RawScoreExportV2;
}

/**
 * V2 Archetype profile with 8 viral types
 */
export interface ArchetypeProfileV2 {
  /** Primary archetype */
  primary: {
    id: string; // vespyr, ignyx, auryn, prismae, solara, crypta, vertex, fluxus
    name: string;
    title: string;
    tagline: string;
    viralHandle: string; // @VESPYR, @IGNYX, etc.
  };

  /** Blend weights across all 8 archetypes */
  blendWeights: Record<string, number>;

  /** Top 3 secondary influences */
  secondary: Array<{
    id: string;
    name: string;
    weight: number;
  }>;

  /** Identity narrative */
  identityStatement: string;

  /** Style keywords */
  keywords: string[];

  /** Color palette (primary + accent) */
  colors: {
    primary: string; // hex
    accent: string; // hex
    gradient: [string, string]; // start, end hex
  };
}

/**
 * V2 Enneagram profile
 */
export interface EnneagramProfileV2 {
  /** Primary type (1-9) */
  primary: {
    type: number;
    name: string;
    title: string;
  };

  /** Wing type */
  wing: {
    type: number;
    name: string;
  } | null;

  /** Tritype (heart, head, gut) */
  tritype: [number, number, number];

  /** Type scores for all 9 types */
  typeScores: Record<number, number>;

  /** Integration level */
  integrationLevel: 'stress' | 'average' | 'growth';

  /** Type confidence */
  confidence: number;
}

/**
 * Cross-modal taste embedding
 */
export interface TasteEmbedding {
  /** 128-dimensional composite taste vector */
  vector: number[];

  /** Dimensionality */
  dimensions: 128;

  /** Embedding model version */
  modelVersion: string;

  /** Component contributions (for interpretability) */
  components: {
    psychometric: number; // weight of psychometric traits
    visual: number; // weight of visual preferences
    sonic: number; // weight of audio preferences
    archetype: number; // weight of archetype affinity
  };

  /** Generation timestamp */
  generatedAt: string;
}

/**
 * V2 Confidence metadata with refinement info
 */
export interface ConfidenceMetadataV2 extends ConfidenceMetadata {
  /** Whether refinement quiz was completed */
  refinementApplied: boolean;

  /** Confidence boost from refinement */
  refinementBoost: number;

  /** Per-dimension confidence */
  dimensionConfidence: {
    archetype: number;
    enneagram: number;
    visual: number;
    sonic: number;
    behavioral: number;
  };
}

/**
 * V2 Raw scores with archetype and enneagram
 */
export interface RawScoreExportV2 extends RawScoreExport {
  /** Archetype blend weights */
  archetypeWeights: Record<string, number>;

  /** Enneagram type scores */
  enneagramScores: Record<number, number>;

  /** Component embeddings */
  embeddings?: {
    psychometric?: number[];
    visual?: number[];
    audio?: number[];
  };
}

/**
 * V2 Export configuration
 */
export interface ExportConfigV2 extends ExportConfig {
  /** Include taste embedding */
  includeTasteEmbedding?: boolean;

  /** Include Enneagram data */
  includeEnneagram?: boolean;

  /** Include component embeddings in raw */
  includeComponentEmbeddings?: boolean;

  /** Embedding model to use */
  embeddingModel?: 'local' | 'ml-service';
}
