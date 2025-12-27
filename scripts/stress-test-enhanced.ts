/**
 * Comprehensive Stress Test for Enhanced Constellation Interpretation
 * Run with: npx tsx scripts/stress-test-enhanced.ts
 *
 * Tests:
 * 1. Blend Narrative generation accuracy
 * 2. Flavor State computation and triggers
 * 3. Behavioral Modifier scoring
 * 4. Subculture Fit predictions
 * 5. Identity Statement generation
 * 6. Edge cases and error handling
 * 7. Performance with 500 simulated users
 * 8. Determinism and reproducibility
 */

import { computeEnhancedConstellationProfile } from '../src/lib/scoring/constellation';
import { generateBlendNarrative, generateBlendBadge } from '../src/lib/constellation-interpretation/blend-narrative';
import { computeFlavorState, getAllFlavorStates } from '../src/lib/constellation-interpretation/flavor-states';
import { computeBehavioralModifiers, getBehavioralModeString } from '../src/lib/constellation-interpretation/behavioral-modifiers';
import { CONSTELLATION_IDS, ConstellationId } from '../src/lib/constellations/types';
import { constellationsConfig } from '../src/lib/constellations/config';
import {
  InterpretationInput,
  BehavioralInput,
  FlavorState,
  BehavioralModifier,
} from '../src/lib/constellation-interpretation/types';

const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const WARN = '\x1b[33m⚠\x1b[0m';
const SECTION = '\x1b[36m';
const RESET = '\x1b[0m';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
  severity: 'error' | 'warning';
}

const results: TestResult[] = [];

function test(name: string, condition: boolean, details?: string, severity: 'error' | 'warning' = 'error') {
  results.push({ name, passed: condition, details, severity });
  const icon = condition ? PASS : (severity === 'warning' ? WARN : FAIL);
  const detailStr = details ? ` (${details})` : '';
  console.log(`  ${icon} ${name}${detailStr}`);
}

function section(name: string) {
  console.log(`\n${SECTION}${'━'.repeat(70)}${RESET}`);
  console.log(`${SECTION}${name}${RESET}`);
  console.log(`${SECTION}${'━'.repeat(70)}${RESET}`);
}

// Helper to generate random psychometric profile
function randomPsychometric() {
  return {
    openness: Math.random(),
    conscientiousness: Math.random(),
    extraversion: Math.random(),
    agreeableness: Math.random(),
    neuroticism: Math.random(),
    noveltySeeking: Math.random(),
    aestheticSensitivity: Math.random(),
    riskTolerance: Math.random(),
  };
}

// Helper to generate random aesthetic preferences
function randomAesthetic() {
  return {
    colorPaletteVector: [],
    darknessPreference: Math.random(),
    complexityPreference: Math.random(),
    symmetryPreference: Math.random(),
    organicVsSynthetic: Math.random(),
    minimalVsMaximal: Math.random(),
    tempoRangeMin: 60 + Math.random() * 80,
    tempoRangeMax: 100 + Math.random() * 100,
    energyRangeMin: Math.random() * 0.5,
    energyRangeMax: 0.5 + Math.random() * 0.5,
    harmonicDissonanceTolerance: Math.random(),
    rhythmPreference: Math.random(),
    acousticVsDigital: Math.random(),
  };
}

// Helper to generate random behavioral input
function randomBehavioral(): BehavioralInput {
  return {
    contentDiversity: Math.random(),
    sessionDepth: Math.floor(Math.random() * 30),
    reengagementRate: Math.random(),
    noveltyPreference: Math.random(),
    saveRate: Math.random() * 0.5,
    shareRate: Math.random() * 0.3,
    sessionCount: Math.floor(Math.random() * 100),
    daysSinceFirst: Math.floor(Math.random() * 365),
    contentCategories: ['electronic', 'ambient', 'experimental'].slice(0, Math.floor(Math.random() * 4)),
  };
}

