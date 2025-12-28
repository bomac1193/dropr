/**
 * Enneagram Questions
 *
 * 27 questions (3 per type) designed to measure Enneagram type affinities.
 * Questions are designed to avoid obvious self-typing while measuring
 * core motivations and behavioral patterns.
 */

import { EnneagramType } from './types';
import type { ItemBankQuestion, TraitId } from '../quiz/item-bank';

// =============================================================================
// Enneagram Question Extensions
// =============================================================================

export interface EnneagramQuestion extends Omit<ItemBankQuestion, 'primaryTrait'> {
  primaryTrait: TraitId;
  enneagramLoadings: Partial<Record<EnneagramType, number>>; // Type loadings
  enneagramCategory: 'core' | 'behavioral' | 'aesthetic';
}

// =============================================================================
// Type 1: The Reformer
// =============================================================================

const TYPE_1_QUESTIONS: EnneagramQuestion[] = [
  {
    id: 'enne_1_standards',
    type: 'ab',
    text: 'When you see something done incorrectly...',
    primaryTrait: 'conscientiousness',
    enneagramLoadings: { 1: 0.8, 6: 0.2 },
    enneagramCategory: 'core',
    difficulty: 0.5,
    discrimination: 1.6,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_1a_a',
        text: 'I feel compelled to correct it or point it out',
        traitDeltas: { conscientiousness: 0.15 },
        value: 1,
      },
      {
        id: 'enne_1a_b',
        text: 'I let it go unless it really matters',
        traitDeltas: { agreeableness: 0.1 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_1_criticism',
    type: 'ab',
    text: 'Your inner voice is most often...',
    primaryTrait: 'neuroticism',
    enneagramLoadings: { 1: 0.7, 4: 0.3 },
    enneagramCategory: 'core',
    difficulty: 0.6,
    discrimination: 1.5,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_1b_a',
        text: 'Critical—reminding me how I could do better',
        traitDeltas: { neuroticism: 0.1, conscientiousness: 0.1 },
        value: 1,
      },
      {
        id: 'enne_1b_b',
        text: 'Supportive—accepting of my imperfections',
        traitDeltas: { agreeableness: 0.1 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_1_principles',
    type: 'multiple',
    text: 'What drives your decisions most?',
    primaryTrait: 'conscientiousness',
    enneagramLoadings: { 1: 0.6, 6: 0.3, 5: 0.1 },
    enneagramCategory: 'behavioral',
    difficulty: 0.5,
    discrimination: 1.4,
    isAnchor: false,
    category: 'personality',
    answers: [
      { id: 'enne_1c_a', text: 'Clear principles and values', traitDeltas: { conscientiousness: 0.15 }, value: 1 },
      { id: 'enne_1c_b', text: 'What feels right emotionally', traitDeltas: { agreeableness: 0.1 }, value: 0.25 },
      { id: 'enne_1c_c', text: 'Practical outcomes and efficiency', traitDeltas: { conscientiousness: 0.05 }, value: 0.5 },
      { id: 'enne_1c_d', text: 'Spontaneous intuition', traitDeltas: { openness: 0.1 }, value: 0 },
    ],
  },
];

// =============================================================================
// Type 2: The Helper
// =============================================================================

const TYPE_2_QUESTIONS: EnneagramQuestion[] = [
  {
    id: 'enne_2_needs',
    type: 'ab',
    text: "When someone you care about is struggling...",
    primaryTrait: 'agreeableness',
    enneagramLoadings: { 2: 0.8, 9: 0.2 },
    enneagramCategory: 'core',
    difficulty: 0.4,
    discrimination: 1.7,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_2a_a',
        text: 'I immediately want to help, even if uninvited',
        traitDeltas: { agreeableness: 0.15, extraversion: 0.1 },
        value: 1,
      },
      {
        id: 'enne_2a_b',
        text: 'I offer support only if they ask for it',
        traitDeltas: { conscientiousness: 0.1 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_2_appreciation',
    type: 'ab',
    text: 'Feeling appreciated by others...',
    primaryTrait: 'extraversion',
    enneagramLoadings: { 2: 0.7, 3: 0.3 },
    enneagramCategory: 'core',
    difficulty: 0.5,
    discrimination: 1.5,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_2b_a',
        text: 'Is essential to my sense of self-worth',
        traitDeltas: { extraversion: 0.1, neuroticism: 0.1 },
        value: 1,
      },
      {
        id: 'enne_2b_b',
        text: 'Is nice but not necessary for my happiness',
        traitDeltas: { riskTolerance: 0.1 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_2_giving',
    type: 'multiple',
    text: 'When you give to others, you most often feel...',
    primaryTrait: 'agreeableness',
    enneagramLoadings: { 2: 0.6, 9: 0.2, 7: 0.2 },
    enneagramCategory: 'behavioral',
    difficulty: 0.5,
    discrimination: 1.4,
    isAnchor: false,
    category: 'personality',
    answers: [
      { id: 'enne_2c_a', text: 'Fulfilled and connected', traitDeltas: { agreeableness: 0.15 }, value: 1 },
      { id: 'enne_2c_b', text: 'Drained if not reciprocated', traitDeltas: { neuroticism: 0.1 }, value: 0.75 },
      { id: 'enne_2c_c', text: 'Neutral—it depends on the situation', traitDeltas: {}, value: 0.5 },
      { id: 'enne_2c_d', text: 'Uncomfortable—I prefer receiving', traitDeltas: { riskTolerance: 0.1 }, value: 0 },
    ],
  },
];

// =============================================================================
// Type 3: The Achiever
// =============================================================================

const TYPE_3_QUESTIONS: EnneagramQuestion[] = [
  {
    id: 'enne_3_success',
    type: 'ab',
    text: 'When starting a new project...',
    primaryTrait: 'conscientiousness',
    enneagramLoadings: { 3: 0.8, 8: 0.2 },
    enneagramCategory: 'core',
    difficulty: 0.5,
    discrimination: 1.6,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_3a_a',
        text: 'I immediately think about how to succeed and be recognized',
        traitDeltas: { conscientiousness: 0.1, extraversion: 0.1 },
        value: 1,
      },
      {
        id: 'enne_3a_b',
        text: 'I focus on the process and what I\'ll learn',
        traitDeltas: { openness: 0.15 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_3_image',
    type: 'ab',
    text: 'How others perceive you...',
    primaryTrait: 'extraversion',
    enneagramLoadings: { 3: 0.7, 2: 0.2, 4: 0.1 },
    enneagramCategory: 'core',
    difficulty: 0.6,
    discrimination: 1.5,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_3b_a',
        text: 'Is something I actively manage and optimize',
        traitDeltas: { conscientiousness: 0.1, extraversion: 0.1 },
        value: 1,
      },
      {
        id: 'enne_3b_b',
        text: "Doesn't concern me much—I am who I am",
        traitDeltas: { riskTolerance: 0.1 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_3_failure',
    type: 'multiple',
    text: 'When you fail at something important, you...',
    primaryTrait: 'neuroticism',
    enneagramLoadings: { 3: 0.6, 1: 0.2, 4: 0.2 },
    enneagramCategory: 'behavioral',
    difficulty: 0.6,
    discrimination: 1.5,
    isAnchor: false,
    category: 'personality',
    answers: [
      { id: 'enne_3c_a', text: 'Feel it as a blow to your identity', traitDeltas: { neuroticism: 0.15 }, value: 1 },
      { id: 'enne_3c_b', text: 'Quickly reframe and move on', traitDeltas: { riskTolerance: 0.1 }, value: 0.5 },
      { id: 'enne_3c_c', text: 'Analyze what went wrong systematically', traitDeltas: { conscientiousness: 0.1 }, value: 0.25 },
      { id: 'enne_3c_d', text: 'Shrug it off—failure is part of learning', traitDeltas: { openness: 0.1 }, value: 0 },
    ],
  },
];

// =============================================================================
// Type 4: The Individualist
// =============================================================================

const TYPE_4_QUESTIONS: EnneagramQuestion[] = [
  {
    id: 'enne_4_unique',
    type: 'ab',
    text: 'Your sense of identity comes from...',
    primaryTrait: 'openness',
    enneagramLoadings: { 4: 0.8, 5: 0.2 },
    enneagramCategory: 'core',
    difficulty: 0.5,
    discrimination: 1.7,
    isAnchor: false,
    category: 'identity',
    answers: [
      {
        id: 'enne_4a_a',
        text: 'What makes you different from everyone else',
        traitDeltas: { openness: 0.15, aestheticSensitivity: 0.1 },
        value: 1,
      },
      {
        id: 'enne_4a_b',
        text: 'What you share in common with others',
        traitDeltas: { agreeableness: 0.1 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_4_emotions',
    type: 'ab',
    text: 'Strong emotions are...',
    primaryTrait: 'aestheticSensitivity',
    enneagramLoadings: { 4: 0.7, 2: 0.2, 8: 0.1 },
    enneagramCategory: 'core',
    difficulty: 0.5,
    discrimination: 1.6,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_4b_a',
        text: 'A source of depth and meaning I embrace',
        traitDeltas: { aestheticSensitivity: 0.15, neuroticism: 0.1 },
        value: 1,
      },
      {
        id: 'enne_4b_b',
        text: 'Something to manage and not let control me',
        traitDeltas: { conscientiousness: 0.1 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_4_belonging',
    type: 'multiple',
    text: 'In social situations, you often feel...',
    primaryTrait: 'neuroticism',
    enneagramLoadings: { 4: 0.6, 5: 0.3, 6: 0.1 },
    enneagramCategory: 'behavioral',
    difficulty: 0.6,
    discrimination: 1.5,
    isAnchor: false,
    category: 'personality',
    answers: [
      { id: 'enne_4c_a', text: 'Like an outsider looking in', traitDeltas: { neuroticism: 0.1, openness: 0.1 }, value: 1 },
      { id: 'enne_4c_b', text: 'Comfortable and part of the group', traitDeltas: { extraversion: 0.1 }, value: 0 },
      { id: 'enne_4c_c', text: 'Observant and analytical', traitDeltas: { openness: 0.1 }, value: 0.5 },
      { id: 'enne_4c_d', text: 'Energized and at the center', traitDeltas: { extraversion: 0.15 }, value: 0.25 },
    ],
  },
];

// =============================================================================
// Type 5: The Investigator
// =============================================================================

const TYPE_5_QUESTIONS: EnneagramQuestion[] = [
  {
    id: 'enne_5_knowledge',
    type: 'ab',
    text: 'When faced with a new challenge, your first instinct is to...',
    primaryTrait: 'openness',
    enneagramLoadings: { 5: 0.8, 1: 0.2 },
    enneagramCategory: 'core',
    difficulty: 0.5,
    discrimination: 1.6,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_5a_a',
        text: 'Research and understand it thoroughly before acting',
        traitDeltas: { openness: 0.1, conscientiousness: 0.1 },
        value: 1,
      },
      {
        id: 'enne_5a_b',
        text: 'Jump in and learn by doing',
        traitDeltas: { riskTolerance: 0.15 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_5_privacy',
    type: 'ab',
    text: 'Your personal space and time alone are...',
    primaryTrait: 'extraversion',
    enneagramLoadings: { 5: 0.7, 4: 0.2, 9: 0.1 },
    enneagramCategory: 'core',
    difficulty: 0.4,
    discrimination: 1.7,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_5b_a',
        text: 'Essential—I need solitude to recharge and think',
        traitDeltas: { extraversion: -0.15 },
        value: 1,
      },
      {
        id: 'enne_5b_b',
        text: 'Nice but I prefer being around people',
        traitDeltas: { extraversion: 0.15 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_5_resources',
    type: 'multiple',
    text: 'Your relationship with resources (time, energy, money) is...',
    primaryTrait: 'conscientiousness',
    enneagramLoadings: { 5: 0.6, 6: 0.2, 1: 0.2 },
    enneagramCategory: 'behavioral',
    difficulty: 0.5,
    discrimination: 1.5,
    isAnchor: false,
    category: 'personality',
    answers: [
      { id: 'enne_5c_a', text: 'Conservative—I guard them carefully', traitDeltas: { conscientiousness: 0.1 }, value: 1 },
      { id: 'enne_5c_b', text: 'Generous—I share freely', traitDeltas: { agreeableness: 0.15 }, value: 0 },
      { id: 'enne_5c_c', text: 'Strategic—I invest for returns', traitDeltas: { conscientiousness: 0.1 }, value: 0.5 },
      { id: 'enne_5c_d', text: 'Carefree—I don\'t think about it much', traitDeltas: { noveltySeeking: 0.1 }, value: 0.25 },
    ],
  },
];

// =============================================================================
// Type 6: The Loyalist
// =============================================================================

const TYPE_6_QUESTIONS: EnneagramQuestion[] = [
  {
    id: 'enne_6_trust',
    type: 'ab',
    text: 'When meeting new people or situations, you tend to...',
    primaryTrait: 'neuroticism',
    enneagramLoadings: { 6: 0.8, 5: 0.2 },
    enneagramCategory: 'core',
    difficulty: 0.5,
    discrimination: 1.6,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_6a_a',
        text: 'Be cautious until they prove trustworthy',
        traitDeltas: { neuroticism: 0.1 },
        value: 1,
      },
      {
        id: 'enne_6a_b',
        text: 'Give them the benefit of the doubt',
        traitDeltas: { agreeableness: 0.15 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_6_authority',
    type: 'ab',
    text: 'Your relationship with authority is...',
    primaryTrait: 'agreeableness',
    enneagramLoadings: { 6: 0.7, 8: 0.2, 1: 0.1 },
    enneagramCategory: 'core',
    difficulty: 0.6,
    discrimination: 1.5,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_6b_a',
        text: 'Complex—I question it but also seek reliable guidance',
        traitDeltas: { neuroticism: 0.1, conscientiousness: 0.05 },
        value: 1,
      },
      {
        id: 'enne_6b_b',
        text: 'Simple—I follow my own path regardless',
        traitDeltas: { riskTolerance: 0.15 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_6_security',
    type: 'multiple',
    text: 'When making important decisions, you prioritize...',
    primaryTrait: 'riskTolerance',
    enneagramLoadings: { 6: 0.6, 1: 0.2, 5: 0.2 },
    enneagramCategory: 'behavioral',
    difficulty: 0.5,
    discrimination: 1.4,
    isAnchor: false,
    category: 'personality',
    answers: [
      { id: 'enne_6c_a', text: 'Security and avoiding worst-case scenarios', traitDeltas: { riskTolerance: -0.1 }, value: 1 },
      { id: 'enne_6c_b', text: 'Potential upside and opportunity', traitDeltas: { riskTolerance: 0.15 }, value: 0 },
      { id: 'enne_6c_c', text: 'What feels right in the moment', traitDeltas: { noveltySeeking: 0.1 }, value: 0.25 },
      { id: 'enne_6c_d', text: 'What others I trust recommend', traitDeltas: { agreeableness: 0.1 }, value: 0.5 },
    ],
  },
];

// =============================================================================
// Type 7: The Enthusiast
// =============================================================================

const TYPE_7_QUESTIONS: EnneagramQuestion[] = [
  {
    id: 'enne_7_options',
    type: 'ab',
    text: 'When planning your free time, you prefer...',
    primaryTrait: 'noveltySeeking',
    enneagramLoadings: { 7: 0.8, 3: 0.2 },
    enneagramCategory: 'core',
    difficulty: 0.4,
    discrimination: 1.7,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_7a_a',
        text: 'Keeping options open for spontaneous adventures',
        traitDeltas: { noveltySeeking: 0.15, extraversion: 0.1 },
        value: 1,
      },
      {
        id: 'enne_7a_b',
        text: 'Having a clear plan and sticking to it',
        traitDeltas: { conscientiousness: 0.15 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_7_pain',
    type: 'ab',
    text: 'When facing difficult emotions or situations...',
    primaryTrait: 'neuroticism',
    enneagramLoadings: { 7: 0.7, 9: 0.2, 3: 0.1 },
    enneagramCategory: 'core',
    difficulty: 0.6,
    discrimination: 1.5,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_7b_a',
        text: 'I reframe them positively or distract myself',
        traitDeltas: { noveltySeeking: 0.1, neuroticism: -0.1 },
        value: 1,
      },
      {
        id: 'enne_7b_b',
        text: 'I sit with them and process fully',
        traitDeltas: { aestheticSensitivity: 0.1 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_7_boredom',
    type: 'multiple',
    text: 'Boredom for you is...',
    primaryTrait: 'noveltySeeking',
    enneagramLoadings: { 7: 0.6, 4: 0.2, 5: 0.2 },
    enneagramCategory: 'behavioral',
    difficulty: 0.5,
    discrimination: 1.5,
    isAnchor: false,
    category: 'personality',
    answers: [
      { id: 'enne_7c_a', text: 'Unbearable—I always need stimulation', traitDeltas: { noveltySeeking: 0.15 }, value: 1 },
      { id: 'enne_7c_b', text: 'An opportunity for creativity or reflection', traitDeltas: { openness: 0.1 }, value: 0.5 },
      { id: 'enne_7c_c', text: 'Rare—I find interest in most things', traitDeltas: { openness: 0.1 }, value: 0.25 },
      { id: 'enne_7c_d', text: 'Comfortable—I enjoy quiet moments', traitDeltas: { agreeableness: 0.1 }, value: 0 },
    ],
  },
];

// =============================================================================
// Type 8: The Challenger
// =============================================================================

const TYPE_8_QUESTIONS: EnneagramQuestion[] = [
  {
    id: 'enne_8_control',
    type: 'ab',
    text: 'In group situations, you naturally tend to...',
    primaryTrait: 'extraversion',
    enneagramLoadings: { 8: 0.8, 3: 0.2 },
    enneagramCategory: 'core',
    difficulty: 0.5,
    discrimination: 1.6,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_8a_a',
        text: 'Take charge and direct the action',
        traitDeltas: { extraversion: 0.15, riskTolerance: 0.1 },
        value: 1,
      },
      {
        id: 'enne_8a_b',
        text: 'Go with the flow and support others\' ideas',
        traitDeltas: { agreeableness: 0.15 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_8_vulnerability',
    type: 'ab',
    text: 'Showing vulnerability to others...',
    primaryTrait: 'agreeableness',
    enneagramLoadings: { 8: 0.7, 5: 0.2, 3: 0.1 },
    enneagramCategory: 'core',
    difficulty: 0.6,
    discrimination: 1.5,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_8b_a',
        text: 'Feels like weakness I try to avoid',
        traitDeltas: { agreeableness: -0.1, riskTolerance: 0.1 },
        value: 1,
      },
      {
        id: 'enne_8b_b',
        text: 'Is healthy and builds connection',
        traitDeltas: { agreeableness: 0.15 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_8_justice',
    type: 'multiple',
    text: 'When you see injustice, you...',
    primaryTrait: 'riskTolerance',
    enneagramLoadings: { 8: 0.6, 1: 0.3, 6: 0.1 },
    enneagramCategory: 'behavioral',
    difficulty: 0.5,
    discrimination: 1.5,
    isAnchor: false,
    category: 'personality',
    answers: [
      { id: 'enne_8c_a', text: 'Confront it directly and forcefully', traitDeltas: { riskTolerance: 0.15 }, value: 1 },
      { id: 'enne_8c_b', text: 'Report it through proper channels', traitDeltas: { conscientiousness: 0.1 }, value: 0.25 },
      { id: 'enne_8c_c', text: 'Consider all sides before acting', traitDeltas: { openness: 0.1 }, value: 0.5 },
      { id: 'enne_8c_d', text: 'Feel upset but avoid conflict', traitDeltas: { agreeableness: 0.1 }, value: 0 },
    ],
  },
];

// =============================================================================
// Type 9: The Peacemaker
// =============================================================================

const TYPE_9_QUESTIONS: EnneagramQuestion[] = [
  {
    id: 'enne_9_conflict',
    type: 'ab',
    text: 'When conflict arises in your relationships...',
    primaryTrait: 'agreeableness',
    enneagramLoadings: { 9: 0.8, 2: 0.2 },
    enneagramCategory: 'core',
    difficulty: 0.4,
    discrimination: 1.7,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_9a_a',
        text: 'I tend to minimize it or go along to keep peace',
        traitDeltas: { agreeableness: 0.15 },
        value: 1,
      },
      {
        id: 'enne_9a_b',
        text: 'I address it directly to resolve it',
        traitDeltas: { riskTolerance: 0.1 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_9_priorities',
    type: 'ab',
    text: 'Your own priorities and wants are...',
    primaryTrait: 'conscientiousness',
    enneagramLoadings: { 9: 0.7, 2: 0.2, 4: 0.1 },
    enneagramCategory: 'core',
    difficulty: 0.5,
    discrimination: 1.6,
    isAnchor: false,
    category: 'personality',
    answers: [
      {
        id: 'enne_9b_a',
        text: 'Often unclear or easily set aside for others',
        traitDeltas: { agreeableness: 0.1, conscientiousness: -0.1 },
        value: 1,
      },
      {
        id: 'enne_9b_b',
        text: 'Clear and important to pursue',
        traitDeltas: { conscientiousness: 0.15 },
        value: -1,
      },
    ],
  },
  {
    id: 'enne_9_inertia',
    type: 'multiple',
    text: 'Starting new things or making changes feels...',
    primaryTrait: 'noveltySeeking',
    enneagramLoadings: { 9: 0.6, 5: 0.2, 6: 0.2 },
    enneagramCategory: 'behavioral',
    difficulty: 0.5,
    discrimination: 1.4,
    isAnchor: false,
    category: 'personality',
    answers: [
      { id: 'enne_9c_a', text: 'Overwhelming—I prefer comfortable routines', traitDeltas: { noveltySeeking: -0.1 }, value: 1 },
      { id: 'enne_9c_b', text: 'Exciting—I embrace new experiences', traitDeltas: { noveltySeeking: 0.15 }, value: 0 },
      { id: 'enne_9c_c', text: 'Depends on the stakes involved', traitDeltas: { conscientiousness: 0.1 }, value: 0.5 },
      { id: 'enne_9c_d', text: 'Neutral—I adapt either way', traitDeltas: { agreeableness: 0.1 }, value: 0.25 },
    ],
  },
];

// =============================================================================
// Export All Enneagram Questions
// =============================================================================

export const ENNEAGRAM_QUESTIONS: EnneagramQuestion[] = [
  ...TYPE_1_QUESTIONS,
  ...TYPE_2_QUESTIONS,
  ...TYPE_3_QUESTIONS,
  ...TYPE_4_QUESTIONS,
  ...TYPE_5_QUESTIONS,
  ...TYPE_6_QUESTIONS,
  ...TYPE_7_QUESTIONS,
  ...TYPE_8_QUESTIONS,
  ...TYPE_9_QUESTIONS,
];

/**
 * Get questions for a specific Enneagram type
 */
export function getQuestionsForType(type: EnneagramType): EnneagramQuestion[] {
  return ENNEAGRAM_QUESTIONS.filter((q) =>
    q.enneagramLoadings[type] && q.enneagramLoadings[type]! >= 0.5
  );
}

/**
 * Get all question IDs
 */
export function getEnneagramQuestionIds(): string[] {
  return ENNEAGRAM_QUESTIONS.map((q) => q.id);
}

export default ENNEAGRAM_QUESTIONS;
