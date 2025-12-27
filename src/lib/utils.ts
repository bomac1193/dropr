import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Normalize an object of values to sum to 1
 */
export function normalizeWeights(weights: Record<string, number>): Record<string, number> {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  if (sum === 0) return weights;

  const normalized: Record<string, number> = {};
  for (const [key, value] of Object.entries(weights)) {
    normalized[key] = value / sum;
  }
  return normalized;
}

/**
 * Calculate entropy of a probability distribution (0 = all weight on one, higher = more spread)
 */
export function entropy(weights: number[]): number {
  const filtered = weights.filter((w) => w > 0);
  if (filtered.length === 0) return 0;

  return -filtered.reduce((sum, w) => sum + w * Math.log2(w), 0);
}

/**
 * Map a 0-100 score to 1-5 stars
 */
export function scoreToStars(score: number): 1 | 2 | 3 | 4 | 5 {
  if (score >= 80) return 5;
  if (score >= 60) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}