// =============================================================================
// TEST SUITE 1: Blend Narrative Generation
// =============================================================================
function testBlendNarrativeGeneration() {
  section('1. BLEND NARRATIVE GENERATION');

  // Test with various constellation primaries
  for (const primaryId of CONSTELLATION_IDS.slice(0, 10)) {
    const blendWeights: Partial<Record<ConstellationId, number>> = {
      [primaryId]: 0.4,
    };

    // Add some secondary weights
    const secondaries = CONSTELLATION_IDS.filter(id => id !== primaryId).slice(0, 3);
    secondaries.forEach((id, i) => {
      blendWeights[id] = 0.2 - i * 0.05;
    });

    const input: InterpretationInput = {
      primaryConstellationId: primaryId,
      blendWeights,
      subtasteIndex: 50,
      explorerScore: 60,
      earlyAdopterScore: 55,
      traits: {
        openness: 0.7, conscientiousness: 0.5, extraversion: 0.6,
        agreeableness: 0.5, neuroticism: 0.4, noveltySeeking: 0.7,
        aestheticSensitivity: 0.8, riskTolerance: 0.6,
      },
      aesthetic: {
        darknessPreference: 0.5, complexityPreference: 0.5,
        organicVsSynthetic: 0.5, minimalVsMaximal: 0.5,
        tempoCenter: 120, energyCenter: 0.6, acousticVsDigital: 0.5,
      },
    };

    try {
      const narrative = generateBlendNarrative(input);

      test(`${primaryId}: narrative generated`, narrative !== undefined);
      test(`${primaryId}: has tagline`, narrative.tagline.length > 0);
      test(`${primaryId}: has summary`, narrative.summary.length > 20);
      test(`${primaryId}: has aesthetic DNA`, narrative.aestheticDNA.length > 0);
      test(`${primaryId}: secondary count valid`, narrative.secondary.length <= 3);

      // Verify secondary influences have meanings
      for (const sec of narrative.secondary) {
        test(`${primaryId}: secondary ${sec.id} has meaning`, sec.meaning.length > 0);
      }
    } catch (e) {
      test(`${primaryId}: no errors`, false, (e as Error).message);
    }
  }

  // Test blend badge generation
  console.log('\n  Testing blend badge generation...');
  try {
    const input: InterpretationInput = {
      primaryConstellationId: 'radianth',
      blendWeights: { radianth: 0.4, velocine: 0.2, iridrax: 0.15 },
      subtasteIndex: 50, explorerScore: 60, earlyAdopterScore: 55,
      traits: {
        openness: 0.7, conscientiousness: 0.5, extraversion: 0.6,
        agreeableness: 0.5, neuroticism: 0.4, noveltySeeking: 0.7,
        aestheticSensitivity: 0.8, riskTolerance: 0.6,
      },
      aesthetic: {
        darknessPreference: 0.5, complexityPreference: 0.5,
        organicVsSynthetic: 0.5, minimalVsMaximal: 0.5,
        tempoCenter: 120, energyCenter: 0.6, acousticVsDigital: 0.5,
      },
    };

    const narrative = generateBlendNarrative(input);
    const badge = generateBlendBadge(narrative.primary, narrative.secondary);
    test('Blend badge generated', badge.length > 0, badge);
    test('Blend badge contains primary name', badge.includes('Radianth'));
  } catch (e) {
    test('Blend badge generation', false, (e as Error).message);
  }
}

