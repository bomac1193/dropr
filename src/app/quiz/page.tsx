'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { SubtasteQuiz } from '@/components/quiz';
import { AuthModal, useAuth } from '@/components/auth';
import { ScoringResult } from '@/lib/quiz/scoring';
import { UserPriorData } from '@/lib/quiz/adaptive-selection';
import { User, LogIn, ArrowRight } from 'lucide-react';

export default function QuizPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPreQuizAuth, setShowPreQuizAuth] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [priorData, setPriorData] = useState<UserPriorData | undefined>();
  const [submittedUserId, setSubmittedUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load prior data for returning users
  useEffect(() => {
    if (user) {
      const sessionCount = parseInt(localStorage.getItem('subtaste_session_count') || '0', 10);
      setPriorData({ sessionCount });
    }
  }, [user]);

  // After auth success, navigate to results (profile already saved)
  useEffect(() => {
    if (user && submittedUserId && !showAuthModal) {
      // User just signed in after quiz - go to results
      router.push('/results');
    }
  }, [user, submittedUserId, showAuthModal, router]);

  const submitQuiz = useCallback(async (scoringResult: ScoringResult, userId?: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          scoringResult,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user ID in localStorage for subsequent requests
        localStorage.setItem('subtaste_user_id', data.userId);
        setSubmittedUserId(data.userId);

        // Increment session count
        const currentCount = parseInt(localStorage.getItem('subtaste_session_count') || '0', 10);
        localStorage.setItem('subtaste_session_count', String(currentCount + 1));

        return data.userId;
      } else {
        console.error('Quiz submission failed:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handleComplete = async (scoringResult: ScoringResult) => {
    if (user) {
      // User is already authenticated, submit and go to results
      const userId = await submitQuiz(scoringResult, user.id);
      if (userId) {
        router.push('/results');
      }
    } else {
      // Anonymous user - submit first, then offer sign-in
      const userId = await submitQuiz(scoringResult);
      if (userId) {
        // Show auth modal - user can sign in or skip to results
        setShowAuthModal(true);
      }
    }
  };

  const handleAuthSuccess = () => {
    // Close modal - the useEffect will handle navigation after user state updates
    setShowAuthModal(false);
    // Navigate to results immediately since profile is already saved
    router.push('/results');
  };

  const handleSkipAuth = () => {
    setShowAuthModal(false);
    // Profile already saved, just go to results
    router.push('/results');
  };

  const handlePreliminaryResult = (constellation: string, confidence: number) => {
    console.log(`Preliminary: ${constellation} at ${Math.round(confidence * 100)}% confidence`);
  };

  const handlePreQuizAuthSuccess = () => {
    setShowPreQuizAuth(false);
    setQuizStarted(true);
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleLoginFirst = () => {
    setShowPreQuizAuth(true);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-600 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Show loading while submitting
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-600 border-t-violet-500 rounded-full animate-spin" />
        <p className="mt-4 text-neutral-400">Saving your constellation...</p>
      </div>
    );
  }

  // Pre-quiz screen - show login option before starting (only for non-logged-in users)
  if (!quizStarted && !user) {
    return (
      <>
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Ready to discover your taste?
            </h1>
            <p className="text-neutral-400 mb-8">
              Take the Subtaste quiz to find your unique aesthetic constellation.
            </p>

            {/* Start Quiz Button */}
            <button
              onClick={handleStartQuiz}
              className="w-full group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full font-semibold text-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 mb-4"
            >
              Start Quiz
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-neutral-950 text-neutral-500">or</span>
              </div>
            </div>

            {/* Login First Button */}
            <button
              onClick={handleLoginFirst}
              className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-neutral-900 border border-neutral-700 rounded-full font-semibold text-lg hover:bg-neutral-800 hover:border-neutral-600 transition-all"
            >
              <LogIn className="w-5 h-5" />
              Sign in first to save your results
            </button>

            <p className="text-neutral-600 text-sm mt-6">
              Signing in lets you save your profile and retake the quiz anytime.
            </p>
          </div>
        </div>

        {/* Pre-quiz auth modal */}
        <AuthModal
          isOpen={showPreQuizAuth}
          onClose={() => setShowPreQuizAuth(false)}
          onSuccess={handlePreQuizAuthSuccess}
          initialMode="login"
        />
      </>
    );
  }

  return (
    <>
      <SubtasteQuiz
        onComplete={handleComplete}
        onPreliminaryResult={handlePreliminaryResult}
        userId={user?.id}
        priorData={priorData}
      />

      {/* Auth modal - shown after quiz completion for anonymous users */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleSkipAuth}
        onSuccess={handleAuthSuccess}
        initialMode="signup"
      />

      {/* Skip auth option */}
      {showAuthModal && (
        <div className="fixed bottom-8 left-0 right-0 text-center z-50">
          <button
            onClick={handleSkipAuth}
            className="text-neutral-400 hover:text-white transition-colors underline"
          >
            Continue without account
          </button>
        </div>
      )}
    </>
  );
}
