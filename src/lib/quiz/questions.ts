/**
 * Subtaste Quiz Questions Configuration
 *
 * 12 questions designed to estimate psychometric traits + aesthetic priors.
 * Question types:
 * - ab: Binary A/B choice
 * - multiple: 4-option multiple choice
 * - image: Image selection (seeds visual features)
 *
 * Each answer maps to trait deltas and/or aesthetic feature adjustments.
 */

import { TraitDeltas } from '../types/models';

export type QuestionType = 'ab' | 'multiple' | 'image';

export interface AestheticAdjustment {
  darknessPreference?: number;
  complexityPreference?: number;
  organicVsSynthetic?: number;
  minimalVsMaximal?: number;
  tempoCenter?: number;      // shifts preferred tempo
  energyCenter?: number;     // shifts preferred energy
  acousticVsDigital?: number;
}

export interface QuizAnswer {
  id: string;
  text: string;
  imageUrl?: string;          // for image-type questions
  traitDeltas: TraitDeltas;
  aestheticAdjustment?: AestheticAdjustment;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  text: string;
  subtext?: string;
  answers: QuizAnswer[];
}

/**
 * Base trait starting values (neutral 0.5 for all).
 * Quiz responses will adjust these values.
 */
export const BASE_TRAITS = {
  openness: 0.5,
  conscientiousness: 0.5,
  extraversion: 0.5,
  agreeableness: 0.5,
  neuroticism: 0.5,
  noveltySeeking: 0.5,
  aestheticSensitivity: 0.5,
  riskTolerance: 0.5,
};

