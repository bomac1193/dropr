/**
 * Profile Export Module Tests
 *
 * Comprehensive tests for the profile export system including:
 * - Core export function
 * - Visual/audio embedding placeholders
 * - Vector search client
 * - Prompt generation
 * - Serialization utilities
 *
 * Run: npx ts-node scripts/test-profile-export.ts
 */

import { exportAestheticProfile } from '../src/lib/profile-export/export';
import {
  generateImagePrompt,
  generateMusicPrompt,
  generateTextPrompt,
  generatePrompt,
  promptTemplates,
} from '../src/lib/profile-export/prompt-generator';
import {
  generateImageEmbedding,
  generateBatchEmbeddings,
  extractVisualFeatures,
  computeVisualSimilarity,
  scoreImagesForProfile,
  categorizeImagesByAlignment,
  MODEL_CONFIGS,
} from '../src/lib/profile-export/embeddings/visual';
import {
  extractAudioFeatures,
  generateAudioEmbedding,
  computeAudioSimilarity,
  computeEmbeddingSimilarity,
  scoreTracksForProfile,
  findSimilarTracks,
  generateDiscoveryRecommendations,
  AUDIO_MODEL_CONFIGS,
} from '../src/lib/profile-export/embeddings/audio';
import {
  createVectorSearchClient,
  normalizeVector,
  euclideanDistance,
} from '../src/lib/profile-export/embeddings/vector-search';
import {
  serializeProfile,
  deserializeProfile,
  validateProfile,
  createProfileExportClient,
} from '../src/lib/profile-export';
import { ComputedProfile } from '../src/lib/scoring/constellation';
import type { AestheticProfileV1 } from '../src/lib/profile-export/types';

// =============================================================================
// Test Utilities
// =============================================================================

