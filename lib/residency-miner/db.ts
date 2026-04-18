import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import type {
  Opportunity,
  Genre,
  MineRunLog,
  Source,
  SourceType,
  SourceStatus,
  DiscoveryLog,
} from "./types";

const FAILURE_DEACTIVATE_THRESHOLD = 4;

// Runtime validation for DB rows. Catches schema drift (column renames,
// nullability changes) before bad data propagates to the UI.
const opportunityRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  org: z.string(),
  url: z.string(),
  deadline: z.string(),
  genre: z.array(z.string()).nullable().default([]),
  duration: z.string(),
  stipend: z.number().nullable(),
  stipend_max: z.number().nullable().optional(),
  location: z.string(),
  eligibility: z.string(),
  description: z.string(),
  first_seen: z.date(),
  last_updated: z.date(),
  source_url: z.string(),
});

const sourceRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  type: z.enum(["aggregator", "org_listing"]),
  status: z.enum(["active", "inactive"]),
  discovered_at: z.date(),
  last_fetched_at: z.date().nullable(),
  last_success_at: z.date().nullable(),
  success_count: z.number(),
  failure_count: z.number(),
  consecutive_failures: z.number(),
});

let client: NeonQueryFunction<false, false> | null = null;

function getClient(): NeonQueryFunction<false, false> | null {
  if (!process.env.DATABASE_URL) return null;
  if (!client) client = neon(process.env.DATABASE_URL);
  return client;
}

function requireClient(): NeonQueryFunction<false, false> {
  const sql = getClient();
  if (!sql) throw new Error("DATABASE_URL is not configured");
  return sql;
}

function rowToOpportunity(row: Record<string, unknown>): Opportunity | null {
  const parsed = opportunityRowSchema.safeParse(row);
  if (!parsed.success) {
    Sentry.captureMessage("residency db: malformed opportunity row", {
      level: "warning",
      extra: { issues: parsed.error.issues, row },
    });
    return null;
  }
  const r = parsed.data;
  return {
    id: r.id,
    name: r.name,
    org: r.org,
    url: r.url,
    deadline: r.deadline,
    genre: (r.genre ?? []) as Genre[],
    duration: r.duration,
    stipend: r.stipend,
    stipendMax: r.stipend_max ?? null,
    location: r.location,
    eligibility: r.eligibility,
    description: r.description,
    firstSeen: r.first_seen.toISOString(),
    lastUpdated: r.last_updated.toISOString(),
    sourceUrl: r.source_url,
  };
}

function mapOpportunityRows(rows: Record<string, unknown>[]): Opportunity[] {
  return rows.map(rowToOpportunity).filter((o): o is Opportunity => o !== null);
}

