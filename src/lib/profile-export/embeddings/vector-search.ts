/**
 * Vector Similarity Search Module
 *
 * Provides interfaces and utilities for nearest-neighbor search
 * across image and audio embeddings.
 *
 * RECOMMENDED SERVICES:
 *
 * Managed Vector Databases:
 * - Pinecone: Fully managed, serverless option (pinecone.io)
 * - Weaviate: Open-source, self-hosted or cloud (weaviate.io)
 * - Qdrant: Open-source, high performance (qdrant.tech)
 * - Milvus: Open-source, scalable (milvus.io)
 *
 * Local/Embedded:
 * - FAISS: Facebook's similarity search (via Python)
 * - Annoy: Spotify's approximate NN (npm install annoy)
 * - HNSWLib: Fast approximate NN (npm install hnswlib-node)
 *
 * INSTALLATION:
 * ```bash
 * # For Pinecone
 * npm install @pinecone-database/pinecone
 *
 * # For local search
 * npm install hnswlib-node
 * ```
 *
 * USAGE:
 * ```typescript
 * import { createVectorSearchClient, VectorSearchClient } from './vector-search';
 *
 * const client = createVectorSearchClient('pinecone', { apiKey: '...' });
 * await client.upsert('images', [{ id: '1', vector: [...], metadata: {...} }]);
 * const results = await client.search('images', queryVector, 10);
 * ```
 */

import { ImageEmbedding, AudioEmbedding, SimilarityResult } from '../types';

// =============================================================================
// Vector Search Interface
// =============================================================================

/**
 * Supported vector database providers
 */
export type VectorProvider = 'pinecone' | 'weaviate' | 'qdrant' | 'local' | 'memory';

/**
 * Vector record for storage
 */
export interface VectorRecord {
  /** Unique identifier */
  id: string;

  /** Embedding vector */
  vector: number[];

  /** Metadata for filtering and display */
  metadata?: Record<string, unknown>;

  /** Namespace/collection for organization */
  namespace?: string;
}

/**
 * Search query options
 */
export interface SearchOptions {
  /** Number of results to return */
  topK: number;

  /** Minimum similarity threshold (0-1) */
  threshold?: number;

  /** Metadata filters */
  filter?: Record<string, unknown>;

  /** Include vector in results */
  includeVector?: boolean;

  /** Namespace to search in */
  namespace?: string;
}

/**
 * Search result
 */
export interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
  vector?: number[];
}

/**
 * Vector search client interface
 */
export interface VectorSearchClient {
  /** Provider name */
  provider: VectorProvider;

  /** Upsert vectors */
  upsert(collection: string, records: VectorRecord[]): Promise<void>;

  /** Search for similar vectors */
  search(
    collection: string,
    queryVector: number[],
    options: SearchOptions
  ): Promise<VectorSearchResult[]>;

  /** Delete vectors by ID */
  delete(collection: string, ids: string[]): Promise<void>;

  /** Get vector by ID */
  get(collection: string, id: string): Promise<VectorRecord | null>;

  /** Create collection/index */
  createCollection(name: string, dimensions: number): Promise<void>;

  /** Delete collection */
  deleteCollection(name: string): Promise<void>;

  /** Get collection stats */
  stats(collection: string): Promise<{ count: number; dimensions: number }>;
}

// =============================================================================
// Provider Configurations
// =============================================================================

/**
 * Pinecone configuration
 */
export interface PineconeConfig {
  apiKey: string;
  environment: string;
  projectId?: string;
}

/**
 * Weaviate configuration
 */
export interface WeaviateConfig {
  host: string;
  apiKey?: string;
  scheme?: 'http' | 'https';
}

/**
 * Qdrant configuration
 */
export interface QdrantConfig {
  host: string;
  port: number;
  apiKey?: string;
}

/**
 * Local/memory configuration
 */
export interface LocalConfig {
  persistPath?: string;
  maxElements?: number;
}

export type ProviderConfig = PineconeConfig | WeaviateConfig | QdrantConfig | LocalConfig;

// =============================================================================
// Client Factory
// =============================================================================

/**
 * Create vector search client
 *
 * IMPLEMENTATION NOTES:
 *
 * For Pinecone:
 * ```typescript
 * import { PineconeClient } from '@pinecone-database/pinecone';
 *
 * const pinecone = new PineconeClient();
 * await pinecone.init({
 *   apiKey: config.apiKey,
 *   environment: config.environment,
 * });
 *
 * const index = pinecone.Index('subtaste-embeddings');
 *
 * // Upsert
 * await index.upsert({
 *   vectors: records.map(r => ({
 *     id: r.id,
 *     values: r.vector,
 *     metadata: r.metadata,
 *   })),
 * });
 *
 * // Search
 * const results = await index.query({
 *   vector: queryVector,
 *   topK: 10,
 *   includeMetadata: true,
 * });
 * ```
 *
 * @param provider - Vector database provider
 * @param config - Provider-specific configuration
 * @returns Vector search client
 */
export function createVectorSearchClient(
  provider: VectorProvider,
  config: ProviderConfig
): VectorSearchClient {
  switch (provider) {
    case 'pinecone':
      return createPineconeClient(config as PineconeConfig);
    case 'weaviate':
      return createWeaviateClient(config as WeaviateConfig);
    case 'qdrant':
      return createQdrantClient(config as QdrantConfig);
    case 'local':
      return createLocalClient(config as LocalConfig);
    case 'memory':
    default:
      return createMemoryClient();
  }
}

// =============================================================================
// Placeholder Implementations
// =============================================================================

/**
 * Pinecone client (placeholder)
 */
