'use client';

import { motion } from 'framer-motion';
import { Sparkles, Compass, Zap } from 'lucide-react';
import { ResultSummary } from '@/lib/types/results';
import { cn } from '@/lib/utils';

interface ResultSummaryCardProps {
  summary: ResultSummary;
  onSceneClick?: (scene: string) => void;
}

export function ResultSummaryCard({ summary, onSceneClick }: ResultSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden"
    >
      {/* Header with constellation name */}
      <div className="p-6 pb-4 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-neutral-500 text-sm mb-2"
        >
          You are
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent"
        >
          {summary.primaryName}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-neutral-400 max-w-md mx-auto leading-relaxed"
        >
          {summary.tagline}
        </motion.p>
      </div>

      {/* Key scores */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="px-6 py-4 grid grid-cols-3 gap-4 border-t border-neutral-800/50"
      >
        <ScoreDisplay
          icon={<Sparkles className="w-4 h-4" />}
          label="Subtaste Index"
          value={summary.keyScores.subtasteIndex}
          color="violet"
        />
        <ScoreDisplay
          icon={<Compass className="w-4 h-4" />}
          label="Explorer Score"
          value={summary.keyScores.explorerScore}
          color="fuchsia"
        />
        <ScoreDisplay
          icon={<Zap className="w-4 h-4" />}
          label="Early Adopter"
          value={summary.keyScores.earlyAdopterScore}
          color="pink"
        />
      </motion.div>

      {/* Scene chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="px-6 pb-6 pt-2"
      >
        <p className="text-xs text-neutral-600 mb-3 text-center">Your scenes</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {summary.topScenes.map((scene, index) => (
            <motion.button
              key={scene}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              onClick={() => onSceneClick?.(scene)}
              className={cn(
                'px-4 py-2 rounded-full text-sm transition-all',
                'bg-neutral-800/50 hover:bg-neutral-700/50',
                'border border-neutral-700/50 hover:border-neutral-600',
                'text-neutral-300 hover:text-white'
              )}
            >
              {scene.split(':')[0]}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ScoreDisplayProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'violet' | 'fuchsia' | 'pink';
}

function ScoreDisplay({ icon, label, value, color }: ScoreDisplayProps) {
  const colorClasses = {
    violet: 'text-violet-400',
    fuchsia: 'text-fuchsia-400',
    pink: 'text-pink-400',
  };

  return (
    <div className="text-center">
      <div className={cn('flex items-center justify-center gap-1 mb-1', colorClasses[color])}>
        {icon}
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs text-neutral-500 leading-tight">{label}</p>
    </div>
  );
}

export default ResultSummaryCard;
