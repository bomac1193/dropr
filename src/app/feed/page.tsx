'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ContentFeed, FeedInteraction } from '@/components/feed';
import { ContentItem } from '@/lib/types/models';

export default function FeedPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

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
  const fetchContent = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `/api/content?userId=${userId}&limit=10&offset=${offset}`
      );
      const data = await response.json();

      if (data.items) {
        setItems((prev) => (offset === 0 ? data.items : [...prev, ...data.items]));
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
      // Use mock data for demo
      if (offset === 0) {
        setItems(generateMockFeedContent());
        setHasMore(true);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, offset]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleInteraction = useCallback(
    async (interaction: FeedInteraction) => {
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
            source: 'feed',
          }),
        });
      } catch (error) {
        console.error('Failed to log interaction:', error);
      }
    },
    [userId]
  );

  const handleLoadMore = useCallback(() => {
    setOffset((prev) => prev + 10);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-600 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-800 px-6 py-4">
        <h1 className="text-xl font-semibold text-center">Your Feed</h1>
      </header>

      <ContentFeed
        items={items}
        onInteraction={handleInteraction}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-neutral-950/80 backdrop-blur-lg border-t border-neutral-800 px-6 py-4">
        <div className="flex justify-around max-w-md mx-auto">
          <button
            onClick={() => router.push('/swipe')}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            Swipe
          </button>
          <button className="text-violet-400 font-medium">Feed</button>
          <button
            onClick={() => router.push('/results')}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            Profile
          </button>
        </div>
      </nav>
    </div>
  );
}

function generateMockFeedContent(): ContentItem[] {
  const mockItems: ContentItem[] = [];
  const types: ('image' | 'track' | 'ai_artifact')[] = ['image', 'track', 'ai_artifact'];
  const tagSets = [
    ['dark', 'moody', 'atmospheric'],
    ['bright', 'colorful', 'vibrant'],
    ['minimal', 'clean', 'geometric'],
    ['organic', 'natural', 'textured'],
    ['futuristic', 'neon', 'synthetic'],
  ];

  for (let i = 0; i < 20; i++) {
    mockItems.push({
      id: `feed-mock-${i}`,
      type: types[i % 3],
      title: `Feed Item ${i + 1}`,
      description: `This is a sample ${types[i % 3]} for your taste profile exploration. React to help refine your constellation.`,
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