let passed = 0;
let failed = 0;
const errors: string[] = [];

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result
        .then(() => {
          passed++;
          console.log(`  ✓ ${name}`);
        })
        .catch((error) => {
          failed++;
          const msg = `${name}: ${error.message}`;
          errors.push(msg);
          console.log(`  ✗ ${name}`);
          console.log(`    Error: ${error.message}`);
        });
    }
    passed++;
    console.log(`  ✓ ${name}`);
    return Promise.resolve();
  } catch (error: unknown) {
    failed++;
    const msg = `${name}: ${(error as Error).message}`;
    errors.push(msg);
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${(error as Error).message}`);
    return Promise.resolve();
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(message ?? `Expected ${expected}, got ${actual}`);
  }
}

function assertInRange(value: number, min: number, max: number, name?: string): void {
  if (value < min || value > max) {
    throw new Error(`${name ?? 'Value'} ${value} not in range [${min}, ${max}]`);
  }
}

function assertTrue(condition: boolean, message?: string): void {
  if (!condition) {
    throw new Error(message ?? 'Assertion failed');
  }
}

function assertDefined<T>(value: T | undefined | null, message?: string): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(message ?? 'Value is undefined or null');
  }
}

// =============================================================================
// Mock Data
// =============================================================================

function createMockPsychometric() {
  return {
    openness: 0.75,
    conscientiousness: 0.55,
    extraversion: 0.45,
    agreeableness: 0.6,
    neuroticism: 0.35,
    noveltySeeking: 0.7,
    aestheticSensitivity: 0.8,
    riskTolerance: 0.65,
  };
}

function createMockAesthetic() {
  return {
    darknessPreference: 0.6,
    complexityPreference: 0.7,
    symmetryPreference: 0.5,
    organicVsSynthetic: 0.4,
    minimalVsMaximal: 0.55,
    tempoRangeMin: 90,
    tempoRangeMax: 140,
    energyRangeMin: 0.4,
    energyRangeMax: 0.8,
    harmonicDissonanceTolerance: 0.5,
    rhythmPreference: 0.6,
    acousticVsDigital: 0.5,
  };
}

function createMockComputedProfile(): ComputedProfile {
  return {
    profile: {
      primaryConstellationId: 'somnexis',
      blendWeights: {
        somnexis: 0.35,
        nycataria: 0.25,
        obscyra: 0.15,
        holovain: 0.1,
        radianth: 0.05,
        velocine: 0.05,
        crysolen: 0.05,
      },
      subtasteIndex: 65,
      explorerScore: 72,
      earlyAdopterScore: 68,
    },
    explanation: {
      primaryRationale: 'Your introspective nature and appreciation for depth...',
      traitSimilarityScores: { somnexis: 0.85 },
      aestheticSimilarityScores: { somnexis: 0.80 },
      personalityNarrative: 'You are introspective and thoughtful.',
      aestheticNarrative: 'You prefer moody, atmospheric visuals.',
      subcultureNarrative: 'You fit well with dreamy, nocturnal scenes.',
      creativeHooks: ['Design a dreamy bedroom'],
      contentPrompts: ['Find more atmospheric photography'],
    },
    result: {
      summary: {
        primaryConstellationId: 'somnexis',
        primaryName: 'Somnexis',
        tagline: 'The dreamer archetype',
        keyScores: {
          subtasteIndex: 65,
          explorerScore: 72,
          earlyAdopterScore: 68,
        },
        topScenes: ['Moody bedrooms', 'Lo-fi cafes'],
      },
      details: {
        personality: {
          traits: {
            openness: 0.75,
            conscientiousness: 0.55,
            extraversion: 0.45,
            agreeableness: 0.6,
            neuroticism: 0.35,
            noveltySeeking: 0.7,
            aestheticSensitivity: 0.8,
            riskTolerance: 0.65,
          },
          narrative: 'You are introspective and creative.',
        },
        aesthetic: {
          visualSliders: {
            darkToBright: 0.4,
            minimalToMaximal: 0.55,
            organicToSynthetic: 0.4,
          },
          musicSliders: {
            slowToFast: 0.5,
            softToIntense: 0.6,
            acousticToDigital: 0.5,
          },
          narrative: 'You prefer moody, atmospheric content.',
        },
        subculture: {
          topConstellations: [
            { id: 'somnexis', name: 'Somnexis', affinityScore: 85, earlyAdopterScore: 68, summary: 'The dreamer' },
          ],
          narrative: 'You resonate with dreamy scenes.',
        },
        prompts: {
          creativeHooks: ['Design a dreamy space'],
          contentPrompts: ['Find atmospheric content'],
        },
      },
    },
    enhanced: {
      blendNarrative: {
        primary: 'somnexis',
        primaryName: 'Somnexis',
        secondary: [
          {
            id: 'nycataria',
            weight: 0.25,
            meaning: 'Nocturnal influence',
            modifierPhrase: 'nocturnal allure',
          },
        ],
        summary: 'A dreamer with nocturnal tendencies',
        tagline: 'Dreamer in the night',
        aestheticDNA: 'Deep, introspective, atmospheric',
      },
      behavioralProfile: {
        modifiers: [],
        archetype: 'Intuitive Explorer',
        summary: 'Seeks depth over breadth',
      },
      subcultureFit: [],
      identityStatement: 'You are a Somnexis with nocturnal undertones.',
      identityComponents: [],
    },
  };
}

function createMockExportedProfile(): AestheticProfileV1 {
  const computed = createMockComputedProfile();
  const psychometric = createMockPsychometric();
  const aesthetic = createMockAesthetic();
  return exportAestheticProfile(computed, psychometric, aesthetic);
}

// =============================================================================
// Test Suites
// =============================================================================

async function testCoreExport() {
  console.log('\n📦 Core Export Function');

  await test('exports profile with correct version', () => {
    const profile = createMockExportedProfile();
    assertEqual(profile.version, '1.0');
  });

  await test('exports with valid timestamp', () => {
    const profile = createMockExportedProfile();
    const date = new Date(profile.exportedAt);
    assertTrue(!isNaN(date.getTime()), 'Invalid date');
  });

  await test('includes archetype summary', () => {
    const profile = createMockExportedProfile();
    assertDefined(profile.archetype);
    assertDefined(profile.archetype.primary);
    assertEqual(profile.archetype.primary.id, 'somnexis');
    assertEqual(profile.archetype.primary.name, 'Somnexis');
  });

  await test('includes secondary influences', () => {
    const profile = createMockExportedProfile();
    assertTrue(Array.isArray(profile.archetype.secondary));
    assertTrue(profile.archetype.secondary.length >= 1);
  });

  await test('includes identity statement', () => {
    const profile = createMockExportedProfile();
    assertTrue(profile.archetype.identityStatement.length > 0);
  });

  await test('includes keywords', () => {
    const profile = createMockExportedProfile();
    assertTrue(Array.isArray(profile.archetype.keywords));
    assertTrue(profile.archetype.keywords.length > 0);
  });

  await test('includes style descriptors', () => {
    const profile = createMockExportedProfile();
    assertTrue(Array.isArray(profile.archetype.styleDescriptors));
  });
}

async function testVisualVector() {
  console.log('\n🎨 Visual Aesthetic Vector');

  await test('all visual values in 0-1 range', () => {
    const profile = createMockExportedProfile();
    const visual = profile.visual;

    assertInRange(visual.darkness, 0, 1, 'darkness');
    assertInRange(visual.symmetry, 0, 1, 'symmetry');
    assertInRange(visual.complexity, 0, 1, 'complexity');
    assertInRange(visual.colorContrast, 0, 1, 'colorContrast');
    assertInRange(visual.minimalMaximal, 0, 1, 'minimalMaximal');
    assertInRange(visual.organicSynthetic, 0, 1, 'organicSynthetic');
    assertInRange(visual.warmth, 0, 1, 'warmth');
    assertInRange(visual.saturation, 0, 1, 'saturation');
    assertInRange(visual.texture, 0, 1, 'texture');
  });

  await test('darkness matches input preference', () => {
    const profile = createMockExportedProfile();
    assertEqual(profile.visual.darkness, 0.6);
  });

  await test('complexity matches input preference', () => {
    const profile = createMockExportedProfile();
    assertEqual(profile.visual.complexity, 0.7);
  });

  await test('symmetry matches input preference', () => {
    const profile = createMockExportedProfile();
    assertEqual(profile.visual.symmetry, 0.5);
  });
}

async function testSonicVector() {
  console.log('\n🎵 Sonic Aesthetic Vector');

  await test('all sonic values in 0-1 range (except tempo range)', () => {
    const profile = createMockExportedProfile();
    const sonic = profile.sonic;

    assertInRange(sonic.tempo, 0, 1, 'tempo');
    assertInRange(sonic.energy, 0, 1, 'energy');
    assertInRange(sonic.harmonicTension, 0, 1, 'harmonicTension');
    assertInRange(sonic.rhythm, 0, 1, 'rhythm');
    assertInRange(sonic.acousticDigital, 0, 1, 'acousticDigital');
    assertInRange(sonic.vocalInstrumental, 0, 1, 'vocalInstrumental');
    assertInRange(sonic.density, 0, 1, 'density');
  });

  await test('tempo range is valid BPM', () => {
    const profile = createMockExportedProfile();
    assertEqual(profile.sonic.tempoRange.min, 90);
    assertEqual(profile.sonic.tempoRange.max, 140);
  });

  await test('energy range is valid', () => {
    const profile = createMockExportedProfile();
    assertEqual(profile.sonic.energyRange.min, 0.4);
    assertEqual(profile.sonic.energyRange.max, 0.8);
  });
}

async function testBehavioralVector() {
  console.log('\n🧠 Behavioral Vector');

  await test('temporal style is valid', () => {
    const profile = createMockExportedProfile();
    assertTrue(
      ['looped', 'evolving', 'episodic'].includes(profile.behavioral.temporalStyle)
    );
  });

  await test('all behavioral values in 0-1 range', () => {
    const profile = createMockExportedProfile();
    const behavioral = profile.behavioral;

    assertInRange(behavioral.noveltySeeking, 0, 1, 'noveltySeeking');
    assertInRange(behavioral.earlyAdopterScore, 0, 1, 'earlyAdopterScore');
    assertInRange(behavioral.diversityPreference, 0, 1, 'diversityPreference');
    assertInRange(behavioral.socialSharing, 0, 1, 'socialSharing');
    assertInRange(behavioral.engagementDepth, 0, 1, 'engagementDepth');
  });
}

async function testConfidenceMetadata() {
  console.log('\n📊 Confidence Metadata');

  await test('includes overall confidence', () => {
    const profile = createMockExportedProfile();
    assertInRange(profile.confidence.overall, 0, 1, 'overall');
  });

  await test('includes questions answered', () => {
    const profile = createMockExportedProfile();
    assertTrue(profile.confidence.questionsAnswered >= 0);
  });

  await test('includes reliability tier', () => {
    const profile = createMockExportedProfile();
    assertTrue(
      ['high', 'medium', 'low', 'provisional'].includes(profile.confidence.reliabilityTier)
    );
  });

  await test('includes last updated timestamp', () => {
    const profile = createMockExportedProfile();
    const date = new Date(profile.confidence.lastUpdated);
    assertTrue(!isNaN(date.getTime()), 'Invalid last updated date');
  });
}

async function testVisualEmbeddings() {
  console.log('\n🖼️ Visual Embeddings');

  await test('generates image embedding with correct dimensions', async () => {
    const embedding = await generateImageEmbedding(Buffer.from([]), 'mobilenet');
    assertEqual(embedding.dimensions, 1024);
    assertEqual(embedding.vector.length, 1024);
    assertEqual(embedding.model, 'mobilenet');
  });

  await test('generates CLIP embedding with correct dimensions', async () => {
    const embedding = await generateImageEmbedding(Buffer.from([]), 'clip');
    assertEqual(embedding.dimensions, 512);
    assertEqual(embedding.vector.length, 512);
    assertEqual(embedding.model, 'clip');
  });

  await test('embeddings are normalized', async () => {
    const embedding = await generateImageEmbedding(Buffer.from([]), 'mobilenet');
    const magnitude = Math.sqrt(embedding.vector.reduce((sum, v) => sum + v * v, 0));
    assertTrue(Math.abs(magnitude - 1) < 0.01, `Expected magnitude ~1, got ${magnitude}`);
  });

  await test('batch embeddings work', async () => {
    const images = [Buffer.from([]), Buffer.from([]), Buffer.from([])];
    const embeddings = await generateBatchEmbeddings(images, 'mobilenet');
    assertEqual(embeddings.length, 3);
    embeddings.forEach((e) => assertEqual(e.dimensions, 1024));
  });

  await test('extracts visual features', async () => {
    const features = await extractVisualFeatures(Buffer.from([]));
    assertInRange(features.darkness ?? 0, 0, 1, 'darkness');
    assertInRange(features.complexity ?? 0, 0, 1, 'complexity');
  });

  await test('model configs are defined', () => {
    assertTrue(Object.keys(MODEL_CONFIGS).length >= 4);
    assertDefined(MODEL_CONFIGS.mobilenet);
    assertDefined(MODEL_CONFIGS.clip);
    assertDefined(MODEL_CONFIGS.resnet);
  });
}

async function testAudioEmbeddings() {
  console.log('\n🎶 Audio Embeddings');

  await test('extracts audio features', async () => {
    const features = await extractAudioFeatures(Buffer.from([]));
    assertInRange(features.tempo, 60, 180, 'tempo');
    assertInRange(features.energy, 0, 1, 'energy');
    assertInRange(features.danceability, 0, 1, 'danceability');
  });

  await test('generates audio embedding with correct dimensions', async () => {
    const embedding = await generateAudioEmbedding(Buffer.from([]), 'essentia');
    assertEqual(embedding.dimensions, 128);
    assertEqual(embedding.vector.length, 128);
    assertEqual(embedding.model, 'essentia');
  });

  await test('generates MusicNN embedding with correct dimensions', async () => {
    const embedding = await generateAudioEmbedding(Buffer.from([]), 'musicnn');
    assertEqual(embedding.dimensions, 50);
    assertEqual(embedding.model, 'musicnn');
  });

  await test('embeddings include features', async () => {
    const embedding = await generateAudioEmbedding(Buffer.from([]), 'essentia');
    assertDefined(embedding.features);
    assertDefined(embedding.features.tempo);
    assertDefined(embedding.features.energy);
  });

  await test('computes audio similarity', () => {
    const profile = createMockExportedProfile();
    const features = {
      tempo: 115,
      tempoConfidence: 0.8,
      energy: 0.6,
      danceability: 0.7,
      valence: 0.5,
      instrumentalness: 0.3,
      acousticness: 0.5,
      loudness: -10,
      speechiness: 0.1,
      key: 5,
      mode: 1,
      duration: 200,
      spectralComplexity: 0.6,
      rhythmRegularity: 0.7,
    };
    const similarity = computeAudioSimilarity(profile.sonic, features);
    assertInRange(similarity, 0, 1, 'similarity');
  });

  await test('computes embedding similarity', async () => {
    const a = await generateAudioEmbedding(Buffer.from([]), 'essentia');
    const b = await generateAudioEmbedding(Buffer.from([]), 'essentia');
    const similarity = computeEmbeddingSimilarity(a, b);
    assertInRange(similarity, 0, 1, 'similarity');
  });

  await test('audio model configs are defined', () => {
    assertTrue(Object.keys(AUDIO_MODEL_CONFIGS).length >= 4);
    assertDefined(AUDIO_MODEL_CONFIGS.essentia);
    assertDefined(AUDIO_MODEL_CONFIGS.musicnn);
    assertDefined(AUDIO_MODEL_CONFIGS.openl3);
  });
}

async function testVectorSearch() {
  console.log('\n🔍 Vector Search');

  await test('creates memory client', () => {
    const client = createVectorSearchClient('memory', {});
    assertEqual(client.provider, 'memory');
  });

  await test('creates collection', async () => {
    const client = createVectorSearchClient('memory', {});
    await client.createCollection('test', 128);
    const stats = await client.stats('test');
    assertEqual(stats.count, 0);
  });

  await test('upserts and searches vectors', async () => {
    const client = createVectorSearchClient('memory', {});
    await client.createCollection('test', 3);

    await client.upsert('test', [
      { id: '1', vector: [1, 0, 0], metadata: { label: 'x' } },
      { id: '2', vector: [0, 1, 0], metadata: { label: 'y' } },
      { id: '3', vector: [0, 0, 1], metadata: { label: 'z' } },
    ]);

    const results = await client.search('test', [1, 0, 0], { topK: 2 });
    assertEqual(results.length, 2);
    assertEqual(results[0].id, '1');
    assertEqual(results[0].score, 1);
  });

  await test('gets vector by id', async () => {
    const client = createVectorSearchClient('memory', {});
    await client.upsert('test', [{ id: 'a', vector: [1, 2, 3] }]);

    const record = await client.get('test', 'a');
    assertDefined(record);
    assertEqual(record.id, 'a');
  });

  await test('deletes vectors', async () => {
    const client = createVectorSearchClient('memory', {});
    await client.upsert('test', [{ id: 'a', vector: [1, 2, 3] }]);
    await client.delete('test', ['a']);

    const record = await client.get('test', 'a');
    assertTrue(record === null);
  });

  await test('normalizes vectors', () => {
    const normalized = normalizeVector([3, 4]);
    const magnitude = Math.sqrt(normalized.reduce((sum, v) => sum + v * v, 0));
    assertTrue(Math.abs(magnitude - 1) < 0.001);
  });

  await test('computes euclidean distance', () => {
    const distance = euclideanDistance([0, 0], [3, 4]);
    assertEqual(distance, 5);
  });
}

async function testPromptGeneration() {
  console.log('\n✍️ Prompt Generation');

  await test('generates image prompt', () => {
    const profile = createMockExportedProfile();
    const prompt = generateImagePrompt(profile, { subject: 'landscape' });

    assertTrue(prompt.prompt.length > 0);
    assertTrue(prompt.prompt.includes('landscape'));
    assertTrue(Array.isArray(prompt.styleKeywords));
    assertTrue(prompt.styleKeywords.length > 0);
  });

  await test('generates music prompt', () => {
    const profile = createMockExportedProfile();
    const prompt = generateMusicPrompt(profile, { duration: 60 });

    assertTrue(prompt.prompt.length > 0);
    assertTrue(Array.isArray(prompt.styleKeywords));
    // Check that parameters exist and contain expected duration
    assertDefined(prompt.parameters);
    assertEqual((prompt.parameters as Record<string, unknown>).duration, 60);
  });

  await test('generates text prompt', () => {
    const profile = createMockExportedProfile();
    const prompt = generateTextPrompt(profile, 'description');

    assertTrue(prompt.prompt.length > 0);
    assertTrue(Array.isArray(prompt.styleModifiers));
  });

  await test('unified generatePrompt with simple API', () => {
    const profile = createMockExportedProfile();
    const prompt = generatePrompt(profile, 'image', { style: 'stable-diffusion' });

    assertTrue(prompt.prompt.length > 0);
    assertDefined(prompt.parameters);
  });

  await test('prompt includes negative prompt', () => {
    const profile = createMockExportedProfile();
    const prompt = generateImagePrompt(profile);

    assertTrue(prompt.negativePrompt.length > 0);
    assertTrue(prompt.negativePrompt.includes('blurry'));
  });

  await test('prompt templates are defined', () => {
    assertDefined(promptTemplates.image);
    assertDefined(promptTemplates.image['stable-diffusion']);
    assertDefined(promptTemplates.music.musicgen);
  });

  await test('dark profile generates moody prompts', () => {
    const computed = createMockComputedProfile();
    const psychometric = createMockPsychometric();
    const aesthetic = { ...createMockAesthetic(), darknessPreference: 0.9 };
    const profile = exportAestheticProfile(computed, psychometric, aesthetic);
    const prompt = generateImagePrompt(profile);

    assertTrue(
      prompt.styleKeywords.some((k) => k.includes('dark') || k.includes('moody'))
    );
  });
}

async function testSerialization() {
  console.log('\n💾 Serialization');

  await test('serializes to JSON', () => {
    const profile = createMockExportedProfile();
    const json = serializeProfile(profile);

    assertTrue(json.length > 0);
    assertTrue(json.includes('"version": "1.0"'));
  });

  await test('deserializes from JSON', () => {
    const original = createMockExportedProfile();
    const json = serializeProfile(original);
    const restored = deserializeProfile(json);

    assertEqual(restored.version, original.version);
    assertEqual(restored.archetype.primary.id, original.archetype.primary.id);
  });

  await test('validates correct profile', () => {
    const profile = createMockExportedProfile();
    assertTrue(validateProfile(profile));
  });

  await test('rejects invalid profile - missing version', () => {
    const invalid = { ...createMockExportedProfile(), version: undefined };
    assertTrue(!validateProfile(invalid));
  });

  await test('rejects invalid profile - wrong version', () => {
    const invalid = { ...createMockExportedProfile(), version: '2.0' };
    assertTrue(!validateProfile(invalid));
  });

  await test('rejects invalid profile - missing archetype', () => {
    const profile = createMockExportedProfile();
    const invalid = { ...profile, archetype: undefined };
    assertTrue(!validateProfile(invalid));
  });
}

async function testProfileExportClient() {
  console.log('\n🔧 Profile Export Client');

  await test('creates client', () => {
    const client = createProfileExportClient();
    assertDefined(client.exportProfile);
    assertDefined(client.generatePrompt);
    assertDefined(client.embeddings);
  });

  await test('client has embedding methods', () => {
    const client = createProfileExportClient();
    assertDefined(client.embeddings.vectorClient);
  });

  await test('client generates embeddings', async () => {
    const client = createProfileExportClient();
    const profile = createMockExportedProfile();
    const embeddings = await client.generateEmbeddings(profile);

    assertDefined(embeddings.visual);
    assertDefined(embeddings.audio);
    assertEqual(embeddings.visual.model, 'mobilenet');
    assertEqual(embeddings.audio.model, 'essentia');
  });
}

async function testSimilarityScoring() {
  console.log('\n📐 Similarity Scoring');

  await test('scores images for profile', async () => {
    const profile = createMockExportedProfile();
    const images = [
      {
        id: '1',
        embedding: await generateImageEmbedding(Buffer.from([]), 'mobilenet'),
        features: { darkness: 0.6, complexity: 0.7 },
      },
      {
        id: '2',
        embedding: await generateImageEmbedding(Buffer.from([]), 'mobilenet'),
        features: { darkness: 0.1, complexity: 0.2 },
      },
    ];

    const results = await scoreImagesForProfile(profile.visual, images);
    assertEqual(results.length, 2);
    assertTrue(results[0].score >= results[1].score);
  });

  await test('categorizes images by alignment', async () => {
    const scores = [
      { id: '1', score: 0.9, distance: 0.1, metadata: {} },
      { id: '2', score: 0.7, distance: 0.3, metadata: {} },
      { id: '3', score: 0.5, distance: 0.5, metadata: {} },
      { id: '4', score: 0.3, distance: 0.7, metadata: {} },
    ];

    const categories = categorizeImagesByAlignment(scores);
    assertEqual(categories.highlight.length, 1);
    assertEqual(categories.aligned.length, 1);
    assertEqual(categories.neutral.length, 1);
    assertEqual(categories.misaligned.length, 1);
  });

  await test('scores tracks for profile', async () => {
    const profile = createMockExportedProfile();
    const tracks = [
      {
        id: '1',
        features: {
          tempo: 115,
          tempoConfidence: 0.8,
          energy: 0.6,
          danceability: 0.7,
          valence: 0.5,
          instrumentalness: 0.3,
          acousticness: 0.5,
          loudness: -10,
          speechiness: 0.1,
          key: 5,
          mode: 1,
          duration: 200,
          spectralComplexity: 0.6,
          rhythmRegularity: 0.7,
        },
      },
    ];

    const results = await scoreTracksForProfile(profile.sonic, tracks);
    assertEqual(results.length, 1);
    assertInRange(results[0].score, 0, 1, 'score');
  });

  await test('finds similar tracks', async () => {
    const reference = await generateAudioEmbedding(Buffer.from([]), 'essentia');
    const candidates = [
      { id: '1', embedding: await generateAudioEmbedding(Buffer.from([]), 'essentia') },
      { id: '2', embedding: await generateAudioEmbedding(Buffer.from([]), 'essentia') },
    ];

    const results = findSimilarTracks(reference, candidates, 2);
    assertEqual(results.length, 2);
    assertTrue(results[0].score >= results[1].score);
  });

  await test('generates discovery recommendations', async () => {
    const scores = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      score: 1 - i * 0.05,
      distance: i * 0.05,
      metadata: {},
    }));

    const recommendations = generateDiscoveryRecommendations(scores, 0.3);
    assertTrue(recommendations.length > 0);
    assertTrue(recommendations.length <= 10);
  });
}

async function testEdgeCases() {
  console.log('\n⚠️ Edge Cases');

  await test('handles extreme values in psychometric', () => {
    const computed = createMockComputedProfile();
    const psychometric = {
      openness: 1.0,
      conscientiousness: 0.0,
      extraversion: 1.0,
      agreeableness: 0.0,
      neuroticism: 1.0,
      noveltySeeking: 1.0,
      aestheticSensitivity: 1.0,
      riskTolerance: 1.0,
    };
    const aesthetic = createMockAesthetic();

    const profile = exportAestheticProfile(computed, psychometric, aesthetic);
    assertTrue(validateProfile(profile));
  });

  await test('handles extreme values in aesthetic', () => {
    const computed = createMockComputedProfile();
    const psychometric = createMockPsychometric();
    const aesthetic = {
      darknessPreference: 1.0,
      complexityPreference: 1.0,
      symmetryPreference: 1.0,
      organicVsSynthetic: 1.0,
      minimalVsMaximal: 1.0,
      tempoRangeMin: 180,
      tempoRangeMax: 180,
      energyRangeMin: 1.0,
      energyRangeMax: 1.0,
      harmonicDissonanceTolerance: 1.0,
      rhythmPreference: 1.0,
      acousticVsDigital: 1.0,
    };

    const profile = exportAestheticProfile(computed, psychometric, aesthetic);
    assertTrue(validateProfile(profile));
    assertInRange(profile.visual.darkness, 0, 1);
  });

  await test('handles empty secondary influences', () => {
    const computed = {
      ...createMockComputedProfile(),
      profile: {
        ...createMockComputedProfile().profile,
        blendWeights: { somnexis: 1.0 },
      },
    };
    const profile = exportAestheticProfile(
      computed,
      createMockPsychometric(),
      createMockAesthetic()
    );

    assertTrue(validateProfile(profile));
  });

  await test('handles zero-vector normalization', () => {
    const normalized = normalizeVector([0, 0, 0]);
    // Should return the same zero vector without crashing
    assertEqual(normalized[0], 0);
  });
}

// =============================================================================
// Main Test Runner
// =============================================================================

async function main() {
  console.log('🧪 Profile Export Module Tests\n');
  console.log('='.repeat(60));

  await testCoreExport();
  await testVisualVector();
  await testSonicVector();
  await testBehavioralVector();
  await testConfidenceMetadata();
  await testVisualEmbeddings();
  await testAudioEmbeddings();
  await testVectorSearch();
  await testPromptGeneration();
  await testSerialization();
  await testProfileExportClient();
  await testSimilarityScoring();
  await testEdgeCases();

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  if (errors.length > 0) {
    console.log('\n❌ Failures:');
    errors.forEach((e) => console.log(`   • ${e}`));
  }

  console.log('\n' + '='.repeat(60));

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
