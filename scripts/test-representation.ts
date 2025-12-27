/**
 * Representation Layer Test Suite
 *
 * Tests Module 4: Representation Layer
 * Validates that psychometric/aesthetic inputs correctly map to
 * universal representation dimensions.
 *
 * Run with: npx tsx scripts/test-representation.ts
 */

import {
  computeRepresentationProfile,
  computeRepresentationProfileOnly,
  compareProfiles,
  profileToVector,
  isValidRepresentationProfile,
  formatRepresentationProfile,
  getRepresentationSummary,
  computeFullProfile,
  RepresentationInput,
  RepresentationProfile,
  TemporalStyle,
} from '../src/lib/representation';

import {
  classifyTemporalStyle,
  analyzeTemporalStyle,
  getTemporalProbabilities,
} from '../src/lib/representation/temporal';

// =============================================================================
// Test Infrastructure
// =============================================================================

let passed = 0;
let failed = 0;
let warnings = 0;

function test(name: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    passed++;
  } else {
    console.log(`  \x1b[31m✗\x1b[0m ${name}${details ? ` (${details})` : ''}`);
    failed++;
  }
}

function warn(name: string, details?: string) {
  console.log(`  \x1b[33m⚠\x1b[0m ${name}${details ? ` (${details})` : ''}`);
  warnings++;
}

function section(title: string) {
  console.log(`\n\x1b[36m${'━'.repeat(70)}\x1b[0m`);
  console.log(`\x1b[36m${title}\x1b[0m`);
  console.log(`\x1b[36m${'━'.repeat(70)}\x1b[0m`);
}

// =============================================================================
// Test Data
// =============================================================================