export async function getOpportunities(filters?: {
  genre?: Genre;
  deadlineBefore?: string;
  deadlineAfter?: string;
  sort?: "deadline" | "firstSeen";
  order?: "asc" | "desc";
}): Promise<Opportunity[]> {
  const sql = getClient();
  if (!sql) return [];

  // Rolling opportunities are stored as the literal string "rolling", which
  // sorts after any ISO date under lexicographic comparison. That means they
  // naturally appear at the tail of ORDER BY deadline ASC — which is what we
  // want: dated opportunities first, rolling last.

  if (!filters?.genre && !filters?.deadlineAfter && !filters?.deadlineBefore) {
    const sortByFirstSeen = filters?.sort === "firstSeen";
    const desc = filters?.order === "desc";

    let rows: Record<string, unknown>[];
    if (sortByFirstSeen && desc) {
      rows = await sql`SELECT * FROM opportunities ORDER BY first_seen DESC`;
    } else if (sortByFirstSeen) {
      rows = await sql`SELECT * FROM opportunities ORDER BY first_seen ASC`;
    } else if (desc) {
      rows = await sql`SELECT * FROM opportunities ORDER BY deadline DESC`;
    } else {
      rows = await sql`SELECT * FROM opportunities ORDER BY deadline ASC`;
    }
    return mapOpportunityRows(rows);
  }

  let rows: Record<string, unknown>[];

  const g = filters?.genre;
  const da = filters?.deadlineAfter;
  const db = filters?.deadlineBefore;

  if (da && !g && !db) {
    rows =
      await sql`SELECT * FROM opportunities WHERE deadline >= ${da} OR deadline = 'rolling' ORDER BY deadline ASC`;
  } else if (da && g && !db) {
    rows =
      await sql`SELECT * FROM opportunities WHERE (deadline >= ${da} OR deadline = 'rolling') AND genre @> ARRAY[${g}]::text[] ORDER BY deadline ASC`;
  } else if (g && !da && !db) {
    rows =
      await sql`SELECT * FROM opportunities WHERE genre @> ARRAY[${g}]::text[] ORDER BY deadline ASC`;
  } else if (db && !da && !g) {
    rows =
      await sql`SELECT * FROM opportunities WHERE deadline <= ${db} AND deadline <> 'rolling' ORDER BY deadline ASC`;
  } else if (db && g && !da) {
    rows =
      await sql`SELECT * FROM opportunities WHERE deadline <= ${db} AND deadline <> 'rolling' AND genre @> ARRAY[${g}]::text[] ORDER BY deadline ASC`;
  } else if (da && db && !g) {
    rows =
      await sql`SELECT * FROM opportunities WHERE ((deadline >= ${da} AND deadline <= ${db}) OR deadline = 'rolling') ORDER BY deadline ASC`;
  } else {
    rows =
      await sql`SELECT * FROM opportunities WHERE ((deadline >= ${da ?? ""} AND deadline <= ${db ?? "9999-12-31"}) OR deadline = 'rolling') AND genre @> ARRAY[${g}]::text[] ORDER BY deadline ASC`;
  }

  return mapOpportunityRows(rows);
}

export async function upsertOpportunity(
  opp: Opportunity,
): Promise<{ inserted: boolean }> {
  const sql = requireClient();
  const rows = await sql`
    INSERT INTO opportunities (id, name, org, url, deadline, genre, duration, stipend, stipend_max, location, eligibility, description, source_url)
    VALUES (${opp.id}, ${opp.name}, ${opp.org}, ${opp.url}, ${opp.deadline}, ${opp.genre}, ${opp.duration}, ${opp.stipend}, ${opp.stipendMax}, ${opp.location}, ${opp.eligibility}, ${opp.description}, ${opp.sourceUrl})
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      org = EXCLUDED.org,
      url = EXCLUDED.url,
      deadline = EXCLUDED.deadline,
      genre = EXCLUDED.genre,
      duration = EXCLUDED.duration,
      stipend = EXCLUDED.stipend,
      stipend_max = EXCLUDED.stipend_max,
      location = EXCLUDED.location,
      eligibility = EXCLUDED.eligibility,
      description = EXCLUDED.description,
      source_url = EXCLUDED.source_url,
      last_updated = NOW()
    RETURNING (xmax = 0) AS inserted`;
  return { inserted: Boolean((rows[0] as { inserted: boolean })?.inserted) };
}

export async function logRun(log: MineRunLog): Promise<void> {
  const sql = getClient();
  if (!sql) return;
  const errorsJson = JSON.stringify(log.errors);
  await sql`
    INSERT INTO run_logs (sources_fetched, new_found, updated, errors)
    VALUES (${log.sourcesFetched}, ${log.newFound}, ${log.updated}, ${errorsJson}::jsonb)`;
}

export async function getLastRun(): Promise<MineRunLog | null> {
  const sql = getClient();
  if (!sql) return null;
  const rows =
    await sql`SELECT * FROM run_logs ORDER BY timestamp DESC LIMIT 1`;

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    timestamp: (row.timestamp as Date).toISOString(),
    sourcesFetched: row.sources_fetched as number,
    newFound: row.new_found as number,
    updated: row.updated as number,
    errors: row.errors as { url: string; error: string }[],
  };
}

