'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Share2, ChevronUp } from 'lucide-react';
import { ContentItem, InteractionType } from '@/lib/types/models';
import { cn } from '@/lib/utils';

export interface FeedInteraction {
  contentId: string;
  interactionType: InteractionType;
  rating?: 1 | 2 | 3 | 4 | 5;
  dwellTimeMs: number;
}

interface ContentFeedProps {
  items: ContentItem[];
  onInteraction: (interaction: FeedInteraction) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

type QuickReaction = 'too_chill' | 'just_right' | 'too_intense';

const REACTION_MAP: Record<QuickReaction, { rating: 1 | 2 | 3 | 4 | 5; interactionType: InteractionType }> = {
  too_chill: { rating: 2, interactionType: 'view' },
  just_right: { rating: 4, interactionType: 'like' },
  too_intense: { rating: 2, interactionType: 'view' },
};

export function ContentFeed({ items, onInteraction, onLoadMore, hasMore }: ContentFeedProps) {
  const [viewedItems, setViewedItems] = useState<Set<string>>(new Set());
  const [itemStartTimes, setItemStartTimes] = useState<Map<string, number>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Track when items come into view
  const trackItemView = useCallback((itemId: string) => {
    if (!itemStartTimes.has(itemId)) {
      setItemStartTimes((prev) => new Map(prev).set(itemId, Date.now()));
    }
  }, [itemStartTimes]);

  // Calculate dwell time when item leaves view or interaction happens
  const getDwellTime = useCallback(
    (itemId: string): number => {
      const startTime = itemStartTimes.get(itemId);
      if (!startTime) return 0;
      return Date.now() - startTime;
    },
    [itemStartTimes]
  );

  // Handle quick reactions (Too chill / Just right / Too intense)
  const handleQuickReaction = useCallback(
    (item: ContentItem, reaction: QuickReaction) => {
      const { rating, interactionType } = REACTION_MAP[reaction];
      const dwellTime = getDwellTime(item.id);

      onInteraction({
        contentId: item.id,
        interactionType,
        rating,
        dwellTimeMs: dwellTime,
      });

      setViewedItems((prev) => new Set(prev).add(item.id));
    },
    [getDwellTime, onInteraction]
  );

  // Handle star rating
  const handleRating = useCallback(
    (item: ContentItem, rating: 1 | 2 | 3 | 4 | 5) => {
      const dwellTime = getDwellTime(item.id);

      onInteraction({
        contentId: item.id,
        interactionType: rating >= 3 ? 'like' : 'dislike',
        rating,
        dwellTimeMs: dwellTime,
      });

      setViewedItems((prev) => new Set(prev).add(item.id));
    },
    [getDwellTime, onInteraction]
  );

  // Handle save action
  const handleSave = useCallback(
    (item: ContentItem) => {
      const dwellTime = getDwellTime(item.id);

      onInteraction({
        contentId: item.id,
        interactionType: 'save',
        dwellTimeMs: dwellTime,
      });
    },
    [getDwellTime, onInteraction]
  );

  // Handle share action
  const handleShare = useCallback(
    (item: ContentItem) => {
      const dwellTime = getDwellTime(item.id);

      onInteraction({
        contentId: item.id,
        interactionType: 'share',
        dwellTimeMs: dwellTime,
      });

      // Could implement actual share functionality here
      if (navigator.share) {
        navigator.share({
          title: item.title || 'Check this out',
          url: item.contentUrl || window.location.href,
        });
      }
    },
    [getDwellTime, onInteraction]
  );

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !onLoadMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [onLoadMore, hasMore]);

