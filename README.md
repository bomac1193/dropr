# DROPR - AI Music Battle Platform

**The infrastructure for how Gen-Z validates music taste in the AI era.**

DROPR is a cross-platform music battle game that captures taste data through gameplay. Players compete by selecting AI-generated remixes of viral sounds, and the crowd votes on winners.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         DROPR Platform                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │
│  │   Roblox    │      │   Next.js   │      │  Supabase   │     │
│  │    Game     │◄────►│   API       │◄────►│  PostgreSQL │     │
│  │  (Lua/UI)   │      │  (Backend)  │      │  (Database) │     │
│  └─────────────┘      └─────────────┘      └─────────────┘     │
│         │                    │                    │             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │
│  │   Players   │      │  AI Audio   │      │ Taste Graph │     │
│  │  Battles    │      │  Generation │      │   PULSE     │     │
│  │   Votes     │      │ (Suno/Udio) │      │  Profiles   │     │
│  └─────────────┘      └─────────────┘      └─────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### Taste Graph API
- **PULSE Profiles**: 6 taste archetypes (Trendsetter, Purist, Chaos Agent, Crowd Surfer, Architect, Mood Shifter)
- **10-Dimension Taste Vector**: Energy, experimentalism, cultural alignment, and more
- **Real-time Battles**: WebSocket-ready battle system with matchmaking
- **AI Remix Generation**: Integration with Suno, Udio, and Stability Audio
- **Taste Stakes**: Training data value appreciation system

### Roblox Game
- **Battle System**: 1v1 remix selection competitions
- **Voting**: Crowd-powered winner determination
- **Leaderboards**: Global rankings by influence, hype, and win rate
- **Daily Challenges**: Engagement mechanics

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL (via Supabase)
- Roblox Studio (for game development)

### 1. Install Dependencies
```bash
cd dropr
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 3. Set Up Database
```bash
npm run db:push      # Push schema to Supabase
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed with initial data
```

### 4. Run Development Server
```bash
npm run dev
```

API available at `http://localhost:3000`

## API Endpoints

### Battles
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/battles` | Create a new battle |
| GET | `/api/battles` | Get active battles |
| GET | `/api/battles/:id` | Get battle details |
| POST | `/api/battles/:id/select-remix` | Select a remix |
| POST | `/api/battles/:id/vote` | Cast a vote |

### Players
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/players` | Create/get player |
| GET | `/api/players/:id` | Get player details |
| GET | `/api/players/:id/stats` | Get detailed stats |

### Sounds
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sounds` | List sounds |
| GET | `/api/sounds/trending` | Trending sounds |
| POST | `/api/sounds/:id/remixes` | Generate remixes |

### Matchmaking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/matchmaking` | Join/leave queue |
| GET | `/api/matchmaking/status` | Check queue status |

### Roblox Webhook
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhook/roblox` | Unified Roblox endpoint |

## PULSE Archetype System

| Archetype | Title | Description |
|-----------|-------|-------------|
| **TRENDSETTER** | The Prophet | First to spot winners |
| **PURIST** | The Scholar | Deep genre knowledge |
| **CHAOS_AGENT** | The Wildcard | Loves upsets |
| **CROWD_SURFER** | The Vibe Reader | Reads crowds |
| **ARCHITECT** | The Sound Engineer | Values production |
| **MOOD_SHIFTER** | The Empath | Context-aware |

## Roblox Integration

1. Copy Lua files from `roblox/` to Roblox Studio
2. Update `TasteGraphAPI.lua` with your API URL
3. Enable HTTP Requests in Game Settings

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **AI Audio**: Suno, Udio, Stability Audio
- **Game**: Roblox (Lua)

## Project Structure

```
dropr/
├── prisma/              # Database schema & seeds
├── roblox/              # Roblox game files
│   ├── ServerScriptService/
│   ├── ReplicatedStorage/
│   └── StarterGui/
├── src/
│   ├── app/api/         # API routes
│   └── lib/
│       ├── pulse/       # PULSE archetype system
│       ├── battle/      # Battle management
│       └── audio/       # AI audio generation
└── package.json
```

## License

MIT

---

Built by VIOLET SPHINX / Ubani
