'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Target, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArchetypeId, ARCHETYPE_CONFIG } from '@/lib/archetypes/config';
import { EnneagramType, ENNEAGRAM_TYPE_INFO } from '@/lib/enneagram/types';

// =============================================================================
// Types
// =============================================================================

interface RefinementQuestion {
  id: string;
  text: string;
  context: string; // Why we're asking
  answers: RefinementAnswer[];
  targetDimension: 'archetype' | 'enneagram' | 'trait';
}

interface RefinementAnswer {
  id: string;
  text: string;
  archetypeWeights?: Partial<Record<ArchetypeId, number>>;
  enneagramWeights?: Partial<Record<EnneagramType, number>>;
  traitWeights?: Partial<Record<string, number>>;
}

interface RefinementResult {
  archetypeAdjustments: Partial<Record<ArchetypeId, number>>;
  enneagramAdjustments: Partial<Record<EnneagramType, number>>;
  traitAdjustments: Partial<Record<string, number>>;
  confidence: number;
}

interface RefinementQuizProps {
  /** Primary archetype from initial quiz */
  primaryArchetype: ArchetypeId;
  /** Secondary archetype (for blend disambiguation) */
  secondaryArchetype?: ArchetypeId;
  /** Primary Enneagram type */
  primaryEnneagram?: EnneagramType;
  /** Secondary Enneagram candidates */
  secondaryEnneagram?: EnneagramType[];
  /** Overall confidence from initial quiz */
  initialConfidence: number;
  /** Callback when refinement is complete */
  onComplete: (result: RefinementResult) => void;
  /** Optional: skip refinement */
  onSkip?: () => void;
}

// =============================================================================
// Refinement Questions
// =============================================================================

function generateRefinementQuestions(
  primaryArchetype: ArchetypeId,
  secondaryArchetype?: ArchetypeId,
  primaryEnneagram?: EnneagramType,
  secondaryEnneagram?: EnneagramType[]
): RefinementQuestion[] {
  const questions: RefinementQuestion[] = [];

  // Archetype disambiguation questions
  if (secondaryArchetype) {
    const primary = ARCHETYPE_CONFIG[primaryArchetype];
    const secondary = ARCHETYPE_CONFIG[secondaryArchetype];

    questions.push({
      id: 'archetype-disambig-1',
      text: `When facing a creative challenge, which approach resonates more?`,
      context: `Differentiating ${primary.name} vs ${secondary.name}`,
      targetDimension: 'archetype',
      answers: [
        {
          id: 'a',
          text: primary.keywords[0] ? `I lean into ${primary.keywords[0]} energy` : 'Follow my intuition deeply',
          archetypeWeights: { [primaryArchetype]: 0.2 },
        },
        {
          id: 'b',
          text: secondary.keywords[0] ? `I embrace ${secondary.keywords[0]} vibes` : 'Explore multiple paths',
          archetypeWeights: { [secondaryArchetype]: 0.2 },
        },
      ],
    });

    questions.push({
      id: 'archetype-disambig-2',
      text: `Your ideal weekend vibe?`,
      context: `Core energy preference`,
      targetDimension: 'archetype',
      answers: [
        {
          id: 'a',
          text: getArchetypeWeekendVibe(primaryArchetype),
          archetypeWeights: { [primaryArchetype]: 0.15 },
        },
        {
          id: 'b',
          text: getArchetypeWeekendVibe(secondaryArchetype),
          archetypeWeights: { [secondaryArchetype]: 0.15 },
        },
      ],
    });
  }

  // Enneagram confirmation questions
  if (primaryEnneagram && secondaryEnneagram && secondaryEnneagram.length > 0) {
    const primaryInfo = ENNEAGRAM_TYPE_INFO[primaryEnneagram];
    const secondaryInfo = ENNEAGRAM_TYPE_INFO[secondaryEnneagram[0]];

    questions.push({
      id: 'enneagram-confirm-1',
      text: `What drives you more at your core?`,
      context: `Type ${primaryEnneagram} vs Type ${secondaryEnneagram[0]}`,
      targetDimension: 'enneagram',
      answers: [
        {
          id: 'a',
          text: primaryInfo.coreDesire,
          enneagramWeights: { [primaryEnneagram]: 0.2 },
        },
        {
          id: 'b',
          text: secondaryInfo.coreDesire,
          enneagramWeights: { [secondaryEnneagram[0]]: 0.2 },
        },
      ],
    });

    questions.push({
      id: 'enneagram-confirm-2',
      text: `Which fear resonates more deeply?`,
      context: `Core fear identification`,
      targetDimension: 'enneagram',
      answers: [
        {
          id: 'a',
          text: primaryInfo.coreFear,
          enneagramWeights: { [primaryEnneagram]: 0.15 },
        },
        {
          id: 'b',
          text: secondaryInfo.coreFear,
          enneagramWeights: { [secondaryEnneagram[0]]: 0.15 },
        },
      ],
    });
  }

  // General trait refinement questions
  questions.push({
    id: 'trait-novelty',
    text: `How do you feel about trying completely new experiences?`,
    context: `Novelty seeking calibration`,
    targetDimension: 'trait',
    answers: [
      {
        id: 'a',
        text: 'I actively seek out the unfamiliar and unexplored',
        traitWeights: { noveltySeeking: 0.1, openness: 0.05 },
      },
      {
        id: 'b',
        text: 'I prefer familiar comfort with occasional surprises',
        traitWeights: { noveltySeeking: -0.1, conscientiousness: 0.05 },
      },
    ],
  });

  questions.push({
    id: 'trait-aesthetic',
    text: `When experiencing art or music, you typically:`,
    context: `Aesthetic sensitivity depth`,
    targetDimension: 'trait',
    answers: [
      {
        id: 'a',
        text: 'Feel it viscerally - it can move me to tears or chills',
        traitWeights: { aestheticSensitivity: 0.15 },
      },
      {
        id: 'b',
        text: 'Appreciate it intellectually - I analyze what makes it good',
        traitWeights: { aestheticSensitivity: -0.05, openness: 0.1 },
      },
    ],
  });

  // Return a subset based on what we need to disambiguate
  const maxQuestions = 5;
  return questions.slice(0, maxQuestions);
}

