/**
 * ML Service Client
 *
 * TypeScript client for the FastAPI ML microservice.
 * Handles embeddings, taste prediction, content scoring, and FAISS search.
 */

// =============================================================================
// Types (matching FastAPI schemas)
// =============================================================================

export type EmbeddingType = 'image' | 'audio' | 'text' | 'psychometric';

export interface EmbeddingResponse {
  embedding: number[];
  dimension: number;
  model: string;
  embedding_type: EmbeddingType;
}

export interface BatchEmbedRequest {
  items: Array<{
    url?: string;
    content?: string;
    embedding_type: EmbeddingType;
  }>;
}

export interface BatchEmbeddingResponse {
  embeddings: EmbeddingResponse[];
  total: number;
  failed: number;
}

export interface PsychometricInput {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  novelty_seeking: number;
  aesthetic_sensitivity: number;
  risk_tolerance: number;
  enneagram_primary?: number;
  enneagram_wing?: number;
  enneagram_type_scores?: Record<string, number>;
  darkness_preference?: number;
  complexity_preference?: number;
  organic_vs_synthetic?: number;
  tempo_center?: number;
  energy_center?: number;
}

export interface TasteVector {
  psychometric_embedding: number[];
  visual_embedding?: number[];
  audio_embedding?: number[];
  composite_embedding: number[];
  component_confidence: {
    psychometric: number;
    visual: number;
    audio: number;
  };
}

export interface TastePredictionResponse {
  taste_vector: TasteVector;
  predicted_preferences: Record<string, number>;
  archetype_affinities: Record<string, number>;
}

export interface ContentItem {
  content_id: string;
  embedding: number[];
  content_type: 'image' | 'track' | 'ai_artifact';
  tags: string[];
  subculture_hints: string[];
}

export interface ContentScore {
  content_id: string;
  overall_score: number;
  psych_alignment: number;
  aesthetic_alignment: number;
  novelty_score: number;
  explanation?: string;
}

export interface RankedContent {
  content_id: string;
  rank: number;
  score: number;
  diversity_bonus: number;
}

export interface SimilarityResult {
  content_id: string;
  score: number;
}

export interface ArchetypeAffinities {
  primary: string | null;
  primary_score: number;
  affinities: Record<string, number>;
  blend_weights: Record<string, number>;
}

// =============================================================================
// Client Configuration
// =============================================================================

export interface MLClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  fallbackEnabled?: boolean;
}

const DEFAULT_CONFIG: MLClientConfig = {
  baseUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  timeout: parseInt(process.env.ML_SERVICE_TIMEOUT || '5000'),
  retries: 2,
  fallbackEnabled: process.env.ML_FALLBACK_ENABLED !== 'false',
};

// =============================================================================
// ML Service Client
// =============================================================================

export class MLServiceClient {
  private config: MLClientConfig;