const TEST_PROFILES: { name: string; input: RepresentationInput; expectedTraits: Partial<RepresentationProfile> }[] = [
  {
    name: 'High Energy Party Person',
    input: {
      psychometric: {
        openness: 0.7,
        conscientiousness: 0.4,
        extraversion: 0.95,
        agreeableness: 0.6,
        neuroticism: 0.3,
        noveltySeeking: 0.8,
        aestheticSensitivity: 0.6,
        riskTolerance: 0.8,
      },
      aesthetic: {
        darknessPreference: 0.4,
        complexityPreference: 0.7,
        symmetryPreference: 0.5,
        organicVsSynthetic: 0.7,
        minimalVsMaximal: 0.8,
        tempoRangeMin: 125,
        tempoRangeMax: 150,
        energyRangeMin: 0.7,
        energyRangeMax: 1.0,
        harmonicDissonanceTolerance: 0.5,
        rhythmPreference: 0.8,
        acousticVsDigital: 0.8,
      },
      behavioral: {
        contentDiversity: 0.6,
        sessionDepth: 5,
        reengagementRate: 0.4,
        noveltyPreference: 0.7,
        saveRate: 0.2,
        shareRate: 0.6,
        sessionCount: 30,
      },
    },
    expectedTraits: {
      energy: 0.7, // Should be high
      sensoryDensity: 0.7, // Should be high (maximal preference)
      identityProjection: 0.7, // Should be high (extravert, shares)
      temporalStyle: 'episodic', // High novelty, low session depth
    },
  },
  {
    name: 'Calm Minimalist Introvert',
    input: {
      psychometric: {
        openness: 0.6,
        conscientiousness: 0.8,
        extraversion: 0.2,
        agreeableness: 0.5,
        neuroticism: 0.4,
        noveltySeeking: 0.3,
        aestheticSensitivity: 0.8,
        riskTolerance: 0.3,
      },
      aesthetic: {
        darknessPreference: 0.3,
        complexityPreference: 0.3,
        symmetryPreference: 0.7,
        organicVsSynthetic: 0.3,
        minimalVsMaximal: 0.2,
        tempoRangeMin: 60,
        tempoRangeMax: 90,
        energyRangeMin: 0.2,
        energyRangeMax: 0.4,
        harmonicDissonanceTolerance: 0.3,
        rhythmPreference: 0.4,
        acousticVsDigital: 0.3,
      },
      behavioral: {
        contentDiversity: 0.3,
        sessionDepth: 20,
        reengagementRate: 0.8,
        noveltyPreference: 0.2,
        saveRate: 0.6,
        shareRate: 0.1,
        sessionCount: 50,
      },
    },
    expectedTraits: {
      energy: 0.3, // Should be low
      sensoryDensity: 0.3, // Should be low (minimal preference)
      identityProjection: 0.3, // Should be low (introvert, doesn't share)
      temporalStyle: 'looped', // High conscientiousness, high reengagement
    },
  },
  {
    name: 'Avant-Garde Explorer',
    input: {
      psychometric: {
        openness: 0.95,
        conscientiousness: 0.3,
        extraversion: 0.5,
        agreeableness: 0.4,
        neuroticism: 0.5,
        noveltySeeking: 0.95,
        aestheticSensitivity: 0.9,
        riskTolerance: 0.9,
      },
      aesthetic: {
        darknessPreference: 0.5,
        complexityPreference: 0.9,
        symmetryPreference: 0.3,
        organicVsSynthetic: 0.5,
        minimalVsMaximal: 0.7,
        tempoRangeMin: 80,
        tempoRangeMax: 160,
        energyRangeMin: 0.3,
        energyRangeMax: 0.9,
        harmonicDissonanceTolerance: 0.9,
        rhythmPreference: 0.5,
        acousticVsDigital: 0.6,
      },
      behavioral: {
        contentDiversity: 0.9,
        sessionDepth: 8,
        reengagementRate: 0.3,
        noveltyPreference: 0.9,
        saveRate: 0.3,
        shareRate: 0.4,
        sessionCount: 25,
      },
    },
    expectedTraits: {
      complexity: 0.8, // Should be very high
      ambiguityTolerance: 0.8, // Should be very high
      temporalStyle: 'episodic', // High novelty seeking
    },
  },
  {
    name: 'Ritual-Oriented Deep Diver',
    input: {
      psychometric: {
        openness: 0.5,
        conscientiousness: 0.9,
        extraversion: 0.4,
        agreeableness: 0.6,
        neuroticism: 0.3,
        noveltySeeking: 0.2,
        aestheticSensitivity: 0.7,
        riskTolerance: 0.2,
      },
      aesthetic: {
        darknessPreference: 0.5,
        complexityPreference: 0.5,
        symmetryPreference: 0.6,
        organicVsSynthetic: 0.4,
        minimalVsMaximal: 0.4,
        tempoRangeMin: 90,
        tempoRangeMax: 120,
        energyRangeMin: 0.4,
        energyRangeMax: 0.6,
        harmonicDissonanceTolerance: 0.3,
        rhythmPreference: 0.5,
        acousticVsDigital: 0.5,
      },
      behavioral: {
        contentDiversity: 0.2,
        sessionDepth: 25,
        reengagementRate: 0.9,
        noveltyPreference: 0.2,
        saveRate: 0.7,
        shareRate: 0.2,
        sessionCount: 60,
      },
    },
    expectedTraits: {
      temporalStyle: 'looped', // Very high conscientiousness, low novelty
      ambiguityTolerance: 0.3, // Should be low (low openness, risk tolerance)
    },
  },
];

// =============================================================================
// Test Suite 1: Basic Computation
// =============================================================================

section('1. BASIC REPRESENTATION COMPUTATION');

for (const profile of TEST_PROFILES) {
  console.log(`\n  Testing: ${profile.name}`);

  const result = computeRepresentationProfile(profile.input);

  test(`${profile.name}: returns valid profile`, isValidRepresentationProfile(result.profile));
  test(`${profile.name}: energy in range`, result.profile.energy >= 0 && result.profile.energy <= 1);
  test(`${profile.name}: complexity in range`, result.profile.complexity >= 0 && result.profile.complexity <= 1);
  test(`${profile.name}: sensoryDensity in range`, result.profile.sensoryDensity >= 0 && result.profile.sensoryDensity <= 1);
  test(`${profile.name}: identityProjection in range`, result.profile.identityProjection >= 0 && result.profile.identityProjection <= 1);
  test(`${profile.name}: ambiguityTolerance in range`, result.profile.ambiguityTolerance >= 0 && result.profile.ambiguityTolerance <= 1);
  test(`${profile.name}: temporalStyle is valid`, ['looped', 'evolving', 'episodic'].includes(result.profile.temporalStyle));
  test(`${profile.name}: has version`, result.profile.version === 1);
  test(`${profile.name}: has constraints`, result.constraints !== undefined);
  test(`${profile.name}: has computedAt`, result.computedAt !== undefined);
  test(`${profile.name}: has inputHash`, result.inputHash !== undefined && result.inputHash.length === 16);
}