export const quizQuestions: QuizQuestion[] = [
  // Q1: Openness & novelty seeking
  {
    id: 'q1_exploration',
    type: 'ab',
    text: 'On a free evening, you prefer to...',
    answers: [
      {
        id: 'q1_a',
        text: 'Explore somewhere new, even if it might disappoint',
        traitDeltas: { openness: 0.15, noveltySeeking: 0.2, riskTolerance: 0.1 },
      },
      {
        id: 'q1_b',
        text: 'Return to a place you know and love',
        traitDeltas: { openness: -0.1, noveltySeeking: -0.15, conscientiousness: 0.1 },
      },
    ],
  },

  // Q2: Extraversion
  {
    id: 'q2_social',
    type: 'ab',
    text: 'After a long day, you recharge by...',
    answers: [
      {
        id: 'q2_a',
        text: 'Being around people, even strangers',
        traitDeltas: { extraversion: 0.2, agreeableness: 0.1 },
      },
      {
        id: 'q2_b',
        text: 'Solitude or one close person',
        traitDeltas: { extraversion: -0.2, neuroticism: 0.05 },
      },
    ],
  },

  // Q3: Aesthetic sensitivity & visual darkness
  {
    id: 'q3_aesthetic',
    type: 'multiple',
    text: 'Which space feels most like home?',
    answers: [
      {
        id: 'q3_a',
        text: 'Warm, golden light with natural materials',
        traitDeltas: { agreeableness: 0.1, aestheticSensitivity: 0.15 },
        aestheticAdjustment: { darknessPreference: -0.2, organicVsSynthetic: -0.3 },
      },
      {
        id: 'q3_b',
        text: 'Cool, minimal space with clean lines',
        traitDeltas: { conscientiousness: 0.15, aestheticSensitivity: 0.1 },
        aestheticAdjustment: { complexityPreference: -0.2, minimalVsMaximal: -0.3 },
      },
      {
        id: 'q3_c',
        text: 'Moody, layered with collected objects',
        traitDeltas: { openness: 0.15, aestheticSensitivity: 0.2 },
        aestheticAdjustment: { darknessPreference: 0.2, complexityPreference: 0.2 },
      },
      {
        id: 'q3_d',
        text: 'High-tech, futuristic, neon accents',
        traitDeltas: { noveltySeeking: 0.15, openness: 0.1 },
        aestheticAdjustment: { organicVsSynthetic: 0.3, darknessPreference: 0.1 },
      },
    ],
  },

  // Q4: Risk tolerance & conscientiousness
  {
    id: 'q4_planning',
    type: 'ab',
    text: 'When making big decisions, you...',
    answers: [
      {
        id: 'q4_a',
        text: 'Trust your gut and adapt as you go',
        traitDeltas: { riskTolerance: 0.2, openness: 0.1, conscientiousness: -0.15 },
      },
      {
        id: 'q4_b',
        text: 'Research thoroughly before committing',
        traitDeltas: { conscientiousness: 0.2, riskTolerance: -0.15, neuroticism: 0.05 },
      },
    ],
  },

  // Q5: Agreeableness & neuroticism
  {
    id: 'q5_conflict',
    type: 'ab',
    text: 'In a disagreement, you tend to...',
    answers: [
      {
        id: 'q5_a',
        text: 'Prioritize harmony, find middle ground',
        traitDeltas: { agreeableness: 0.2, neuroticism: 0.05 },
      },
      {
        id: 'q5_b',
        text: 'Stand your ground if you believe you\'re right',
        traitDeltas: { agreeableness: -0.15, conscientiousness: 0.1, extraversion: 0.1 },
      },
    ],
  },

  // Q6: Music tempo & energy
  {
    id: 'q6_music_energy',
    type: 'multiple',
    text: 'What energy do you seek in music?',
    answers: [
      {
        id: 'q6_a',
        text: 'Calm, ambient, floating',
        traitDeltas: { neuroticism: 0.1, openness: 0.1 },
        aestheticAdjustment: { tempoCenter: -30, energyCenter: -0.3 },
      },
      {
        id: 'q6_b',
        text: 'Rhythmic, groovy, makes me move',
        traitDeltas: { extraversion: 0.15, agreeableness: 0.05 },
        aestheticAdjustment: { tempoCenter: 10, energyCenter: 0.1 },
      },
      {
        id: 'q6_c',
        text: 'Intense, driving, adrenaline',
        traitDeltas: { riskTolerance: 0.15, noveltySeeking: 0.1, extraversion: 0.1 },
        aestheticAdjustment: { tempoCenter: 40, energyCenter: 0.3 },
      },
      {
        id: 'q6_d',
        text: 'Eclectic, unpredictable, experimental',
        traitDeltas: { openness: 0.2, noveltySeeking: 0.2, aestheticSensitivity: 0.15 },
        aestheticAdjustment: { tempoCenter: 0, energyCenter: 0 },
      },
    ],
  },

  // Q7: Image selection - Visual palette seed 1
  {
    id: 'q7_visual_1',
    type: 'image',
    text: 'Which image draws you in?',
    subtext: 'Trust your first instinct.',
    answers: [
      {
        id: 'q7_a',
        text: 'Misty forest at dawn',
        imageUrl: '/images/quiz/forest-mist.jpg',
        traitDeltas: { openness: 0.1, agreeableness: 0.1 },
        aestheticAdjustment: { darknessPreference: 0.1, organicVsSynthetic: -0.3 },
      },
      {
        id: 'q7_b',
        text: 'Neon-lit city at night',
        imageUrl: '/images/quiz/neon-city.jpg',
        traitDeltas: { noveltySeeking: 0.15, extraversion: 0.1 },
        aestheticAdjustment: { darknessPreference: 0.3, organicVsSynthetic: 0.2 },
      },
      {
        id: 'q7_c',
        text: 'Abstract geometric patterns',
        imageUrl: '/images/quiz/geometric.jpg',
        traitDeltas: { conscientiousness: 0.1, aestheticSensitivity: 0.15 },
        aestheticAdjustment: { organicVsSynthetic: 0.1, complexityPreference: 0.1 },
      },
      {
        id: 'q7_d',
        text: 'Cosmic nebula in deep space',
        imageUrl: '/images/quiz/nebula.jpg',
        traitDeltas: { openness: 0.2, aestheticSensitivity: 0.2 },
        aestheticAdjustment: { darknessPreference: 0.2, complexityPreference: 0.2 },
      },
    ],
  },

  // Q8: Complexity preference
  {
    id: 'q8_complexity',
    type: 'ab',
    text: 'In design and art, you prefer...',
    answers: [
      {
        id: 'q8_a',
        text: 'Clean, minimal, breathing room',
        traitDeltas: { conscientiousness: 0.1, neuroticism: -0.1 },
        aestheticAdjustment: { minimalVsMaximal: -0.3, complexityPreference: -0.2 },
      },
      {
        id: 'q8_b',
        text: 'Rich, layered, maximalist',
        traitDeltas: { openness: 0.15, aestheticSensitivity: 0.15 },
        aestheticAdjustment: { minimalVsMaximal: 0.3, complexityPreference: 0.2 },
      },
    ],
  },

  // Q9: Acoustic vs digital
  {
    id: 'q9_sound_texture',
    type: 'ab',
    text: 'Sound textures you gravitate toward...',
    answers: [
      {
        id: 'q9_a',
        text: 'Organic: strings, wood, voice, breath',
        traitDeltas: { agreeableness: 0.1, aestheticSensitivity: 0.1 },
        aestheticAdjustment: { acousticVsDigital: -0.3, organicVsSynthetic: -0.2 },
      },
      {
        id: 'q9_b',
        text: 'Synthetic: synths, processed, electronic',
        traitDeltas: { noveltySeeking: 0.1, openness: 0.1 },
        aestheticAdjustment: { acousticVsDigital: 0.3, organicVsSynthetic: 0.2 },
      },
    ],
  },

  // Q10: Image selection - Visual palette seed 2
  {
    id: 'q10_visual_2',
    type: 'image',
    text: 'And this set?',
    subtext: 'Go with your feeling.',
    answers: [
      {
        id: 'q10_a',
        text: 'Candlelit ritual space',
        imageUrl: '/images/quiz/ritual.jpg',
        traitDeltas: { openness: 0.15, aestheticSensitivity: 0.2 },
        aestheticAdjustment: { darknessPreference: 0.25, organicVsSynthetic: -0.1 },
      },
      {
        id: 'q10_b',
        text: 'Brutalist concrete architecture',
        imageUrl: '/images/quiz/brutalist.jpg',
        traitDeltas: { conscientiousness: 0.1, riskTolerance: 0.1 },
        aestheticAdjustment: { minimalVsMaximal: -0.2, organicVsSynthetic: 0.2 },
      },
      {
        id: 'q10_c',
        text: 'Iridescent bubble textures',
        imageUrl: '/images/quiz/iridescent.jpg',
        traitDeltas: { noveltySeeking: 0.15, openness: 0.15 },
        aestheticAdjustment: { complexityPreference: 0.1, organicVsSynthetic: 0.1 },
      },
      {
        id: 'q10_d',
        text: 'Golden hour landscape',
        imageUrl: '/images/quiz/golden-hour.jpg',
        traitDeltas: { agreeableness: 0.15, neuroticism: -0.1 },
        aestheticAdjustment: { darknessPreference: -0.2, organicVsSynthetic: -0.2 },
      },
    ],
  },

  // Q11: Emotional processing
  {
    id: 'q11_emotions',
    type: 'ab',
    text: 'When experiencing strong emotions...',
    answers: [
      {
        id: 'q11_a',
        text: 'You process through art, music, expression',
        traitDeltas: { aestheticSensitivity: 0.2, openness: 0.1, neuroticism: 0.1 },
      },
      {
        id: 'q11_b',
        text: 'You prefer action, problem-solving, moving forward',
        traitDeltas: { conscientiousness: 0.15, extraversion: 0.1, neuroticism: -0.1 },
      },
    ],
  },

  // Q12: Final identity question
  {
    id: 'q12_identity',
    type: 'multiple',
    text: 'Which role resonates most?',
    subtext: 'Not what you do, but who you are.',
    answers: [
      {
        id: 'q12_a',
        text: 'The Explorer: always seeking the new',
        traitDeltas: { noveltySeeking: 0.2, openness: 0.15, riskTolerance: 0.15 },
      },
      {
        id: 'q12_b',
        text: 'The Curator: discerning, selective, refined',
        traitDeltas: { aestheticSensitivity: 0.2, conscientiousness: 0.1, openness: 0.1 },
      },
      {
        id: 'q12_c',
        text: 'The Connector: bridging people and ideas',
        traitDeltas: { extraversion: 0.15, agreeableness: 0.2, openness: 0.1 },
      },
      {
        id: 'q12_d',
        text: 'The Dreamer: inner world rich and vast',
        traitDeltas: { openness: 0.2, neuroticism: 0.1, aestheticSensitivity: 0.15 },
      },
    ],
  },
];

export default quizQuestions;