function rowToSource(row: Record<string, unknown>): Source | null {
  const parsed = sourceRowSchema.safeParse(row);
  if (!parsed.success) {
    Sentry.captureMessage("residency db: malformed source row", {
      level: "warning",
      extra: { issues: parsed.error.issues, row },
    });
    return null;
  }
  const r = parsed.data;
  return {
    id: r.id,
    name: r.name,
    url: r.url,
    type: r.type as SourceType,
    status: r.status as SourceStatus,
    discoveredAt: r.discovered_at.toISOString(),
    lastFetchedAt: r.last_fetched_at ? r.last_fetched_at.toISOString() : null,
    lastSuccessAt: r.last_success_at ? r.last_success_at.toISOString() : null,
    successCount: r.success_count,
    failureCount: r.failure_count,
    consecutiveFailures: r.consecutive_failures,
  };
}

function mapSourceRows(rows: Record<string, unknown>[]): Source[] {
  return rows.map(rowToSource).filter((s): s is Source => s !== null);
}

export async function getActiveSources(): Promise<Source[]> {
  const sql = getClient();
  if (!sql) return [];
  const rows =
    await sql`SELECT * FROM sources WHERE status = 'active' ORDER BY discovered_at ASC`;
  return mapSourceRows(rows);
}

export async function getAllSources(): Promise<Source[]> {
  const sql = getClient();
  if (!sql) return [];
  const rows = await sql`SELECT * FROM sources ORDER BY discovered_at ASC`;
  return mapSourceRows(rows);
}

export async function insertSource(input: {
  id: string;
  name: string;
  url: string;
  type: SourceType;
  reason?: string;
}): Promise<boolean> {
  const sql = requireClient();
  const result = await sql`
    INSERT INTO sources (id, name, url, type, reason)
    VALUES (${input.id}, ${input.name}, ${input.url}, ${input.type}, ${input.reason ?? null})
    ON CONFLICT (url) DO NOTHING
    RETURNING id`;
  return result.length > 0;
}

export async function recordSourceSuccess(id: string): Promise<void> {
  const sql = getClient();
  if (!sql) return;
  await sql`
    UPDATE sources
    SET success_count = success_count + 1,
        consecutive_failures = 0,
        last_fetched_at = NOW(),
        last_success_at = NOW()
    WHERE id = ${id}`;
}

export async function recordSourceFailure(id: string): Promise<void> {
  const sql = getClient();
  if (!sql) return;
  await sql`
    UPDATE sources
    SET failure_count = failure_count + 1,
        consecutive_failures = consecutive_failures + 1,
        last_fetched_at = NOW(),
        status = CASE
          WHEN consecutive_failures + 1 >= ${FAILURE_DEACTIVATE_THRESHOLD} THEN 'inactive'
          ELSE status
        END
    WHERE id = ${id}`;
}

export async function getSourceStats(): Promise<{
  active: number;
  inactive: number;
}> {
  const sql = getClient();
  if (!sql) return { active: 0, inactive: 0 };
  const rows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'active') AS active,
      COUNT(*) FILTER (WHERE status = 'inactive') AS inactive
    FROM sources`;
  const row = rows[0] ?? { active: 0, inactive: 0 };
  return {
    active: Number(row.active ?? 0),
    inactive: Number(row.inactive ?? 0),
  };
}

export async function logDiscovery(log: DiscoveryLog): Promise<void> {
  const sql = getClient();
  if (!sql) return;
  const rejectedJson = JSON.stringify(log.rejected);
  await sql`
    INSERT INTO discovery_logs (candidates, added, rejected)
    VALUES (${log.candidates}, ${log.added}, ${rejectedJson}::jsonb)`;
}

// Log retention: delete rows older than the given number of days. Call from
// a scheduled route to keep run_logs / discovery_logs from growing unbounded.
export async function pruneLogs(keepDays: number): Promise<{
  runLogs: number;
  discoveryLogs: number;
}> {
  const sql = getClient();
  if (!sql) return { runLogs: 0, discoveryLogs: 0 };
  const runRows =
    await sql`DELETE FROM run_logs WHERE timestamp < NOW() - (${keepDays} || ' days')::interval RETURNING id`;
  const discoveryRows =
    await sql`DELETE FROM discovery_logs WHERE timestamp < NOW() - (${keepDays} || ' days')::interval RETURNING id`;
  return { runLogs: runRows.length, discoveryLogs: discoveryRows.length };
}