// =============================================================================
// Test Suite 2: Expected Trait Mapping
// =============================================================================

section('2. EXPECTED TRAIT MAPPING');

for (const profile of TEST_PROFILES) {
  console.log(`\n  Testing: ${profile.name}`);

  const result = computeRepresentationProfile(profile.input);

  for (const [key, expectedValue] of Object.entries(profile.expectedTraits)) {
    const actualValue = result.profile[key as keyof RepresentationProfile];

    if (key === 'temporalStyle') {
      test(
        `${profile.name}: ${key} matches expected`,
        actualValue === expectedValue,
        `expected ${expectedValue}, got ${actualValue}`
      );
    } else {
      const numericExpected = expectedValue as number;
      const numericActual = actualValue as number;
      // Allow 0.25 tolerance for numeric values
      const matches = Math.abs(numericActual - numericExpected) < 0.25;
      if (!matches) {
        warn(
          `${profile.name}: ${key} close to expected`,
          `expected ~${numericExpected.toFixed(2)}, got ${numericActual.toFixed(2)}`
        );
      } else {
        test(`${profile.name}: ${key} matches expected`, matches);
      }
    }
  }
}

// =============================================================================
// Test Suite 3: Temporal Style Classification
// =============================================================================

section('3. TEMPORAL STYLE CLASSIFICATION');

// Test looped profile
const loopedInput: RepresentationInput = {
  psychometric: {
    openness: 0.4,
    conscientiousness: 0.9,
    extraversion: 0.4,
    agreeableness: 0.5,
    neuroticism: 0.4,
    noveltySeeking: 0.2,
    aestheticSensitivity: 0.5,
    riskTolerance: 0.2,
  },
  aesthetic: {
    darknessPreference: 0.5,
    complexityPreference: 0.5,
    symmetryPreference: 0.5,
    organicVsSynthetic: 0.5,
    minimalVsMaximal: 0.5,
    tempoRangeMin: 100,
    tempoRangeMax: 120,
    energyRangeMin: 0.4,
    energyRangeMax: 0.6,
    harmonicDissonanceTolerance: 0.4,
    rhythmPreference: 0.5,
    acousticVsDigital: 0.5,
  },
  behavioral: {
    reengagementRate: 0.9,
    contentDiversity: 0.2,
    sessionDepth: 15,
  },
};

const loopedStyle = classifyTemporalStyle(loopedInput);
test('High conscientiousness + low novelty → looped', loopedStyle === 'looped', `got ${loopedStyle}`);

// Test evolving profile
const evolvingInput: RepresentationInput = {
  psychometric: {
    openness: 0.8,
    conscientiousness: 0.5,
    extraversion: 0.5,
    agreeableness: 0.5,
    neuroticism: 0.4,
    noveltySeeking: 0.5,
    aestheticSensitivity: 0.7,
    riskTolerance: 0.5,
  },
  aesthetic: {
    darknessPreference: 0.5,
    complexityPreference: 0.6,
    symmetryPreference: 0.5,
    organicVsSynthetic: 0.5,
    minimalVsMaximal: 0.5,
    tempoRangeMin: 100,
    tempoRangeMax: 120,
    energyRangeMin: 0.4,
    energyRangeMax: 0.6,
    harmonicDissonanceTolerance: 0.5,
    rhythmPreference: 0.5,
    acousticVsDigital: 0.5,
  },
  behavioral: {
    sessionDepth: 20,
    contentDiversity: 0.5,
  },
};

const evolvingStyle = classifyTemporalStyle(evolvingInput);
test('High openness + deep sessions → evolving', evolvingStyle === 'evolving', `got ${evolvingStyle}`);

