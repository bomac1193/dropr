/**
 * Test Enhanced Constellation Interpretation System
 * Run with: npx tsx scripts/test-enhanced-interpretation.ts
 */

import { computeEnhancedConstellationProfile } from '../src/lib/scoring/constellation';
import { CONSTELLATION_IDS, ConstellationId } from '../src/lib/constellations/types';
import { constellationsConfig } from '../src/lib/constellations/config';

console.log('═'.repeat(70));
console.log('🔮 ENHANCED CONSTELLATION INTERPRETATION TEST');
console.log('═'.repeat(70));

// =============================================================================
// Test Profiles
// =============================================================================

const testProfiles = [
  {
    name: 'Dreamy Introvert',
    psychometric: {
      openness: 0.85,
      conscientiousness: 0.35,
      extraversion: 0.2,
      agreeableness: 0.6,
      neuroticism: 0.55,
      noveltySeeking: 0.6,
      aestheticSensitivity: 0.9,
      riskTolerance: 0.4,
    },
    aesthetic: {
      colorPaletteVector: [],
      darknessPreference: 0.6,
      complexityPreference: 0.5,
      symmetryPreference: 0.5,
      organicVsSynthetic: 0.3,
      minimalVsMaximal: 0.4,
      tempoRangeMin: 60,
      tempoRangeMax: 100,
      energyRangeMin: 0.2,
      energyRangeMax: 0.5,
      harmonicDissonanceTolerance: 0.4,
      rhythmPreference: 0.4,
      acousticVsDigital: 0.4,
    },
    behavioral: {
      contentDiversity: 0.4,
      sessionDepth: 15,
      reengagementRate: 0.7,
      noveltyPreference: 0.5,
      saveRate: 0.4,
      shareRate: 0.1,
      sessionCount: 20,
    },
  },
  {
    name: 'Risk-Taking Explorer',
    psychometric: {
      openness: 0.95,
      conscientiousness: 0.3,
      extraversion: 0.7,
      agreeableness: 0.4,
      neuroticism: 0.35,
      noveltySeeking: 0.95,
      aestheticSensitivity: 0.8,
      riskTolerance: 0.95,
    },
    aesthetic: {
      colorPaletteVector: [],
      darknessPreference: 0.5,
      complexityPreference: 0.8,
      symmetryPreference: 0.3,
      organicVsSynthetic: 0.7,
      minimalVsMaximal: 0.7,
      tempoRangeMin: 120,
      tempoRangeMax: 180,
      energyRangeMin: 0.6,
      energyRangeMax: 0.95,
      harmonicDissonanceTolerance: 0.6,
      rhythmPreference: 0.7,
      acousticVsDigital: 0.8,
    },
    behavioral: {
      contentDiversity: 0.85,
      sessionDepth: 8,
      reengagementRate: 0.4,
      noveltyPreference: 0.9,
      saveRate: 0.2,
      shareRate: 0.3,
      sessionCount: 15,
    },
  },
  {
    name: 'Structured Minimalist',
    psychometric: {
      openness: 0.5,
      conscientiousness: 0.9,
      extraversion: 0.4,
      agreeableness: 0.5,
      neuroticism: 0.25,
      noveltySeeking: 0.3,
      aestheticSensitivity: 0.7,
      riskTolerance: 0.25,
    },
    aesthetic: {
      colorPaletteVector: [],
      darknessPreference: 0.3,
      complexityPreference: 0.2,
      symmetryPreference: 0.8,
      organicVsSynthetic: 0.4,
      minimalVsMaximal: 0.2,
      tempoRangeMin: 80,
      tempoRangeMax: 120,
      energyRangeMin: 0.3,
      energyRangeMax: 0.5,
      harmonicDissonanceTolerance: 0.2,
      rhythmPreference: 0.5,
      acousticVsDigital: 0.5,
    },
    behavioral: {
      contentDiversity: 0.25,
      sessionDepth: 20,
      reengagementRate: 0.8,
      noveltyPreference: 0.2,
      saveRate: 0.5,
      shareRate: 0.15,
      sessionCount: 50,
      contentCategories: ['minimal', 'ambient'],
    },
  },
  {
    name: 'Party Extravert',
    psychometric: {
      openness: 0.7,
      conscientiousness: 0.4,
      extraversion: 0.95,
      agreeableness: 0.6,
      neuroticism: 0.35,
      noveltySeeking: 0.8,
      aestheticSensitivity: 0.7,
      riskTolerance: 0.8,
    },
    aesthetic: {
      colorPaletteVector: [],
      darknessPreference: 0.4,
      complexityPreference: 0.7,
      symmetryPreference: 0.5,
      organicVsSynthetic: 0.6,
      minimalVsMaximal: 0.8,
      tempoRangeMin: 125,
      tempoRangeMax: 150,
      energyRangeMin: 0.7,
      energyRangeMax: 1.0,
      harmonicDissonanceTolerance: 0.4,
      rhythmPreference: 0.8,
      acousticVsDigital: 0.7,
    },
    behavioral: {
      contentDiversity: 0.6,
      sessionDepth: 5,
      reengagementRate: 0.5,
      noveltyPreference: 0.7,
      saveRate: 0.1,
      shareRate: 0.5,
      sessionCount: 30,
    },
  },
];

