/**
 * AI Audio Generation Service
 *
 * Integrates with Suno, Udio, and Stability AI for remix generation.
 * Provides fallback between providers for reliability.
 */

import OpenAI from 'openai';

// =============================================================================
// Types
// =============================================================================

export type RemixGenre =
  | 'TRAP'
  | 'HOUSE'
  | 'DUBSTEP'
  | 'PHONK'
  | 'DRILL'
  | 'HYPERPOP'
  | 'JERSEY_CLUB'
  | 'AMBIENT';

export interface RemixRequest {
  soundName: string;
  soundDescription?: string;
  genre: RemixGenre;
  duration?: number;  // seconds, default 15
  bpm?: number;
  energy?: 'low' | 'medium' | 'high';
}

export interface GeneratedRemix {
  audioUrl: string;
  duration: number;  // milliseconds
  genre: RemixGenre;
  name: string;
  description: string;
  generatedBy: 'suno' | 'udio' | 'stable-audio' | 'mock';
  prompt: string;
}

// =============================================================================
// Genre Prompt Templates
// =============================================================================

const GENRE_PROMPTS: Record<RemixGenre, { style: string; bpm: [number, number]; mood: string }> = {
  TRAP: {
    style: 'trap music with 808 bass, hi-hats, snares, dark atmosphere',
    bpm: [130, 150],
    mood: 'hard-hitting, aggressive, street',
  },
  HOUSE: {
    style: 'house music with four-on-the-floor kick, funky bassline, groovy',
    bpm: [120, 130],
    mood: 'uplifting, dancefloor, energetic',
  },
  DUBSTEP: {
    style: 'dubstep with heavy wobble bass, intense drops, half-time drums',
    bpm: [140, 150],
    mood: 'aggressive, powerful, bass-heavy',
  },
  PHONK: {
    style: 'phonk with Memphis rap samples, cowbell, dark synths, drift aesthetic',
    bpm: [130, 145],
    mood: 'dark, nostalgic, aggressive',
  },
  DRILL: {
    style: 'UK drill with sliding 808s, rapid hi-hats, dark pads',
    bpm: [140, 145],
    mood: 'menacing, street, intense',
  },
  HYPERPOP: {
    style: 'hyperpop with glitchy synths, pitched vocals, maximalist production, chaotic',
    bpm: [150, 180],
    mood: 'chaotic, digital, futuristic',
  },
  JERSEY_CLUB: {
    style: 'jersey club with rapid kicks, bed squeaks, chopped vocals, bouncy',
    bpm: [130, 145],
    mood: 'energetic, bouncy, party',
  },
  AMBIENT: {
    style: 'ambient with lush pads, reverb, atmospheric textures, ethereal',
    bpm: [60, 90],
    mood: 'calm, dreamy, atmospheric',
  },
};

// =============================================================================
// Build Remix Prompt
// =============================================================================

function buildRemixPrompt(request: RemixRequest): string {
  const genreConfig = GENRE_PROMPTS[request.genre];

  const bpm = request.bpm || Math.floor(
    Math.random() * (genreConfig.bpm[1] - genreConfig.bpm[0]) + genreConfig.bpm[0]
  );

  const energyModifier = request.energy === 'high'
    ? 'intense, high energy, powerful'
    : request.energy === 'low'
    ? 'chill, laid-back, subtle'
    : 'balanced, dynamic';

  return `Create a ${request.genre.toLowerCase()} remix of "${request.soundName}".
Style: ${genreConfig.style}
Mood: ${genreConfig.mood}
Energy: ${energyModifier}
BPM: ${bpm}
Duration: ${request.duration || 15} seconds
${request.soundDescription ? `Original context: ${request.soundDescription}` : ''}

Make it catchy, memorable, and perfect for a music battle game. Include a drop or hook that hits hard.`;
}

// =============================================================================
// Suno API Integration
// =============================================================================

async function generateWithSuno(request: RemixRequest): Promise<GeneratedRemix | null> {
  const apiKey = process.env.SUNO_API_KEY;
  if (!apiKey) {
    console.warn('SUNO_API_KEY not configured');
    return null;
  }

  const prompt = buildRemixPrompt(request);

  try {
    const response = await fetch('https://api.suno.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        duration: request.duration || 15,
        make_instrumental: true,
      }),
    });

    if (!response.ok) {
      console.error('Suno API error:', await response.text());
      return null;
    }

    const data = await response.json();

    return {
      audioUrl: data.audio_url,
      duration: (request.duration || 15) * 1000,
      genre: request.genre,
      name: `${request.soundName} (${request.genre} Remix)`,
      description: `AI-generated ${request.genre.toLowerCase()} remix`,
      generatedBy: 'suno',
      prompt,
    };
  } catch (error) {
    console.error('Suno generation failed:', error);
    return null;
  }
}