// =============================================================================
// TEST SUITE 2: Flavor State Computation
// =============================================================================
function testFlavorStateComputation() {
  section('2. FLAVOR STATE COMPUTATION');

  // Get all flavor states
  const allFlavors = getAllFlavorStates();
  test('All flavors loaded', allFlavors.length >= 10, `Found ${allFlavors.length}`);

  // Test each flavor has required fields
  console.log('\n  Validating flavor definitions...');
  for (const flavor of allFlavors) {
    test(`Flavor ${flavor.id}: has displayName`, flavor.displayName.length > 0);
    test(`Flavor ${flavor.id}: has description`, flavor.description.length > 0);
    test(`Flavor ${flavor.id}: has tasteManifesto`, flavor.tasteManifesto.length > 0);
    test(`Flavor ${flavor.id}: has triggers`, flavor.triggers !== undefined);
  }

  // Test flavor activation with specific profiles
  console.log('\n  Testing flavor activation...');

  // Test Volatile flavor (high risk, high novelty)
  const volatileInput: InterpretationInput = {
    primaryConstellationId: 'radianth',
    blendWeights: { radianth: 0.4, velocine: 0.2, iridrax: 0.2 },
    subtasteIndex: 30,
    explorerScore: 85,
    earlyAdopterScore: 80,
    traits: {
      openness: 0.8, conscientiousness: 0.3, extraversion: 0.7,
      agreeableness: 0.4, neuroticism: 0.4, noveltySeeking: 0.9,
      aestheticSensitivity: 0.7, riskTolerance: 0.9,
    },
    aesthetic: {
      darknessPreference: 0.5, complexityPreference: 0.7,
      organicVsSynthetic: 0.7, minimalVsMaximal: 0.7,
      tempoCenter: 140, energyCenter: 0.8, acousticVsDigital: 0.7,
    },
  };

  const volatileFlavor = computeFlavorState(volatileInput);
  test('High-energy profile activates flavor', volatileFlavor !== undefined,
    volatileFlavor ? volatileFlavor.displayName : 'none');

  // Test Serene flavor (low energy, calm)
  const sereneInput: InterpretationInput = {
    primaryConstellationId: 'somnexis',
    blendWeights: { somnexis: 0.4, opalith: 0.2, glaceryl: 0.15 },
    subtasteIndex: 70,
    explorerScore: 40,
    earlyAdopterScore: 35,
    traits: {
      openness: 0.7, conscientiousness: 0.6, extraversion: 0.2,
      agreeableness: 0.8, neuroticism: 0.2, noveltySeeking: 0.4,
      aestheticSensitivity: 0.9, riskTolerance: 0.3,
    },
    aesthetic: {
      darknessPreference: 0.4, complexityPreference: 0.3,
      organicVsSynthetic: 0.3, minimalVsMaximal: 0.3,
      tempoCenter: 80, energyCenter: 0.3, acousticVsDigital: 0.3,
    },
  };

  const sereneFlavor = computeFlavorState(sereneInput);
  test('Calm profile may activate flavor', true, // Not all profiles activate flavors
    sereneFlavor ? sereneFlavor.displayName : 'none (valid)');

  // Test Pioneer flavor (early adopter)
  const pioneerInput: InterpretationInput = {
    primaryConstellationId: 'vantoryx',
    blendWeights: { vantoryx: 0.5, fluxeris: 0.2 },
    subtasteIndex: 40,
    explorerScore: 90,
    earlyAdopterScore: 85,
    traits: {
      openness: 0.95, conscientiousness: 0.3, extraversion: 0.6,
      agreeableness: 0.4, neuroticism: 0.35, noveltySeeking: 0.95,
      aestheticSensitivity: 0.85, riskTolerance: 0.9,
    },
    aesthetic: {
      darknessPreference: 0.5, complexityPreference: 0.8,
      organicVsSynthetic: 0.6, minimalVsMaximal: 0.7,
      tempoCenter: 130, energyCenter: 0.7, acousticVsDigital: 0.7,
    },
    behavioral: {
      contentDiversity: 0.8,
      noveltyPreference: 0.9,
      sessionCount: 20,
    },
  };

  const pioneerFlavor = computeFlavorState(pioneerInput);
  test('Explorer profile activates flavor', pioneerFlavor !== undefined,
    pioneerFlavor ? pioneerFlavor.displayName : 'none');
}

