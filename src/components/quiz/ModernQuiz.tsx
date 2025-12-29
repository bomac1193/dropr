'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
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
// POLARIZING QUESTION BANK - High Signal Questions
// =============================================================================

// Each trait has 6-8 questions, we randomly select 2-3 per trait
const QUESTION_POOL: Record<string, LikertQuestion[]> = {
  // OPENNESS - Intellectual curiosity, artistic interest, unconventional thinking
  openness: [
    { id: 'o1', text: "I'd rather watch a confusing art film than a crowd-pleaser", trait: 'openness' },
    { id: 'o2', text: "Most \"classic\" art is overrated—the interesting stuff is happening now", trait: 'openness' },
    { id: 'o3', text: "I've gone down Wikipedia rabbit holes for hours on topics nobody cares about", trait: 'openness' },
    { id: 'o4', text: "If I can't explain why I like something, that makes me like it more", trait: 'openness' },
    { id: 'o5', text: "I judge people who only consume mainstream content", trait: 'openness' },
    { id: 'o6', text: "My taste has changed so drastically that past-me would hate current-me's favorites", trait: 'openness' },
    { id: 'o7', text: "I'm attracted to things specifically because they're weird", trait: 'openness' },
  ],

  // CONSCIENTIOUSNESS - Organization, deliberation, self-discipline
  conscientiousness: [
    { id: 'c1', text: "I have a system for organizing my music/photos/files that others would find obsessive", trait: 'conscientiousness' },
    { id: 'c2', text: "I finish albums/series even when I'm not enjoying them", trait: 'conscientiousness' },
    { id: 'c3', text: "I research things extensively before committing—restaurants, shows, purchases", trait: 'conscientiousness' },
    { id: 'c4', text: "Messy creative spaces stress me out more than inspire me", trait: 'conscientiousness' },
    { id: 'c5', text: "I'd rather have fewer things I love than many things I sort of like", trait: 'conscientiousness' },
    { id: 'c6', text: "I make lists of things to watch/listen to/read and actually follow them", trait: 'conscientiousness' },
  ],

  // EXTRAVERSION - Social energy, stimulation-seeking, assertiveness
  extraversion: [
    { id: 'e1', text: "A perfect Friday night involves other people, period", trait: 'extraversion' },
    { id: 'e2', text: "I've been told I have 'main character energy'", trait: 'extraversion' },
    { id: 'e3', text: "Silence in a group conversation is my cue to fill it", trait: 'extraversion' },
    { id: 'e4', text: "I get restless if I haven't left my house in two days", trait: 'extraversion' },
    { id: 'e5', text: "I've introduced friends to each other specifically so they could date", trait: 'extraversion' },
    { id: 'e6', text: "I perform differently when I know I'm being watched—and I like it", trait: 'extraversion' },
    { id: 'e7', text: "My ideal vacation involves meeting strangers, not avoiding them", trait: 'extraversion' },
  ],

  // AGREEABLENESS - Empathy, cooperation, conflict avoidance
  agreeableness: [
    { id: 'a1', text: "I've pretended to like something because someone I cared about loved it", trait: 'agreeableness' },
    { id: 'a2', text: "Being right isn't worth making someone feel stupid", trait: 'agreeableness' },
    { id: 'a3', text: "I physically cringe during awkward scenes in movies", trait: 'agreeableness' },
    { id: 'a4', text: "I've stayed friends with people I don't particularly like to keep the peace", trait: 'agreeableness' },
    { id: 'a5', text: "I apologize even when I don't think I did anything wrong", trait: 'agreeableness' },
    { id: 'a6', text: "Competitive games stress me out—I feel bad when others lose", trait: 'agreeableness' },
  ],

  // NEUROTICISM - Emotional volatility, anxiety, sensitivity to negative
  neuroticism: [
    { id: 'n1', text: "I've ruined my own mood by imagining worst-case scenarios", trait: 'neuroticism' },
    { id: 'n2', text: "Small criticisms can derail my entire day", trait: 'neuroticism' },
    { id: 'n3', text: "I replay embarrassing moments from years ago like they happened yesterday", trait: 'neuroticism' },
    { id: 'n4', text: "I've canceled plans because my mental state felt too fragile", trait: 'neuroticism' },
    { id: 'n5', text: "Sad songs comfort me more than happy ones", trait: 'neuroticism' },
    { id: 'n6', text: "I notice when someone's energy shifts before they say anything", trait: 'neuroticism' },
  ],

  // NOVELTY SEEKING - Trend hunting, early adoption, boredom with familiar
  noveltySeeking: [
    { id: 'ns1', text: "I lose interest in things specifically because they've become popular", trait: 'noveltySeeking' },
    { id: 'ns2', text: "I'd rather try something new and hate it than revisit something I know I love", trait: 'noveltySeeking' },
    { id: 'ns3', text: "My friends come to me to find out what's next", trait: 'noveltySeeking' },
    { id: 'ns4', text: "I've abandoned entire platforms when they got too mainstream", trait: 'noveltySeeking' },
    { id: 'ns5', text: "Nostalgia feels like a trap—I'm allergic to 'remember when'", trait: 'noveltySeeking' },
    { id: 'ns6', text: "I check Bandcamp/SoundCloud/obscure blogs more than Spotify's main page", trait: 'noveltySeeking' },
    { id: 'ns7', text: "Being 'early' to something is part of my identity", trait: 'noveltySeeking' },
  ],

  // AESTHETIC SENSITIVITY - Deep aesthetic response, beauty appreciation
  aestheticSensitivity: [
    { id: 'as1', text: "Ugly design physically bothers me—bad fonts, clashing colors, poor spacing", trait: 'aestheticSensitivity' },
    { id: 'as2', text: "I've cried or felt chills from a piece of music or art", trait: 'aestheticSensitivity' },
    { id: 'as3', text: "I notice when a photo is slightly off-center and it bothers me", trait: 'aestheticSensitivity' },
    { id: 'as4', text: "I've chosen the worse option because the better one looked ugly", trait: 'aestheticSensitivity' },
    { id: 'as5', text: "I spend money on things purely for how they look, not function", trait: 'aestheticSensitivity' },
    { id: 'as6', text: "A perfectly curated Instagram grid matters to me (or did when I used it)", trait: 'aestheticSensitivity' },
  ],

  // RISK TOLERANCE - Comfort with uncertainty, gambling instinct
  riskTolerance: [
    { id: 'rt1', text: "I've made major life decisions on gut feeling alone", trait: 'riskTolerance' },
    { id: 'rt2', text: "Job security matters less to me than doing something exciting", trait: 'riskTolerance' },
    { id: 'rt3', text: "I've invested in things purely because they seemed wild", trait: 'riskTolerance' },
    { id: 'rt4', text: "I'd rather fail spectacularly than succeed boringly", trait: 'riskTolerance' },
    { id: 'rt5', text: "I've said yes to things without knowing what I was agreeing to", trait: 'riskTolerance' },
    { id: 'rt6', text: "My best experiences came from plans that fell apart", trait: 'riskTolerance' },
  ],

  // DARKNESS PREFERENCE - Drawn to shadow, moodiness, night
  darknessPreference: [
    { id: 'd1', text: "I'm more productive and creative after midnight", trait: 'darknessPreference' },
    { id: 'd2', text: "Bright, cheerful aesthetics feel naive or cheap to me", trait: 'darknessPreference' },
    { id: 'd3', text: "I'm drawn to stories where the villain is more interesting than the hero", trait: 'darknessPreference' },
    { id: 'd4', text: "Overcast days are more beautiful than sunny ones", trait: 'darknessPreference' },
    { id: 'd5', text: "I'd rather a space feel moody than welcoming", trait: 'darknessPreference' },
    { id: 'd6', text: "Happy endings feel less honest than ambiguous ones", trait: 'darknessPreference' },
  ],

  // COMPLEXITY PREFERENCE - Layered, dense, intricate vs simple
  complexityPreference: [
    { id: 'cx1', text: "I respect art more when I don't fully understand it at first", trait: 'complexityPreference' },
    { id: 'cx2', text: "Maximalism > minimalism. More is more.", trait: 'complexityPreference' },
    { id: 'cx3', text: "I'm drawn to cluttered, chaotic visual compositions", trait: 'complexityPreference' },
    { id: 'cx4', text: "Songs that take multiple listens to 'get' are usually better", trait: 'complexityPreference' },
    { id: 'cx5', text: "I find 'clean' design boring—give me texture and noise", trait: 'complexityPreference' },
    { id: 'cx6', text: "I like when things have hidden details you only notice later", trait: 'complexityPreference' },
  ],

  // ORGANIC VS SYNTHETIC - Natural/analog vs digital/artificial
  organicVsSynthetic: [
    { id: 'os1', text: "I prefer the imperfections of analog over digital perfection", trait: 'organicVsSynthetic', reversed: true },
    { id: 'os2', text: "Grain, dust, and scratches add character—don't clean them up", trait: 'organicVsSynthetic', reversed: true },
    { id: 'os3', text: "I'm drawn to spaces with plants more than sleek modern furniture", trait: 'organicVsSynthetic', reversed: true },
    { id: 'os4', text: "AI-generated art is just as valid as human-made art", trait: 'organicVsSynthetic' },
    { id: 'os5', text: "Synthesizers and drum machines beat acoustic instruments", trait: 'organicVsSynthetic' },
    { id: 'os6', text: "I prefer digital/CGI aesthetics over practical effects", trait: 'organicVsSynthetic' },
  ],

  // TEMPO/ENERGY - Fast/intense vs slow/calm preference
  tempoPreference: [
    { id: 't1', text: "I need music to be at least 120 BPM to feel energized by it", trait: 'tempoPreference' },
    { id: 't2', text: "Slow movies test my patience—I usually speed them up", trait: 'tempoPreference' },
    { id: 't3', text: "I love the feeling of being overwhelmed by intensity", trait: 'tempoPreference' },
    { id: 't4', text: "Silence in media is wasted time", trait: 'tempoPreference' },
    { id: 't5', text: "Ambient/drone music puts me to sleep (negatively)", trait: 'tempoPreference' },
    { id: 't6', text: "A track needs to 'hit' within the first 30 seconds or I skip", trait: 'tempoPreference' },
  ],

  // HARMONIC DISSONANCE - Tension, discord, unconventional harmony
  harmonicDissonance: [
    { id: 'h1', text: "I actively enjoy music that sounds 'wrong' or unresolved", trait: 'harmonicDissonance' },
    { id: 'h2', text: "Harsh noise/industrial has beauty that clean pop can't touch", trait: 'harmonicDissonance' },
    { id: 'h3', text: "I like when visuals or sounds clash and create tension", trait: 'harmonicDissonance' },
    { id: 'h4', text: "Autotune used as an obvious effect is more interesting than 'natural' vocals", trait: 'harmonicDissonance' },
    { id: 'h5', text: "I've recommended things to people knowing they'd probably hate them", trait: 'harmonicDissonance' },
    { id: 'h6', text: "The most interesting music makes you slightly uncomfortable", trait: 'harmonicDissonance' },
  ],

  // ACOUSTIC VS DIGITAL
  acousticVsDigital: [
    { id: 'ad1', text: "Electronic production is more innovative than live instruments", trait: 'acousticVsDigital' },
    { id: 'ad2', text: "I'd rather hear a laptop performance than a band", trait: 'acousticVsDigital' },
    { id: 'ad3', text: "Virtual/digital experiences can be as meaningful as physical ones", trait: 'acousticVsDigital' },
    { id: 'ad4', text: "I don't care if music is made by a person or an algorithm", trait: 'acousticVsDigital' },
    { id: 'ad5', text: "The 'warmth' of vinyl is just romanticized distortion", trait: 'acousticVsDigital' },
    { id: 'ad6', text: "I prefer synthesized/sampled textures over recorded acoustic ones", trait: 'acousticVsDigital' },
  ],

  // RHYTHM PREFERENCE
  rhythmPreference: [
    { id: 'r1', text: "I judge music primarily by its drums/rhythm section", trait: 'rhythmPreference' },
    { id: 'r2', text: "Complex polyrhythms and odd time signatures excite me", trait: 'rhythmPreference' },
    { id: 'r3', text: "I've specifically sought out music from other cultures for their rhythms", trait: 'rhythmPreference' },
    { id: 'r4', text: "I can't help but move when I hear a good beat—it's involuntary", trait: 'rhythmPreference' },
    { id: 'r5', text: "A song with a weak beat can't be saved by good melody", trait: 'rhythmPreference' },
    { id: 'r6', text: "I notice and appreciate when music plays with my rhythmic expectations", trait: 'rhythmPreference' },
  ],
};

