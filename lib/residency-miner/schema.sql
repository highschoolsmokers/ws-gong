CREATE TABLE IF NOT EXISTS opportunities (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  org             TEXT NOT NULL,
  url             TEXT NOT NULL,
  deadline        TEXT NOT NULL,
  genre           TEXT[] NOT NULL DEFAULT '{}',
  duration        TEXT NOT NULL DEFAULT 'varies',
  stipend         INTEGER,
  location        TEXT NOT NULL DEFAULT 'Unknown',
  eligibility     TEXT NOT NULL DEFAULT 'Open',
  description     TEXT NOT NULL DEFAULT '',
  first_seen      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL DEFAULT 'new',
  source_url      TEXT NOT NULL,

  CONSTRAINT valid_status CHECK (status IN ('new', 'reviewed', 'bookmarked', 'applied', 'skipped'))
);

CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities (deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities (status);
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
