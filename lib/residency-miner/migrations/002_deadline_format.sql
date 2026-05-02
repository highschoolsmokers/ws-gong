-- Defense in depth for the deadline column.
--   The Zod deadlineSchema in lib/residency-miner/extract.ts already enforces
--   YYYY-MM-DD or 'rolling' on insert, but the DB had no equivalent guard, so
--   any future code path bypassing the validator could poison sort order and
--   the formatDeadline UI ("Invalid Date").
--   Apply manually against Neon. NOT applied automatically.
--   Reversible: rollback block at the bottom.

BEGIN;

ALTER TABLE opportunities
  ADD CONSTRAINT valid_deadline_format
  CHECK (deadline ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' OR deadline = 'rolling')
  NOT VALID;

-- Validate against existing rows once you've confirmed there are no
-- non-conforming deadlines in production:
-- ALTER TABLE opportunities VALIDATE CONSTRAINT valid_deadline_format;

COMMIT;

-- Rollback (manual):
-- BEGIN;
--   ALTER TABLE opportunities DROP CONSTRAINT IF EXISTS valid_deadline_format;
-- COMMIT;