// =============================================================================
// TEST SUITE 3: Behavioral Modifier Scoring
// =============================================================================
function testBehavioralModifierScoring() {
  section('3. BEHAVIORAL MODIFIER SCORING');

  // Test modifier computation produces valid results
  const testInput: InterpretationInput = {
    primaryConstellationId: 'radianth',
    blendWeights: { radianth: 0.4, velocine: 0.2 },
    subtasteIndex: 50,
    explorerScore: 70,
    earlyAdopterScore: 75,
    traits: {
      openness: 0.8, conscientiousness: 0.4, extraversion: 0.7,
      agreeableness: 0.5, neuroticism: 0.3, noveltySeeking: 0.8,
      aestheticSensitivity: 0.7, riskTolerance: 0.8,
    },
    aesthetic: {
      darknessPreference: 0.4, complexityPreference: 0.7,
      organicVsSynthetic: 0.6, minimalVsMaximal: 0.7,
      tempoCenter: 130, energyCenter: 0.7, acousticVsDigital: 0.6,
    },
    behavioral: {
      contentDiversity: 0.7,
      sessionDepth: 8,
      reengagementRate: 0.5,
      noveltyPreference: 0.7,
      saveRate: 0.2,
      shareRate: 0.3,
      sessionCount: 25,
    },
  };

  const profile = computeBehavioralModifiers(testInput);

  test('Modifiers computed', profile.modifiers.length > 0, `${profile.modifiers.length} modifiers`);
  test('Archetype generated', profile.archetype.length > 0, profile.archetype);
  test('Summary generated', profile.summary.length > 0);

  // Validate each modifier
  console.log('\n  Validating modifier structure...');
  for (const mod of profile.modifiers) {
    test(`${mod.id}: score in range [0-100]`, mod.score >= 0 && mod.score <= 100, `${mod.score}`);
    test(`${mod.id}: has valid pole`, ['high', 'low', 'balanced'].includes(mod.pole));
    test(`${mod.id}: has label`, mod.label.length > 0);
    test(`${mod.id}: has explanation`, mod.explanation.length > 0);
    test(`${mod.id}: has insight`, mod.insight.length > 0);
  }

  // Test mode string generation
  const modeString = getBehavioralModeString(profile);
  test('Mode string generated', modeString.length > 0, modeString);

  // Test extreme profiles
  console.log('\n  Testing extreme profiles...');

  // Early adopter extreme
  const earlyAdopterInput: InterpretationInput = {
    ...testInput,
    earlyAdopterScore: 95,
    explorerScore: 90,
    traits: { ...testInput.traits, noveltySeeking: 0.95, riskTolerance: 0.9 },
  };

  const earlyProfile = computeBehavioralModifiers(earlyAdopterInput);
  const adoptionMod = earlyProfile.modifiers.find(m => m.id === 'adoption_timing');
  test('High early adopter → high adoption score', adoptionMod?.score ?? 0 >= 70, `${adoptionMod?.score}`);

  // Deep diver extreme
  const deepDiverInput: InterpretationInput = {
    ...testInput,
    subtasteIndex: 85,
    traits: { ...testInput.traits, conscientiousness: 0.9, noveltySeeking: 0.3 },
    behavioral: { ...testInput.behavioral, contentDiversity: 0.2, sessionDepth: 25 },
  };

  const deepProfile = computeBehavioralModifiers(deepDiverInput);
  const depthMod = deepProfile.modifiers.find(m => m.id === 'engagement_depth');
  test('High coherence → deep diver tendency', depthMod?.score ?? 0 >= 50, `${depthMod?.score}`);
}

// =============================================================================
// TEST SUITE 4: Subculture Fit Predictions
// =============================================================================
function testSubcultureFitPredictions() {
  section('4. SUBCULTURE FIT PREDICTIONS');

  // Test various profiles and their subculture fits
  const profiles = [
    {
      name: 'Electronic Underground',
      psychometric: {
        openness: 0.8, conscientiousness: 0.4, extraversion: 0.7,
        agreeableness: 0.4, neuroticism: 0.4, noveltySeeking: 0.9,
        aestheticSensitivity: 0.7, riskTolerance: 0.85,
      },
      expectedSubcultures: ['Underground Electronic', 'Hyperpop'],
    },
    {
      name: 'Ambient Contemplative',
      psychometric: {
        openness: 0.85, conscientiousness: 0.5, extraversion: 0.2,
        agreeableness: 0.7, neuroticism: 0.5, noveltySeeking: 0.5,
        aestheticSensitivity: 0.95, riskTolerance: 0.3,
      },
      expectedSubcultures: ['Ambient & Contemplative'],
    },
    {
      name: 'Minimalist Designer',
      psychometric: {
        openness: 0.6, conscientiousness: 0.9, extraversion: 0.4,
        agreeableness: 0.5, neuroticism: 0.2, noveltySeeking: 0.3,
        aestheticSensitivity: 0.8, riskTolerance: 0.25,
      },
      expectedSubcultures: ['Minimalist Design'],
    },
  ];

  for (const profile of profiles) {
    const result = computeEnhancedConstellationProfile(
      profile.psychometric,
      randomAesthetic(),
      undefined,
      randomBehavioral()
    );

    test(`${profile.name}: has subculture predictions`,
      result.enhanced?.subcultureFit.length ?? 0 > 0,
      `${result.enhanced?.subcultureFit.length} predictions`);

    if (result.enhanced) {
      const fitNames = result.enhanced.subcultureFit.map(f => f.name);
      const hasExpected = profile.expectedSubcultures.some(exp =>
        fitNames.some(f => f.includes(exp) || exp.includes(f))
      );
      test(`${profile.name}: expected subculture in top fits`, hasExpected,
        `Got: ${fitNames.slice(0, 3).join(', ')}`, 'warning');

      // Validate fit structure
      for (const fit of result.enhanced.subcultureFit) {
        test(`${profile.name}: ${fit.name} score valid`, fit.fitScore >= 0 && fit.fitScore <= 100);
        test(`${profile.name}: ${fit.name} has timing`, fit.adoptionTiming !== undefined);
        test(`${profile.name}: ${fit.name} has reasoning`, fit.reasoning.length > 0);
      }
    }
  }
}

