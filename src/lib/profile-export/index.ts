/**
 * Profile Export Module
 *
 * Machine-readable export of user aesthetic profiles for external applications:
 * - Photo arrangers / galleries
 * - AI content generators (Stable Diffusion, DALL-E, MusicGen)
 * - Music discovery services
 * - Personalization engines
 *
 * @example
 * ```typescript
 * import { exportAestheticProfile, generatePrompt } from './profile-export';
 *
 * // Export profile for external apps
 * const profile = exportAestheticProfile(enhancedProfile);
 *
 * // Generate AI prompts
 * const imagePrompt = generatePrompt(profile, 'image', { style: 'stable-diffusion' });
 * const musicPrompt = generatePrompt(profile, 'music', { style: 'musicgen' });
 *
 * // Use embeddings for similarity search
 * import { createVectorSearchClient, generateImageEmbedding } from './profile-export/embeddings';
 * const client = createVectorSearchClient('pinecone', { apiKey: '...' });
 * const embedding = await generateImageEmbedding(imageBuffer, 'clip');
 * const similar = await client.search('images', embedding.vector, { topK: 10 });
 * ```
 */

// =============================================================================
// Core Types
// =============================================================================

export type {
  // Profile structure
  AestheticProfileV1,
  ArchetypeSummary,
  VisualAestheticVector,
  SonicAestheticVector,
  BehavioralVector,
  ConfidenceMetadata,

  // Embedding types
  ImageEmbedding,
  AudioEmbedding,

  // Query types
  VisualSimilarityQuery,
  AudioSimilarityQuery,
  SimilarityResult,

  // Prompt types
  GeneratedPrompt,
  PromptStyle,

  // Export options
  ExportOptions,
} from './types';

// Export version constant
export { PROFILE_VERSION } from './types';

// =============================================================================
// Core Export Function
// =============================================================================

export { exportAestheticProfile } from './export';

// =============================================================================
// Prompt Generation
// =============================================================================

export {
  generateImagePrompt,
  generateMusicPrompt,
  generateTextPrompt,
  generatePrompt,
  promptTemplates,
  type PromptOptions,
} from './prompt-generator';

// =============================================================================
// Embeddings (Re-export for convenience)
// =============================================================================

export {
  // Visual
  generateImageEmbedding,
  generateBatchEmbeddings,
  computeVisualSimilarity,
  computeCosineSimilarity,
  extractVisualFeatures,
  scoreImagesForProfile,
  categorizeImagesByAlignment,
  VISUAL_MODEL_CONFIGS,
  type VisualModel,
  type VisualModelConfig,

  // Audio
  extractAudioFeatures,
  generateAudioEmbedding,
  computeAudioSimilarity,
  computeEmbeddingSimilarity,
  scoreTracksForProfile,
  findSimilarTracks,
  generateDiscoveryRecommendations,
  AUDIO_MODEL_CONFIGS,
  type AudioModel,
  type AudioModelConfig,
  type ExtractedAudioFeatures,

  // Vector search
  createVectorSearchClient,
  normalizeVector,
  euclideanDistance,
  searchSimilarImages,
  searchSimilarAudio,
  indexImage,
  indexAudio,
  type VectorProvider,
  type VectorRecord,
  type SearchOptions,
  type VectorSearchResult,
  type VectorSearchClient,
  type PineconeConfig,
  type WeaviateConfig,
  type QdrantConfig,
  type LocalConfig,
  type ProviderConfig,

  // Utilities
  createDevEmbeddingClient,
  generateProfileEmbeddings,
} from './embeddings';

// =============================================================================
// Integration Utilities
// =============================================================================

import { exportAestheticProfile } from './export';
import { generatePrompt } from './prompt-generator';
import { createDevEmbeddingClient, generateProfileEmbeddings } from './embeddings';
import type { AestheticProfileV1, GeneratedPrompt } from './types';

/**
 * Full profile export with all generated assets
 *
 * Returns the exported profile along with AI prompts for various platforms.
 */
export interface FullProfileExport {
  profile: AestheticProfileV1;
  prompts: {
    stableDiffusion: GeneratedPrompt;
    dalle: GeneratedPrompt;
    midjourney: GeneratedPrompt;
    musicGen: GeneratedPrompt;
  };
}

/**
 * Integration helper for external apps
 *
 * Provides a simplified interface for common operations.
 */
export function createProfileExportClient() {
  const embeddingClient = createDevEmbeddingClient();

  return {
    /**
     * Export a user's aesthetic profile
     */
    exportProfile: exportAestheticProfile,

    /**
     * Generate a specific prompt type
     */
    generatePrompt,

    /**
     * Embedding client for similarity search
     */
    embeddings: embeddingClient,

    /**
     * Generate embeddings from profile vectors
     */
    async generateEmbeddings(profile: AestheticProfileV1) {
      return generateProfileEmbeddings(profile.visual, profile.sonic);
    },
  };
}

// =============================================================================
// Serialization Utilities
// =============================================================================

/**
 * Serialize profile to JSON string
 */
export function serializeProfile(profile: AestheticProfileV1): string {
  return JSON.stringify(profile, null, 2);
}

/**
 * Deserialize profile from JSON string
 */
export function deserializeProfile(json: string): AestheticProfileV1 {
  const parsed = JSON.parse(json);

  // Validate version
  if (parsed.version !== '1.0') {
    console.warn(`[Profile Export] Unknown version: ${parsed.version}. Expected 1.0.`);
  }

  return parsed as AestheticProfileV1;
}

/**
 * Validate profile structure
 */
export function validateProfile(profile: unknown): profile is AestheticProfileV1 {
  if (!profile || typeof profile !== 'object') return false;

  const p = profile as Record<string, unknown>;

  // Check required top-level fields
  if (p.version !== '1.0') return false;
  if (typeof p.exportedAt !== 'string') return false;
  if (!p.archetype || typeof p.archetype !== 'object') return false;
  if (!p.visual || typeof p.visual !== 'object') return false;
  if (!p.sonic || typeof p.sonic !== 'object') return false;
  if (!p.behavioral || typeof p.behavioral !== 'object') return false;
  if (!p.confidence || typeof p.confidence !== 'object') return false;

  // Check archetype structure
  const archetype = p.archetype as Record<string, unknown>;
  if (!archetype.primary || typeof archetype.primary !== 'object') return false;

  // Check primary archetype
  const primary = archetype.primary as Record<string, unknown>;
  if (typeof primary.id !== 'string') return false;
  if (typeof primary.name !== 'string') return false;

  return true;
}

// =============================================================================
// Default Export
// =============================================================================

export default {
  // Core
  exportAestheticProfile,

  // Prompts
  generatePrompt,

  // Client
  createProfileExportClient,

  // Serialization
  serializeProfile,
  deserializeProfile,
  validateProfile,
};
