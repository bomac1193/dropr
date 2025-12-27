/**
 * AI Prompt Generator
 *
 * Generates style-consistent prompts for AI content generation
 * based on user's aesthetic profile.
 *
 * SUPPORTED MODELS:
 * - Image: Stable Diffusion, DALL-E, Midjourney
 * - Music: MusicGen, Riffusion, AudioCraft
 * - Text: GPT-4, Claude, Llama
 *
 * USAGE:
 * ```typescript
 * import { generateImagePrompt, generateMusicPrompt } from './prompt-generator';
 *
 * const profile = exportAestheticProfile(...);
 * const imagePrompt = generateImagePrompt(profile, { subject: 'landscape' });
 * const musicPrompt = generateMusicPrompt(profile, { duration: 30 });
 * ```
 */

import {
  AestheticProfileV1,
  VisualAestheticVector,
  SonicAestheticVector,
  GeneratedPrompt,
  PromptGenerationRequest,
} from './types';

// =============================================================================
// Image Prompt Generation
// =============================================================================

/**
 * Generate image prompt from aesthetic profile
 *
 * @param profile - User's aesthetic profile
 * @param options - Generation options
 * @returns Prompt for image generation models
 */
export function generateImagePrompt(
  profile: AestheticProfileV1,
  options: {
    subject?: string;
    style?: string;
    medium?: string;
    aspect?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    model?: 'stable-diffusion' | 'dalle' | 'midjourney';
  } = {}
): GeneratedPrompt {
  const visual = profile.visual;
  const archetype = profile.archetype;

  // Build style keywords from visual vector
  const styleKeywords = extractVisualStyleKeywords(visual);

  // Add archetype keywords
  const archetypeKeywords = archetype.keywords.slice(0, 5);
  const styleDescriptors = archetype.styleDescriptors;

  // Build lighting description
  const lighting = describeLighting(visual);

  // Build color description
  const colorDescription = describeColors(visual);

  // Build composition description
  const composition = describeComposition(visual);

  // Construct main prompt
  const promptParts: string[] = [];

  // Subject
  if (options.subject) {
    promptParts.push(options.subject);
  }

  // Style
  if (options.style) {
    promptParts.push(options.style);
  } else {
    promptParts.push(...styleDescriptors.slice(0, 3));
  }

  // Medium
  if (options.medium) {
    promptParts.push(options.medium);
  }

  // Visual characteristics
  promptParts.push(lighting);
  promptParts.push(colorDescription);
  promptParts.push(composition);

  // Archetype flavor
  promptParts.push(...archetypeKeywords.slice(0, 2));

  // Quality boosters
  promptParts.push('high quality', 'detailed');

  const prompt = promptParts.filter(Boolean).join(', ');

  // Build negative prompt
  const negativeKeywords = extractNegativeKeywords(visual);
  const negativePrompt = negativeKeywords.join(', ');

  // Model-specific parameters
  const parameters = getModelParameters(options.model ?? 'stable-diffusion', visual);

  return {
    prompt,
    negativePrompt,
    styleKeywords,
    parameters: {
      ...parameters,
      aspectRatio: options.aspect ?? '1:1',
    },
    styleModifiers: styleDescriptors,
  };
}

/**
 * Extract style keywords from visual vector
 */
function extractVisualStyleKeywords(visual: VisualAestheticVector): string[] {
  const keywords: string[] = [];

  // Darkness
  if (visual.darkness > 0.7) keywords.push('dark', 'moody', 'noir');
  else if (visual.darkness < 0.3) keywords.push('bright', 'luminous', 'high-key');
  else keywords.push('balanced lighting');

  // Complexity
  if (visual.complexity > 0.7) keywords.push('detailed', 'intricate', 'complex');
  else if (visual.complexity < 0.3) keywords.push('minimal', 'simple', 'clean');

  // Organic/Synthetic
  if (visual.organicSynthetic > 0.7) keywords.push('synthetic', 'geometric', 'digital');
  else if (visual.organicSynthetic < 0.3) keywords.push('organic', 'natural', 'flowing');

  // Saturation
  if (visual.saturation > 0.7) keywords.push('vibrant', 'saturated', 'colorful');
  else if (visual.saturation < 0.3) keywords.push('muted', 'desaturated', 'subtle');

  // Texture
  if (visual.texture > 0.7) keywords.push('textured', 'grainy', 'tactile');
  else if (visual.texture < 0.3) keywords.push('smooth', 'clean', 'polished');

  return keywords;
}