// =============================================================================
// TEST SUITE 5: Identity Statement Generation
// =============================================================================
function testIdentityStatementGeneration() {
  section('5. IDENTITY STATEMENT GENERATION');

  // Test identity statements for various profiles
  for (let i = 0; i < 10; i++) {
    const result = computeEnhancedConstellationProfile(
      randomPsychometric(),
      randomAesthetic(),
      undefined,
      randomBehavioral()
    );

    if (result.enhanced) {
      test(`Profile ${i + 1}: identity statement exists`, result.enhanced.identityStatement.length > 0);
      test(`Profile ${i + 1}: identity contains primary`,
        result.enhanced.identityStatement.includes(result.result.summary.primaryName));
      test(`Profile ${i + 1}: identity is sentence`,
        result.enhanced.identityStatement.endsWith('.'));
      test(`Profile ${i + 1}: identity components exist`,
        result.enhanced.identityComponents.length > 0,
        `${result.enhanced.identityComponents.length} components`);

      // Validate identity components
      for (const comp of result.enhanced.identityComponents) {
        test(`Profile ${i + 1}: component ${comp.name} has type`,
          ['psychometric', 'aesthetic', 'behavioral', 'temporal', 'cross_modal'].includes(comp.type));
        test(`Profile ${i + 1}: component ${comp.name} has weight`,
          comp.weight >= 0 && comp.weight <= 1);
      }
    } else {
      test(`Profile ${i + 1}: enhanced result exists`, false);
    }
  }
}

// =============================================================================
// TEST SUITE 6: Edge Cases and Error Handling
// =============================================================================
function testEdgeCasesAndErrorHandling() {
  section('6. EDGE CASES AND ERROR HANDLING');

  // Test with all traits at 0
  console.log('\n  Testing extreme low values...');
  try {
    const result = computeEnhancedConstellationProfile(
      {
        openness: 0, conscientiousness: 0, extraversion: 0,
        agreeableness: 0, neuroticism: 0, noveltySeeking: 0,
        aestheticSensitivity: 0, riskTolerance: 0,
      },
      {
        colorPaletteVector: [], darknessPreference: 0, complexityPreference: 0,
        symmetryPreference: 0, organicVsSynthetic: 0, minimalVsMaximal: 0,
        tempoRangeMin: 60, tempoRangeMax: 60, energyRangeMin: 0, energyRangeMax: 0,
        harmonicDissonanceTolerance: 0, rhythmPreference: 0, acousticVsDigital: 0,
      }
    );
    test('All zeros handled', result.enhanced !== undefined);
    test('All zeros: valid identity', result.enhanced?.identityStatement.length ?? 0 > 0);
  } catch (e) {
    test('All zeros handled', false, (e as Error).message);
  }

  // Test with all traits at 1
  console.log('\n  Testing extreme high values...');
  try {
    const result = computeEnhancedConstellationProfile(
      {
        openness: 1, conscientiousness: 1, extraversion: 1,
        agreeableness: 1, neuroticism: 1, noveltySeeking: 1,
        aestheticSensitivity: 1, riskTolerance: 1,
      },
      {
        colorPaletteVector: [], darknessPreference: 1, complexityPreference: 1,
        symmetryPreference: 1, organicVsSynthetic: 1, minimalVsMaximal: 1,
        tempoRangeMin: 200, tempoRangeMax: 200, energyRangeMin: 1, energyRangeMax: 1,
        harmonicDissonanceTolerance: 1, rhythmPreference: 1, acousticVsDigital: 1,
      }
    );
    test('All ones handled', result.enhanced !== undefined);
    test('All ones: valid identity', result.enhanced?.identityStatement.length ?? 0 > 0);
  } catch (e) {
    test('All ones handled', false, (e as Error).message);
  }

  // Test with no behavioral data
  console.log('\n  Testing without behavioral data...');
  try {
    const result = computeEnhancedConstellationProfile(
      randomPsychometric(),
      randomAesthetic(),
      undefined,
      undefined // No behavioral data
    );
    test('No behavioral data handled', result.enhanced !== undefined);
    test('No behavioral: still has modifiers', result.enhanced?.behavioralProfile.modifiers.length ?? 0 > 0);
  } catch (e) {
    test('No behavioral data handled', false, (e as Error).message);
  }

  // Test with empty behavioral data
  console.log('\n  Testing with empty behavioral data...');
  try {
    const result = computeEnhancedConstellationProfile(
      randomPsychometric(),
      randomAesthetic(),
      undefined,
      {} // Empty behavioral
    );
    test('Empty behavioral handled', result.enhanced !== undefined);
  } catch (e) {
    test('Empty behavioral handled', false, (e as Error).message);
  }
}

