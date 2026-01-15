'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Share2, Trophy, Music, Users } from 'lucide-react';
import { ShareButtons } from './ShareButtons';

interface BattleShareCardProps {
  battleId: string;
  winner: {
    username: string;
    archetype?: string;
    hypeEarned: number;
  } | null;
  loser?: {
    username: string;
    archetype?: string;
    hypeEarned: number;
  };
  sound: {
    name: string;
  };
  stats: {
    player1Votes: number;
    player2Votes: number;
    crowdEnergy: number;
    totalViewers?: number;
  };
  isWinner?: boolean;
  userRole?: 'player' | 'spectator';
}

export function BattleShareCard({
  battleId,
  winner,
  loser,
  sound,
  stats,
  isWinner,
  userRole = 'spectator',
}: BattleShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const totalVotes = stats.player1Votes + stats.player2Votes;
  const winnerPercent = winner
    ? Math.round(((stats.player1Votes > stats.player2Votes ? stats.player1Votes : stats.player2Votes) / Math.max(totalVotes, 1)) * 100)
    : 50;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/battles/${battleId}`
    : '';

  const getShareText = () => {
    if (userRole === 'player') {
      if (isWinner) {
        return `I just won a DROPR battle with ${winnerPercent}% of the votes! Drop by the arena and challenge me.`;
      }
      return `Just battled in DROPR! The crowd chose their side. Think you can do better?`;
    }
    if (winner) {
      return `${winner.username} just won a DROPR battle with ${winnerPercent}% of the votes! Crowd energy: ${stats.crowdEnergy}%`;
    }
    return `Epic battle just ended in DROPR! The crowd has spoken.`;
  };

  const hashtags = ['DROPR', 'MusicBattle', winner?.archetype?.toUpperCase()].filter(Boolean) as string[];

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 px-6 py-4 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold">Battle Complete</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Users className="w-4 h-4" />
            <span>{totalVotes} votes</span>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="p-6">
        {winner ? (
          <div className="text-center mb-6">
            <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">Winner</p>
            <h3 className="text-2xl font-bold text-white mb-1">{winner.username}</h3>
            {winner.archetype && (
              <p className="text-sm text-violet-400">{winner.archetype}</p>
            )}
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">+{winner.hypeEarned}</p>
                <p className="text-xs text-neutral-500">HYPE</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{winnerPercent}%</p>
                <p className="text-xs text-neutral-500">VOTES</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center mb-6">
            <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">Result</p>
            <h3 className="text-2xl font-bold text-neutral-400">Draw</h3>
          </div>
        )}

        {/* Vote Breakdown */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-400">Vote Split</span>
            <span className="text-neutral-400">{stats.player1Votes} - {stats.player2Votes}</span>
          </div>
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden flex">
            <div
              className="bg-violet-500 transition-all duration-500"
              style={{ width: `${(stats.player1Votes / Math.max(totalVotes, 1)) * 100}%` }}
            />
            <div
              className="bg-fuchsia-500 transition-all duration-500"
              style={{ width: `${(stats.player2Votes / Math.max(totalVotes, 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Sound Info */}
        <div className="flex items-center gap-3 bg-neutral-800/50 rounded-xl p-3 mb-6">
          <div className="p-2 bg-neutral-700 rounded-lg">
            <Music className="w-5 h-5 text-neutral-300" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Sound</p>
            <p className="text-sm font-medium text-neutral-200">{sound.name}</p>
          </div>
        </div>

        {/* Crowd Energy */}
        <div className="flex items-center justify-between bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-xl p-4 mb-6">
          <span className="text-sm text-neutral-300">Crowd Energy</span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                style={{ width: `${stats.crowdEnergy}%` }}
              />
            </div>
            <span className="text-sm font-bold text-orange-400">{stats.crowdEnergy}%</span>
          </div>
        </div>

        {/* Share Button */}
        <ShareButtons
          title="DROPR Battle Result"
          text={getShareText()}
          url={shareUrl}
          hashtags={hashtags}
          via="dropr"
        />
      </div>

      {/* Footer */}
      <div className="bg-neutral-900/50 px-6 py-3 border-t border-neutral-800">
        <p className="text-center text-xs text-neutral-500">
          dropr.gg - AI Music Battle Platform
        </p>
      </div>
    </motion.div>
  );
}

export default BattleShareCard;
