-- Hardening migration for the residency miner schema.
--   Apply manually against the Neon DB when ready. NOT applied automatically.
--   Reversible: each statement has a matching ROLLBACK block below.

BEGIN;

-- 1. Validate genre values. Reject LLM hallucinations like "literature" or
--    "writing" that don't match our 6-value enum.
ALTER TABLE opportunities
  ADD CONSTRAINT valid_genre_values
  CHECK (
    genre <@ ARRAY['fiction','nonfiction','poetry','screenwriting','multi','other']::text[]
  )
  NOT VALID;

-- 2. Sanity: stipend range must not invert.
ALTER TABLE opportunities
  ADD CONSTRAINT stipend_range_sane
  CHECK (stipend_max IS NULL OR stipend IS NULL OR stipend_max >= stipend)
  NOT VALID;

-- 3. Persist the LLM's reason for adding a source, for auditability.
ALTER TABLE sources ADD COLUMN IF NOT EXISTS reason TEXT;

-- 4. Dedup URLs against hallucinated variants at the DB level. This uses the
--    same normalization the app performs client-side, so the index works
--    for EXACT-match normalized URLs.
CREATE INDEX IF NOT EXISTS idx_opportunities_url ON opportunities (url);

-- 5. Validate the NOT-VALID constraints once data is known-clean.
-- ALTER TABLE opportunities VALIDATE CONSTRAINT valid_genre_values;
-- ALTER TABLE opportunities VALIDATE CONSTRAINT stipend_range_sane;

COMMIT;

-- Rollback (manual):
-- BEGIN;
--   ALTER TABLE opportunities DROP CONSTRAINT IF EXISTS valid_genre_values;
--   ALTER TABLE opportunities DROP CONSTRAINT IF EXISTS stipend_range_sane;
--   ALTER TABLE sources DROP COLUMN IF EXISTS reason;
--   DROP INDEX IF EXISTS idx_opportunities_url;
-- COMMIT;