// =============================================================================
// Run Tests
// =============================================================================

let passed = 0;
let failed = 0;

for (const profile of testProfiles) {
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`📊 Testing: ${profile.name}`);
  console.log('─'.repeat(70));

  try {
    const result = computeEnhancedConstellationProfile(
      profile.psychometric,
      profile.aesthetic,
      undefined,
      profile.behavioral
    );

    // Check base profile
    console.log(`\n✅ Primary Constellation: ${result.result.summary.primaryName}`);
    console.log(`   Subtaste Index: ${result.profile.subtasteIndex}`);
    console.log(`   Explorer Score: ${result.profile.explorerScore}`);
    console.log(`   Early Adopter Score: ${result.profile.earlyAdopterScore}`);

    // Check enhanced interpretation
    if (result.enhanced) {
      console.log('\n🔮 Enhanced Interpretation:');

      // Identity Statement
      console.log(`\n   📜 Identity Statement:`);
      console.log(`      "${result.enhanced.identityStatement}"`);

      // Blend Narrative
      console.log(`\n   🎨 Blend Narrative:`);
      console.log(`      Tagline: ${result.enhanced.blendNarrative.tagline}`);
      console.log(`      Aesthetic DNA: ${result.enhanced.blendNarrative.aestheticDNA}`);

      if (result.enhanced.blendNarrative.secondary.length > 0) {
        console.log(`      Secondary Influences:`);
        for (const sec of result.enhanced.blendNarrative.secondary) {
          console.log(`        - ${constellationsConfig[sec.id].displayName} (${(sec.weight * 100).toFixed(0)}%): ${sec.modifierPhrase}`);
        }
      }

      // Flavor State
      if (result.enhanced.flavorState) {
        console.log(`\n   ✨ Flavor State: ${result.enhanced.flavorState.fullLabel}`);
        console.log(`      ${result.enhanced.flavorState.description}`);
        console.log(`      "${result.enhanced.flavorState.tasteManifesto}"`);
      } else {
        console.log(`\n   ✨ Flavor State: None activated`);
      }

      // Behavioral Profile
      console.log(`\n   🧠 Behavioral Profile:`);
      console.log(`      Archetype: ${result.enhanced.behavioralProfile.archetype}`);
      console.log(`      Summary: ${result.enhanced.behavioralProfile.summary}`);
      console.log(`\n      Modifiers:`);
      for (const mod of result.enhanced.behavioralProfile.modifiers) {
        const bar = '█'.repeat(Math.round(mod.score / 10)) + '░'.repeat(10 - Math.round(mod.score / 10));
        console.log(`        ${mod.id.padEnd(20)} [${bar}] ${mod.score.toFixed(0).padStart(3)} - ${mod.shortPhrase}`);
      }

      // Subculture Fit
      if (result.enhanced.subcultureFit.length > 0) {
        console.log(`\n   🎭 Subculture Fit Predictions:`);
        for (const fit of result.enhanced.subcultureFit.slice(0, 3)) {
          console.log(`        ${fit.name}: ${fit.fitScore}% fit (${fit.adoptionTiming.replace('_', ' ')})`);
        }
      }

      // Identity Components
      console.log(`\n   🧬 Identity Components (${result.enhanced.identityComponents.length}):`);
      for (const comp of result.enhanced.identityComponents.slice(0, 5)) {
        console.log(`        [${comp.type}] ${comp.name}: ${comp.value} (weight: ${comp.weight.toFixed(2)})`);
      }

      passed++;
    } else {
      console.log('\n❌ Enhanced interpretation missing');
      failed++;
    }
  } catch (error) {
    console.log(`\n❌ Error: ${(error as Error).message}`);
    failed++;
  }
}

// =============================================================================
// Summary
// =============================================================================

console.log(`\n${'═'.repeat(70)}`);
console.log('📋 TEST SUMMARY');
console.log('═'.repeat(70));
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All enhanced interpretation tests passed!');
  console.log('\nThe system now provides:');
  console.log('  ✓ Blend narratives with semantic meaning');
  console.log('  ✓ Flavor states (sub-dimensions within constellations)');
  console.log('  ✓ Behavioral modifiers (cross-cutting dimensions)');
  console.log('  ✓ Subculture fit predictions');
  console.log('  ✓ Procedurally generated identity statements');
} else {
  console.log('\n⚠️ Some tests failed. Please review the output above.');
  process.exit(1);
}
