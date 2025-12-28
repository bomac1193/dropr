'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

type LikertValue = 1 | 2 | 3 | 4 | 5;

interface LikertQuestion {
  id: string;
  text: string;
  trait: string;
  reversed?: boolean;
}

interface QuestionPage {
  title: string;
  subtitle?: string;
  questions: LikertQuestion[];
}

interface QuizAnswer {
  questionId: string;
  value: LikertValue;
}

interface ModernQuizProps {
  onComplete: (answers: QuizAnswer[], traits: Record<string, number>) => Promise<void>;
  onProgress?: (progress: number) => void;
}

// =============================================================================
// Question Bank - Organized by Page/Theme
// =============================================================================

const LIKERT_LABELS: Record<LikertValue, string> = {
  1: 'Strongly Disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly Agree',
};

const QUESTION_PAGES: QuestionPage[] = [
  {
    title: 'Your Inner World',
    subtitle: 'How you think and feel',
    questions: [
      { id: 'o1', text: 'I enjoy exploring abstract ideas and theories', trait: 'openness' },
      { id: 'o2', text: 'I get excited by new artistic experiences', trait: 'openness' },
      { id: 'c1', text: 'I prefer having a plan before starting something', trait: 'conscientiousness' },
      { id: 'n1', text: 'I often worry about things that might go wrong', trait: 'neuroticism' },
    ],
  },
  {
    title: 'Social Energy',
    subtitle: 'How you connect with others',
    questions: [
      { id: 'e1', text: 'I feel energized after spending time with groups of people', trait: 'extraversion' },
      { id: 'e2', text: 'I enjoy being the center of attention', trait: 'extraversion' },
      { id: 'a1', text: 'I tend to trust people easily', trait: 'agreeableness' },
      { id: 'a2', text: 'I prioritize harmony over being right', trait: 'agreeableness' },
    ],
  },
  {
    title: 'Aesthetic Sense',
    subtitle: 'What draws your eye and ear',
    questions: [
      { id: 'as1', text: 'I notice small details in art and design that others miss', trait: 'aestheticSensitivity' },
      { id: 'as2', text: 'Music can completely change my mood', trait: 'aestheticSensitivity' },
      { id: 'as3', text: 'I spend time curating how my spaces look and feel', trait: 'aestheticSensitivity' },
      { id: 'ns1', text: 'I actively seek out music and art I\'ve never experienced before', trait: 'noveltySeeking' },
    ],
  },
  {
    title: 'Taking Risks',
    subtitle: 'Your comfort with uncertainty',
    questions: [
      { id: 'rt1', text: 'I enjoy trying things even when the outcome is uncertain', trait: 'riskTolerance' },
      { id: 'rt2', text: 'I\'d rather take a chance than play it safe', trait: 'riskTolerance' },
      { id: 'ns2', text: 'I get bored easily with routine', trait: 'noveltySeeking' },
      { id: 'ns3', text: 'I\'m often the first among my friends to try new trends', trait: 'noveltySeeking' },
    ],
  },
  {
    title: 'Visual Preferences',
    subtitle: 'The aesthetics that speak to you',
    questions: [
      { id: 'v1', text: 'I\'m drawn to dark, moody visuals over bright ones', trait: 'darknessPreference' },
      { id: 'v2', text: 'I prefer minimalist design over maximalist', trait: 'minimalVsMaximal', reversed: true },
      { id: 'v3', text: 'I like organic, natural textures more than synthetic ones', trait: 'organicVsSynthetic', reversed: true },
      { id: 'v4', text: 'Complex, layered imagery appeals to me more than simple compositions', trait: 'complexityPreference' },
    ],
  },
  {
    title: 'Sound & Music',
    subtitle: 'Your sonic landscape',
    questions: [
      { id: 'm1', text: 'I prefer fast-paced, high-energy music', trait: 'tempoPreference' },
      { id: 'm2', text: 'I enjoy electronic/digital sounds more than acoustic', trait: 'acousticVsDigital' },
      { id: 'm3', text: 'I appreciate dissonance and unconventional harmonies in music', trait: 'harmonicDissonance' },
      { id: 'm4', text: 'I like music with strong, driving rhythms', trait: 'rhythmPreference' },
    ],
  },
  {
    title: 'Identity & Values',
    subtitle: 'What drives you',
    questions: [
      { id: 'i1', text: 'I define myself by my creative pursuits', trait: 'creativeIdentity' },
      { id: 'i2', text: 'Standing out from the crowd matters to me', trait: 'individualityPursuit' },
      { id: 'i3', text: 'I feel a strong need to express my authentic self', trait: 'authenticExpression' },
      { id: 'i4', text: 'I\'m drawn to subcultures and niche communities', trait: 'subcultureAffinity' },
    ],
  },
];

