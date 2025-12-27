/**
 * Embeddings Module Index
 *
 * Unified exports for all embedding-related functionality:
 * - Visual embeddings (MobileNet, CLIP, ResNet)
 * - Audio embeddings (Essentia, MusicNN, OpenL3)
 * - Vector similarity search (Pinecone, Weaviate, Qdrant, local)
 */

// Visual embeddings
export {
  generateImageEmbedding,
  generateBatchEmbeddings,
  computeVisualSimilarity,
  computeCosineSimilarity,
  extractVisualFeatures,
  scoreImagesForProfile,
  categorizeImagesByAlignment,
  MODEL_CONFIGS as VISUAL_MODEL_CONFIGS,
  type VisualModel,
  type VisualModelConfig,
} from './visual';

// Audio embeddings
export {
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
} from './audio';

// Vector search
export {
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
} from './vector-search';

// =============================================================================
// Convenience Utilities
// =============================================================================

import { createVectorSearchClient } from './vector-search';
import { generateImageEmbedding, extractVisualFeatures } from './visual';
import { generateAudioEmbedding, extractAudioFeatures } from './audio';
import type { ImageEmbedding, AudioEmbedding } from '../types';
import type { ExtractedAudioFeatures } from './audio';
import type { VisualAestheticVector } from '../types';

/**
 * Create a development/testing embedding client
 * Uses in-memory vector search with placeholder embeddings
 */
export function createDevEmbeddingClient() {
  const vectorClient = createVectorSearchClient('memory', {});

  return {
    vectorClient,

    /**
     * Process and index an image
     */
    async indexImageWithEmbedding(
      id: string,
      imageData: Buffer | string,
      metadata?: Record<string, unknown>
    ): Promise<ImageEmbedding> {
      const embedding = await generateImageEmbedding(imageData, 'mobilenet');
      const features = await extractVisualFeatures(imageData);

      await vectorClient.upsert('images', [
        {
          id,
          vector: embedding.vector,
          metadata: {
            ...metadata,
            features,
            model: embedding.model,
            generatedAt: embedding.generatedAt,
          },
        },
      ]);

      return embedding;
    },

    /**
     * Process and index audio
     */
    async indexAudioWithEmbedding(
      id: string,
      audioData: Buffer | string,
      metadata?: Record<string, unknown>
    ): Promise<AudioEmbedding> {
      const embedding = await generateAudioEmbedding(audioData, 'essentia');

      await vectorClient.upsert('audio', [
        {
          id,
          vector: embedding.vector,
          metadata: {
            ...metadata,
            features: embedding.features,
            model: embedding.model,
            generatedAt: embedding.generatedAt,
          },
        },
      ]);

      return embedding;
    },

    /**
     * Find similar images by embedding
     */
    async findSimilarImages(
      queryEmbedding: ImageEmbedding,
      topK: number = 10
    ) {
      return vectorClient.search('images', queryEmbedding.vector, {
        topK,
        threshold: 0.5,
      });
    },

    /**
     * Find similar audio by embedding
     */
    async findSimilarAudio(
      queryEmbedding: AudioEmbedding,
      topK: number = 10
    ) {
      return vectorClient.search('audio', queryEmbedding.vector, {
        topK,
        threshold: 0.5,
      });
    },
  };
}

/**
 * Full embedding pipeline for a user profile
 * Generates representative embeddings based on aesthetic vectors
 */
export async function generateProfileEmbeddings(
  visualVector: VisualAestheticVector,
  sonicVector: {
    tempo: number;
    energy: number;
    harmonicTension: number;
    rhythm: number;
    acousticDigital: number;
    vocalInstrumental: number;
    density: number;
  }
): Promise<{
  visual: ImageEmbedding;
  audio: AudioEmbedding;
}> {
  // Generate representative embeddings based on profile vectors
  // In production, this would use the vectors to condition or weight
  // the embedding generation

  // For now, generate placeholder embeddings
  const visual = await generateImageEmbedding(Buffer.from([]), 'mobilenet');
  const audio = await generateAudioEmbedding(Buffer.from([]), 'essentia');

  return { visual, audio };
}

export default {
  createDevEmbeddingClient,
  generateProfileEmbeddings,
};