// Page themes for organizing the quiz
const PAGE_THEMES = [
  { title: 'How You Think', subtitle: 'Your mental wiring', traits: ['openness', 'conscientiousness'] },
  { title: 'Social Voltage', subtitle: 'How you charge up', traits: ['extraversion', 'agreeableness'] },
  { title: 'Emotional Weather', subtitle: 'Your inner climate', traits: ['neuroticism', 'noveltySeeking'] },
  { title: 'Sensory Appetite', subtitle: 'What your senses crave', traits: ['aestheticSensitivity', 'riskTolerance'] },
  { title: 'Light & Shadow', subtitle: 'Your visual temperature', traits: ['darknessPreference', 'complexityPreference'] },
  { title: 'Texture & Form', subtitle: 'Organic or synthetic?', traits: ['organicVsSynthetic', 'tempoPreference'] },
  { title: 'Sonic DNA', subtitle: 'How you hear the world', traits: ['harmonicDissonance', 'acousticVsDigital', 'rhythmPreference'] },
];

// =============================================================================
// Question Selection & Randomization
// =============================================================================

function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentIndex = shuffled.length;

  // Simple seeded random for consistency within a session
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  while (currentIndex > 0) {
    const randomIndex = Math.floor(seededRandom() * currentIndex);
    currentIndex--;
    [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
  }

  return shuffled;
}

