/**
 * Storage Layer Type Validation Test
 *
 * Tests that storage types compile correctly and conversion functions work.
 * Does NOT require a live Supabase connection.
 *
 * Run with: npx tsx scripts/test-storage-types.ts
 */

import {
  UserRow,
  PsychometricProfileRow,
  AestheticPreferenceRow,
  ConstellationProfileRow,
  RepresentationProfileRow,
  ProfileHistoryRow,
  toRepresentationRow,
  fromRepresentationRow,
} from '../src/lib/storage/types';

import { RepresentationProfile, RepresentationConstraints } from '../src/lib/representation/types';

// =============================================================================
// Test Infrastructure
// =============================================================================

let passed = 0;
let failed = 0;

function test(name: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    passed++;
  } else {
    console.log(`  \x1b[31m✗\x1b[0m ${name}${details ? ` (${details})` : ''}`);
    failed++;
  }
}

function section(title: string) {
  console.log(`\n\x1b[36m${'━'.repeat(60)}\x1b[0m`);
  console.log(`\x1b[36m${title}\x1b[0m`);
  console.log(`\x1b[36m${'━'.repeat(60)}\x1b[0m`);
}

console.log('═'.repeat(60));
console.log('🗄️  STORAGE LAYER TYPE VALIDATION TEST');
console.log('═'.repeat(60));

// =============================================================================
// Test 1: Type Definitions Compile
// =============================================================================

section('1. TYPE DEFINITIONS');

// Mock user row
const mockUser: UserRow = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  display_name: 'Test User',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

test('UserRow type compiles', typeof mockUser.id === 'string');
test('UserRow has required fields', mockUser.email !== undefined && mockUser.created_at !== undefined);

// Mock psychometric row
const mockPsychometric: PsychometricProfileRow = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  user_id: mockUser.id,
  openness: 0.7,
  conscientiousness: 0.6,
  extraversion: 0.5,
  agreeableness: 0.8,
  neuroticism: 0.3,
  novelty_seeking: 0.7,
  aesthetic_sensitivity: 0.8,
  risk_tolerance: 0.6,
  trait_confidence: { openness: 0.85 },
  overall_confidence: 0.8,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

test('PsychometricProfileRow type compiles', typeof mockPsychometric.openness === 'number');
test('PsychometricProfileRow has all Big Five',
  mockPsychometric.openness !== undefined &&
  mockPsychometric.conscientiousness !== undefined &&
  mockPsychometric.extraversion !== undefined &&
  mockPsychometric.agreeableness !== undefined &&
  mockPsychometric.neuroticism !== undefined
);