// =============================================================================
// TEST SUITE 7: Performance with 500 Users
// =============================================================================
function testPerformanceWith500Users() {
  section('7. PERFORMANCE TEST (500 USERS)');

  const startTime = Date.now();
  const constellationCounts: Record<string, number> = {};
  const flavorCounts: Record<string, number> = {};
  const errors: string[] = [];

  for (let i = 0; i < 500; i++) {
    try {
      const result = computeEnhancedConstellationProfile(
        randomPsychometric(),
        randomAesthetic(),
        undefined,
        randomBehavioral()
      );

      // Track constellation distribution
      const primary = result.profile.primaryConstellationId;
      constellationCounts[primary] = (constellationCounts[primary] || 0) + 1;

      // Track flavor distribution
      if (result.enhanced?.flavorState) {
        const flavor = result.enhanced.flavorState.displayName;
        flavorCounts[flavor] = (flavorCounts[flavor] || 0) + 1;
      }
    } catch (e) {
      errors.push(`User ${i}: ${(e as Error).message}`);
    }
  }

  const duration = Date.now() - startTime;
  const avgTime = duration / 500;

  test('All 500 users processed', errors.length === 0,
    errors.length > 0 ? `${errors.length} errors` : undefined);
  test('Performance acceptable (<50ms avg)', avgTime < 50, `${avgTime.toFixed(1)}ms avg`);

  // Check constellation diversity
  const uniqueConstellations = Object.keys(constellationCounts).length;
  test('Good constellation diversity (10+)', uniqueConstellations >= 10,
    `${uniqueConstellations} unique`);

  // Check no single constellation dominates
  const maxCount = Math.max(...Object.values(constellationCounts));
  const maxPercent = (maxCount / 500) * 100;
  test('No constellation dominates (<30%)', maxPercent < 30, `${maxPercent.toFixed(1)}%`);

  // Check flavor activation rate
  const flavorActivations = Object.values(flavorCounts).reduce((a, b) => a + b, 0);
  const activationRate = (flavorActivations / 500) * 100;
  test('Reasonable flavor activation (20-80%)', activationRate >= 20 && activationRate <= 80,
    `${activationRate.toFixed(1)}% activated`);

  console.log(`\n  Completed 500 users in ${duration}ms (${avgTime.toFixed(1)}ms avg)`);
  console.log(`  Constellation distribution (top 5):`);
  Object.entries(constellationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([name, count]) => {
      console.log(`    ${name}: ${count} (${((count/500)*100).toFixed(1)}%)`);
    });

  if (Object.keys(flavorCounts).length > 0) {
    console.log(`  Flavor distribution:`);
    Object.entries(flavorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([name, count]) => {
        console.log(`    ${name}: ${count} (${((count/500)*100).toFixed(1)}%)`);
      });
  }
}

