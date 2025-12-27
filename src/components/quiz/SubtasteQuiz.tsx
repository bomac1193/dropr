'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { quizQuestions, QuizQuestion, QuizAnswer } from '@/lib/quiz/questions';
import { QuizResponses } from '@/lib/quiz/processor';
import { cn } from '@/lib/utils';

interface SubtasteQuizProps {
  onComplete: (responses: QuizResponses) => Promise<void>;
  onPreliminaryResult?: (constellation: string) => void;
}

export function SubtasteQuiz({ onComplete, onPreliminaryResult }: SubtasteQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<QuizResponses>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for back

  const currentQuestion = quizQuestions[currentIndex];
  const totalQuestions = quizQuestions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleAnswer = useCallback(
    (answerId: string) => {
      setResponses((prev) => ({
        ...prev,
        [currentQuestion.id]: answerId,
      }));
    },
    [currentQuestion]
  );

  const handleNext = useCallback(async () => {
    if (!responses[currentQuestion.id]) return;

    if (currentIndex < totalQuestions - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Submit quiz
      setIsSubmitting(true);
      try {
        await onComplete(responses);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [currentIndex, currentQuestion, responses, totalQuestions, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const selectedAnswer = responses[currentQuestion.id];
  const canProceed = !!selectedAnswer;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-neutral-800">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Progress indicator */}
      <div className="pt-6 px-6 flex justify-between items-center text-sm text-neutral-500">
        <span>
          {currentIndex + 1} of {totalQuestions}
        </span>
        <span className="text-neutral-600">Subtaste Test</span>
      </div>

      {/* Question content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <QuestionDisplay
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              onSelect={handleAnswer}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-6 flex justify-between items-center border-t border-neutral-800">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
            currentIndex === 0
              ? 'text-neutral-600 cursor-not-allowed'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className={cn(
            'flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all',
            canProceed && !isSubmitting
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white'
              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : currentIndex === totalQuestions - 1 ? (
            'Complete'
          ) : (
            <>
              Next
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

interface QuestionDisplayProps {
  question: QuizQuestion;
  selectedAnswer: string | undefined;
  onSelect: (answerId: string) => void;
}

function QuestionDisplay({ question, selectedAnswer, onSelect }: QuestionDisplayProps) {
  return (
    <div className="space-y-8">
      {/* Question text */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-light">{question.text}</h2>
        {question.subtext && <p className="text-neutral-500">{question.subtext}</p>}
      </div>

      {/* Answers */}
      <div
        className={cn(
          'grid gap-4',
          question.type === 'ab' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'
        )}
      >
        {question.answers.map((answer) => (
          <AnswerOption
            key={answer.id}
            answer={answer}
            questionType={question.type}
            isSelected={selectedAnswer === answer.id}
            onSelect={() => onSelect(answer.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface AnswerOptionProps {
  answer: QuizAnswer;
  questionType: QuizQuestion['type'];
  isSelected: boolean;
  onSelect: () => void;
}

function AnswerOption({ answer, questionType, isSelected, onSelect }: AnswerOptionProps) {
  if (questionType === 'image') {
    return (
      <button
        onClick={onSelect}
        className={cn(
          'relative aspect-square rounded-xl overflow-hidden border-2 transition-all',
          isSelected
            ? 'border-violet-500 ring-2 ring-violet-500/30 scale-[1.02]'
            : 'border-neutral-800 hover:border-neutral-600'
        )}
      >
        {/* Placeholder for image - in production, use next/image */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br flex items-end justify-center p-4',
            answer.id.includes('forest') && 'from-emerald-900/50 to-neutral-900',
            answer.id.includes('neon') && 'from-purple-900/50 to-neutral-900',
            answer.id.includes('geometric') && 'from-blue-900/50 to-neutral-900',
            answer.id.includes('nebula') && 'from-indigo-900/50 to-neutral-900',
            answer.id.includes('ritual') && 'from-orange-900/50 to-neutral-900',
            answer.id.includes('brutalist') && 'from-neutral-700/50 to-neutral-900',
            answer.id.includes('iridescent') && 'from-pink-900/50 to-neutral-900',
            answer.id.includes('golden') && 'from-amber-900/50 to-neutral-900'
          )}
        >
          <span className="text-sm text-neutral-300 text-center">{answer.text}</span>
        </div>
        {isSelected && (
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onSelect}
      className={cn(
        'p-5 rounded-xl border-2 text-left transition-all',
        isSelected
          ? 'border-violet-500 bg-violet-500/10 text-white'
          : 'border-neutral-800 hover:border-neutral-600 text-neutral-300 hover:text-white'
      )}
    >
      <span className="text-lg">{answer.text}</span>
    </button>
  );
}

export default SubtasteQuiz;
