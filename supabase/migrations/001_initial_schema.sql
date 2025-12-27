-- =============================================================================
-- Subtaste Initial Schema
-- =============================================================================
-- This migration creates the core tables for the Subtaste taste profiling system.
--
-- Layers:
-- 1. Users - Core user identity
-- 2. Psychometric Profiles - Big Five + extended traits
-- 3. Aesthetic Preferences - Visual and music preferences
-- 4. Constellation Profiles - Archetypal mappings
-- 5. Representation Profiles - Universal dimensions (Module 4)
-- 6. Content & Interactions - Behavioral data
--
-- Run with: supabase db push
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. Users
-- =============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_users_email ON users(email);

-- =============================================================================
-- 2. Psychometric Profiles
-- =============================================================================

CREATE TABLE psychometric_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Big Five (OCEAN) - all 0-1 normalized
  openness FLOAT NOT NULL CHECK (openness >= 0 AND openness <= 1),
  conscientiousness FLOAT NOT NULL CHECK (conscientiousness >= 0 AND conscientiousness <= 1),
  extraversion FLOAT NOT NULL CHECK (extraversion >= 0 AND extraversion <= 1),
  agreeableness FLOAT NOT NULL CHECK (agreeableness >= 0 AND agreeableness <= 1),
  neuroticism FLOAT NOT NULL CHECK (neuroticism >= 0 AND neuroticism <= 1),

  -- Extended traits
  novelty_seeking FLOAT NOT NULL CHECK (novelty_seeking >= 0 AND novelty_seeking <= 1),
  aesthetic_sensitivity FLOAT NOT NULL CHECK (aesthetic_sensitivity >= 0 AND aesthetic_sensitivity <= 1),
  risk_tolerance FLOAT NOT NULL CHECK (risk_tolerance >= 0 AND risk_tolerance <= 1),

  -- Confidence scores (from IRT scoring)
  trait_confidence JSONB DEFAULT '{}',
  overall_confidence FLOAT DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_psychometric_user ON psychometric_profiles(user_id);

-- =============================================================================
-- 3. Aesthetic Preferences
-- =============================================================================

CREATE TABLE aesthetic_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Visual preferences
  color_palette_vector FLOAT[] DEFAULT '{}',
  darkness_preference FLOAT NOT NULL DEFAULT 0.5 CHECK (darkness_preference >= 0 AND darkness_preference <= 1),
  complexity_preference FLOAT NOT NULL DEFAULT 0.5 CHECK (complexity_preference >= 0 AND complexity_preference <= 1),
  symmetry_preference FLOAT NOT NULL DEFAULT 0.5 CHECK (symmetry_preference >= 0 AND symmetry_preference <= 1),
  organic_vs_synthetic FLOAT NOT NULL DEFAULT 0.5 CHECK (organic_vs_synthetic >= 0 AND organic_vs_synthetic <= 1),
  minimal_vs_maximal FLOAT NOT NULL DEFAULT 0.5 CHECK (minimal_vs_maximal >= 0 AND minimal_vs_maximal <= 1),

  -- Music preferences
  tempo_range_min FLOAT NOT NULL DEFAULT 80,
  tempo_range_max FLOAT NOT NULL DEFAULT 140,
  energy_range_min FLOAT NOT NULL DEFAULT 0.3 CHECK (energy_range_min >= 0 AND energy_range_min <= 1),
  energy_range_max FLOAT NOT NULL DEFAULT 0.7 CHECK (energy_range_max >= 0 AND energy_range_max <= 1),
  harmonic_dissonance_tolerance FLOAT NOT NULL DEFAULT 0.5 CHECK (harmonic_dissonance_tolerance >= 0 AND harmonic_dissonance_tolerance <= 1),
  rhythm_preference FLOAT NOT NULL DEFAULT 0.5 CHECK (rhythm_preference >= 0 AND rhythm_preference <= 1),
  acoustic_vs_digital FLOAT NOT NULL DEFAULT 0.5 CHECK (acoustic_vs_digital >= 0 AND acoustic_vs_digital <= 1),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_aesthetic_user ON aesthetic_preferences(user_id);