/**
 * Describe lighting based on visual preferences
 */
function describeLighting(visual: VisualAestheticVector): string {
  if (visual.darkness > 0.7) {
    return visual.colorContrast > 0.6
      ? 'dramatic chiaroscuro lighting'
      : 'soft shadows, low-key lighting';
  } else if (visual.darkness < 0.3) {
    return visual.colorContrast > 0.6
      ? 'bright high-contrast lighting'
      : 'soft diffused lighting';
  }
  return 'natural balanced lighting';
}

/**
 * Describe color preferences
 */
function describeColors(visual: VisualAestheticVector): string {
  const parts: string[] = [];

  if (visual.warmth > 0.7) parts.push('warm tones');
  else if (visual.warmth < 0.3) parts.push('cool tones');

  if (visual.saturation > 0.7) parts.push('vibrant colors');
  else if (visual.saturation < 0.3) parts.push('muted palette');

  if (visual.colorContrast > 0.7) parts.push('bold contrast');
  else if (visual.colorContrast < 0.3) parts.push('harmonious colors');

  return parts.join(', ') || 'balanced color palette';
}

/**
 * Describe composition preferences
 */
function describeComposition(visual: VisualAestheticVector): string {
  const parts: string[] = [];

  if (visual.symmetry > 0.7) parts.push('symmetrical composition');
  else if (visual.symmetry < 0.3) parts.push('asymmetric dynamic composition');

  if (visual.minimalMaximal > 0.7) parts.push('dense composition');
  else if (visual.minimalMaximal < 0.3) parts.push('minimal negative space');

  return parts.join(', ') || 'balanced composition';
}

/**
 * Extract negative prompt keywords
 */
function extractNegativeKeywords(visual: VisualAestheticVector): string[] {
  const negative: string[] = ['blurry', 'low quality', 'distorted'];

  // Opposite of preferences
  if (visual.darkness > 0.7) negative.push('overly bright', 'washed out');
  else if (visual.darkness < 0.3) negative.push('too dark', 'underexposed');

  if (visual.complexity > 0.7) negative.push('empty', 'sparse');
  else if (visual.complexity < 0.3) negative.push('cluttered', 'busy', 'chaotic');

  if (visual.organicSynthetic > 0.7) negative.push('organic mess');
  else if (visual.organicSynthetic < 0.3) negative.push('artificial', 'plasticy');

  return negative;
}

/**
 * Get model-specific parameters
 */
function getModelParameters(
  model: string,
  visual: VisualAestheticVector
): Record<string, unknown> {
  // Adjust CFG scale based on complexity preference
  const cfgScale = 7 + visual.complexity * 5; // 7-12 range

  // More steps for complex images
  const steps = Math.round(20 + visual.complexity * 30); // 20-50 range

  switch (model) {
    case 'stable-diffusion':
      return {
        cfgScale,
        steps,
        sampler: visual.organicSynthetic > 0.5 ? 'euler_a' : 'dpm++_2m',
      };
    case 'dalle':
      return {
        quality: visual.complexity > 0.5 ? 'hd' : 'standard',
        style: visual.organicSynthetic > 0.5 ? 'vivid' : 'natural',
      };
    case 'midjourney':
      return {
        stylize: Math.round(visual.complexity * 1000), // 0-1000
        chaos: Math.round((1 - visual.symmetry) * 100), // 0-100
      };
    default:
      return { cfgScale, steps };
  }
}