const TOTAL_QUESTIONS = QUESTION_PAGES.reduce((acc, page) => acc + page.questions.length, 0);

// =============================================================================
// Likert Scale Component
// =============================================================================

interface LikertScaleProps {
  value: LikertValue | null;
  onChange: (value: LikertValue) => void;
  questionId: string;
}

function LikertScale({ value, onChange, questionId }: LikertScaleProps) {
  return (
    <div className="flex items-center justify-between gap-2 mt-3">
      {([1, 2, 3, 4, 5] as LikertValue[]).map((val) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          className={cn(
            'flex-1 py-3 px-2 rounded-lg text-sm font-medium transition-all',
            'border-2',
            value === val
              ? 'bg-violet-600 border-violet-500 text-white scale-105'
              : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-600 hover:text-neutral-300'
          )}
          aria-label={LIKERT_LABELS[val]}
        >
          <span className="hidden sm:inline">{LIKERT_LABELS[val]}</span>
          <span className="sm:hidden">{val}</span>
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// Question Card Component
// =============================================================================

interface QuestionCardProps {
  question: LikertQuestion;
  index: number;
  value: LikertValue | null;
  onChange: (value: LikertValue) => void;
}

function QuestionCard({ question, index, value, onChange }: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6"
    >
      <p className="text-white text-lg mb-4">{question.text}</p>
      <LikertScale value={value} onChange={onChange} questionId={question.id} />
      <div className="flex justify-between text-xs text-neutral-600 mt-2 px-1">
        <span>Disagree</span>
        <span>Agree</span>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Main Quiz Component
// =============================================================================

export function ModernQuiz({ onComplete, onProgress }: ModernQuizProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, LikertValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const page = QUESTION_PAGES[currentPage];
  const totalPages = QUESTION_PAGES.length;

  // Calculate progress
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / TOTAL_QUESTIONS) * 100);

  // Check if current page is complete
  const pageComplete = page.questions.every((q) => answers[q.id] !== undefined);
  const isLastPage = currentPage === totalPages - 1;

  // Handle answer change
  const handleAnswerChange = useCallback((questionId: string, value: LikertValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    onProgress?.(Math.round(((Object.keys(answers).length + 1) / TOTAL_QUESTIONS) * 100));
  }, [answers, onProgress]);

  // Calculate trait scores from answers
  const calculateTraits = useCallback(() => {
    const traitSums: Record<string, { sum: number; count: number }> = {};

    for (const page of QUESTION_PAGES) {
      for (const question of page.questions) {
        const answer = answers[question.id];
        if (answer !== undefined) {
          const trait = question.trait;
          if (!traitSums[trait]) {
            traitSums[trait] = { sum: 0, count: 0 };
          }
          // Convert 1-5 to 0-1 scale, handling reversed questions
          let normalizedValue = (answer - 1) / 4;
          if (question.reversed) {
            normalizedValue = 1 - normalizedValue;
          }
          traitSums[trait].sum += normalizedValue;
          traitSums[trait].count += 1;
        }
      }
    }

    const traits: Record<string, number> = {};
    for (const [trait, { sum, count }] of Object.entries(traitSums)) {
      traits[trait] = count > 0 ? sum / count : 0.5;
    }

    return traits;
  }, [answers]);

  // Handle next page
  const handleNext = useCallback(async () => {
    if (isLastPage && pageComplete) {
      setIsSubmitting(true);
      const traits = calculateTraits();
      const answerArray: QuizAnswer[] = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));
      await onComplete(answerArray, traits);
      setIsSubmitting(false);
    } else if (pageComplete) {
      setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    }
  }, [isLastPage, pageComplete, calculateTraits, answers, onComplete, totalPages]);

  // Handle previous page
  const handlePrev = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }, []);

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-12 h-12 text-violet-500" />
        </motion.div>
        <p className="mt-4 text-neutral-400">Analyzing your taste profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-800">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">
              Page {currentPage + 1} of {totalPages}
            </span>
            <span className="text-sm text-neutral-400">{progress}% complete</span>
          </div>
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Page Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{page.title}</h2>
              {page.subtitle && (
                <p className="text-neutral-400">{page.subtitle}</p>
              )}
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {page.questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  value={answers[question.id] ?? null}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-950/80 backdrop-blur-sm border-t border-neutral-800">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all',
              currentPage === 0
                ? 'text-neutral-600 cursor-not-allowed'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            )}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!pageComplete}
            className={cn(
              'flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all',
              pageComplete
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            )}
          >
            {isLastPage ? 'Get My Results' : 'Continue'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModernQuiz;
