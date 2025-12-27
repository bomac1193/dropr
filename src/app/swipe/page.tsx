'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { SwipeDeck, SwipeInteraction } from '@/components/swipe';
import { ContentItem } from '@/lib/types/models';
import { getConstellationById } from '@/lib/constellations';

function SwipeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teaser = searchParams.get('teaser');

  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTeaser, setShowTeaser] = useState(!!teaser);

  // Get user ID from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('subtaste_user_id');
    if (!storedUserId) {
      router.push('/quiz');
      return;
    }
    setUserId(storedUserId);
  }, [router]);

  // Fetch content
  useEffect(() => {
    if (!userId) return;

    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content?userId=${userId}&limit=30`);
        const data = await response.json();
        setItems(data.items || []);
      } catch (error) {
        console.error('Failed to fetch content:', error);
        // Use mock data for demo
        setItems(generateMockContent());
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [userId]);

  // Handle teaser dismissal
  useEffect(() => {
    if (showTeaser) {
      const timer = setTimeout(() => setShowTeaser(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showTeaser]);

  const handleInteraction = useCallback(
    async (interaction: SwipeInteraction) => {
      if (!userId) return;

      try {
        await fetch('/api/interactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            contentId: interaction.contentId,
            interactionType: interaction.interactionType,
            rating: interaction.rating,
            dwellTimeMs: interaction.dwellTimeMs,
            source: 'swipe',
          }),
        });
      } catch (error) {
        console.error('Failed to log interaction:', error);
      }
    },
    [userId]
  );

  const handleDeckEmpty = useCallback(() => {
    // Navigate to results page
    router.push('/results');
  }, [router]);

  if (showTeaser && teaser) {
    const constellation = getConstellationById(teaser as 'somnexis');
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-neutral-950 flex items-center justify-center p-6"
      >
        <div className="text-center">
          <p className="text-neutral-500 mb-2">You&apos;re leaning</p>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            {constellation?.displayName || teaser}
          </h1>
          <p className="text-neutral-500 mt-4">Let&apos;s refine it...</p>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-600 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-8">
      <div className="text-center mb-8 px-6">
        <h1 className="text-2xl font-semibold">Swipe to refine</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Left = not for me, Right = love it
        </p>
      </div>

      <SwipeDeck
        items={items}
        onInteraction={handleInteraction}
        onDeckEmpty={handleDeckEmpty}
        showRatingOnLike={true}
        abComparisonInterval={5}
      />
    </div>
  );
}

// Generate mock content for demo purposes
function generateMockContent(): ContentItem[] {
  const mockItems: ContentItem[] = [];
  const types: ('image' | 'track' | 'ai_artifact')[] = ['image', 'track', 'ai_artifact'];
  const tagSets = [
    ['dark', 'moody', 'atmospheric'],
    ['bright', 'colorful', 'vibrant'],
    ['minimal', 'clean', 'geometric'],
    ['organic', 'natural', 'textured'],
    ['futuristic', 'neon', 'synthetic'],
    ['dreamy', 'hazy', 'ethereal'],
    ['gothic', 'dramatic', 'baroque'],
    ['cosmic', 'space', 'celestial'],
  ];

  for (let i = 0; i < 30; i++) {
    mockItems.push({
      id: `mock-${i}`,
      type: types[i % 3],
      title: `Content ${i + 1}`,
      description: `Sample ${types[i % 3]} content for testing`,
      thumbnailUrl: undefined,
      contentUrl: undefined,
      featureEmbedding: [],
      tags: tagSets[i % tagSets.length],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return mockItems;
}

export default function SwipePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-neutral-600 border-t-violet-500 rounded-full animate-spin" />
        </div>
      }
    >
      <SwipeContent />
    </Suspense>
  );
}