  return (
    <div className="w-full max-w-lg mx-auto pb-20">
      {/* Scroll to top button */}
      <ScrollToTopButton />

      {/* Feed items */}
      <div className="space-y-6 p-4">
        {items.map((item) => (
          <FeedCard
            key={item.id}
            item={item}
            hasInteracted={viewedItems.has(item.id)}
            onViewStart={() => trackItemView(item.id)}
            onQuickReaction={(reaction) => handleQuickReaction(item, reaction)}
            onRating={(rating) => handleRating(item, rating)}
            onSave={() => handleSave(item)}
            onShare={() => handleShare(item)}
          />
        ))}
      </div>

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-neutral-600 border-t-violet-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

interface FeedCardProps {
  item: ContentItem;
  hasInteracted: boolean;
  onViewStart: () => void;
  onQuickReaction: (reaction: QuickReaction) => void;
  onRating: (rating: 1 | 2 | 3 | 4 | 5) => void;
  onSave: () => void;
  onShare: () => void;
}

function FeedCard({
  item,
  hasInteracted,
  onViewStart,
  onQuickReaction,
  onRating,
  onSave,
  onShare,
}: FeedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showRatingPills, setShowRatingPills] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Track when card comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onViewStart();
        }
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [onViewStart]);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave();
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800"
    >
      {/* Content image */}
      <div className="relative aspect-square bg-neutral-800">
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt={item.title || 'Content'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600">
            <span className="text-8xl">
              {item.type === 'image' ? '🖼️' : item.type === 'track' ? '🎵' : '✨'}
            </span>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 rounded-full text-xs text-neutral-300 backdrop-blur-sm">
          {item.type}
        </div>

        {/* Save and share buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={handleSave}
            className={cn(
              'w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors',
              isSaved ? 'bg-violet-500 text-white' : 'bg-black/50 hover:bg-black/70'
            )}
          >
            <Bookmark className={cn('w-5 h-5', isSaved && 'fill-current')} />
          </button>
          <button
            onClick={onShare}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg">{item.title || 'Untitled'}</h3>
        {item.description && (
          <p className="text-neutral-500 text-sm mt-1 line-clamp-2">{item.description}</p>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-neutral-800 rounded-full text-xs text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Quick reactions or rating pills */}
        <AnimatePresence mode="wait">
          {!hasInteracted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4"
            >
              {showRatingPills ? (
                <RatingPills onRate={onRating} onBack={() => setShowRatingPills(false)} />
              ) : (
                <QuickReactionButtons
                  onReaction={onQuickReaction}
                  onShowRating={() => setShowRatingPills(true)}
                />
              )}
            </motion.div>
          )}

          {hasInteracted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-sm text-neutral-600"
            >
              Response recorded
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface QuickReactionButtonsProps {
  onReaction: (reaction: QuickReaction) => void;
  onShowRating: () => void;
}

function QuickReactionButtons({ onReaction, onShowRating }: QuickReactionButtonsProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => onReaction('too_chill')}
          className="flex-1 py-2 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm transition-colors"
        >
          Too chill
        </button>
        <button
          onClick={() => onReaction('just_right')}
          className="flex-1 py-2 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium transition-colors"
        >
          Just right
        </button>
        <button
          onClick={() => onReaction('too_intense')}
          className="flex-1 py-2 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm transition-colors"
        >
          Too intense
        </button>
      </div>
      <button
        onClick={onShowRating}
        className="w-full text-xs text-neutral-500 hover:text-neutral-300 py-1"
      >
        Rate 1-5 instead
      </button>
    </div>
  );
}

interface RatingPillsProps {
  onRate: (rating: 1 | 2 | 3 | 4 | 5) => void;
  onBack: () => void;
}

function RatingPills({ onRate, onBack }: RatingPillsProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => onRate(rating as 1 | 2 | 3 | 4 | 5)}
            className={cn(
              'w-10 h-10 rounded-full font-semibold transition-all hover:scale-110',
              rating <= 2 && 'bg-neutral-800 hover:bg-red-500/20 hover:text-red-400',
              rating === 3 && 'bg-neutral-800 hover:bg-yellow-500/20 hover:text-yellow-400',
              rating >= 4 && 'bg-neutral-800 hover:bg-green-500/20 hover:text-green-400'
            )}
          >
            {rating}
          </button>
        ))}
      </div>
      <button
        onClick={onBack}
        className="w-full text-xs text-neutral-500 hover:text-neutral-300 py-1"
      >
        Back to quick reactions
      </button>
    </div>
  );
}

function ScrollToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-neutral-800 shadow-lg flex items-center justify-center hover:bg-neutral-700 transition-colors z-40"
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default ContentFeed;