  constructor(config: Partial<MLClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= (this.config.retries || 0); attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.config.timeout
        );

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`ML Service error: ${response.status} - ${error}`);
        }

        return response.json();
      } catch (error) {
        lastError = error as Error;
        if (attempt < (this.config.retries || 0)) {
          // Exponential backoff
          await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 100));
        }
      }
    }

    throw lastError;
  }

  // ---------------------------------------------------------------------------
  // Health & Status
  // ---------------------------------------------------------------------------

  async healthCheck(): Promise<{
    status: string;
    version: string;
    models_loaded: boolean;
  }> {
    return this.fetch('/health');
  }

  // ---------------------------------------------------------------------------
  // Embeddings
  // ---------------------------------------------------------------------------

  async embedImage(imageUrl: string): Promise<EmbeddingResponse> {
    try {
      return await this.fetch('/api/v1/embed/image', {
        method: 'POST',
        body: JSON.stringify({ url: imageUrl, embedding_type: 'image' }),
      });
    } catch (error) {
      if (this.config.fallbackEnabled) {
        return this.fallbackEmbedding('image', 512);
      }
      throw error;
    }
  }

  async embedAudio(audioUrl: string): Promise<EmbeddingResponse> {
    try {
      return await this.fetch('/api/v1/embed/audio', {
        method: 'POST',
        body: JSON.stringify({ url: audioUrl, embedding_type: 'audio' }),
      });
    } catch (error) {
      if (this.config.fallbackEnabled) {
        return this.fallbackEmbedding('audio', 768);
      }
      throw error;
    }
  }

  async embedText(text: string): Promise<EmbeddingResponse> {
    try {
      return await this.fetch('/api/v1/embed/text', {
        method: 'POST',
        body: JSON.stringify({ content: text, embedding_type: 'text' }),
      });
    } catch (error) {
      if (this.config.fallbackEnabled) {
        return this.fallbackEmbedding('text', 384);
      }
      throw error;
    }
  }

  async embedBatch(items: BatchEmbedRequest): Promise<BatchEmbeddingResponse> {
    return this.fetch('/api/v1/embed/batch', {
      method: 'POST',
      body: JSON.stringify(items),
    });
  }

  private fallbackEmbedding(
    type: EmbeddingType,
    dimension: number
  ): EmbeddingResponse {
    // Return zero embedding as fallback
    return {
      embedding: new Array(dimension).fill(0),
      dimension,
      model: 'fallback',
      embedding_type: type,
    };
  }

  // ---------------------------------------------------------------------------
  // Taste Prediction
  // ---------------------------------------------------------------------------

  async predictTaste(
    psychometrics: PsychometricInput
  ): Promise<TastePredictionResponse> {
    return this.fetch('/api/v1/taste/predict', {
      method: 'POST',
      body: JSON.stringify(psychometrics),
    });
  }

  async createTasteVector(
    psychometrics: PsychometricInput,
    visualEmbedding?: number[],
    audioEmbedding?: number[]
  ): Promise<TasteVector> {
    const params = new URLSearchParams();
    if (visualEmbedding) {
      params.set('visual_embedding', JSON.stringify(visualEmbedding));
    }
    if (audioEmbedding) {
      params.set('audio_embedding', JSON.stringify(audioEmbedding));
    }

    return this.fetch(`/api/v1/taste/vector?${params}`, {
      method: 'POST',
      body: JSON.stringify(psychometrics),
    });
  }

  async updateTasteFromInteraction(
    userId: string,
    contentId: string,
    contentEmbedding: number[],
    interactionType: 'like' | 'dislike' | 'save' | 'share' | 'skip' | 'view',
    currentTasteVector?: TasteVector,
    strength: number = 1
  ): Promise<TasteVector> {
    return this.fetch('/api/v1/taste/update', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        content_id: contentId,
        content_embedding: contentEmbedding,
        interaction_type: interactionType,
        interaction_strength: strength,
        current_taste_vector: currentTasteVector,
      }),
    });
  }

  async getArchetypeAffinities(
    psychometrics: PsychometricInput
  ): Promise<ArchetypeAffinities> {
    return this.fetch('/api/v1/taste/archetypes', {
      method: 'POST',
      body: JSON.stringify(psychometrics),
    });
  }

  // ---------------------------------------------------------------------------
  // Content Scoring & Ranking
  // ---------------------------------------------------------------------------

  async scoreContent(
    userId: string,
    tasteVector: TasteVector,
    contentItems: ContentItem[]
  ): Promise<ContentScore[]> {
    const response = await this.fetch<{ scores: ContentScore[] }>(
      '/api/v1/content/score',
      {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          taste_vector: tasteVector,
          content_items: contentItems,
        }),
      }
    );
    return response.scores;
  }

  async rankContent(
    userId: string,
    tasteVector: TasteVector,
    contentIds: string[],
    limit: number = 20,
    diversityWeight: number = 0.2
  ): Promise<RankedContent[]> {
    const response = await this.fetch<{ ranked: RankedContent[] }>(
      '/api/v1/content/rank',
      {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          taste_vector: tasteVector,
          content_ids: contentIds,
          limit,
          diversity_weight: diversityWeight,
        }),
      }
    );
    return response.ranked;
  }

  // ---------------------------------------------------------------------------
  // FAISS Search
  // ---------------------------------------------------------------------------

  async createIndex(
    indexName: string,
    dimension: number,
    useIvf: boolean = true
  ): Promise<void> {
    await this.fetch('/api/v1/search/index', {
      method: 'POST',
      body: JSON.stringify({
        index_name: indexName,
        dimension,
        use_ivf: useIvf,
      }),
    });
  }

  async addToIndex(
    indexName: string,
    vectors: number[][],
    contentIds: string[]
  ): Promise<{ added: number; total_vectors: number }> {
    return this.fetch('/api/v1/search/index/add', {
      method: 'POST',
      body: JSON.stringify({
        index_name: indexName,
        vectors,
        content_ids: contentIds,
      }),
    });
  }

  async searchSimilar(
    indexName: string,
    queryVector: number[],
    topK: number = 10
  ): Promise<SimilarityResult[]> {
    const response = await this.fetch<{ results: SimilarityResult[] }>(
      '/api/v1/search/similar',
      {
        method: 'POST',
        body: JSON.stringify({
          index_name: indexName,
          query_vector: queryVector,
          top_k: topK,
        }),
      }
    );
    return response.results;
  }

  async getIndexStats(
    indexName: string
  ): Promise<{
    exists: boolean;
    total_vectors: number;
    dimension: number;
  }> {
    return this.fetch(`/api/v1/search/index/${indexName}/stats`);
  }

  async saveIndex(indexName: string): Promise<void> {
    await this.fetch(`/api/v1/search/index/${indexName}/save`, {
      method: 'POST',
    });
  }

  async loadIndex(indexName: string): Promise<{ total_vectors: number }> {
    return this.fetch(`/api/v1/search/index/${indexName}/load`, {
      method: 'POST',
    });
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let clientInstance: MLServiceClient | null = null;

export function getMLClient(config?: Partial<MLClientConfig>): MLServiceClient {
  if (!clientInstance || config) {
    clientInstance = new MLServiceClient(config);
  }
  return clientInstance;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Convert internal trait scores to ML service psychometric input format
 */
export function toMLPsychometricInput(traits: {
  openness?: { score: number };
  conscientiousness?: { score: number };
  extraversion?: { score: number };
  agreeableness?: { score: number };
  neuroticism?: { score: number };
  noveltySeeking?: { score: number };
  aestheticSensitivity?: { score: number };
  riskTolerance?: { score: number };
}): PsychometricInput {
  return {
    openness: traits.openness?.score ?? 0.5,
    conscientiousness: traits.conscientiousness?.score ?? 0.5,
    extraversion: traits.extraversion?.score ?? 0.5,
    agreeableness: traits.agreeableness?.score ?? 0.5,
    neuroticism: traits.neuroticism?.score ?? 0.5,
    novelty_seeking: traits.noveltySeeking?.score ?? 0.5,
    aesthetic_sensitivity: traits.aestheticSensitivity?.score ?? 0.5,
    risk_tolerance: traits.riskTolerance?.score ?? 0.5,
  };
}

/**
 * Convert ML service taste vector to internal format
 */
export function fromMLTasteVector(mlVector: TasteVector): {
  psychometric: number[];
  visual?: number[];
  audio?: number[];
  composite: number[];
  componentConfidence: { psychometric: number; visual: number; audio: number };
} {
  return {
    psychometric: mlVector.psychometric_embedding,
    visual: mlVector.visual_embedding,
    audio: mlVector.audio_embedding,
    composite: mlVector.composite_embedding,
    componentConfidence: mlVector.component_confidence,
  };
}

export default MLServiceClient;
