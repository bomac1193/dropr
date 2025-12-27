/**
 * Visual Embedding Module
 *
 * Generates image embeddings for visual similarity search.
 *
 * RECOMMENDED LIBRARIES:
 * - TensorFlow.js: @tensorflow/tfjs, @tensorflow-models/mobilenet
 * - ONNX Runtime: onnxruntime-node for running CLIP models
 * - Sharp: image preprocessing
 *
 * INSTALLATION:
 * ```bash
 * npm install @tensorflow/tfjs @tensorflow/tfjs-node
 * npm install @tensorflow-models/mobilenet
 * npm install onnxruntime-node  # For CLIP
 * npm install sharp             # Image preprocessing
 * ```
 *
 * MODELS:
 * - MobileNet: Fast, 1024-dim embeddings, good for basic similarity
 * - CLIP: 512-dim, semantic understanding, better for style matching
 * - ResNet: 2048-dim, high accuracy, slower
 *
 * USAGE:
 * ```typescript
 * import { generateImageEmbedding, computeVisualSimilarity } from './visual';
 *
 * const embedding = await generateImageEmbedding(imageBuffer, 'mobilenet');
 * const similarity = computeVisualSimilarity(profileVector, imageVector);
 * ```
 */

import { ImageEmbedding, VisualAestheticVector, VisualSimilarityQuery, SimilarityResult } from '../types';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Supported visual embedding models
 */
export type VisualModel = 'mobilenet' | 'clip' | 'resnet' | 'custom';

/**
 * Model configuration
 */
export interface VisualModelConfig {
  model: VisualModel;
  dimensions: number;
  inputSize: [number, number]; // [width, height]
  normalize: boolean;
}

export const MODEL_CONFIGS: Record<VisualModel, VisualModelConfig> = {
  mobilenet: {
    model: 'mobilenet',
    dimensions: 1024,
    inputSize: [224, 224],
    normalize: true,
  },
  clip: {
    model: 'clip',
    dimensions: 512,
    inputSize: [224, 224],
    normalize: true,
  },
  resnet: {
    model: 'resnet',
    dimensions: 2048,
    inputSize: [224, 224],
    normalize: true,
  },
  custom: {
    model: 'custom',
    dimensions: 512,
    inputSize: [224, 224],
    normalize: true,
  },
};

// =============================================================================
// Embedding Generation (Placeholder)
// =============================================================================

/**
 * Generate image embedding from image data
 *
 * IMPLEMENTATION NOTES:
 * Replace this placeholder with actual TensorFlow.js or ONNX implementation.
 *
 * Example with MobileNet:
 * ```typescript
 * import * as tf from '@tensorflow/tfjs-node';
 * import * as mobilenet from '@tensorflow-models/mobilenet';
 *
 * async function generateWithMobileNet(imageBuffer: Buffer): Promise<number[]> {
 *   const model = await mobilenet.load({ version: 2, alpha: 1.0 });
 *   const image = tf.node.decodeImage(imageBuffer, 3);
 *   const resized = tf.image.resizeBilinear(image, [224, 224]);
 *   const batched = resized.expandDims(0);
 *   const embedding = model.infer(batched, true);
 *   return Array.from(await embedding.data());
 * }
 * ```
 *
 * Example with CLIP (ONNX):
 * ```typescript
 * import * as ort from 'onnxruntime-node';
 *
 * async function generateWithCLIP(imageBuffer: Buffer): Promise<number[]> {
 *   const session = await ort.InferenceSession.create('./clip-vit-base.onnx');
 *   const preprocessed = preprocessForCLIP(imageBuffer);
 *   const feeds = { 'pixel_values': new ort.Tensor('float32', preprocessed, [1, 3, 224, 224]) };
 *   const results = await session.run(feeds);
 *   return Array.from(results['image_embeds'].data as Float32Array);
 * }
 * ```
 *
 * @param imageData - Image as Buffer, base64 string, or URL
 * @param model - Model to use for embedding
 * @returns Image embedding
 */