// =============================================================================
// Music Prompt Generation
// =============================================================================

/**
 * Generate music prompt from aesthetic profile
 *
 * @param profile - User's aesthetic profile
 * @param options - Generation options
 * @returns Prompt for music generation models
 */
export function generateMusicPrompt(
  profile: AestheticProfileV1,
  options: {
    duration?: number; // seconds
    genre?: string;
    mood?: string;
    model?: 'musicgen' | 'riffusion' | 'audiocraft';
  } = {}
): GeneratedPrompt {
  const sonic = profile.sonic;
  const archetype = profile.archetype;
  const behavioral = profile.behavioral;

  // Build style keywords from sonic vector
  const styleKeywords = extractSonicStyleKeywords(sonic);

  // Build tempo description
  const tempoDesc = describeTempo(sonic);

  // Build energy description
  const energyDesc = describeEnergy(sonic);

  // Build texture description
  const textureDesc = describeSonicTexture(sonic);

  // Build production description
  const productionDesc = describeProduction(sonic);

  // Construct prompt
  const promptParts: string[] = [];

  // Genre
  if (options.genre) {
    promptParts.push(options.genre);
  }

  // Mood
  if (options.mood) {
    promptParts.push(options.mood);
  }

  // Sonic characteristics
  promptParts.push(tempoDesc);
  promptParts.push(energyDesc);
  promptParts.push(textureDesc);
  promptParts.push(productionDesc);

  // Add archetype flavor
  const musicKeywords = archetype.keywords.filter((k) =>
    [
      'ambient',
      'electronic',
      'acoustic',
      'experimental',
      'rhythmic',
      'melodic',
      'atmospheric',
    ].some((mk) => k.toLowerCase().includes(mk))
  );
  promptParts.push(...musicKeywords.slice(0, 2));

  // Temporal style influence
  if (behavioral.temporalStyle === 'looped') {
    promptParts.push('looping', 'repetitive patterns');
  } else if (behavioral.temporalStyle === 'evolving') {
    promptParts.push('gradually evolving', 'building');
  } else {
    promptParts.push('varied sections', 'changing');
  }

  const prompt = promptParts.filter(Boolean).join(', ');

  // Negative prompt for music
  const negativePrompt = extractMusicNegativeKeywords(sonic).join(', ');

  return {
    prompt,
    negativePrompt,
    styleKeywords,
    parameters: {
      duration: options.duration ?? 30,
      bpm: Math.round((sonic.tempoRange.min + sonic.tempoRange.max) / 2),
      model: options.model ?? 'musicgen',
    },
    styleModifiers: archetype.styleDescriptors,
  };
}

/**
 * Extract sonic style keywords
 */
function extractSonicStyleKeywords(sonic: SonicAestheticVector): string[] {
  const keywords: string[] = [];

  // Tempo
  if (sonic.tempo > 0.7) keywords.push('fast', 'uptempo', 'energetic');
  else if (sonic.tempo < 0.3) keywords.push('slow', 'downtempo', 'relaxed');

  // Energy
  if (sonic.energy > 0.7) keywords.push('intense', 'powerful', 'driving');
  else if (sonic.energy < 0.3) keywords.push('calm', 'gentle', 'subtle');

  // Acoustic/Digital
  if (sonic.acousticDigital > 0.7) keywords.push('electronic', 'synthesized', 'digital');
  else if (sonic.acousticDigital < 0.3) keywords.push('acoustic', 'organic', 'natural');

  // Rhythm
  if (sonic.rhythm > 0.7) keywords.push('rhythmic', 'groovy', 'percussive');
  else if (sonic.rhythm < 0.3) keywords.push('ambient', 'flowing', 'atmospheric');

  // Harmonic tension
  if (sonic.harmonicTension > 0.7) keywords.push('dissonant', 'complex harmonies');
  else if (sonic.harmonicTension < 0.3) keywords.push('consonant', 'simple harmonies');

  return keywords;
}

/**
 * Describe tempo
 */
