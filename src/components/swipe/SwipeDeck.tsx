'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { Heart, X, Star, SkipForward } from 'lucide-react';
import { ContentItem, InteractionType } from '@/lib/types/models';
import { cn } from '@/lib/utils';

export interface SwipeInteraction {
  contentId: string;
  interactionType: InteractionType;
  rating?: 1 | 2 | 3 | 4 | 5;
  dwellTimeMs: number;
}

interface SwipeDeckProps {
  items: ContentItem[];
  onInteraction: (interaction: SwipeInteraction) => void;
  onDeckEmpty?: () => void;
  showRatingOnLike?: boolean;
  abComparisonInterval?: number; // Show A/B comparison every N cards
}

const SWIPE_THRESHOLD = 100;

export function SwipeDeck({
  items,
  onInteraction,
  onDeckEmpty,
  showRatingOnLike = true,
  abComparisonInterval = 5,
}: SwipeDeckProps) {
  const [deck, setDeck] = useState<ContentItem[]>(items);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [pendingLike, setPendingLike] = useState<ContentItem | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const [showABComparison, setShowABComparison] = useState(false);

  // Dwell time tracking
  const cardShownTime = useRef<number>(Date.now());
  const dwellTimeRef = useRef<number>(0);

  // Update dwell time when card changes
  useEffect(() => {
    cardShownTime.current = Date.now();
  }, [currentIndex]);

  const getDwellTime = useCallback(() => {
    return Date.now() - cardShownTime.current;
  }, []);

  const currentCard = deck[currentIndex];
  const nextCard = deck[currentIndex + 1];

  const handleSwipe = useCallback(
    (direction: 'left' | 'right' | 'up', item: ContentItem) => {
      const dwellTime = getDwellTime();

      if (direction === 'left') {
        // Dislike
        onInteraction({
          contentId: item.id,
          interactionType: 'dislike',
          dwellTimeMs: dwellTime,
        });
        setCurrentIndex((prev) => prev + 1);
        setInteractionCount((prev) => prev + 1);
      } else if (direction === 'right') {
        // Like - optionally show rating
        if (showRatingOnLike) {
          dwellTimeRef.current = dwellTime;
          setPendingLike(item);
          setShowRating(true);
        } else {
          onInteraction({
            contentId: item.id,
            interactionType: 'like',
            dwellTimeMs: dwellTime,
          });
          setCurrentIndex((prev) => prev + 1);
          setInteractionCount((prev) => prev + 1);
        }
      } else if (direction === 'up') {
        // Skip
        onInteraction({
          contentId: item.id,
          interactionType: 'skip',
          dwellTimeMs: dwellTime,
        });
        setCurrentIndex((prev) => prev + 1);
        setInteractionCount((prev) => prev + 1);
      }

      // Check for A/B comparison
      if ((interactionCount + 1) % abComparisonInterval === 0) {
        setShowABComparison(true);
      }
    },
    [getDwellTime, onInteraction, showRatingOnLike, interactionCount, abComparisonInterval]
  );

  const handleRatingSubmit = useCallback(
    (rating: 1 | 2 | 3 | 4 | 5) => {
      if (pendingLike) {
        onInteraction({
          contentId: pendingLike.id,
          interactionType: 'like',
          rating,
          dwellTimeMs: dwellTimeRef.current,
        });
        setPendingLike(null);
        setShowRating(false);
        setCurrentIndex((prev) => prev + 1);
        setInteractionCount((prev) => prev + 1);
      }
    },
    [pendingLike, onInteraction]
  );

  const handleABChoice = useCallback(
    (chosenId: string) => {
      // Log which item was chosen in A/B comparison
      onInteraction({
        contentId: chosenId,
        interactionType: 'like',
        dwellTimeMs: getDwellTime(),
      });
      setShowABComparison(false);
      setCurrentIndex((prev) => prev + 2); // Skip both A/B items
    },
    [getDwellTime, onInteraction]
  );

  // Check if deck is empty
  useEffect(() => {
    if (currentIndex >= deck.length) {
      onDeckEmpty?.();
    }
  }, [currentIndex, deck.length, onDeckEmpty]);

  if (showRating && pendingLike) {
    return (
      <RatingOverlay
        item={pendingLike}
        onRate={handleRatingSubmit}
        onSkipRating={() => handleRatingSubmit(3)} // Default to 3 stars if skipped
      />
    );
  }

  if (showABComparison && deck[currentIndex] && deck[currentIndex + 1]) {
    return (
      <ABComparison
        itemA={deck[currentIndex]}
        itemB={deck[currentIndex + 1]}
        onChoose={handleABChoice}
      />
    );
  }

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        No more items
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px]">
      {/* Card stack */}
      <div className="relative h-full">
        <AnimatePresence>
          {/* Next card (preview) */}
          {nextCard && (
            <motion.div
              key={nextCard.id + '-next'}
              className="absolute inset-0 scale-95 opacity-50"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 0.95, opacity: 0.5 }}
            >
              <SwipeCard item={nextCard} isTop={false} />
            </motion.div>
          )}

          {/* Current card */}
          <SwipeableCard
            key={currentCard.id}
            item={currentCard}
            onSwipe={(direction) => handleSwipe(direction, currentCard)}
          />
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
        <button
          onClick={() => handleSwipe('left', currentCard)}
          className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <X className="w-7 h-7" />
        </button>
        <button
          onClick={() => handleSwipe('up', currentCard)}
          className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors"
        >
          <SkipForward className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleSwipe('right', currentCard)}
          className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-green-500/20 hover:text-green-400 transition-colors"
        >
          <Heart className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}

