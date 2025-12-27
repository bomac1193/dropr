# Subtaste Database Schema

## Overview

Subtaste uses Supabase (PostgreSQL) for data persistence. The schema supports the multi-layer taste profiling system:

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER                                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Psychometric│  │  Aesthetic  │  │    Constellation        │  │
│  │   Profile   │  │ Preferences │  │      Profile            │  │
│  │  (traits)   │  │(visual/music)│ │(archetype + blend)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                           │                                      │
│                           ▼                                      │
│              ┌─────────────────────────┐                        │
│              │  Representation Profile │  ← Module 4            │
│              │   (universal dims)      │                        │
│              └─────────────────────────┘                        │
│                           │                                      │
│                           ▼                                      │
│              ┌─────────────────────────┐                        │
│              │    Profile History      │  ← Drift Analysis      │
│              └─────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## Tables

### Core Profile Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User identity | id, email, display_name |
| `psychometric_profiles` | Big Five + extended traits | openness, conscientiousness, extraversion, agreeableness, neuroticism, novelty_seeking, aesthetic_sensitivity, risk_tolerance |
| `aesthetic_preferences` | Visual & music prefs | darkness_preference, complexity_preference, tempo_range_*, energy_range_*, etc. |
| `constellation_profiles` | Archetypal mapping | primary_constellation_id, blend_weights, subtaste_index, explorer_score, early_adopter_score |
| `representation_profiles` | Universal dimensions | energy, complexity, temporal_style, sensory_density, identity_projection, ambiguity_tolerance |

### Supporting Tables

| Table | Purpose |
|-------|---------|
| `profile_history` | Versioned snapshots for drift analysis |
| `quiz_sessions` | Quiz state management |
| `content_items` | Content catalog (future) |
| `user_content_interactions` | Behavioral data (future) |
| `subculture_clusters` | Emergent taste clusters (Module 5) |
| `user_subculture_fits` | User-cluster relationships |

## Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Start Local Supabase

```bash
supabase start
```

### 3. Run Migrations

```bash
supabase db push
```

Or apply directly:

```bash
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/migrations/001_initial_schema.sql
```

## Schema Details

### Representation Profile (Module 4)

```sql
CREATE TABLE representation_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),

  -- Core dimensions (0-1)
  energy FLOAT NOT NULL,
  complexity FLOAT NOT NULL,
  temporal_style TEXT NOT NULL,  -- 'looped' | 'evolving' | 'episodic'
  sensory_density FLOAT NOT NULL,
  identity_projection FLOAT NOT NULL,
  ambiguity_tolerance FLOAT NOT NULL,

  -- Machine constraints for AI
  constraints JSONB NOT NULL,

  -- Versioning
  version INT NOT NULL DEFAULT 1,
  input_hash TEXT,

  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Profile History (Drift Analysis)

```sql
CREATE TABLE profile_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),

  profile_type TEXT NOT NULL,  -- 'psychometric' | 'aesthetic' | 'constellation' | 'representation'
  profile_data JSONB NOT NULL,
  version INT NOT NULL,
  trigger TEXT NOT NULL,  -- 'quiz_complete' | 'profile_update' | 'periodic'

  created_at TIMESTAMPTZ
);
```

## Row Level Security

All user-owned tables have RLS enabled:

```sql
-- Users can only access their own data
CREATE POLICY users_own_data ON psychometric_profiles
  FOR ALL USING (auth.uid() = user_id);
```

Content tables are readable by all authenticated users.

## Indexes

Key indexes for performance:

- `idx_representation_user` - Fast lookup by user
- `idx_representation_temporal` - Filter by temporal style
- `idx_representation_constraints` - GIN index for JSONB queries (clustering)
- `idx_history_user` + `idx_history_created` - Efficient history queries

## Usage with TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';
import { createStorageClient } from '@/lib/storage';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const storage = createStorageClient(supabase);

// Save representation profile
await storage.representation.save(userId, profile, constraints);

// Get full user profile
const fullProfile = await storage.profile.getFullProfile(userId);

// Get profile history
const history = await storage.history.getForUser(userId, 'representation');
```

## Future: Clustering (Module 5)

When population reaches 500+ users, enable clustering:

```sql
-- Get all profiles for batch clustering
SELECT * FROM representation_profiles;

-- Store cluster results
INSERT INTO subculture_clusters (cluster_id, stage, coherence, aesthetic_constraints)
VALUES ('C-0001', 'forming', 0.72, '{"energyRange": [0.6, 0.8]}');

-- Link users to clusters
INSERT INTO user_subculture_fits (user_id, subculture_id, affinity_score, adoption_stage)
VALUES ($1, $2, 85, 'early');
```