function describeTempo(sonic: SonicAestheticVector): string {
  const bpm = Math.round((sonic.tempoRange.min + sonic.tempoRange.max) / 2);

  if (bpm < 80) return 'slow, relaxed tempo';
  if (bpm < 100) return 'moderate tempo';
  if (bpm < 130) return 'medium-fast tempo';
  if (bpm < 160) return 'fast, driving tempo';
  return 'very fast, intense tempo';
}

/**
 * Describe energy
 */
function describeEnergy(sonic: SonicAestheticVector): string {
  if (sonic.energy > 0.8) return 'high energy, intense';
  if (sonic.energy > 0.6) return 'energetic, dynamic';
  if (sonic.energy > 0.4) return 'moderate energy';
  if (sonic.energy > 0.2) return 'calm, subdued';
  return 'very calm, ambient';
}

/**
 * Describe sonic texture
 */
function describeSonicTexture(sonic: SonicAestheticVector): string {
  const parts: string[] = [];

  if (sonic.density > 0.7) parts.push('dense layers');
  else if (sonic.density < 0.3) parts.push('sparse arrangement');

  if (sonic.harmonicTension > 0.7) parts.push('complex harmonies');
  else if (sonic.harmonicTension < 0.3) parts.push('simple harmonies');

  return parts.join(', ') || 'balanced texture';
}

/**
 * Describe production style
 */
function describeProduction(sonic: SonicAestheticVector): string {
  if (sonic.acousticDigital > 0.7) {
    return 'electronic production, synthesizers';
  } else if (sonic.acousticDigital < 0.3) {
    return 'acoustic instruments, organic sounds';
  }
  return 'hybrid production, mix of acoustic and electronic';
}

/**
 * Extract negative keywords for music
 */
function extractMusicNegativeKeywords(sonic: SonicAestheticVector): string[] {
  const negative: string[] = ['distorted audio', 'clipping'];

  if (sonic.energy > 0.7) negative.push('boring', 'flat');
  else if (sonic.energy < 0.3) negative.push('harsh', 'aggressive');

  if (sonic.acousticDigital > 0.7) negative.push('purely acoustic');
  else if (sonic.acousticDigital < 0.3) negative.push('harsh synths', 'digital artifacts');

  return negative;
}

// =============================================================================
// Text/Content Prompt Generation
// =============================================================================

/**
 * Generate text content prompt based on aesthetic profile
 *
 * @param profile - User's aesthetic profile
 * @param contentType - Type of text content
 * @returns Prompt for text generation
 */
export function generateTextPrompt(
  profile: AestheticProfileV1,
  contentType: 'description' | 'story' | 'poetry' | 'marketing'
): GeneratedPrompt {
  const archetype = profile.archetype;
  const visual = profile.visual;

  // Build tone based on visual preferences
  let tone: string;
  if (visual.darkness > 0.7) {
    tone = 'mysterious, moody, contemplative';
  } else if (visual.darkness < 0.3) {
    tone = 'bright, optimistic, uplifting';
  } else if (visual.complexity > 0.7) {
    tone = 'rich, layered, nuanced';
  } else {
    tone = 'clear, direct, elegant';
  }

  // Build style based on archetype
  const style = archetype.styleDescriptors.slice(0, 3).join(', ');

  let promptTemplate: string;
  switch (contentType) {
    case 'description':
      promptTemplate = `Write a ${tone} description in a ${style} style. Use imagery that evokes ${archetype.keywords.slice(0, 3).join(', ')}. Keep it ${visual.complexity > 0.5 ? 'detailed and rich' : 'concise and elegant'}.`;
      break;
    case 'story':
      promptTemplate = `Write a short ${tone} story with a ${style} aesthetic. The mood should be ${archetype.primary.tagline.toLowerCase()}. ${visual.complexity > 0.5 ? 'Include vivid descriptions.' : 'Keep descriptions minimal.'}`;
      break;
    case 'poetry':
      promptTemplate = `Write ${tone} poetry with ${style} imagery. Draw from themes of ${archetype.keywords.slice(0, 3).join(', ')}. Use ${visual.symmetry > 0.5 ? 'structured form' : 'free verse'}.`;
      break;
    case 'marketing':
      promptTemplate = `Write ${tone} marketing copy with a ${style} brand voice. Target audience appreciates ${archetype.keywords.slice(0, 3).join(', ')}. Be ${visual.complexity > 0.5 ? 'detailed and sophisticated' : 'direct and impactful'}.`;
      break;
  }

  return {
    prompt: promptTemplate,
    negativePrompt: 'generic, cliché, off-brand',
    styleKeywords: archetype.styleDescriptors,
    styleModifiers: [tone, style],
  };
}

