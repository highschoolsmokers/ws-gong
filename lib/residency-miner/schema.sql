CREATE TABLE IF NOT EXISTS opportunities (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  org             TEXT NOT NULL,
  url             TEXT NOT NULL,
  deadline        TEXT NOT NULL,
  genre           TEXT[] NOT NULL DEFAULT '{}',
  duration        TEXT NOT NULL DEFAULT 'varies',
  stipend         INTEGER,
  stipend_max     INTEGER,
  location        TEXT NOT NULL DEFAULT 'Unknown',
  eligibility     TEXT NOT NULL DEFAULT 'Open',
  description     TEXT NOT NULL DEFAULT '',
  first_seen      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_url      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities (deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_genre ON opportunities USING GIN (genre);

CREATE TABLE IF NOT EXISTS run_logs (
  id              SERIAL PRIMARY KEY,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sources_fetched INTEGER NOT NULL,
  new_found       INTEGER NOT NULL,
  updated         INTEGER NOT NULL,
  errors          JSONB NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_run_logs_timestamp ON run_logs (timestamp DESC);

CREATE TABLE IF NOT EXISTS sources (
  id                   TEXT PRIMARY KEY,
  name                 TEXT NOT NULL,
  url                  TEXT NOT NULL UNIQUE,
  type                 TEXT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'active',
  discovered_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_fetched_at      TIMESTAMPTZ,
  last_success_at      TIMESTAMPTZ,
  success_count        INTEGER NOT NULL DEFAULT 0,
  failure_count        INTEGER NOT NULL DEFAULT 0,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT valid_source_status CHECK (status IN ('active', 'inactive')),
  CONSTRAINT valid_source_type CHECK (type IN ('aggregator', 'org_listing'))
);

CREATE INDEX IF NOT EXISTS idx_sources_status ON sources (status);

CREATE TABLE IF NOT EXISTS discovery_logs (
  id              SERIAL PRIMARY KEY,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  candidates      INTEGER NOT NULL,
  added           INTEGER NOT NULL,
  rejected        JSONB NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_discovery_logs_timestamp ON discovery_logs (timestamp DESC);
