/**
 * Quiz Processor
 *
 * Processes quiz answers to compute initial psychometric profile
 * and aesthetic preferences.
 */

import { PsychometricProfile, AestheticPreference, TraitDeltas } from '../types/models';
import { QuizAnswer, AestheticAdjustment, BASE_TRAITS, quizQuestions } from './questions';
import { clamp } from '../utils';

export interface QuizResponses {
  [questionId: string]: string; // answerId
}

export interface ProcessedQuizResult {
  psychometric: Omit<PsychometricProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
  aesthetic: Omit<AestheticPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
  preliminaryConstellation: string | null; // hint at likely constellation
}

/**
 * Base aesthetic values
 */
const BASE_AESTHETIC = {
  colorPaletteVector: [],
  darknessPreference: 0.5,
  complexityPreference: 0.5,
  symmetryPreference: 0.5,
  organicVsSynthetic: 0.5,
  minimalVsMaximal: 0.5,
  tempoRangeMin: 80,
  tempoRangeMax: 140,
  energyRangeMin: 0.3,
  energyRangeMax: 0.7,
  harmonicDissonanceTolerance: 0.3,
  rhythmPreference: 0.5,
  acousticVsDigital: 0.5,
};

/**
 * Process quiz responses into psychometric and aesthetic profiles
 */
export function processQuizResponses(responses: QuizResponses): ProcessedQuizResult {
  // Start with base values
  const traits = { ...BASE_TRAITS };
  const aesthetic = { ...BASE_AESTHETIC };

  // Process each response
  for (const [questionId, answerId] of Object.entries(responses)) {
    const question = quizQuestions.find((q) => q.id === questionId);
    if (!question) continue;

    const answer = question.answers.find((a) => a.id === answerId);
    if (!answer) continue;

    // Apply trait deltas
    applyTraitDeltas(traits, answer.traitDeltas);

    // Apply aesthetic adjustments
    if (answer.aestheticAdjustment) {
      applyAestheticAdjustment(aesthetic, answer.aestheticAdjustment);
    }
  }

  // Clamp all trait values to 0-1
  for (const key of Object.keys(traits) as (keyof typeof traits)[]) {
    traits[key] = clamp(traits[key], 0, 1);
  }

  // Clamp aesthetic values
  aesthetic.darknessPreference = clamp(aesthetic.darknessPreference, 0, 1);
  aesthetic.complexityPreference = clamp(aesthetic.complexityPreference, 0, 1);
  aesthetic.symmetryPreference = clamp(aesthetic.symmetryPreference, 0, 1);
  aesthetic.organicVsSynthetic = clamp(aesthetic.organicVsSynthetic, 0, 1);
  aesthetic.minimalVsMaximal = clamp(aesthetic.minimalVsMaximal, 0, 1);
  aesthetic.tempoRangeMin = clamp(aesthetic.tempoRangeMin, 40, 200);
  aesthetic.tempoRangeMax = clamp(aesthetic.tempoRangeMax, 60, 220);
  aesthetic.energyRangeMin = clamp(aesthetic.energyRangeMin, 0, 1);
  aesthetic.energyRangeMax = clamp(aesthetic.energyRangeMax, 0, 1);
  aesthetic.harmonicDissonanceTolerance = clamp(aesthetic.harmonicDissonanceTolerance, 0, 1);
  aesthetic.rhythmPreference = clamp(aesthetic.rhythmPreference, 0, 1);
  aesthetic.acousticVsDigital = clamp(aesthetic.acousticVsDigital, 0, 1);

  // Ensure tempo range is valid
  if (aesthetic.tempoRangeMin > aesthetic.tempoRangeMax) {
    [aesthetic.tempoRangeMin, aesthetic.tempoRangeMax] = [
      aesthetic.tempoRangeMax,
      aesthetic.tempoRangeMin,
    ];
  }

  // Generate a preliminary constellation hint
  // This is a simple heuristic; full computation happens after more data
  const preliminaryConstellation = getPreliminaryConstellation(traits, aesthetic);

  return {
    psychometric: traits,
    aesthetic,
    preliminaryConstellation,
  };
}