function createPineconeClient(config: PineconeConfig): VectorSearchClient {
  console.warn(
    '[Vector Search] Pinecone client is placeholder. Install @pinecone-database/pinecone.'
  );

  return createMemoryClient();
}

/**
 * Weaviate client (placeholder)
 */
function createWeaviateClient(config: WeaviateConfig): VectorSearchClient {
  console.warn('[Vector Search] Weaviate client is placeholder. Install weaviate-ts-client.');

  return createMemoryClient();
}

/**
 * Qdrant client (placeholder)
 */
function createQdrantClient(config: QdrantConfig): VectorSearchClient {
  console.warn('[Vector Search] Qdrant client is placeholder. Install @qdrant/js-client-rest.');

  return createMemoryClient();
}

/**
 * Local HNSW client (placeholder)
 */
function createLocalClient(config: LocalConfig): VectorSearchClient {
  console.warn('[Vector Search] Local client is placeholder. Install hnswlib-node.');

  return createMemoryClient();
}

/**
 * In-memory client for testing and development
 * Uses brute-force search (not suitable for production)
 */
function createMemoryClient(): VectorSearchClient {
  const collections = new Map<string, Map<string, VectorRecord>>();

  return {
    provider: 'memory',

    async upsert(collection: string, records: VectorRecord[]): Promise<void> {
      if (!collections.has(collection)) {
        collections.set(collection, new Map());
      }

      const col = collections.get(collection)!;
      for (const record of records) {
        col.set(record.id, record);
      }
    },

    async search(
      collection: string,
      queryVector: number[],
      options: SearchOptions
    ): Promise<VectorSearchResult[]> {
      const col = collections.get(collection);
      if (!col) return [];

      const results: VectorSearchResult[] = [];

      for (const [id, record] of col) {
        // Apply namespace filter
        if (options.namespace && record.namespace !== options.namespace) continue;

        // Apply metadata filter (simple equality)
        if (options.filter) {
          let match = true;
          for (const [key, value] of Object.entries(options.filter)) {
            if (record.metadata?.[key] !== value) {
              match = false;
              break;
            }
          }
          if (!match) continue;
        }

        // Compute cosine similarity
        const score = cosineSimilarity(queryVector, record.vector);

        // Apply threshold
        if (options.threshold && score < options.threshold) continue;

        results.push({
          id,
          score,
          metadata: record.metadata,
          vector: options.includeVector ? record.vector : undefined,
        });
      }

      // Sort by score and return top K
      return results.sort((a, b) => b.score - a.score).slice(0, options.topK);
    },

    async delete(collection: string, ids: string[]): Promise<void> {
      const col = collections.get(collection);
      if (!col) return;

      for (const id of ids) {
        col.delete(id);
      }
    },

    async get(collection: string, id: string): Promise<VectorRecord | null> {
      const col = collections.get(collection);
      return col?.get(id) ?? null;
    },

    async createCollection(name: string, dimensions: number): Promise<void> {
      if (!collections.has(name)) {
        collections.set(name, new Map());
      }
    },

    async deleteCollection(name: string): Promise<void> {
      collections.delete(name);
    },

    async stats(collection: string): Promise<{ count: number; dimensions: number }> {
      const col = collections.get(collection);
      if (!col || col.size === 0) {
        return { count: 0, dimensions: 0 };
      }

      const firstRecord = col.values().next().value as VectorRecord;
      return {
        count: col.size,
        dimensions: firstRecord.vector.length,
      };
    },
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vector dimensions must match');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Normalize vector to unit length
 */
export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (magnitude === 0) return vector;
  return vector.map((v) => v / magnitude);
}

/**
 * Compute Euclidean distance between vectors
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vector dimensions must match');
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

// =============================================================================
// High-Level Search Utilities
// =============================================================================

/**
 * Search for similar images using aesthetic profile
 */
export async function searchSimilarImages(
  client: VectorSearchClient,
  profileEmbedding: ImageEmbedding,
  options: Partial<SearchOptions> = {}
): Promise<VectorSearchResult[]> {
  return client.search('images', profileEmbedding.vector, {
    topK: options.topK ?? 20,
    threshold: options.threshold ?? 0.5,
    includeVector: false,
    ...options,
  });
}

/**
 * Search for similar audio/music
 */
export async function searchSimilarAudio(
  client: VectorSearchClient,
  profileEmbedding: AudioEmbedding,
  options: Partial<SearchOptions> = {}
): Promise<VectorSearchResult[]> {
  return client.search('audio', profileEmbedding.vector, {
    topK: options.topK ?? 20,
    threshold: options.threshold ?? 0.5,
    includeVector: false,
    ...options,
  });
}

/**
 * Index an image embedding
 */
export async function indexImage(
  client: VectorSearchClient,
  id: string,
  embedding: ImageEmbedding,
  metadata?: Record<string, unknown>
): Promise<void> {
  await client.upsert('images', [
    {
      id,
      vector: embedding.vector,
      metadata: {
        ...metadata,
        model: embedding.model,
        modelVersion: embedding.modelVersion,
        generatedAt: embedding.generatedAt,
      },
    },
  ]);
}

/**
 * Index an audio embedding
 */
export async function indexAudio(
  client: VectorSearchClient,
  id: string,
  embedding: AudioEmbedding,
  metadata?: Record<string, unknown>
): Promise<void> {
  await client.upsert('audio', [
    {
      id,
      vector: embedding.vector,
      metadata: {
        ...metadata,
        model: embedding.model,
        modelVersion: embedding.modelVersion,
        features: embedding.features,
        generatedAt: embedding.generatedAt,
      },
    },
  ]);
}

export default {
  createVectorSearchClient,
  normalizeVector,
  euclideanDistance,
  searchSimilarImages,
  searchSimilarAudio,
  indexImage,
  indexAudio,
};
