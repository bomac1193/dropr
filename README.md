# DROPR

**The arena where taste is proven.**

---

## The Problem

The way music discovery works is broken.

| Problem | Reality |
|---------|---------|
| **Algorithms decide** | What you hear is chosen by code, not you |
| **Zero agency** | You consume. You don't control. |
| **No stakes** | Your taste costs you nothing. It means nothing. |
| **No proof** | Anyone can claim good taste. Nobody can prove it. |

Music used to be identity. Now it's background noise selected by an algorithm optimized for engagement, not taste.

---

## The Solution

DROPR is an arena. You enter. You choose. You win or lose. Your taste is tested against others, judged by the crowd, and your record speaks for itself.

**Core Mechanics:**
- **Battles**: 1v1 competition. Same sound, different remixes. You pick.
- **Crowd Voting**: The audience decides. No algorithm. No curator.
- **Rankings**: Win and rise. Lose and fall. Your record is public.
- **Stakes**: Put your reputation on the line.

---

## How It Works

```
1. ENTER     → Get matched against another player
2. CHOOSE    → Pick from AI-generated remixes of the same sound
3. BATTLE    → The crowd votes on which remix wins
4. RISE      → Win to climb. Your rank is your reputation.
```

---

## Taste Archetypes

Your battle history reveals your taste profile.

| Archetype | Description |
|-----------|-------------|
| **Trendsetter** | Spots winners before they peak |
| **Purist** | Deep genre loyalty |
| **Chaos Agent** | Bets against the crowd |
| **Crowd Surfer** | Reads the room |
| **Architect** | Values production over popularity |
| **Mood Shifter** | Context-dependent decisions |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                            DROPR                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Roblox Game  ←→  Next.js API  ←→  Supabase PostgreSQL        │
│                                                                 │
│   ┌─────────┐      ┌──────────┐      ┌─────────────┐           │
│   │ Battles │      │ AI Audio │      │ Taste Graph │           │
│   │ Votes   │      │ Suno     │      │ PULSE       │           │
│   │ Ranks   │      │ Udio     │      │ Profiles    │           │
│   └─────────┘      └──────────┘      └─────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## API

### Battles
| Method | Endpoint | Action |
|--------|----------|--------|
| POST | `/api/battles` | Create battle |
| GET | `/api/battles/:id` | Get battle |
| POST | `/api/battles/:id/select-remix` | Select remix |
| POST | `/api/battles/:id/vote` | Cast vote |

### Players
| Method | Endpoint | Action |
|--------|----------|--------|
| POST | `/api/players` | Create/get player |
| GET | `/api/players/:id` | Get player |
| GET | `/api/players/:id/stats` | Get stats |

### Sounds
| Method | Endpoint | Action |
|--------|----------|--------|
| GET | `/api/sounds` | List sounds |
| GET | `/api/sounds/trending` | Trending |
| POST | `/api/sounds/:id/remixes` | Generate remixes |

### Roblox
| Method | Endpoint | Action |
|--------|----------|--------|
| POST | `/api/webhook/roblox` | Unified webhook |

---

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run db:generate
npm run dev
```

---

## Stack

- Next.js 16
- TypeScript
- PostgreSQL (Supabase)
- Prisma
- Roblox (Lua)

---

## Brand

See [BRAND.md](./BRAND.md) for archetype analysis and design system.

**Archetype**: The Hero
**Promise**: The arena where taste is proven
**Voice**: Direct. Confident. No hedging.

---

Built by VIOLET SPHINX
