-- Initialize database for Ethos Analytics
-- Run with: psql $DATABASE_URL < scripts/init-db.sql

-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS aggregates CASCADE;
-- DROP TABLE IF EXISTS replies CASCADE;
-- DROP TABLE IF EXISTS reviews CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP TABLE IF EXISTS job_status CASCADE;

-- Ethos Analytics Database Schema

CREATE TABLE IF NOT EXISTS profiles (
  userkey TEXT PRIMARY KEY,
  twitter TEXT NULL UNIQUE,
  primary_wallet TEXT NULL,
  display_name TEXT NULL,
  avatar_url TEXT NULL,
  last_refreshed TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  userkey TEXT NOT NULL REFERENCES profiles(userkey) ON DELETE CASCADE,
  score TEXT NOT NULL CHECK(score IN ('POSITIVE', 'NEGATIVE', 'NEUTRAL')),
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  author_userkey TEXT,
  net_votes INT NULL,
  raw JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_userkey_score_created 
  ON reviews(userkey, score, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at 
  ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_author 
  ON reviews(author_userkey);

CREATE TABLE IF NOT EXISTS replies (
  id TEXT PRIMARY KEY,
  review_id TEXT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  author_userkey TEXT,
  raw JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_replies_review_id 
  ON replies(review_id);

CREATE TABLE IF NOT EXISTS aggregates (
  userkey TEXT PRIMARY KEY REFERENCES profiles(userkey) ON DELETE CASCADE,
  counts JSONB NOT NULL,           -- {pos: n, neg: n, neu: n}
  timeline JSONB NOT NULL,         -- [{month:'2025-07', pos:…, neg:…, neu:…}, ...]
  themes JSONB NOT NULL,           -- {positives:[{theme,weight,examples:[id,...]}], negatives:[...]}
  quotes JSONB NOT NULL,           -- {positives:[{id, snippet}], negatives:[...]}
  outliers JSONB NOT NULL,         -- [{id, reason:'very negative & many votes'}]
  summary TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Utility: track job status
CREATE TABLE IF NOT EXISTS job_status (
  userkey TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT NULL,
  reviews_fetched INT DEFAULT 0
);

-- Grant permissions (adjust based on your user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;

\echo 'Database schema initialized successfully!'

