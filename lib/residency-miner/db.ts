import { neon } from "@neondatabase/serverless";
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

function getClient() {
  return neon(process.env.DATABASE_URL!);
}

function rowToOpportunity(row: Record<string, unknown>): Opportunity {
  return {
    id: row.id as string,
    name: row.name as string,
    org: row.org as string,
    url: row.url as string,
    deadline: row.deadline as string,
    genre: ((row.genre as string[]) ?? []) as Genre[],
    duration: row.duration as string,
    stipend: row.stipend as number | null,
    stipendMax: (row.stipend_max ?? null) as number | null,
    location: row.location as string,
    eligibility: row.eligibility as string,
    description: row.description as string,
    firstSeen: (row.first_seen as Date).toISOString(),
    lastUpdated: (row.last_updated as Date).toISOString(),
    sourceUrl: row.source_url as string,
  };
}

export async function getOpportunities(filters?: {
  genre?: Genre;
  deadlineBefore?: string;
  deadlineAfter?: string;
  sort?: "deadline" | "firstSeen";
  order?: "asc" | "desc";
}): Promise<Opportunity[]> {
  const sql = getClient();

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
    return rows.map(rowToOpportunity);
  }

  let rows: Record<string, unknown>[];

  const g = filters?.genre;
  const da = filters?.deadlineAfter;
  const db = filters?.deadlineBefore;

  if (da && !g && !db) {
    rows =
      await sql`SELECT * FROM opportunities WHERE deadline >= ${da} ORDER BY deadline ASC`;
  } else if (da && g && !db) {
    rows =
      await sql`SELECT * FROM opportunities WHERE deadline >= ${da} AND genre @> ARRAY[${g}]::text[] ORDER BY deadline ASC`;
  } else if (g && !da && !db) {
    rows =
      await sql`SELECT * FROM opportunities WHERE genre @> ARRAY[${g}]::text[] ORDER BY deadline ASC`;
  } else {
    rows = await sql`SELECT * FROM opportunities ORDER BY deadline ASC`;
    rows = rows.filter((r) => {
      if (g && !(r.genre as string[])?.includes(g)) return false;
      if (da && (r.deadline as string) < da) return false;
      if (db && (r.deadline as string) > db) return false;
      return true;
    });
  }

  return rows.map(rowToOpportunity);
}

export async function upsertOpportunity(opp: Opportunity): Promise<void> {
  const sql = getClient();
  await sql`
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
      last_updated = NOW()`;
}

export async function logRun(log: MineRunLog): Promise<void> {
  const sql = getClient();
  const errorsJson = JSON.stringify(log.errors);
  await sql`
    INSERT INTO run_logs (sources_fetched, new_found, updated, errors)
    VALUES (${log.sourcesFetched}, ${log.newFound}, ${log.updated}, ${errorsJson}::jsonb)`;
}

export async function getLastRun(): Promise<MineRunLog | null> {
  const sql = getClient();
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

function rowToSource(row: Record<string, unknown>): Source {
  return {
    id: row.id as string,
    name: row.name as string,
    url: row.url as string,
    type: row.type as SourceType,
    status: row.status as SourceStatus,
    discoveredAt: (row.discovered_at as Date).toISOString(),
    lastFetchedAt: row.last_fetched_at
      ? (row.last_fetched_at as Date).toISOString()
      : null,
    lastSuccessAt: row.last_success_at
      ? (row.last_success_at as Date).toISOString()
      : null,
    successCount: row.success_count as number,
    failureCount: row.failure_count as number,
    consecutiveFailures: row.consecutive_failures as number,
  };
}

export async function getActiveSources(): Promise<Source[]> {
  const sql = getClient();
  const rows =
    await sql`SELECT * FROM sources WHERE status = 'active' ORDER BY discovered_at ASC`;
  return rows.map(rowToSource);
}

export async function getAllSources(): Promise<Source[]> {
  const sql = getClient();
  const rows = await sql`SELECT * FROM sources ORDER BY discovered_at ASC`;
  return rows.map(rowToSource);
}

export async function insertSource(input: {
  id: string;
  name: string;
  url: string;
  type: SourceType;
}): Promise<boolean> {
  const sql = getClient();
  const result = await sql`
    INSERT INTO sources (id, name, url, type)
    VALUES (${input.id}, ${input.name}, ${input.url}, ${input.type})
    ON CONFLICT (url) DO NOTHING
    RETURNING id`;
  return result.length > 0;
}

export async function recordSourceSuccess(id: string): Promise<void> {
  const sql = getClient();
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

export async function logDiscovery(log: DiscoveryLog): Promise<void> {
  const sql = getClient();
  const rejectedJson = JSON.stringify(log.rejected);
  await sql`
    INSERT INTO discovery_logs (candidates, added, rejected)
    VALUES (${log.candidates}, ${log.added}, ${rejectedJson}::jsonb)`;
}