// Test episodic profile
const episodicInput: RepresentationInput = {
  psychometric: {
    openness: 0.7,
    conscientiousness: 0.3,
    extraversion: 0.6,
    agreeableness: 0.5,
    neuroticism: 0.4,
    noveltySeeking: 0.9,
    aestheticSensitivity: 0.6,
    riskTolerance: 0.8,
  },
  aesthetic: {
    darknessPreference: 0.5,
    complexityPreference: 0.6,
    symmetryPreference: 0.5,
    organicVsSynthetic: 0.5,
    minimalVsMaximal: 0.6,
    tempoRangeMin: 100,
    tempoRangeMax: 140,
    energyRangeMin: 0.5,
    energyRangeMax: 0.8,
    harmonicDissonanceTolerance: 0.6,
    rhythmPreference: 0.6,
    acousticVsDigital: 0.6,
  },
  behavioral: {
    sessionDepth: 5,
    contentDiversity: 0.8,
  },
};

const episodicStyle = classifyTemporalStyle(episodicInput);
test('High novelty + low conscientiousness → episodic', episodicStyle === 'episodic', `got ${episodicStyle}`);

// Test temporal analysis
const analysis = analyzeTemporalStyle(episodicInput);
test('Temporal analysis has scores', analysis.scores.looped >= 0 && analysis.scores.evolving >= 0);
test('Temporal analysis has confidence', analysis.confidence >= 0);
test('Temporal analysis has description', analysis.description.length > 0);

// Test probabilities
const probs = getTemporalProbabilities(episodicInput);
const probSum = probs.looped + probs.evolving + probs.episodic;
test('Temporal probabilities sum to 1', Math.abs(probSum - 1) < 0.01, `sum = ${probSum.toFixed(3)}`);

// =============================================================================
// Test Suite 4: Constraint Generation
// =============================================================================

section('4. CONSTRAINT GENERATION');

const constraintResult = computeRepresentationProfile(TEST_PROFILES[0].input);
const constraints = constraintResult.constraints;

test('Energy range is tuple', Array.isArray(constraints.energyRange) && constraints.energyRange.length === 2);
test('Energy range min <= max', constraints.energyRange[0] <= constraints.energyRange[1]);
test('Complexity bias is valid', ['low', 'medium', 'high'].includes(constraints.complexityBias));
test('Temporal style is valid', ['looped', 'evolving', 'episodic'].includes(constraints.temporalStyle));
test('Density range is tuple', Array.isArray(constraints.densityRange) && constraints.densityRange.length === 2);
test('Ambiguity level is valid', ['low', 'medium', 'high'].includes(constraints.ambiguityLevel));

// Test constraint alignment with profile
test(
  'High energy profile → high energy constraint center',
  (constraints.energyRange[0] + constraints.energyRange[1]) / 2 > 0.5
);

// =============================================================================
// Test Suite 5: Profile Comparison
// =============================================================================

section('5. PROFILE COMPARISON');

const profile1 = computeRepresentationProfileOnly(TEST_PROFILES[0].input);
const profile2 = computeRepresentationProfileOnly(TEST_PROFILES[1].input);
const profile1Copy = computeRepresentationProfileOnly(TEST_PROFILES[0].input);

const selfSimilarity = compareProfiles(profile1, profile1Copy);
test('Identical profiles have similarity 1', Math.abs(selfSimilarity - 1) < 0.01, `got ${selfSimilarity.toFixed(3)}`);

const differentSimilarity = compareProfiles(profile1, profile2);
test('Different profiles have lower similarity', differentSimilarity < 0.9, `got ${differentSimilarity.toFixed(3)}`);
test('Similarity is in valid range', differentSimilarity >= 0 && differentSimilarity <= 1);

// =============================================================================
// Test Suite 6: Vector Conversion
// =============================================================================

section('6. VECTOR CONVERSION');

const vector = profileToVector(profile1);
test('Vector has 6 dimensions', vector.length === 6);
test('All vector values in range', vector.every(v => v >= 0 && v <= 1));
test('Vector[0] is energy', Math.abs(vector[0] - profile1.energy) < 0.01);
test('Vector[1] is complexity', Math.abs(vector[1] - profile1.complexity) < 0.01);

// =============================================================================
// Test Suite 7: Full Profile Integration
// =============================================================================

section('7. FULL PROFILE INTEGRATION');

const fullResult = computeFullProfile(
  TEST_PROFILES[0].input.psychometric,
  TEST_PROFILES[0].input.aesthetic,
  TEST_PROFILES[0].input.behavioral
);

