/**
 * Audio Embedding Module
 *
 * Generates audio embeddings for music similarity and discovery.
 *
 * RECOMMENDED LIBRARIES:
 *
 * JavaScript/Node.js:
 * - Essentia.js: Lightweight audio analysis (npm install essentia.js)
 * - Meyda: Real-time audio feature extraction (npm install meyda)
 * - Web Audio API: Browser-based analysis
 *
 * Python Backend (via API):
 * - librosa: Comprehensive audio analysis
 * - musicnn: Pre-trained music tagging models
 * - OpenL3: Audio embeddings
 * - Essentia: Full audio analysis suite
 *
 * INSTALLATION (Node.js):
 * ```bash
 * npm install essentia.js    # Audio feature extraction
 * npm install meyda          # Real-time features
 * npm install fluent-ffmpeg  # Audio format conversion
 * ```
 *
 * INSTALLATION (Python backend):
 * ```bash
 * pip install librosa musicnn essentia openl3
 * ```
 *
 * MODELS:
 * - Essentia: Fast, good for tempo/energy/key detection
 * - MusicNN: 50-dim embeddings, music tagging
 * - OpenL3: 512/6144-dim embeddings, general audio
 *
 * USAGE:
 * ```typescript
 * import { generateAudioEmbedding, extractAudioFeatures } from './audio';
 *
 * const features = await extractAudioFeatures(audioBuffer);
 * const similarity = computeAudioSimilarity(profileVector, features);
 * ```
 */

import { AudioEmbedding, SonicAestheticVector, SimilarityResult } from '../types';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Supported audio embedding models
 */
export type AudioModel = 'essentia' | 'musicnn' | 'openl3' | 'custom';

/**
 * Model configuration
 */
export interface AudioModelConfig {
  model: AudioModel;
  dimensions: number;
  sampleRate: number;
  hopSize: number;
  features: string[];
}

export const AUDIO_MODEL_CONFIGS: Record<AudioModel, AudioModelConfig> = {
  essentia: {
    model: 'essentia',
    dimensions: 128,
    sampleRate: 44100,
    hopSize: 512,
    features: ['tempo', 'energy', 'danceability', 'key', 'loudness'],
  },
  musicnn: {
    model: 'musicnn',
    dimensions: 50,
    sampleRate: 16000,
    hopSize: 256,
    features: ['mood', 'genre', 'instrument', 'era'],
  },
  openl3: {
    model: 'openl3',
    dimensions: 512,
    sampleRate: 48000,
    hopSize: 512,
    features: ['general_audio_embedding'],
  },
  custom: {
    model: 'custom',
    dimensions: 256,
    sampleRate: 44100,
    hopSize: 512,
    features: ['custom'],
  },
};

// =============================================================================
// Audio Feature Extraction
// =============================================================================

/**
 * Extracted audio features
 */
export interface ExtractedAudioFeatures {
  /** Tempo in BPM */
  tempo: number;

  /** Tempo confidence (0-1) */
  tempoConfidence: number;

  /** Energy level (0-1) */
  energy: number;

  /** Danceability score (0-1) */
  danceability: number;

  /** Valence/mood (0=sad, 1=happy) */
  valence: number;

  /** Instrumentalness (0=vocal, 1=instrumental) */
  instrumentalness: number;

  /** Acousticness (0=electronic, 1=acoustic) */
  acousticness: number;

  /** Loudness in dB (typically -60 to 0) */
  loudness: number;

  /** Speechiness (0-1) */
  speechiness: number;

  /** Musical key (0-11, C=0, C#=1, ..., B=11) */
  key: number;

  /** Mode (0=minor, 1=major) */
  mode: number;

  /** Duration in seconds */
  duration: number;

  /** Spectral complexity (0-1) */
  spectralComplexity: number;

  /** Rhythm regularity (0=irregular, 1=regular) */
  rhythmRegularity: number;
}