function applyTraitDeltas(traits: typeof BASE_TRAITS, deltas: TraitDeltas): void {
  if (deltas.openness !== undefined) traits.openness += deltas.openness;
  if (deltas.conscientiousness !== undefined) traits.conscientiousness += deltas.conscientiousness;
  if (deltas.extraversion !== undefined) traits.extraversion += deltas.extraversion;
  if (deltas.agreeableness !== undefined) traits.agreeableness += deltas.agreeableness;
  if (deltas.neuroticism !== undefined) traits.neuroticism += deltas.neuroticism;
  if (deltas.noveltySeeking !== undefined) traits.noveltySeeking += deltas.noveltySeeking;
  if (deltas.aestheticSensitivity !== undefined)
    traits.aestheticSensitivity += deltas.aestheticSensitivity;
  if (deltas.riskTolerance !== undefined) traits.riskTolerance += deltas.riskTolerance;
}

function applyAestheticAdjustment(
  aesthetic: typeof BASE_AESTHETIC,
  adjustment: AestheticAdjustment
): void {
  if (adjustment.darknessPreference !== undefined) {
    aesthetic.darknessPreference += adjustment.darknessPreference;
  }
  if (adjustment.complexityPreference !== undefined) {
    aesthetic.complexityPreference += adjustment.complexityPreference;
  }
  if (adjustment.organicVsSynthetic !== undefined) {
    aesthetic.organicVsSynthetic += adjustment.organicVsSynthetic;
  }
  if (adjustment.minimalVsMaximal !== undefined) {
    aesthetic.minimalVsMaximal += adjustment.minimalVsMaximal;
  }
  if (adjustment.tempoCenter !== undefined) {
    // Shift tempo range
    aesthetic.tempoRangeMin += adjustment.tempoCenter * 0.5;
    aesthetic.tempoRangeMax += adjustment.tempoCenter * 0.5;
  }
  if (adjustment.energyCenter !== undefined) {
    aesthetic.energyRangeMin += adjustment.energyCenter * 0.3;
    aesthetic.energyRangeMax += adjustment.energyCenter * 0.3;
  }
  if (adjustment.acousticVsDigital !== undefined) {
    aesthetic.acousticVsDigital += adjustment.acousticVsDigital;
  }
}

/**
 * Simple heuristic to suggest a preliminary constellation
 * Full constellation computation uses all data sources
 */
function getPreliminaryConstellation(
  traits: typeof BASE_TRAITS,
  aesthetic: typeof BASE_AESTHETIC
): string {
  // High darkness + high aesthetic sensitivity → Obscyra or Nycataria
  if (aesthetic.darknessPreference > 0.65 && traits.aestheticSensitivity > 0.7) {
    return traits.extraversion < 0.4 ? 'obscyra' : 'nycataria';
  }

  // High openness + high novelty → Vantoryx or Holovain
  if (traits.openness > 0.75 && traits.noveltySeeking > 0.75) {
    return aesthetic.organicVsSynthetic > 0.6 ? 'holovain' : 'vantoryx';
  }

  // Low energy + dreamy → Somnexis
  if (aesthetic.energyRangeMax < 0.5 && traits.openness > 0.6) {
    return 'somnexis';
  }

  // High extraversion + high energy → Velocine or Radianth
  if (traits.extraversion > 0.7 && aesthetic.energyRangeMax > 0.7) {
    return traits.riskTolerance > 0.7 ? 'radianth' : 'velocine';
  }

  // High agreeableness + organic → Vireth or Glovern
  if (traits.agreeableness > 0.7 && aesthetic.organicVsSynthetic < 0.4) {
    return aesthetic.darknessPreference < 0.4 ? 'luminth' : 'vireth';
  }

  // High conscientiousness + minimal → Crysolen or Prismora
  if (traits.conscientiousness > 0.7 && aesthetic.minimalVsMaximal < 0.4) {
    return aesthetic.darknessPreference < 0.5 ? 'lucidyne' : 'crysolen';
  }

  // High aesthetic sensitivity + high complexity → Chromyne or Iridrax
  if (traits.aestheticSensitivity > 0.8 && aesthetic.complexityPreference > 0.6) {
    return aesthetic.organicVsSynthetic > 0.5 ? 'iridrax' : 'chromyne';
  }

  // Cosmic/space leaning
  if (traits.openness > 0.7 && traits.extraversion < 0.4) {
    return 'astryde';
  }

  // Default to Nexyra (connected, genre-fluid)
  return 'nexyra';
}

export default processQuizResponses;