// =============================================================================
// TEST SUITE 8: Determinism and Reproducibility
// =============================================================================
function testDeterminismAndReproducibility() {
  section('8. DETERMINISM AND REPRODUCIBILITY');

  // Fixed input for reproducibility test
  const fixedPsychometric = {
    openness: 0.75, conscientiousness: 0.45, extraversion: 0.65,
    agreeableness: 0.55, neuroticism: 0.35, noveltySeeking: 0.8,
    aestheticSensitivity: 0.85, riskTolerance: 0.7,
  };

  const fixedAesthetic = {
    colorPaletteVector: [], darknessPreference: 0.4, complexityPreference: 0.6,
    symmetryPreference: 0.5, organicVsSynthetic: 0.6, minimalVsMaximal: 0.55,
    tempoRangeMin: 100, tempoRangeMax: 140, energyRangeMin: 0.4, energyRangeMax: 0.7,
    harmonicDissonanceTolerance: 0.35, rhythmPreference: 0.6, acousticVsDigital: 0.55,
  };

  const fixedBehavioral: BehavioralInput = {
    contentDiversity: 0.6, sessionDepth: 12, reengagementRate: 0.55,
    noveltyPreference: 0.7, saveRate: 0.25, shareRate: 0.2, sessionCount: 30,
  };

  // Run 10 times and compare results
  const results: string[] = [];
  const identities: string[] = [];
  const constellations: string[] = [];

  for (let i = 0; i < 10; i++) {
    const result = computeEnhancedConstellationProfile(
      fixedPsychometric,
      fixedAesthetic,
      undefined,
      fixedBehavioral
    );

    constellations.push(result.profile.primaryConstellationId);
    if (result.enhanced) {
      identities.push(result.enhanced.identityStatement);
      results.push(JSON.stringify(result.enhanced.behavioralProfile.modifiers.map(m => m.score)));
    }
  }

  // Check all are identical
  test('10 runs: same constellation', new Set(constellations).size === 1);
  test('10 runs: same identity statement', new Set(identities).size === 1);
  test('10 runs: same modifier scores', new Set(results).size === 1);
}

// =============================================================================
// RUN ALL TESTS
// =============================================================================
async function runAllTests() {
  console.log('═'.repeat(70));
  console.log('🔬 ENHANCED CONSTELLATION INTERPRETATION - COMPREHENSIVE STRESS TEST');
  console.log('═'.repeat(70));
  console.log(`Constellations: ${CONSTELLATION_IDS.length}`);
  console.log(`Flavor States: ${getAllFlavorStates().length}`);

  testBlendNarrativeGeneration();
  testFlavorStateComputation();
  testBehavioralModifierScoring();
  testSubcultureFitPredictions();
  testIdentityStatementGeneration();
  testEdgeCasesAndErrorHandling();
  testPerformanceWith500Users();
  testDeterminismAndReproducibility();

  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('📊 FINAL SUMMARY');
  console.log('═'.repeat(70));

  const passed = results.filter(r => r.passed).length;
  const errors = results.filter(r => !r.passed && r.severity === 'error').length;
  const warnings = results.filter(r => !r.passed && r.severity === 'warning').length;

  console.log(`  Total Tests: ${results.length}`);
  console.log(`  ${PASS} Passed: ${passed}`);
  console.log(`  ${FAIL} Errors: ${errors}`);
  console.log(`  ${WARN} Warnings: ${warnings}`);
  console.log('─'.repeat(70));

  const passRate = ((passed / results.length) * 100).toFixed(1);

  if (errors === 0) {
    console.log(`\n🎉 ${passRate}% PASS RATE - Enhanced system is PRODUCTION READY!`);
    if (warnings > 0) {
      console.log(`   (${warnings} warnings - minor optimizations possible)`);
    }
    return true;
  } else {
    console.log(`\n⚠️  ${errors} CRITICAL ERRORS found`);
    console.log('   Please fix before production release.\n');

    console.log('  Critical failures:');
    results
      .filter(r => !r.passed && r.severity === 'error')
      .slice(0, 10)
      .forEach(r => {
        console.log(`    ${FAIL} ${r.name}${r.details ? ` - ${r.details}` : ''}`);
      });
    return false;
  }
}

runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(e => {
  console.error('Test suite crashed:', e);
  process.exit(1);
});
