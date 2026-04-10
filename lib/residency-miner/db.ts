import { neon } from "@neondatabase/serverless";
import type { Opportunity, Status, Genre, MineRunLog } from "./types";

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
    location: row.location as string,
    eligibility: row.eligibility as string,
    description: row.description as string,
    firstSeen: (row.first_seen as Date).toISOString(),
    lastUpdated: (row.last_updated as Date).toISOString(),
    status: row.status as Status,
    sourceUrl: row.source_url as string,
  };
}

export async function getOpportunities(filters?: {
  status?: Status;
  genre?: Genre;
  deadlineBefore?: string;
  deadlineAfter?: string;
  sort?: "deadline" | "firstSeen";
  order?: "asc" | "desc";
}): Promise<Opportunity[]> {
  const sql = getClient();

  // No filters — fast path
  if (
    !filters?.status &&
    !filters?.genre &&
    !filters?.deadlineAfter &&
    !filters?.deadlineBefore
  ) {
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

  // With filters — build dynamically
  // We use individual tagged template queries per filter combination
  // to stay safe with parameterized queries
  let rows: Record<string, unknown>[];

  const s = filters?.status;
  const g = filters?.genre;
  const da = filters?.deadlineAfter;
  const db = filters?.deadlineBefore;

  // Most common case: deadlineAfter only (default view)
  if (da && !s && !g && !db) {
    rows =
      await sql`SELECT * FROM opportunities WHERE deadline >= ${da} ORDER BY deadline ASC`;
  } else if (da && s && !g && !db) {
    rows =
      await sql`SELECT * FROM opportunities WHERE deadline >= ${da} AND status = ${s} ORDER BY deadline ASC`;
  } else if (da && g && !s && !db) {
    rows =
      await sql`SELECT * FROM opportunities WHERE deadline >= ${da} AND genre @> ARRAY[${g}]::text[] ORDER BY deadline ASC`;
  } else if (da && s && g && !db) {
    rows =
      await sql`SELECT * FROM opportunities WHERE deadline >= ${da} AND status = ${s} AND genre @> ARRAY[${g}]::text[] ORDER BY deadline ASC`;
  } else if (s && !da && !g && !db) {
    rows =
      await sql`SELECT * FROM opportunities WHERE status = ${s} ORDER BY deadline ASC`;
  } else if (g && !da && !s && !db) {
    rows =
      await sql`SELECT * FROM opportunities WHERE genre @> ARRAY[${g}]::text[] ORDER BY deadline ASC`;
  } else if (s && g && !da && !db) {
    rows =
      await sql`SELECT * FROM opportunities WHERE status = ${s} AND genre @> ARRAY[${g}]::text[] ORDER BY deadline ASC`;
  } else {
    // Fallback: fetch all and filter in JS
    rows = await sql`SELECT * FROM opportunities ORDER BY deadline ASC`;
    rows = rows.filter((r) => {
      if (s && r.status !== s) return false;
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
    INSERT INTO opportunities (id, name, org, url, deadline, genre, duration, stipend, location, eligibility, description, source_url)
    VALUES (${opp.id}, ${opp.name}, ${opp.org}, ${opp.url}, ${opp.deadline}, ${opp.genre}, ${opp.duration}, ${opp.stipend}, ${opp.location}, ${opp.eligibility}, ${opp.description}, ${opp.sourceUrl})
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      org = EXCLUDED.org,
      url = EXCLUDED.url,
      deadline = EXCLUDED.deadline,
      genre = EXCLUDED.genre,
      duration = EXCLUDED.duration,
      stipend = EXCLUDED.stipend,
      location = EXCLUDED.location,
      eligibility = EXCLUDED.eligibility,
      description = EXCLUDED.description,
      source_url = EXCLUDED.source_url,
      last_updated = NOW()`;
}

export async function updateStatus(id: string, status: Status): Promise<void> {
  const sql = getClient();
  await sql`UPDATE opportunities SET status = ${status} WHERE id = ${id}`;
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