-- =============================================================================
-- 4. Constellation Profiles
-- =============================================================================

CREATE TABLE constellation_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Primary constellation (one of 27)
  primary_constellation_id TEXT NOT NULL,

  -- Blend weights as JSONB (constellation_id -> weight 0-1)
  blend_weights JSONB NOT NULL DEFAULT '{}',

  -- Derived scores (0-100)
  subtaste_index INT NOT NULL DEFAULT 50 CHECK (subtaste_index >= 0 AND subtaste_index <= 100),
  explorer_score INT NOT NULL DEFAULT 50 CHECK (explorer_score >= 0 AND explorer_score <= 100),
  early_adopter_score INT NOT NULL DEFAULT 50 CHECK (early_adopter_score >= 0 AND early_adopter_score <= 100),

  -- Enhanced interpretation (Module 3)
  enhanced_interpretation JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_constellation_user ON constellation_profiles(user_id);
CREATE INDEX idx_constellation_primary ON constellation_profiles(primary_constellation_id);

-- =============================================================================
-- 5. Representation Profiles (Module 4)
-- =============================================================================

CREATE TABLE representation_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Core representation dimensions (0-1 unless otherwise noted)
  energy FLOAT NOT NULL CHECK (energy >= 0 AND energy <= 1),
  complexity FLOAT NOT NULL CHECK (complexity >= 0 AND complexity <= 1),
  temporal_style TEXT NOT NULL CHECK (temporal_style IN ('looped', 'evolving', 'episodic')),
  sensory_density FLOAT NOT NULL CHECK (sensory_density >= 0 AND sensory_density <= 1),
  identity_projection FLOAT NOT NULL CHECK (identity_projection >= 0 AND identity_projection <= 1),
  ambiguity_tolerance FLOAT NOT NULL CHECK (ambiguity_tolerance >= 0 AND ambiguity_tolerance <= 1),

  -- Machine-readable constraints for AI systems
  constraints JSONB NOT NULL DEFAULT '{}',

  -- Versioning for schema evolution
  version INT NOT NULL DEFAULT 1,

  -- Input hash for caching/deduplication
  input_hash TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_representation_user ON representation_profiles(user_id);
CREATE INDEX idx_representation_temporal ON representation_profiles(temporal_style);

-- GIN index for constraint queries (future clustering)
CREATE INDEX idx_representation_constraints ON representation_profiles USING GIN (constraints);

-- =============================================================================
-- 6. Profile History (for drift analysis)
-- =============================================================================

CREATE TABLE profile_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Snapshot type
  profile_type TEXT NOT NULL CHECK (profile_type IN ('psychometric', 'aesthetic', 'constellation', 'representation')),

  -- Full profile snapshot as JSONB
  profile_data JSONB NOT NULL,

  -- Version at time of snapshot
  version INT NOT NULL DEFAULT 1,

  -- Trigger for snapshot (quiz_complete, manual_update, periodic)
  trigger TEXT NOT NULL DEFAULT 'quiz_complete',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_history_user ON profile_history(user_id);
CREATE INDEX idx_history_type ON profile_history(profile_type);
CREATE INDEX idx_history_created ON profile_history(created_at DESC);

-- =============================================================================
-- 7. Quiz Sessions (for IRT scoring)
-- =============================================================================

CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Session state
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  -- Questions and answers
  selected_questions JSONB NOT NULL DEFAULT '[]',
  answers JSONB NOT NULL DEFAULT '[]',

  -- Progress tracking
  current_question_index INT NOT NULL DEFAULT 0,
  estimated_confidence FLOAT DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- For returning users (anchor questions)
  is_returning_user BOOLEAN NOT NULL DEFAULT FALSE,
  previous_profile_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_user ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_status ON quiz_sessions(status);

-- =============================================================================
-- 8. Content Items (future)
-- =============================================================================

CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'track', 'ai_artifact')),
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  content_url TEXT,

  -- Feature embedding for similarity (future ML)
  feature_embedding FLOAT[],

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  subculture_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_type ON content_items(content_type);
CREATE INDEX idx_content_tags ON content_items USING GIN (tags);

