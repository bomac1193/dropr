'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ResultSummaryCard } from '@/components/results/ResultSummaryCard';
import { ResultDetailsAccordion } from '@/components/results/ResultDetailsAccordion';
import { FullResult } from '@/lib/types/results';

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<FullResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      const userId = localStorage.getItem('subtaste_user_id');
      if (!userId) {
        router.push('/quiz');
        return;
      }

      try {
        // Recompute profile with latest interactions
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();

        if (data.success && data.result) {
          setResult(data.result);
        } else {
          // Fall back to stored result or generate demo
          setResult(generateDemoResult());
        }
      } catch (err) {
        console.error('Failed to fetch results:', err);
        // Use demo data for development
        setResult(generateDemoResult());
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [router]);

  const handleSceneClick = (scene: string) => {
    console.log('Scene clicked:', scene);
    // Could navigate to filtered content or generate prompts
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-600 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Computing your constellation...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Failed to load results'}</p>
          <button
            onClick={() => router.push('/quiz')}
            className="px-6 py-2 bg-violet-600 rounded-lg hover:bg-violet-500 transition-colors"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-800 px-6 py-4">
        <h1 className="text-xl font-semibold text-center">Your Subtaste Profile</h1>
      </header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto px-4 py-6 space-y-6"
      >
        {/* Summary Card */}
        <ResultSummaryCard summary={result.summary} onSceneClick={handleSceneClick} />

        {/* Details Accordion */}
        <div className="pt-4">
          <h2 className="text-lg font-medium mb-4 text-center text-neutral-400">
            Deep Dive
          </h2>
          <ResultDetailsAccordion details={result.details} />
        </div>

        {/* Action buttons */}
        <div className="pt-8 flex flex-col gap-3">
          <button
            onClick={() => router.push('/feed')}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all"
          >
            Explore Your Feed
          </button>
          <button
            onClick={() => router.push('/swipe')}
            className="w-full py-3 bg-neutral-800 rounded-xl text-neutral-300 hover:bg-neutral-700 transition-colors"
          >
            Refine with More Swipes
          </button>
          <button
            onClick={() => {
              // Share functionality
              if (navigator.share) {
                navigator.share({
                  title: `I'm ${result.summary.primaryName} on Subtaste`,
                  text: result.summary.tagline,
                  url: window.location.href,
                });
              }
            }}
            className="w-full py-3 bg-neutral-800 rounded-xl text-neutral-300 hover:bg-neutral-700 transition-colors"
          >
            Share Your Constellation
          </button>
        </div>
      </motion.div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-neutral-950/80 backdrop-blur-lg border-t border-neutral-800 px-6 py-4">
        <div className="flex justify-around max-w-md mx-auto">
          <button
            onClick={() => router.push('/swipe')}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            Swipe
          </button>
          <button
            onClick={() => router.push('/feed')}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            Feed
          </button>
          <button className="text-violet-400 font-medium">Profile</button>
        </div>
      </nav>
    </div>
  );
}

/**
 * Generate demo result for development/demo purposes
 */
function generateDemoResult(): FullResult {
  return {
    summary: {
      primaryConstellationId: 'somnexis',
      primaryName: 'Somnexis',
      tagline:
        'Dreamy and introspective, drawn to liminal spaces and hazy aesthetics. You find beauty in the threshold between waking and sleeping.',
      keyScores: {
        subtasteIndex: 72,
        explorerScore: 68,
        earlyAdopterScore: 61,
      },
      topScenes: [
        'Somnexis club night: fog machines and slowed-down tracks',
        'Somnexis AI cover art: dreamlike portraits with soft blur',
        'Somnexis bedroom setup: fairy lights and gauze curtains',
      ],
    },
    details: {
      personality: {
        traits: {
          openness: 0.82,
          conscientiousness: 0.45,
          extraversion: 0.32,
          agreeableness: 0.68,
          neuroticism: 0.55,
          noveltySeeking: 0.71,
          aestheticSensitivity: 0.89,
          riskTolerance: 0.48,
        },
        narrative:
          'You are deeply curious, highly attuned to beauty, drawn to the new and unexplored, introspective and internally rich. This aligns with Somnexis\'s essence of hazy and soft-focus aesthetics.',
      },
      aesthetic: {
        visualSliders: {
          darkToBright: 0.35,
          minimalToMaximal: 0.45,
          organicToSynthetic: 0.4,
        },
        musicSliders: {
          slowToFast: 0.25,
          softToIntense: 0.35,
          acousticToDigital: 0.55,
        },
        narrative:
          'Your aesthetic DNA centers on moody, dark visuals, layered complexity. Sonically, you gravitate toward slow, contemplative tempos, electronic production. This maps to Somnexis\'s profile: ambient, slow, ethereal.',
      },
      subculture: {
        topConstellations: [
          {
            id: 'somnexis',
            name: 'Somnexis',
            affinityScore: 85,
            earlyAdopterScore: 61,
            summary: 'Dreamy and introspective, drawn to liminal spaces.',
          },
          {
            id: 'astryde',
            name: 'Astryde',
            affinityScore: 68,
            earlyAdopterScore: 55,
            summary: 'Cosmic and vast, drawn to space aesthetics.',
          },
          {
            id: 'chromyne',
            name: 'Chromyne',
            affinityScore: 62,
            earlyAdopterScore: 58,
            summary: 'Color-synesthetic and sensation-driven.',
          },
          {
            id: 'obscyra',
            name: 'Obscyra',
            affinityScore: 55,
            earlyAdopterScore: 52,
            summary: 'Refined darkness with theatrical flair.',
          },
          {
            id: 'opalith',
            name: 'Opalith',
            affinityScore: 48,
            earlyAdopterScore: 45,
            summary: 'Subtle and shifting, drawn to iridescence.',
          },
        ],
        narrative:
          'Your taste constellation centers on Somnexis, with threads connecting to Somnexis, Astryde, Chromyne. You\'re likely to resonate with scenes like Somnexis club night.',
      },
      prompts: {
        creativeHooks: [
          'Design a Somnexis-inspired room',
          'Create a Somnexis mood playlist',
          'Generate Somnexis AI artwork: hazy, soft-focus',
          'Style a Somnexis look for Somnexis club night',
        ],
        contentPrompts: [
          'Find more hazy imagery',
          'Discover ambient music',
          'Explore darker, moodier aesthetics',
          'Explore Somnexis-adjacent constellations',
        ],
      },
    },
  };
}