// =============================================================================
// Stability Audio Integration
// =============================================================================

async function generateWithStability(request: RemixRequest): Promise<GeneratedRemix | null> {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    console.warn('STABILITY_API_KEY not configured');
    return null;
  }

  const prompt = buildRemixPrompt(request);

  try {
    const response = await fetch('https://api.stability.ai/v1/audio/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        prompt,
        duration_seconds: request.duration || 15,
        output_format: 'mp3',
      }),
    });

    if (!response.ok) {
      console.error('Stability API error:', await response.text());
      return null;
    }

    // Get audio as blob and upload to storage
    const audioBlob = await response.blob();
    const audioUrl = await uploadAudioBlob(audioBlob, `remix_${Date.now()}.mp3`);

    return {
      audioUrl,
      duration: (request.duration || 15) * 1000,
      genre: request.genre,
      name: `${request.soundName} (${request.genre} Remix)`,
      description: `AI-generated ${request.genre.toLowerCase()} remix`,
      generatedBy: 'stable-audio',
      prompt,
    };
  } catch (error) {
    console.error('Stability generation failed:', error);
    return null;
  }
}

// =============================================================================
// OpenAI Audio Integration (Fallback)
// =============================================================================

async function generateWithOpenAI(request: RemixRequest): Promise<GeneratedRemix | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not configured');
    return null;
  }

  const openai = new OpenAI({ apiKey });
  const prompt = buildRemixPrompt(request);

  try {
    // OpenAI doesn't have direct music generation, but we can use TTS for mock
    // This is a placeholder - in production, use Suno or Stability
    console.warn('OpenAI fallback: Music generation not available, using mock');
    return null;
  } catch (error) {
    console.error('OpenAI generation failed:', error);
    return null;
  }
}

// =============================================================================
// Mock Generator (Development/Testing)
// =============================================================================

function generateMock(request: RemixRequest): GeneratedRemix {
  const prompt = buildRemixPrompt(request);

  // Use placeholder audio URLs for testing
  const mockAudioUrls: Record<RemixGenre, string> = {
    TRAP: 'https://example.com/audio/trap-sample.mp3',
    HOUSE: 'https://example.com/audio/house-sample.mp3',
    DUBSTEP: 'https://example.com/audio/dubstep-sample.mp3',
    PHONK: 'https://example.com/audio/phonk-sample.mp3',
    DRILL: 'https://example.com/audio/drill-sample.mp3',
    HYPERPOP: 'https://example.com/audio/hyperpop-sample.mp3',
    JERSEY_CLUB: 'https://example.com/audio/jersey-sample.mp3',
    AMBIENT: 'https://example.com/audio/ambient-sample.mp3',
  };

  return {
    audioUrl: mockAudioUrls[request.genre],
    duration: (request.duration || 15) * 1000,
    genre: request.genre,
    name: `${request.soundName} (${request.genre} Remix)`,
    description: `Mock ${request.genre.toLowerCase()} remix for testing`,
    generatedBy: 'mock',
    prompt,
  };
}

// =============================================================================
// Upload Audio Blob (Helper)
// =============================================================================

async function uploadAudioBlob(blob: Blob, filename: string): Promise<string> {
  // In production, upload to Supabase Storage or S3
  // For now, return a placeholder URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (supabaseUrl) {
    // TODO: Implement actual Supabase storage upload
    return `${supabaseUrl}/storage/v1/object/public/audio/${filename}`;
  }

  return `https://storage.dropr.io/audio/${filename}`;
}

// =============================================================================
// Main Generation Function
// =============================================================================

export async function generateRemix(request: RemixRequest): Promise<GeneratedRemix> {
  // Try providers in order of preference
  let remix: GeneratedRemix | null = null;

  // 1. Try Suno (best quality for music)
  remix = await generateWithSuno(request);
  if (remix) return remix;

  // 2. Try Stability Audio
  remix = await generateWithStability(request);
  if (remix) return remix;

  // 3. Try OpenAI (if available)
  remix = await generateWithOpenAI(request);
  if (remix) return remix;

  // 4. Fall back to mock (development)
  console.warn('All audio providers failed, using mock generator');
  return generateMock(request);
}

// =============================================================================
// Generate All Remixes for a Sound
// =============================================================================

export async function generateAllRemixes(
  soundName: string,
  soundDescription?: string,
  genres: RemixGenre[] = ['TRAP', 'HOUSE', 'DUBSTEP', 'PHONK']
): Promise<GeneratedRemix[]> {
  const remixes: GeneratedRemix[] = [];

  for (const genre of genres) {
    try {
      const remix = await generateRemix({
        soundName,
        soundDescription,
        genre,
        duration: 15,
      });
      remixes.push(remix);
    } catch (error) {
      console.error(`Failed to generate ${genre} remix:`, error);
    }
  }

  return remixes;
}