/**
 * Extract audio features from audio data
 *
 * IMPLEMENTATION NOTES:
 *
 * With Essentia.js:
 * ```typescript
 * import Essentia from 'essentia.js';
 *
 * async function extractWithEssentia(audioBuffer: Float32Array): Promise<ExtractedAudioFeatures> {
 *   const essentia = new Essentia();
 *
 *   // Tempo detection
 *   const rhythmExtractor = essentia.RhythmExtractor2013(audioBuffer);
 *   const tempo = rhythmExtractor.bpm;
 *
 *   // Energy
 *   const energy = essentia.Energy(audioBuffer).energy;
 *
 *   // Key detection
 *   const keyExtractor = essentia.KeyExtractor(audioBuffer);
 *
 *   return {
 *     tempo,
 *     energy: energy / maxEnergy,
 *     key: keyExtractor.key,
 *     mode: keyExtractor.scale === 'major' ? 1 : 0,
 *     // ... other features
 *   };
 * }
 * ```
 *
 * With Python backend (librosa):
 * ```python
 * import librosa
 * import numpy as np
 *
 * def extract_features(audio_path):
 *     y, sr = librosa.load(audio_path)
 *     tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
 *     energy = np.mean(librosa.feature.rms(y=y))
 *     chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
 *     # ... more features
 *     return {'tempo': tempo, 'energy': energy, ...}
 * ```
 *
 * @param audioData - Audio as Buffer or Float32Array
 * @returns Extracted audio features
 */
export async function extractAudioFeatures(
  audioData: Buffer | Float32Array
): Promise<ExtractedAudioFeatures> {
  // PLACEHOLDER: Replace with actual audio analysis
  console.warn(
    '[Audio Features] Placeholder implementation. Install essentia.js or use Python backend for real extraction.'
  );

  // Return placeholder features with realistic ranges
  return {
    tempo: 120 + Math.random() * 60 - 30, // 90-150 BPM
    tempoConfidence: 0.7 + Math.random() * 0.3,
    energy: Math.random(),
    danceability: Math.random(),
    valence: Math.random(),
    instrumentalness: Math.random(),
    acousticness: Math.random(),
    loudness: -20 + Math.random() * 15, // -20 to -5 dB
    speechiness: Math.random() * 0.3, // Usually low
    key: Math.floor(Math.random() * 12),
    mode: Math.round(Math.random()),
    duration: 180 + Math.random() * 120, // 3-5 minutes
    spectralComplexity: Math.random(),
    rhythmRegularity: 0.5 + Math.random() * 0.5,
  };
}

// =============================================================================
// Embedding Generation
// =============================================================================

/**
 * Generate audio embedding from audio data
 *
 * IMPLEMENTATION NOTES:
 *
 * With MusicNN (Python API):
 * ```python
 * from musicnn.tagger import top_tags
 * from musicnn.extractor import extractor
 *
 * def get_embedding(audio_path):
 *     taggram, tags, features = extractor(audio_path, model='MSD_musicnn', extract_features=True)
 *     embedding = features['penultimate'].mean(axis=0)  # 50-dim
 *     return embedding.tolist()
 * ```
 *
 * With OpenL3 (Python API):
 * ```python
 * import openl3
 * import soundfile as sf
 *
 * def get_embedding(audio_path):
 *     audio, sr = sf.read(audio_path)
 *     emb, ts = openl3.get_audio_embedding(audio, sr, embedding_size=512)
 *     return emb.mean(axis=0).tolist()  # Average over time
 * ```
 *
 * @param audioData - Audio as Buffer or path
 * @param model - Model to use
 * @returns Audio embedding
 */