function getArchetypeWeekendVibe(archetype: ArchetypeId): string {
  const vibes: Record<ArchetypeId, string> = {
    vespyr: 'Contemplative solitude with deep reading or meditation',
    ignyx: 'High-energy adventure or pushing my limits',
    auryn: 'Creating beauty and sharing wisdom with others',
    prismae: 'Immersed in creative expression and artistic flow',
    solara: 'Leading a group activity or planning something big',
    crypta: 'Exploring mysteries or diving deep into research',
    vertex: 'Building something innovative or exploring new tech',
    fluxus: 'Connecting with diverse people and experiencing variety',
  };
  return vibes[archetype];
}

// =============================================================================
// Component
// =============================================================================

export function RefinementQuiz({
  primaryArchetype,
  secondaryArchetype,
  primaryEnneagram,
  secondaryEnneagram,
  initialConfidence,
  onComplete,
  onSkip,
}: RefinementQuizProps) {
  const questions = generateRefinementQuestions(
    primaryArchetype,
    secondaryArchetype,
    primaryEnneagram,
    secondaryEnneagram
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = useCallback((questionId: string, answerId: string) => {
    setAnswers((prev) => new Map(prev).set(questionId, answerId));
  }, []);

  const handleNext = useCallback(async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate refinement results
      setIsSubmitting(true);

      const archetypeAdjustments: Partial<Record<ArchetypeId, number>> = {};
      const enneagramAdjustments: Partial<Record<EnneagramType, number>> = {};
      const traitAdjustments: Partial<Record<string, number>> = {};

      for (const [questionId, answerId] of answers) {
        const question = questions.find((q) => q.id === questionId);
        if (!question) continue;

        const answer = question.answers.find((a) => a.id === answerId);
        if (!answer) continue;

        // Apply weights
        if (answer.archetypeWeights) {
          for (const [archetype, weight] of Object.entries(answer.archetypeWeights)) {
            const key = archetype as ArchetypeId;
            archetypeAdjustments[key] = (archetypeAdjustments[key] || 0) + (weight || 0);
          }
        }

        if (answer.enneagramWeights) {
          for (const [type, weight] of Object.entries(answer.enneagramWeights)) {
            const key = parseInt(type) as EnneagramType;
            enneagramAdjustments[key] = (enneagramAdjustments[key] || 0) + (weight || 0);
          }
        }

        if (answer.traitWeights) {
          for (const [trait, weight] of Object.entries(answer.traitWeights)) {
            traitAdjustments[trait] = (traitAdjustments[trait] || 0) + (weight || 0);
          }
        }
      }

      // Calculate confidence boost based on answer consistency
      const confidenceBoost = Math.min(0.15, answers.size * 0.03);

      await new Promise((resolve) => setTimeout(resolve, 500)); // Brief delay for UX

      onComplete({
        archetypeAdjustments,
        enneagramAdjustments,
        traitAdjustments,
        confidence: Math.min(1, initialConfidence + confidenceBoost),
      });
    }
  }, [currentIndex, questions, answers, initialConfidence, onComplete]);

  const currentAnswer = answers.get(currentQuestion?.id || '');

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-[400px] bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-400" />
          <span className="font-medium text-white">Refine Your Profile</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-400">
            {currentIndex + 1} / {questions.length}
          </span>
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-neutral-800">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Context badge */}
            <div className="flex justify-center">
              <span className="px-3 py-1 rounded-full bg-violet-500/20 text-xs text-violet-300">
                {currentQuestion.context}
              </span>
            </div>

            {/* Question text */}
            <h3 className="text-xl md:text-2xl font-light text-center text-white">
              {currentQuestion.text}
            </h3>

            {/* Answers */}
            <div className="grid gap-3">
              {currentQuestion.answers.map((answer) => (
                <button
                  key={answer.id}
                  onClick={() => handleAnswer(currentQuestion.id, answer.id)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    currentAnswer === answer.id
                      ? 'border-violet-500 bg-violet-500/10 text-white'
                      : 'border-neutral-700 hover:border-neutral-600 text-neutral-300 hover:text-white'
                  )}
                >
                  {answer.text}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-800 flex justify-end">
        <button
          onClick={handleNext}
          disabled={!currentAnswer || isSubmitting}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all',
            currentAnswer && !isSubmitting
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white'
              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Refining...
            </>
          ) : currentIndex === questions.length - 1 ? (
            <>
              <Sparkles className="w-4 h-4" />
              Complete
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default RefinementQuiz;