export async function generateImageEmbedding(
  imageData: Buffer | string,
  model: VisualModel = 'mobilenet'
): Promise<ImageEmbedding> {
  const config = MODEL_CONFIGS[model];

  // PLACEHOLDER: Replace with actual embedding generation
  console.warn(
    `[Visual Embedding] Placeholder implementation. Install @tensorflow-models/mobilenet or onnxruntime-node for real embeddings.`
  );

  // Generate placeholder embedding (random for demo)
  const vector = new Array(config.dimensions).fill(0).map(() => Math.random() * 2 - 1);

  // Normalize if required
  if (config.normalize) {
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= magnitude;
    }
  }

  return {
    model,
    modelVersion: '1.0.0-placeholder',
    vector,
    dimensions: config.dimensions,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Batch generate embeddings for multiple images
 *
 * @param images - Array of image data
 * @param model - Model to use
 * @returns Array of embeddings
 */
export async function generateBatchEmbeddings(
  images: (Buffer | string)[],
  model: VisualModel = 'mobilenet'
): Promise<ImageEmbedding[]> {
  // In production, use batched inference for efficiency
  // TensorFlow.js supports batched inputs
  return Promise.all(images.map((img) => generateImageEmbedding(img, model)));
}

// =============================================================================
// Similarity Computation
// =============================================================================

/**
 * Compute visual similarity between aesthetic vector and image embedding
 *
 * This function combines:
 * 1. Aesthetic vector matching (darkness, complexity, etc.)
 * 2. Embedding similarity (if reference embedding provided)
 *
 * @param aestheticVector - User's visual preferences
 * @param imageEmbedding - Target image embedding
 * @param imageFeatures - Extracted visual features (optional)
 * @returns Similarity score 0-1
 */
export function computeVisualSimilarity(
  aestheticVector: VisualAestheticVector,
  imageEmbedding: ImageEmbedding,
  imageFeatures?: Partial<VisualAestheticVector>
): number {
  // If we have extracted features, compare against aesthetic vector
  if (imageFeatures) {
    return computeFeatureSimilarity(aestheticVector, imageFeatures);
  }

  // Otherwise, return placeholder score
  // In production, you'd use a trained model to predict features from embedding
  console.warn(
    '[Visual Similarity] No image features provided. Use extractVisualFeatures() first.'
  );

  return 0.5; // Neutral placeholder
}

/**
 * Compute cosine similarity between two embeddings
 *
 * @param a - First embedding vector
 * @param b - Second embedding vector
 * @returns Cosine similarity (-1 to 1)
 */
export function computeCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embedding dimensions must match');
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
 * Compute feature-based similarity
 */
function computeFeatureSimilarity(
  profile: VisualAestheticVector,
  features: Partial<VisualAestheticVector>
): number {
  const weights = {
    darkness: 1.0,
    symmetry: 0.8,
    complexity: 1.0,
    colorContrast: 0.7,
    minimalMaximal: 0.9,
    organicSynthetic: 0.9,
    warmth: 0.6,
    saturation: 0.7,
    texture: 0.6,
  };

  let totalWeight = 0;
  let weightedSum = 0;

  for (const [key, weight] of Object.entries(weights)) {
    const profileValue = profile[key as keyof VisualAestheticVector];
    const featureValue = features[key as keyof VisualAestheticVector];

    if (featureValue !== undefined) {
      const diff = Math.abs(profileValue - featureValue);
      const similarity = 1 - diff;
      weightedSum += similarity * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
}

// =============================================================================
// Feature Extraction (Placeholder)
// =============================================================================

/**
 * Extract visual features from image
 *
 * IMPLEMENTATION NOTES:
 * In production, use a trained classifier or regression model to extract:
 * - Darkness: Analyze luminance histogram
 * - Complexity: Edge detection density
 * - Symmetry: Mirror similarity score
 * - Color analysis: Dominant colors, contrast, warmth
 *
 * Example with OpenCV.js:
 * ```typescript
 * import cv from '@techstark/opencv-js';
 *
 * function extractDarkness(imageBuffer: Buffer): number {
 *   const mat = cv.imdecode(imageBuffer);
 *   const gray = new cv.Mat();
 *   cv.cvtColor(mat, gray, cv.COLOR_BGR2GRAY);
 *   const mean = cv.mean(gray);
 *   return 1 - (mean[0] / 255); // Invert: high value = dark
 * }
 * ```
 *
 * @param imageData - Image data
 * @returns Extracted visual features
 */
export async function extractVisualFeatures(
  imageData: Buffer | string
): Promise<Partial<VisualAestheticVector>> {
  // PLACEHOLDER: Replace with actual feature extraction
  console.warn(
    '[Visual Features] Placeholder implementation. Use OpenCV.js or custom model for real extraction.'
  );

  return {
    darkness: 0.5,
    complexity: 0.5,
    symmetry: 0.5,
    colorContrast: 0.5,
    minimalMaximal: 0.5,
    organicSynthetic: 0.5,
    warmth: 0.5,
    saturation: 0.5,
    texture: 0.5,
  };
}

// =============================================================================
// Photo Arrangement Utilities
// =============================================================================

/**
 * Score images against user's aesthetic profile
 *
 * Use this to sort/filter a photo library based on aesthetic alignment.
 *
 * @param aestheticVector - User's visual preferences
 * @param images - Array of image embeddings with features
 * @returns Sorted results with scores
 */
export async function scoreImagesForProfile(
  aestheticVector: VisualAestheticVector,
  images: Array<{
    id: string;
    embedding: ImageEmbedding;
    features?: Partial<VisualAestheticVector>;
    metadata?: unknown;
  }>
): Promise<SimilarityResult[]> {
  const results: SimilarityResult[] = [];

  for (const image of images) {
    const score = computeVisualSimilarity(aestheticVector, image.embedding, image.features);

    results.push({
      id: image.id,
      score,
      distance: 1 - score,
      metadata: image.metadata,
    });
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Categorize images by aesthetic alignment
 *
 * @param aestheticVector - User's visual preferences
 * @param images - Array of scored images
 * @returns Categorized images
 */
export function categorizeImagesByAlignment(
  scores: SimilarityResult[]
): {
  highlight: SimilarityResult[]; // Top matches (>0.8)
  aligned: SimilarityResult[]; // Good matches (0.6-0.8)
  neutral: SimilarityResult[]; // Moderate (0.4-0.6)
  misaligned: SimilarityResult[]; // Poor matches (<0.4)
} {
  return {
    highlight: scores.filter((s) => s.score >= 0.8),
    aligned: scores.filter((s) => s.score >= 0.6 && s.score < 0.8),
    neutral: scores.filter((s) => s.score >= 0.4 && s.score < 0.6),
    misaligned: scores.filter((s) => s.score < 0.4),
  };
}

export default {
  generateImageEmbedding,
  generateBatchEmbeddings,
  computeVisualSimilarity,
  computeCosineSimilarity,
  extractVisualFeatures,
  scoreImagesForProfile,
  categorizeImagesByAlignment,
  MODEL_CONFIGS,
};