interface SwipeableCardProps {
  item: ContentItem;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
}

function SwipeableCard({ item, onSwipe }: SwipeableCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x > SWIPE_THRESHOLD) {
        onSwipe('right');
      } else if (info.offset.x < -SWIPE_THRESHOLD) {
        onSwipe('left');
      } else if (info.offset.y < -SWIPE_THRESHOLD) {
        onSwipe('up');
      }
    },
    [onSwipe]
  );

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, y, rotate }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: 1, opacity: 1 }}
      exit={{ x: 300, opacity: 0, transition: { duration: 0.2 } }}
    >
      <SwipeCard item={item} isTop>
        {/* Like indicator */}
        <motion.div
          className="absolute top-8 right-8 border-4 border-green-500 text-green-500 px-4 py-2 rounded-lg font-bold text-2xl -rotate-12"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </motion.div>

        {/* Nope indicator */}
        <motion.div
          className="absolute top-8 left-8 border-4 border-red-500 text-red-500 px-4 py-2 rounded-lg font-bold text-2xl rotate-12"
          style={{ opacity: nopeOpacity }}
        >
          NOPE
        </motion.div>
      </SwipeCard>
    </motion.div>
  );
}

interface SwipeCardProps {
  item: ContentItem;
  isTop: boolean;
  children?: React.ReactNode;
}

function SwipeCard({ item, isTop, children }: SwipeCardProps) {
  return (
    <div
      className={cn(
        'h-full rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800',
        isTop && 'shadow-2xl'
      )}
    >
      {/* Content image placeholder */}
      <div className="relative h-4/5 bg-gradient-to-br from-neutral-800 to-neutral-900">
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt={item.title || 'Content'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600">
            <span className="text-6xl">
              {item.type === 'image' ? '🖼️' : item.type === 'track' ? '🎵' : '✨'}
            </span>
          </div>
        )}
        {children}
      </div>

      {/* Card info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate">{item.title || 'Untitled'}</h3>
        {item.tags && item.tags.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-neutral-800 rounded-full text-xs text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface RatingOverlayProps {
  item: ContentItem;
  onRate: (rating: 1 | 2 | 3 | 4 | 5) => void;
  onSkipRating: () => void;
}

function RatingOverlay({ item, onRate, onSkipRating }: RatingOverlayProps) {
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
    >
      <div className="bg-neutral-900 rounded-2xl p-6 max-w-sm w-full text-center">
        <h3 className="text-xl font-semibold mb-2">How much do you like this?</h3>
        <p className="text-neutral-500 mb-6 text-sm truncate">{item.title || 'This item'}</p>

        {/* Star rating */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => onRate(rating as 1 | 2 | 3 | 4 | 5)}
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-2 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'w-8 h-8 transition-colors',
                  rating <= hoveredRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-neutral-600'
                )}
              />
            </button>
          ))}
        </div>

        <button
          onClick={onSkipRating}
          className="text-neutral-500 hover:text-neutral-300 text-sm"
        >
          Skip rating
        </button>
      </div>
    </motion.div>
  );
}

interface ABComparisonProps {
  itemA: ContentItem;
  itemB: ContentItem;
  onChoose: (chosenId: string) => void;
}

function ABComparison({ itemA, itemB, onChoose }: ABComparisonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-neutral-950 flex flex-col items-center justify-center p-6 z-50"
    >
      <h2 className="text-xl font-semibold mb-2 text-center">Which feels more like you?</h2>
      <p className="text-neutral-500 text-sm mb-8">Trust your instinct</p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {[itemA, itemB].map((item, index) => (
          <button
            key={item.id}
            onClick={() => onChoose(item.id)}
            className="relative aspect-square rounded-xl overflow-hidden border-2 border-neutral-800 hover:border-violet-500 transition-all hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
              {item.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnailUrl}
                  alt={item.title || 'Content'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl">
                  {item.type === 'image' ? '🖼️' : item.type === 'track' ? '🎵' : '✨'}
                </span>
              )}
            </div>
            <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center font-bold">
              {String.fromCharCode(65 + index)}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default SwipeDeck;