-- =============================================================================
-- 9. User Content Interactions
-- =============================================================================

CREATE TABLE user_content_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,

  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'dislike', 'save', 'share', 'skip')),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  dwell_time_ms INT,
  source TEXT NOT NULL CHECK (source IN ('quiz', 'swipe', 'feed')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interaction_user ON user_content_interactions(user_id);
CREATE INDEX idx_interaction_content ON user_content_interactions(content_id);
CREATE INDEX idx_interaction_type ON user_content_interactions(interaction_type);
CREATE INDEX idx_interaction_created ON user_content_interactions(created_at DESC);

-- =============================================================================
-- 10. Subculture Clusters (future - Module 5)
-- =============================================================================

CREATE TABLE subculture_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Cluster identity
  cluster_id TEXT UNIQUE NOT NULL,  -- e.g., "C-0193"
  name TEXT,

  -- Cluster state
  stage TEXT NOT NULL DEFAULT 'forming' CHECK (stage IN ('forming', 'stable', 'dissolving', 'mainstreaming')),
  coherence FLOAT NOT NULL DEFAULT 0 CHECK (coherence >= 0 AND coherence <= 1),
  member_count INT NOT NULL DEFAULT 0,

  -- Aesthetic constraints for this cluster
  aesthetic_constraints JSONB NOT NULL DEFAULT '{}',

  -- Centroid in representation space
  centroid JSONB,

  -- Tags and hints
  tags TEXT[] DEFAULT '{}',
  constellation_hints TEXT[] DEFAULT '{}',

  -- Embedding for similarity
  embedding_vector FLOAT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cluster_stage ON subculture_clusters(stage);
CREATE INDEX idx_cluster_coherence ON subculture_clusters(coherence DESC);

-- =============================================================================
-- 11. User Subculture Fit
-- =============================================================================

CREATE TABLE user_subculture_fits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subculture_id UUID NOT NULL REFERENCES subculture_clusters(id) ON DELETE CASCADE,

  affinity_score INT NOT NULL CHECK (affinity_score >= 0 AND affinity_score <= 100),
  early_adopter_score INT NOT NULL CHECK (early_adopter_score >= 0 AND early_adopter_score <= 100),
  adoption_stage TEXT NOT NULL CHECK (adoption_stage IN ('early', 'mid', 'late')),

  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, subculture_id)
);

CREATE INDEX idx_fit_user ON user_subculture_fits(user_id);
CREATE INDEX idx_fit_subculture ON user_subculture_fits(subculture_id);
CREATE INDEX idx_fit_adoption ON user_subculture_fits(adoption_stage);

-- =============================================================================
-- Triggers for updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_psychometric_updated_at
  BEFORE UPDATE ON psychometric_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aesthetic_updated_at
  BEFORE UPDATE ON aesthetic_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_constellation_updated_at
  BEFORE UPDATE ON constellation_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_representation_updated_at
  BEFORE UPDATE ON representation_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_updated_at
  BEFORE UPDATE ON quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cluster_updated_at
  BEFORE UPDATE ON subculture_clusters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fit_updated_at
  BEFORE UPDATE ON user_subculture_fits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Row Level Security (RLS) Policies
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychometric_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE constellation_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE representation_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subculture_fits ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY users_own_data ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY psychometric_own_data ON psychometric_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY aesthetic_own_data ON aesthetic_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY constellation_own_data ON constellation_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY representation_own_data ON representation_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY history_own_data ON profile_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY quiz_own_data ON quiz_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY interactions_own_data ON user_content_interactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY fits_own_data ON user_subculture_fits
  FOR ALL USING (auth.uid() = user_id);

-- Content items are readable by all authenticated users
CREATE POLICY content_read_all ON content_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Subculture clusters are readable by all authenticated users
CREATE POLICY clusters_read_all ON subculture_clusters
  FOR SELECT USING (auth.role() = 'authenticated');
