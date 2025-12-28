/**
 * Enneagram Module
 *
 * 9-type personality system integrated with Big Five traits.
 */

// Types
export * from './types';

// Questions
export {
  ENNEAGRAM_QUESTIONS,
  getQuestionsForType,
  getEnneagramQuestionIds,
} from './questions';
export type { EnneagramQuestion } from './questions';

// Scoring
export {
  estimateFromBigFive,
  scoreFromAnswers,
  combineScores,
  computeEnneagramProfile,
  quickEstimate,
} from './scoring';
export type {
  BigFiveInput,
  EnneagramAnswer,
  EnneagramScoringResult,
} from './scoring';