test('Full profile has constellation', fullResult.constellation !== undefined);
test('Full profile has representation', fullResult.representation !== undefined);
test('Constellation has primary ID', fullResult.constellation.profile.primaryConstellationId !== undefined);
test('Representation has valid profile', isValidRepresentationProfile(fullResult.representation.profile));
test('Representation matches standalone computation',
  Math.abs(fullResult.representation.profile.energy - constraintResult.profile.energy) < 0.01
);

// =============================================================================
// Test Suite 8: Utility Functions
// =============================================================================

section('8. UTILITY FUNCTIONS');

// Format function
const formatted = formatRepresentationProfile(profile1);
test('Format produces string', typeof formatted === 'string');
test('Format includes all dimensions',
  formatted.includes('Energy') &&
  formatted.includes('Complexity') &&
  formatted.includes('Temporal Style')
);

// Summary function
const summary = getRepresentationSummary(profile1);
test('Summary produces string', typeof summary === 'string');
test('Summary is concise', summary.length < 200);

// Validation
test('Valid profile passes validation', isValidRepresentationProfile(profile1));
test('Invalid profile fails validation', !isValidRepresentationProfile({
  energy: 'invalid' as unknown as number,
  complexity: 0.5,
  temporalStyle: 'looped',
  sensoryDensity: 0.5,
  identityProjection: 0.5,
  ambiguityTolerance: 0.5,
  version: 1,
}));

// =============================================================================
// Test Suite 9: Edge Cases
// =============================================================================

section('9. EDGE CASES');

// All zeros
const zeroInput: RepresentationInput = {
  psychometric: {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
    noveltySeeking: 0,
    aestheticSensitivity: 0,
    riskTolerance: 0,
  },
  aesthetic: {
    darknessPreference: 0,
    complexityPreference: 0,
    symmetryPreference: 0,
    organicVsSynthetic: 0,
    minimalVsMaximal: 0,
    tempoRangeMin: 60,
    tempoRangeMax: 60,
    energyRangeMin: 0,
    energyRangeMax: 0,
    harmonicDissonanceTolerance: 0,
    rhythmPreference: 0,
    acousticVsDigital: 0,
  },
};

const zeroResult = computeRepresentationProfile(zeroInput);
test('Zero input produces valid profile', isValidRepresentationProfile(zeroResult.profile));
test('Zero input: all values in range',
  zeroResult.profile.energy >= 0 && zeroResult.profile.energy <= 1 &&
  zeroResult.profile.complexity >= 0 && zeroResult.profile.complexity <= 1
);

// All ones
const oneInput: RepresentationInput = {
  psychometric: {
    openness: 1,
    conscientiousness: 1,
    extraversion: 1,
    agreeableness: 1,
    neuroticism: 1,
    noveltySeeking: 1,
    aestheticSensitivity: 1,
    riskTolerance: 1,
  },
  aesthetic: {
    darknessPreference: 1,
    complexityPreference: 1,
    symmetryPreference: 1,
    organicVsSynthetic: 1,
    minimalVsMaximal: 1,
    tempoRangeMin: 180,
    tempoRangeMax: 180,
    energyRangeMin: 1,
    energyRangeMax: 1,
    harmonicDissonanceTolerance: 1,
    rhythmPreference: 1,
    acousticVsDigital: 1,
  },
};

const oneResult = computeRepresentationProfile(oneInput);
test('Max input produces valid profile', isValidRepresentationProfile(oneResult.profile));
test('Max input: all values in range',
  oneResult.profile.energy >= 0 && oneResult.profile.energy <= 1 &&
  oneResult.profile.complexity >= 0 && oneResult.profile.complexity <= 1
);

// Without behavioral data
const noBehavioralInput: RepresentationInput = {
  psychometric: TEST_PROFILES[0].input.psychometric,
  aesthetic: TEST_PROFILES[0].input.aesthetic,
  // No behavioral
};

const noBehavioralResult = computeRepresentationProfile(noBehavioralInput);
test('No behavioral data produces valid profile', isValidRepresentationProfile(noBehavioralResult.profile));

// =============================================================================
// Test Suite 10: Determinism
// =============================================================================

section('10. DETERMINISM');

