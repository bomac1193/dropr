'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Share2, RefreshCw, Sparkles, LogIn, Trash2, LogOut } from 'lucide-react';
import { ARCHETYPES } from '@/lib/archetypes/config';
import { ArchetypeId, ARCHETYPE_IDS } from '@/lib/archetypes/types';
import { AuthModal, useAuth } from '@/components/auth';

interface ArchetypeResult {
  primaryArchetypeId: ArchetypeId;
  archetypeBlendWeights: Partial<Record<ArchetypeId, number>>;
  subtasteIndex: number;
  explorerScore: number;
  earlyAdopterScore: number;
  identityStatement: string;
  shareableHandle: string;
}

interface EnneagramResult {
  primaryType: number;
  wing: number | null;
  tritype: [number, number, number];
  confidence: number;
}

export default function ResultsPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [archetype, setArchetype] = useState<ArchetypeResult | null>(null);
  const [enneagram, setEnneagram] = useState<EnneagramResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    // Load results from localStorage
    const userId = localStorage.getItem('subtaste_user_id');
    const archetypeData = localStorage.getItem('subtaste_archetype');
    const enneagramData = localStorage.getItem('subtaste_enneagram');

    if (!userId || !archetypeData) {
      router.push('/quiz');
      return;
    }

    try {
      setArchetype(JSON.parse(archetypeData));
      if (enneagramData) {
        setEnneagram(JSON.parse(enneagramData));
      }
    } catch (e) {
      console.error('Failed to parse results:', e);
      router.push('/quiz');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleClearData = async () => {
    // Clear localStorage
    localStorage.removeItem('subtaste_user_id');
    localStorage.removeItem('subtaste_archetype');
    localStorage.removeItem('subtaste_enneagram');

    // If logged in, sign out
    if (user) {
      await signOut();
    }

    // Redirect to quiz
    router.push('/quiz');
  };

  const handleSignOut = async () => {
    await signOut();
    // Keep the results visible, just sign out
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Results are already saved via the quiz submission
    // The user is now logged in and their data persists
  };

  if (loading || authLoading || !archetype) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-12 h-12 text-violet-500 mx-auto" />
          </motion.div>
          <p className="text-neutral-500 mt-4">Loading your results...</p>
        </div>
      </div>
    );
  }

  const primaryConfig = ARCHETYPES[archetype.primaryArchetypeId];
  const primaryScore = archetype.archetypeBlendWeights[archetype.primaryArchetypeId] || 0;

  // Get secondary archetypes (top 2 after primary)
  const secondaryArchetypes = ARCHETYPE_IDS
    .filter(id => id !== archetype.primaryArchetypeId)
    .map(id => ({ id, weight: archetype.archetypeBlendWeights[id] || 0 }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 2);

  const handleShare = async () => {
    const shareText = `I'm ${primaryConfig.displayName} - ${primaryConfig.title} on Subtaste! ${primaryConfig.tagline}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `I'm ${primaryConfig.displayName} on Subtaste`,
          text: shareText,
          url: window.location.href,
        });
      } catch (e) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
    }
  };

  const handleRetake = () => {
    localStorage.removeItem('subtaste_archetype');
    localStorage.removeItem('subtaste_enneagram');
    router.push('/quiz');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">Your Taste DNA</h1>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-400">{user.email?.split('@')[0]}</span>
              <button
                onClick={handleSignOut}
                className="text-neutral-500 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </button>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Login prompt for non-authenticated users */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-violet-900/20 border border-violet-800/50 rounded-xl p-4 mb-6 text-center"
          >
            <p className="text-sm text-violet-300 mb-2">
              Sign in to save your results and access them anytime
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign in to save
            </button>
          </motion.div>
        )}

        {/* Primary Archetype Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 p-8 mb-6"
        >
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `linear-gradient(135deg, ${primaryConfig.colorPalette[0]} 0%, ${primaryConfig.colorPalette[2]} 100%)`
            }}
          />

          <div className="relative z-10">
            {/* Emoji & Name */}
            <div className="text-center mb-6">
              <span className="text-6xl mb-4 block">{primaryConfig.emoji}</span>
              <h2 className="text-4xl font-black tracking-tight mb-2">
                {primaryConfig.displayName}
              </h2>
              <p className="text-xl text-neutral-300">{primaryConfig.title}</p>
            </div>

            {/* Tagline */}
            <p className="text-center text-lg text-neutral-400 italic mb-6">
              "{primaryConfig.tagline}"
            </p>

            {/* Match Score */}
            <div className="flex justify-center mb-6">
              <div className="bg-neutral-800/50 rounded-full px-6 py-2">
                <span className="text-neutral-400 text-sm">Match: </span>
                <span className="text-white font-bold">
                  {Math.round(primaryScore * 100)}%
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-neutral-300 leading-relaxed text-center max-w-lg mx-auto">
              {primaryConfig.shortDescription}
            </p>
          </div>
        </motion.div>

        {/* Secondary Archetypes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3 text-center">
            Your Blend
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {secondaryArchetypes.map(({ id, weight }) => {
              const config = ARCHETYPES[id];
              return (
                <div
                  key={id}
                  className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-center"
                >
                  <span className="text-2xl mb-2 block">{config.emoji}</span>
                  <p className="font-semibold text-sm">{config.displayName}</p>
                  <p className="text-neutral-500 text-xs">{config.title}</p>
                  <p className="text-neutral-400 text-sm mt-1">
                    {Math.round(weight * 100)}%
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Viral Hook */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 border border-violet-800/50 rounded-xl p-6 mb-6 text-center"
        >
          <p className="text-lg font-medium text-white">
            {primaryConfig.viralHook}
          </p>
          <p className="text-sm text-violet-400 mt-2">
            {primaryConfig.shareableHandle}
          </p>
        </motion.div>

        {/* Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3 text-center">
            Your Aesthetic Keywords
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {[...primaryConfig.visualKeywords.slice(0, 4), ...primaryConfig.musicKeywords.slice(0, 4)].map((keyword, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-neutral-800/50 border border-neutral-700 rounded-full text-sm text-neutral-300"
              >
                {keyword}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Example Scenes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3 text-center">
            Your Scenes
          </h3>
          <div className="space-y-2">
            {primaryConfig.exampleScenes.map((scene, i) => (
              <div
                key={i}
                className="bg-neutral-900/30 border border-neutral-800 rounded-lg p-4 text-center text-neutral-300"
              >
                {scene}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Enneagram (if available) */}
        {enneagram && enneagram.primaryType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 mb-8"
          >
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3 text-center">
              Enneagram Profile
            </h3>
            <div className="text-center">
              <p className="text-2xl font-bold">
                Type {enneagram.primaryType}
                {enneagram.wing && <span className="text-neutral-400">w{enneagram.wing}</span>}
              </p>
              {enneagram.tritype && Array.isArray(enneagram.tritype) && (
                <p className="text-neutral-400 text-sm mt-1">
                  Tritype: {enneagram.tritype.join('-')}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all"
          >
            <Share2 className="w-5 h-5" />
            Share Your Archetype
          </button>

          <button
            onClick={handleRetake}
            className="w-full flex items-center justify-center gap-3 py-4 bg-neutral-800 rounded-xl text-neutral-300 hover:bg-neutral-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Retake Quiz
          </button>

          {/* Clear Data Button */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-center gap-3 py-3 text-neutral-500 hover:text-red-400 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear all my data
          </button>
        </motion.div>

        {/* Hashtags */}
        <div className="mt-8 text-center">
          <p className="text-neutral-600 text-sm">
            {primaryConfig.hashTags.join(' ')}
          </p>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode="login"
      />

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="text-xl font-bold mb-2">Clear all data?</h3>
            <p className="text-neutral-400 mb-6">
              This will delete your quiz results and sign you out. You'll need to retake the quiz to get new results.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 py-3 bg-red-600 rounded-xl hover:bg-red-500 transition-colors"
              >
                Clear Data
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