function selectQuestionsForSession(seed: number): QuestionPage[] {
  const pages: QuestionPage[] = [];

  for (const theme of PAGE_THEMES) {
    const pageQuestions: LikertQuestion[] = [];

    for (const trait of theme.traits) {
      const pool = QUESTION_POOL[trait] || [];
      const shuffled = shuffleArray(pool, seed + trait.charCodeAt(0));
      // Select 2 questions per trait
      pageQuestions.push(...shuffled.slice(0, 2));
    }

    // Shuffle questions within the page
    const shuffledPageQuestions = shuffleArray(pageQuestions, seed + theme.title.charCodeAt(0));

    pages.push({
      title: theme.title,
      subtitle: theme.subtitle,
      questions: shuffledPageQuestions,
    });
  }

  return pages;
}

// =============================================================================
// Likert Scale Component
// =============================================================================

const LIKERT_LABELS: Record<LikertValue, string> = {
  1: 'Hard No',
  2: 'Nah',
  3: 'Meh',
  4: 'Yeah',
  5: 'So True',
};

interface LikertScaleProps {
  value: LikertValue | null;
  onChange: (value: LikertValue) => void;
  questionId: string;
}

function LikertScale({ value, onChange, questionId }: LikertScaleProps) {
  return (
    <div className="flex items-center justify-between gap-2 mt-4">
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
      <p className="text-white text-lg leading-relaxed">{question.text}</p>
      <LikertScale value={value} onChange={onChange} questionId={question.id} />
      <div className="flex justify-between text-xs text-neutral-600 mt-2 px-1">
        <span>Not me</span>
        <span>So me</span>
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

  // Generate session seed once on mount (ensures same questions for retry within session)
  const [sessionSeed] = useState(() => Math.floor(Math.random() * 1000000));

  // Generate randomized questions for this session
  const questionPages = useMemo(() => selectQuestionsForSession(sessionSeed), [sessionSeed]);

  const page = questionPages[currentPage];
  const totalPages = questionPages.length;
  const totalQuestions = questionPages.reduce((acc, p) => acc + p.questions.length, 0);

  // Calculate progress
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  // Check if current page is complete
  const pageComplete = page.questions.every((q) => answers[q.id] !== undefined);
  const isLastPage = currentPage === totalPages - 1;

  // Handle answer change
  const handleAnswerChange = useCallback((questionId: string, value: LikertValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    onProgress?.(Math.round(((Object.keys(answers).length + 1) / totalQuestions) * 100));
  }, [answers, onProgress, totalQuestions]);

  // Calculate trait scores from answers
  const calculateTraits = useCallback(() => {
    const traitSums: Record<string, { sum: number; count: number }> = {};

    for (const page of questionPages) {
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
  }, [answers, questionPages]);

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
        <p className="mt-4 text-neutral-400">Mapping your taste DNA...</p>
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
              {currentPage + 1} / {totalPages}
            </span>
            <span className="text-sm text-neutral-400">{progress}%</span>
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
            {isLastPage ? 'See My Results' : 'Next'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModernQuiz;