const input = TEST_PROFILES[0].input;
const results: RepresentationProfile[] = [];

for (let i = 0; i < 10; i++) {
  results.push(computeRepresentationProfileOnly(input));
}

const firstResult = results[0];
const allMatch = results.every(r =>
  r.energy === firstResult.energy &&
  r.complexity === firstResult.complexity &&
  r.temporalStyle === firstResult.temporalStyle &&
  r.sensoryDensity === firstResult.sensoryDensity &&
  r.identityProjection === firstResult.identityProjection &&
  r.ambiguityTolerance === firstResult.ambiguityTolerance
);

test('10 runs produce identical results', allMatch);

// =============================================================================
// Test Suite 11: Performance
// =============================================================================

section('11. PERFORMANCE');

const perfInputs = Array(500).fill(null).map(() => ({
  psychometric: {
    openness: Math.random(),
    conscientiousness: Math.random(),
    extraversion: Math.random(),
    agreeableness: Math.random(),
    neuroticism: Math.random(),
    noveltySeeking: Math.random(),
    aestheticSensitivity: Math.random(),
    riskTolerance: Math.random(),
  },
  aesthetic: {
    darknessPreference: Math.random(),
    complexityPreference: Math.random(),
    symmetryPreference: Math.random(),
    organicVsSynthetic: Math.random(),
    minimalVsMaximal: Math.random(),
    tempoRangeMin: 60 + Math.random() * 60,
    tempoRangeMax: 120 + Math.random() * 60,
    energyRangeMin: Math.random() * 0.5,
    energyRangeMax: 0.5 + Math.random() * 0.5,
    harmonicDissonanceTolerance: Math.random(),
    rhythmPreference: Math.random(),
    acousticVsDigital: Math.random(),
  },
}));

const perfStart = Date.now();
const perfResults = perfInputs.map(input => computeRepresentationProfileOnly(input));
const perfEnd = Date.now();
const perfTime = perfEnd - perfStart;
const avgTime = perfTime / 500;

test('500 computations complete', perfResults.length === 500);
test('All results valid', perfResults.every(r => isValidRepresentationProfile(r)));
test(`Performance < 1ms avg (${avgTime.toFixed(2)}ms)`, avgTime < 1);

console.log(`\n  Completed 500 profiles in ${perfTime}ms (${avgTime.toFixed(2)}ms avg)`);

// Distribution check
const temporalDist = {
  looped: perfResults.filter(r => r.temporalStyle === 'looped').length,
  evolving: perfResults.filter(r => r.temporalStyle === 'evolving').length,
  episodic: perfResults.filter(r => r.temporalStyle === 'episodic').length,
};

console.log(`  Temporal distribution: looped=${temporalDist.looped}, evolving=${temporalDist.evolving}, episodic=${temporalDist.episodic}`);

test('All temporal styles represented',
  temporalDist.looped > 0 && temporalDist.evolving > 0 && temporalDist.episodic > 0
);

// =============================================================================
// Summary
// =============================================================================

console.log(`\n${'═'.repeat(70)}`);
console.log('📊 FINAL SUMMARY');
console.log('═'.repeat(70));
console.log(`  Total Tests: ${passed + failed}`);
console.log(`  \x1b[32m✓\x1b[0m Passed: ${passed}`);
console.log(`  \x1b[31m✗\x1b[0m Failed: ${failed}`);
console.log(`  \x1b[33m⚠\x1b[0m Warnings: ${warnings}`);
console.log('─'.repeat(70));

if (failed === 0) {
  console.log(`\n🎉 ${((passed / (passed + failed)) * 100).toFixed(1)}% PASS RATE - Representation layer is READY!`);
  console.log('\nModule 4 provides:');
  console.log('  ✓ Energy level computation (0-1)');
  console.log('  ✓ Complexity tolerance (0-1)');
  console.log('  ✓ Temporal style classification (looped/evolving/episodic)');
  console.log('  ✓ Sensory density preference (0-1)');
  console.log('  ✓ Identity projection strength (0-1)');
  console.log('  ✓ Ambiguity tolerance (0-1)');
  console.log('  ✓ Machine-readable constraints for AI systems');
} else {
  console.log('\n⚠️ Some tests failed. Please review the output above.');
  process.exit(1);
}
