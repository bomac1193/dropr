/**
 * Roblox Webhook API
 *
 * Unified endpoint for all Roblox game server communications.
 * Handles player registration, battles, voting, and game events.
 *
 * POST /api/webhook/roblox
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  createBattle,
  selectRemix,
  castVote,
  advanceBattleState,
  completeBattle,
  joinQueue,
  findMatch,
  getBattle,
} from '@/lib/battle';
import {
  emitBattleCreated,
  emitRemixSelected,
  emitBattleStateChanged,
  emitVoteCast,
  emitBattleCompleted,
} from '@/lib/socket';

// =============================================================================
// Webhook Secret Verification
// =============================================================================

function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-roblox-secret');
  const expectedSecret = process.env.ROBLOX_WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.warn('ROBLOX_WEBHOOK_SECRET not configured');
    return true; // Allow in development
  }

  return secret === expectedSecret;
}

// =============================================================================
// Action Schemas
// =============================================================================

const PlayerJoinSchema = z.object({
  robloxUserId: z.number(),
  username: z.string(),
  displayName: z.string().optional(),
  avatarUrl: z.string().optional(),
});

const JoinQueueSchema = z.object({
  playerId: z.string(),
  mode: z.enum(['similar', 'opposite', 'balanced']).optional(),
});

const SelectRemixSchema = z.object({
  battleId: z.string(),
  playerId: z.string(),
  remixId: z.string(),
});

const VoteSchema = z.object({
  battleId: z.string(),
  voterId: z.string(),
  votedFor: z.enum(['PLAYER_1', 'PLAYER_2']),
});

const BattleStateSchema = z.object({
  battleId: z.string(),
});

// =============================================================================
// Webhook Handler
// =============================================================================

export async function POST(request: NextRequest) {
  // Verify webhook secret
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      // =================================================================
      // PLAYER ACTIONS
      // =================================================================

      case 'player_join': {
        const playerData = PlayerJoinSchema.parse(data);

        // Find or create player
        let player = await prisma.player.findUnique({
          where: { robloxUserId: BigInt(playerData.robloxUserId) },
          include: { pulseProfile: true },
        });

        if (player) {
          // Update existing player
          player = await prisma.player.update({
            where: { id: player.id },
            data: {
              lastActiveAt: new Date(),
              username: playerData.username,
              displayName: playerData.displayName,
              avatarUrl: playerData.avatarUrl,
            },
            include: { pulseProfile: true },
          });
        } else {
          // Create new player with default profile
          player = await prisma.player.create({
            data: {
              robloxUserId: BigInt(playerData.robloxUserId),
              username: playerData.username,
              displayName: playerData.displayName,
              avatarUrl: playerData.avatarUrl,
              pulseProfile: {
                create: {
                  archetype: 'CROWD_SURFER',
                },
              },
            },
            include: { pulseProfile: true },
          });
        }

        return NextResponse.json({
          success: true,
          action: 'player_join',
          data: {
            playerId: player.id,
            username: player.username,
            hypePoints: player.hypePoints,
            influenceScore: player.influenceScore,
            battleCount: player.battleCount,
            winCount: player.winCount,
            archetype: player.pulseProfile?.archetype,
            tasteVector: player.pulseProfile ? {
              energy: player.pulseProfile.energy,
              experimentalism: player.pulseProfile.experimentalism,
              culturalAlignment: player.pulseProfile.culturalAlignment,
            } : null,
          },
        });
      }

      // =================================================================
      // MATCHMAKING ACTIONS
      // =================================================================

      case 'join_queue': {
        const queueData = JoinQueueSchema.parse(data);
        const queueResult = await joinQueue(queueData.playerId, {
          mode: queueData.mode,
        });

        // Try to find immediate match
        const match = await findMatch(queueData.playerId);

        if (match) {
          // Get random sound with remixes
          const sound = await prisma.sound.findFirst({
            where: { remixes: { some: {} } },
            include: { remixes: true },
            orderBy: { viralScore: 'desc' },
          });

          if (sound) {
            const battle = await createBattle({
              player1Id: match.player1Id,
              player2Id: match.player2Id,
              soundId: sound.id,
            });

            // Emit battle created socket event
            emitBattleCreated({
              battleId: battle.id,
              player1Id: battle.player1Id,
              player2Id: battle.player2Id,
              soundId: battle.soundId,
              scene: battle.scene,
              selectingEndsAt: battle.selectingEndsAt?.toISOString() || '',
            }).catch(() => {});

            // Get both players
            const player1 = await prisma.player.findUnique({
              where: { id: match.player1Id },
            });
            const player2 = await prisma.player.findUnique({
              where: { id: match.player2Id },
            });

            return NextResponse.json({
              success: true,
              action: 'match_found',
              data: {
                battleId: battle.id,
                player1: {
                  id: player1?.id,
                  username: player1?.username,
                  robloxUserId: player1?.robloxUserId.toString(),
                },
                player2: {
                  id: player2?.id,
                  username: player2?.username,
                  robloxUserId: player2?.robloxUserId.toString(),
                },
                sound: {
                  id: sound.id,
                  name: sound.name,
                  audioUrl: sound.audioUrl,
                },
                remixes: sound.remixes.map((r: { id: string; genre: string; name: string; audioUrl: string }) => ({
                  id: r.id,
                  genre: r.genre,
                  name: r.name,
                  audioUrl: r.audioUrl,
                })),
                selectingEndsAt: battle.selectingEndsAt,
              },
            });
          }
        }

        return NextResponse.json({
          success: true,
          action: 'queued',
          data: {
            queueId: queueResult.queueId,
            position: queueResult.position,
          },
        });
      }

      case 'check_queue': {
        const { playerId } = data;

        // Try to find match
        const match = await findMatch(playerId);

        if (match) {
          const sound = await prisma.sound.findFirst({
            where: { remixes: { some: {} } },
            include: { remixes: true },
          });

          if (sound) {
            const battle = await createBattle({
              player1Id: match.player1Id,
              player2Id: match.player2Id,
              soundId: sound.id,
            });

            return NextResponse.json({
              success: true,
              action: 'match_found',
              data: {
                battleId: battle.id,
                soundId: sound.id,
                remixes: sound.remixes,
              },
            });
          }
        }

        return NextResponse.json({
          success: true,
          action: 'still_queued',
        });
      }

      // =================================================================
      // BATTLE ACTIONS
      // =================================================================

      case 'select_remix': {
        const selectionData = SelectRemixSchema.parse(data);
        const selection = await selectRemix(
          selectionData.battleId,
          selectionData.playerId,
          selectionData.remixId
        );

        // Check if battle should advance
        const battle = await prisma.battle.findUnique({
          where: { id: selectionData.battleId },
          include: { remixSelections: true },
        });

        const bothSelected = battle?.remixSelections.length === 2;

        // Emit socket event
        emitRemixSelected({
          battleId: selectionData.battleId,
          playerId: selectionData.playerId,
          remixId: selectionData.remixId,
          bothSelected,
        }).catch(() => {});

        // If both selected, emit state change
        if (bothSelected && battle?.status === 'PLAYING_P1') {
          emitBattleStateChanged({
            battleId: selectionData.battleId,
            previousStatus: 'SELECTING',
            newStatus: 'PLAYING_P1',
            playingEndsAt: battle.playingEndsAt?.toISOString(),
          }).catch(() => {});
        }

        return NextResponse.json({
          success: true,
          action: 'remix_selected',
          data: {
            selectionId: selection.id,
            remixGenre: selection.remix.genre,
            battleStatus: battle?.status,
            bothSelected,
          },
        });
      }

      case 'advance_battle': {
        const battleData = BattleStateSchema.parse(data);

        // Get battle before advancing to get previous status
        const battleBefore = await prisma.battle.findUnique({
          where: { id: battleData.battleId },
        });
        const previousStatus = battleBefore?.status || 'UNKNOWN';

        const result = await advanceBattleState(battleData.battleId);

        // advanceBattleState can return a Battle or BattleResult depending on state
        const isBattleResult = 'battleId' in result;

        if (isBattleResult) {
          // Battle completed - emit completed event
          emitBattleCompleted({
            battleId: result.battleId,
            winnerId: result.winnerId,
            player1Votes: result.player1Votes,
            player2Votes: result.player2Votes,
            crowdEnergy: result.crowdEnergy,
            player1HypeEarned: result.player1HypeEarned,
            player2HypeEarned: result.player2HypeEarned,
          }).catch(() => {});
        } else {
          // Battle advanced - emit state change
          emitBattleStateChanged({
            battleId: result.id,
            previousStatus,
            newStatus: result.status,
            playingEndsAt: result.playingEndsAt?.toISOString(),
            votingEndsAt: result.votingEndsAt?.toISOString(),
          }).catch(() => {});
        }

        return NextResponse.json({
          success: true,
          action: isBattleResult ? 'battle_completed' : 'battle_advanced',
          data: isBattleResult
            ? result
            : {
                battleId: result.id,
                status: result.status,
                votingEndsAt: result.votingEndsAt,
              },
        });
      }

      case 'cast_vote': {
        const voteData = VoteSchema.parse(data);
        const vote = await castVote(
          voteData.battleId,
          voteData.voterId,
          voteData.votedFor
        );

        // Get updated vote counts
        const battle = await getBattle(voteData.battleId);
        if (battle) {
          const player1VoteCount = battle.votes.filter(v => v.votedFor === 'PLAYER_1').length;
          const player2VoteCount = battle.votes.filter(v => v.votedFor === 'PLAYER_2').length;

          // Emit socket event
          emitVoteCast({
            battleId: voteData.battleId,
            voterId: voteData.voterId,
            votedFor: voteData.votedFor,
            player1VoteCount,
            player2VoteCount,
          }).catch(() => {});
        }

        return NextResponse.json({
          success: true,
          action: 'vote_cast',
          data: {
            voteId: vote.id,
            votedFor: vote.votedFor,
          },
        });
      }

      case 'complete_battle': {
        const battleData = BattleStateSchema.parse(data);
        const result = await completeBattle(battleData.battleId);

        // Emit socket event
        emitBattleCompleted({
          battleId: result.battleId,
          winnerId: result.winnerId,
          player1Votes: result.player1Votes,
          player2Votes: result.player2Votes,
          crowdEnergy: result.crowdEnergy,
          player1HypeEarned: result.player1HypeEarned,
          player2HypeEarned: result.player2HypeEarned,
        }).catch(() => {});

        // Get winner details
        let winner = null;
        if (result.winnerId) {
          const winnerPlayer = await prisma.player.findUnique({
            where: { id: result.winnerId },
          });
          winner = {
            id: winnerPlayer?.id,
            username: winnerPlayer?.username,
            robloxUserId: winnerPlayer?.robloxUserId.toString(),
          };
        }

        return NextResponse.json({
          success: true,
          action: 'battle_completed',
          data: {
            battleId: result.battleId,
            winner,
            player1Votes: result.player1Votes,
            player2Votes: result.player2Votes,
            crowdEnergy: result.crowdEnergy,
            player1HypeEarned: result.player1HypeEarned,
            player2HypeEarned: result.player2HypeEarned,
          },
        });
      }

      // =================================================================
      // DATA ACTIONS
      // =================================================================

      case 'get_sounds': {
        const { category, limit = 10 } = data;

        const where: Record<string, unknown> = {};
        if (category) where.category = category;

        const sounds = await prisma.sound.findMany({
          where: {
            ...where,
            remixes: { some: {} }, // Only sounds with remixes
          },
          include: { remixes: true },
          orderBy: { viralScore: 'desc' },
          take: limit,
        });

        return NextResponse.json({
          success: true,
          action: 'sounds_list',
          data: sounds.map(s => ({
            id: s.id,
            name: s.name,
            category: s.category,
            rarity: s.rarity,
            audioUrl: s.audioUrl,
            viralScore: s.viralScore,
            remixCount: s.remixes.length,
          })),
        });
      }

      case 'get_leaderboard': {
        const { type = 'hype', limit = 10 } = data;

        let orderBy: Record<string, string> = {};
        switch (type) {
          case 'hype':
            orderBy = { hypePoints: 'desc' };
            break;
          case 'influence':
            orderBy = { influenceScore: 'desc' };
            break;
          case 'wins':
            orderBy = { winCount: 'desc' };
            break;
          default:
            orderBy = { hypePoints: 'desc' };
        }

        const players = await prisma.player.findMany({
          orderBy,
          take: limit,
          include: { pulseProfile: true },
        });

        return NextResponse.json({
          success: true,
          action: 'leaderboard',
          data: players.map((p, i) => ({
            rank: i + 1,
            playerId: p.id,
            username: p.username,
            robloxUserId: p.robloxUserId.toString(),
            hypePoints: p.hypePoints,
            influenceScore: p.influenceScore,
            winCount: p.winCount,
            battleCount: p.battleCount,
            archetype: p.pulseProfile?.archetype,
          })),
        });
      }

      case 'get_player_stats': {
        const { playerId, robloxUserId } = data;

        let player;
        if (playerId) {
          player = await prisma.player.findUnique({
            where: { id: playerId },
            include: { pulseProfile: true },
          });
        } else if (robloxUserId) {
          player = await prisma.player.findUnique({
            where: { robloxUserId: BigInt(robloxUserId) },
            include: { pulseProfile: true },
          });
        }

        if (!player) {
          return NextResponse.json({
            success: false,
            error: 'Player not found',
          });
        }

        return NextResponse.json({
          success: true,
          action: 'player_stats',
          data: {
            playerId: player.id,
            username: player.username,
            hypePoints: player.hypePoints,
            influenceScore: player.influenceScore,
            battleCount: player.battleCount,
            winCount: player.winCount,
            winRate: player.battleCount > 0
              ? (player.winCount / player.battleCount) * 100
              : 0,
            archetype: player.pulseProfile?.archetype,
            tasteVector: player.pulseProfile ? {
              energy: player.pulseProfile.energy,
              experimentalism: player.pulseProfile.experimentalism,
              culturalAlignment: player.pulseProfile.culturalAlignment,
              temporalTiming: player.pulseProfile.temporalTiming,
              emotionalIntensity: player.pulseProfile.emotionalIntensity,
              rhythmComplexity: player.pulseProfile.rhythmComplexity,
            } : null,
          },
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Roblox webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