// Mock aesthetic row
const mockAesthetic: AestheticPreferenceRow = {
  id: '123e4567-e89b-12d3-a456-426614174002',
  user_id: mockUser.id,
  color_palette_vector: [0.1, 0.2, 0.3],
  darkness_preference: 0.6,
  complexity_preference: 0.7,
  symmetry_preference: 0.5,
  organic_vs_synthetic: 0.4,
  minimal_vs_maximal: 0.6,
  tempo_range_min: 80,
  tempo_range_max: 140,
  energy_range_min: 0.3,
  energy_range_max: 0.8,
  harmonic_dissonance_tolerance: 0.5,
  rhythm_preference: 0.6,
  acoustic_vs_digital: 0.5,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

test('AestheticPreferenceRow type compiles', typeof mockAesthetic.darkness_preference === 'number');
test('AestheticPreferenceRow has visual + music prefs',
  mockAesthetic.darkness_preference !== undefined &&
  mockAesthetic.tempo_range_min !== undefined
);

// Mock constellation row
const mockConstellation: ConstellationProfileRow = {
  id: '123e4567-e89b-12d3-a456-426614174003',
  user_id: mockUser.id,
  primary_constellation_id: 'radianth',
  blend_weights: { radianth: 0.6, nycataria: 0.3, somnexis: 0.1 },
  subtaste_index: 65,
  explorer_score: 70,
  early_adopter_score: 75,
  enhanced_interpretation: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

test('ConstellationProfileRow type compiles', typeof mockConstellation.subtaste_index === 'number');
test('ConstellationProfileRow has blend weights', typeof mockConstellation.blend_weights === 'object');

// Mock representation row
const mockRepresentation: RepresentationProfileRow = {
  id: '123e4567-e89b-12d3-a456-426614174004',
  user_id: mockUser.id,
  energy: 0.72,
  complexity: 0.65,
  temporal_style: 'evolving',
  sensory_density: 0.58,
  identity_projection: 0.45,
  ambiguity_tolerance: 0.68,
  constraints: {
    energyRange: [0.57, 0.87] as [number, number],
    complexityBias: 'medium',
    temporalStyle: 'evolving',
    densityRange: [0.38, 0.78] as [number, number],
    ambiguityLevel: 'medium',
  },
  version: 1,
  input_hash: 'abc123def456',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

test('RepresentationProfileRow type compiles', typeof mockRepresentation.energy === 'number');
test('RepresentationProfileRow has all dimensions',
  mockRepresentation.energy !== undefined &&
  mockRepresentation.complexity !== undefined &&
  mockRepresentation.temporal_style !== undefined &&
  mockRepresentation.sensory_density !== undefined &&
  mockRepresentation.identity_projection !== undefined &&
  mockRepresentation.ambiguity_tolerance !== undefined
);
test('RepresentationProfileRow has constraints', typeof mockRepresentation.constraints === 'object');
test('RepresentationProfileRow temporal_style is valid',
  ['looped', 'evolving', 'episodic'].includes(mockRepresentation.temporal_style)
);

// Mock history row
const mockHistory: ProfileHistoryRow = {
  id: '123e4567-e89b-12d3-a456-426614174005',
  user_id: mockUser.id,
  profile_type: 'representation',
  profile_data: mockRepresentation,
  version: 1,
  trigger: 'quiz_complete',
  created_at: '2024-01-01T00:00:00Z',
};

test('ProfileHistoryRow type compiles', typeof mockHistory.profile_type === 'string');
test('ProfileHistoryRow profile_type is valid',
  ['psychometric', 'aesthetic', 'constellation', 'representation'].includes(mockHistory.profile_type)
);

// =============================================================================
// Test 2: Conversion Functions
// =============================================================================

section('2. CONVERSION FUNCTIONS');

// Test toRepresentationRow
const appProfile: RepresentationProfile = {
  energy: 0.72,
  complexity: 0.65,
  temporalStyle: 'evolving',
  sensoryDensity: 0.58,
  identityProjection: 0.45,
  ambiguityTolerance: 0.68,
  version: 1,
};

const appConstraints: RepresentationConstraints = {
  energyRange: [0.57, 0.87],
  complexityBias: 'medium',
  temporalStyle: 'evolving',
  densityRange: [0.38, 0.78],
  ambiguityLevel: 'medium',
};

const rowData = toRepresentationRow('user-123', appProfile, appConstraints, 'hash123');

test('toRepresentationRow converts correctly', rowData.user_id === 'user-123');
test('toRepresentationRow maps energy', rowData.energy === appProfile.energy);
test('toRepresentationRow maps complexity', rowData.complexity === appProfile.complexity);
test('toRepresentationRow maps temporal_style', rowData.temporal_style === appProfile.temporalStyle);
test('toRepresentationRow maps sensory_density', rowData.sensory_density === appProfile.sensoryDensity);
test('toRepresentationRow maps identity_projection', rowData.identity_projection === appProfile.identityProjection);
test('toRepresentationRow maps ambiguity_tolerance', rowData.ambiguity_tolerance === appProfile.ambiguityTolerance);
test('toRepresentationRow maps version', rowData.version === appProfile.version);
test('toRepresentationRow maps input_hash', rowData.input_hash === 'hash123');
test('toRepresentationRow maps constraints', rowData.constraints === appConstraints);

// Test fromRepresentationRow
const convertedProfile = fromRepresentationRow(mockRepresentation);

test('fromRepresentationRow converts correctly', convertedProfile.energy === mockRepresentation.energy);
test('fromRepresentationRow maps temporalStyle', convertedProfile.temporalStyle === mockRepresentation.temporal_style);
test('fromRepresentationRow maps sensoryDensity', convertedProfile.sensoryDensity === mockRepresentation.sensory_density);
test('fromRepresentationRow maps identityProjection', convertedProfile.identityProjection === mockRepresentation.identity_projection);
test('fromRepresentationRow maps ambiguityTolerance', convertedProfile.ambiguityTolerance === mockRepresentation.ambiguity_tolerance);

// =============================================================================
// Test 3: Round-trip Conversion
// =============================================================================

section('3. ROUND-TRIP CONVERSION');

const originalProfile: RepresentationProfile = {
  energy: 0.55,
  complexity: 0.88,
  temporalStyle: 'looped',
  sensoryDensity: 0.33,
  identityProjection: 0.77,
  ambiguityTolerance: 0.44,
  version: 1,
};

// Convert to row and back
const rowFormat = toRepresentationRow('test-user', originalProfile, appConstraints);
const mockRowWithMeta: RepresentationProfileRow = {
  id: 'mock-id',
  user_id: rowFormat.user_id,
  energy: rowFormat.energy,
  complexity: rowFormat.complexity,
  temporal_style: rowFormat.temporal_style,
  sensory_density: rowFormat.sensory_density,
  identity_projection: rowFormat.identity_projection,
  ambiguity_tolerance: rowFormat.ambiguity_tolerance,
  constraints: rowFormat.constraints,
  version: rowFormat.version,
  input_hash: rowFormat.input_hash,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};
const roundTripped = fromRepresentationRow(mockRowWithMeta);

test('Round-trip preserves energy', roundTripped.energy === originalProfile.energy);
test('Round-trip preserves complexity', roundTripped.complexity === originalProfile.complexity);
test('Round-trip preserves temporalStyle', roundTripped.temporalStyle === originalProfile.temporalStyle);
test('Round-trip preserves sensoryDensity', roundTripped.sensoryDensity === originalProfile.sensoryDensity);
test('Round-trip preserves identityProjection', roundTripped.identityProjection === originalProfile.identityProjection);
test('Round-trip preserves ambiguityTolerance', roundTripped.ambiguityTolerance === originalProfile.ambiguityTolerance);
test('Round-trip preserves version', roundTripped.version === originalProfile.version);

// =============================================================================
// Summary
// =============================================================================

console.log(`\n${'═'.repeat(60)}`);
console.log('📊 FINAL SUMMARY');
console.log('═'.repeat(60));
console.log(`  Total Tests: ${passed + failed}`);
console.log(`  \x1b[32m✓\x1b[0m Passed: ${passed}`);
console.log(`  \x1b[31m✗\x1b[0m Failed: ${failed}`);
console.log('─'.repeat(60));

if (failed === 0) {
  console.log('\n🎉 All storage type tests passed!');
  console.log('\nStorage layer provides:');
  console.log('  ✓ Type-safe database row definitions');
  console.log('  ✓ Insert/Update type helpers');
  console.log('  ✓ App ↔ Database conversion functions');
  console.log('  ✓ Full profile aggregation types');
} else {
  console.log('\n⚠️ Some tests failed. Please review the output above.');
  process.exit(1);
}