export async function generateAudioEmbedding(
  audioData: Buffer | string,
  model: AudioModel = 'essentia'
): Promise<AudioEmbedding> {
  const config = AUDIO_MODEL_CONFIGS[model];

  // PLACEHOLDER: Replace with actual embedding generation
  console.warn(
    `[Audio Embedding] Placeholder implementation. Use ${model} library for real embeddings.`
  );

  // Extract features for the embedding metadata
  const features = await extractAudioFeatures(
    typeof audioData === 'string' ? Buffer.from([]) : audioData
  );

  // Generate placeholder embedding
  const vector = new Array(config.dimensions).fill(0).map(() => Math.random() * 2 - 1);

  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  for (let i = 0; i < vector.length; i++) {
    vector[i] /= magnitude;
  }

  return {
    model,
    modelVersion: '1.0.0-placeholder',
    vector,
    dimensions: config.dimensions,
    features: {
      tempo: features.tempo,
      energy: features.energy,
      danceability: features.danceability,
      valence: features.valence,
      instrumentalness: features.instrumentalness,
    },
    generatedAt: new Date().toISOString(),
  };
}

// =============================================================================
// Similarity Computation
// =============================================================================

/**
 * Compute audio similarity between profile and track features
 *
 * @param profileVector - User's sonic preferences
 * @param trackFeatures - Track's extracted features
 * @returns Similarity score (0-1)
 */
export function computeAudioSimilarity(
  profileVector: SonicAestheticVector,
  trackFeatures: ExtractedAudioFeatures
): number {
  let score = 0;
  let totalWeight = 0;

  // Tempo matching (weight: 1.0)
  const tempoWeight = 1.0;
  const trackTempoNorm = (trackFeatures.tempo - 60) / 120; // Normalize to 0-1
  const tempoDiff = Math.abs(profileVector.tempo - trackTempoNorm);

  // Check if within tempo range
  const inTempoRange =
    trackFeatures.tempo >= profileVector.tempoRange.min &&
    trackFeatures.tempo <= profileVector.tempoRange.max;

  score += (inTempoRange ? 1 - tempoDiff * 0.5 : 1 - tempoDiff) * tempoWeight;
  totalWeight += tempoWeight;

  // Energy matching (weight: 1.0)
  const energyWeight = 1.0;
  const energyDiff = Math.abs(profileVector.energy - trackFeatures.energy);
  const inEnergyRange =
    trackFeatures.energy >= profileVector.energyRange.min &&
    trackFeatures.energy <= profileVector.energyRange.max;

  score += (inEnergyRange ? 1 - energyDiff * 0.5 : 1 - energyDiff) * energyWeight;
  totalWeight += energyWeight;

  // Rhythm matching (weight: 0.8)
  const rhythmWeight = 0.8;
  const rhythmDiff = Math.abs(profileVector.rhythm - trackFeatures.danceability);
  score += (1 - rhythmDiff) * rhythmWeight;
  totalWeight += rhythmWeight;

  // Acoustic/Digital matching (weight: 0.9)
  const acousticWeight = 0.9;
  const acousticDiff = Math.abs(profileVector.acousticDigital - (1 - trackFeatures.acousticness));
  score += (1 - acousticDiff) * acousticWeight;
  totalWeight += acousticWeight;

  // Harmonic tension matching (weight: 0.7)
  const harmonicWeight = 0.7;
  const harmonicDiff = Math.abs(profileVector.harmonicTension - trackFeatures.spectralComplexity);
  score += (1 - harmonicDiff) * harmonicWeight;
  totalWeight += harmonicWeight;

  // Density matching (weight: 0.6)
  const densityWeight = 0.6;
  // Use spectral complexity as proxy for density
  const densityDiff = Math.abs(profileVector.density - trackFeatures.spectralComplexity);
  score += (1 - densityDiff) * densityWeight;
  totalWeight += densityWeight;

  // Vocal preference (weight: 0.5)
  const vocalWeight = 0.5;
  const vocalDiff = Math.abs(profileVector.vocalInstrumental - (1 - trackFeatures.instrumentalness));
  score += (1 - vocalDiff) * vocalWeight;
  totalWeight += vocalWeight;

  return score / totalWeight;
}