// =============================================================================
// Unified Prompt Generator
// =============================================================================

/**
 * Prompt generation options for simple API
 */
export interface PromptOptions {
  style?: 'stable-diffusion' | 'dalle' | 'midjourney' | 'musicgen' | 'generic';
  subject?: string;
  mood?: string;
  avoid?: string[];
}

/**
 * Template prompts for different archetypes
 */
export const promptTemplates = {
  image: {
    'stable-diffusion': (keywords: string[]) =>
      `${keywords.join(', ')}, masterpiece, best quality, highly detailed`,
    dalle: (keywords: string[]) => `A ${keywords.join(' ')} scene, photorealistic`,
    midjourney: (keywords: string[]) => `${keywords.join(' ')} --v 6 --q 2`,
  },
  music: {
    musicgen: (keywords: string[]) => keywords.join(', '),
  },
};

/**
 * Generate prompt based on request type
 * @overload Simple API
 */
export function generatePrompt(
  profile: AestheticProfileV1,
  contentType: 'image' | 'music' | 'text',
  options?: PromptOptions
): GeneratedPrompt;

/**
 * Generate prompt based on request type
 * @overload Full request object API
 */
export function generatePrompt(request: PromptGenerationRequest): GeneratedPrompt;

/**
 * Generate prompt implementation
 */
export function generatePrompt(
  profileOrRequest: AestheticProfileV1 | PromptGenerationRequest,
  contentType?: 'image' | 'music' | 'text',
  options?: PromptOptions
): GeneratedPrompt {
  // Handle overload
  let request: PromptGenerationRequest;

  if ('version' in profileOrRequest) {
    // Simple API - convert to request
    request = {
      profile: profileOrRequest,
      contentType: contentType ?? 'image',
      styleIntensity: 1.0,
      context: options?.subject ?? options?.mood,
      avoid: options?.avoid,
    };
  } else {
    // Full request object
    request = profileOrRequest;
  }

  const { profile, contentType: type, styleIntensity, context, avoid } = request;

  let prompt: GeneratedPrompt;

  switch (type) {
    case 'image':
      prompt = generateImagePrompt(profile, {
        subject: context,
        model: options?.style as 'stable-diffusion' | 'dalle' | 'midjourney' | undefined,
      });
      break;
    case 'music':
      prompt = generateMusicPrompt(profile, {
        mood: context,
        model: options?.style === 'musicgen' ? 'musicgen' : undefined,
      });
      break;
    case 'text':
    case 'video':
    default:
      prompt = generateTextPrompt(profile, 'description');
  }

  // Apply style intensity
  if (styleIntensity < 0.5) {
    // Reduce style keywords for lower intensity
    prompt.styleKeywords = prompt.styleKeywords.slice(
      0,
      Math.ceil(prompt.styleKeywords.length * styleIntensity * 2)
    );
  }

  // Add avoid keywords to negative prompt
  if (avoid && avoid.length > 0) {
    prompt.negativePrompt = [prompt.negativePrompt, ...avoid].filter(Boolean).join(', ');
  }

  return prompt;
}

export default {
  generateImagePrompt,
  generateMusicPrompt,
  generateTextPrompt,
  generatePrompt,
  promptTemplates,
};