/**
 * Compute embedding similarity using cosine distance
 */
export function computeEmbeddingSimilarity(a: AudioEmbedding, b: AudioEmbedding): number {
  if (a.dimensions !== b.dimensions) {
    throw new Error('Embedding dimensions must match');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.vector.length; i++) {
    dotProduct += a.vector[i] * b.vector[i];
    normA += a.vector[i] * a.vector[i];
    normB += b.vector[i] * b.vector[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : (dotProduct / magnitude + 1) / 2; // Normalize to 0-1
}

// =============================================================================
// Music Discovery Utilities
// =============================================================================

/**
 * Score tracks against user's sonic profile
 *
 * @param sonicVector - User's sonic preferences
 * @param tracks - Array of tracks with features
 * @returns Sorted results with scores
 */
export async function scoreTracksForProfile(
  sonicVector: SonicAestheticVector,
  tracks: Array<{
    id: string;
    features: ExtractedAudioFeatures;
    embedding?: AudioEmbedding;
    metadata?: unknown;
  }>
): Promise<SimilarityResult[]> {
  const results: SimilarityResult[] = [];

  for (const track of tracks) {
    const featureScore = computeAudioSimilarity(sonicVector, track.features);

    results.push({
      id: track.id,
      score: featureScore,
      distance: 1 - featureScore,
      metadata: track.metadata,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Find tracks similar to a reference track
 *
 * @param referenceEmbedding - Embedding of reference track
 * @param candidates - Candidate tracks with embeddings
 * @param topK - Number of results to return
 * @returns Top similar tracks
 */
export function findSimilarTracks(
  referenceEmbedding: AudioEmbedding,
  candidates: Array<{
    id: string;
    embedding: AudioEmbedding;
    metadata?: unknown;
  }>,
  topK: number = 10
): SimilarityResult[] {
  const results: SimilarityResult[] = candidates.map((track) => ({
    id: track.id,
    score: computeEmbeddingSimilarity(referenceEmbedding, track.embedding),
    distance: 0, // Computed below
    metadata: track.metadata,
  }));

  // Set distance and sort
  for (const result of results) {
    result.distance = 1 - result.score;
  }

  return results.sort((a, b) => b.score - a.score).slice(0, topK);
}

/**
 * Generate discovery recommendations
 *
 * Balances between:
 * - Profile alignment (what user likes)
 * - Novelty (new discoveries)
 * - Diversity (variety)
 *
 * @param sonicVector - User's sonic preferences
 * @param scoredTracks - Pre-scored tracks
 * @param noveltyWeight - How much to weight novelty (0-1)
 * @returns Balanced recommendations
 */
export function generateDiscoveryRecommendations(
  scoredTracks: SimilarityResult[],
  noveltyWeight: number = 0.3
): SimilarityResult[] {
  // Take top aligned tracks
  const topAligned = scoredTracks.slice(0, Math.ceil(scoredTracks.length * 0.5));

  // Take some mid-range tracks for discovery
  const midRange = scoredTracks.slice(
    Math.ceil(scoredTracks.length * 0.3),
    Math.ceil(scoredTracks.length * 0.7)
  );

  // Sample from both based on novelty weight
  const alignedCount = Math.round(10 * (1 - noveltyWeight));
  const noveltyCount = 10 - alignedCount;

  const recommendations = [
    ...topAligned.slice(0, alignedCount),
    ...shuffleArray(midRange).slice(0, noveltyCount),
  ];

  return shuffleArray(recommendations);
}

/**
 * Shuffle array (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default {
  extractAudioFeatures,
  generateAudioEmbedding,
  computeAudioSimilarity,
  computeEmbeddingSimilarity,
  scoreTracksForProfile,
  findSimilarTracks,
  generateDiscoveryRecommendations,
  AUDIO_MODEL_CONFIGS,
};
