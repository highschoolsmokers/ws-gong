# Residency Miner — Technical Specification

## Overview

A feature of ws-gong.com that automatically discovers writer residencies and fellowships from the web, extracts structured data using an LLM, stores results in Neon Postgres, and serves them at `/residencies`. Built as API routes and a page within the existing Next.js App Router project, deployed on Vercel.

## Architecture

```
Vercel Cron (weekly)
  → /api/mine (route handler inside ws-gong.com)
    → fetches HTML from source URLs
    → sends HTML to Claude API for structured extraction
    → deduplicates against existing Postgres records
    → upserts new/updated opportunities

/api/opportunities (route handler inside ws-gong.com)
  → GET: returns opportunities with optional filters
  → PATCH: updates status field on a single opportunity

/residencies (Next.js page inside ws-gong.com)
  → fetches from /api/opportunities
  → client-side filtering and display
```

## Tech Stack

- **Existing**: Next.js App Router, TypeScript, Vercel
- **New dependencies**: `@neondatabase/serverless`, `@anthropic-ai/sdk`
- **Database**: Neon Postgres (free tier)
- **LLM**: Anthropic Claude API (claude-sonnet-4-20250514)

## New Files

All paths are relative to the ws-gong.com project root.

```
src/
├── lib/
│   └── residency-miner/
│       ├── types.ts
│       ├── db.ts
│       ├── schema.sql
│       ├── extract.ts
│       ├── sources.ts
│       └── dedupe.ts
├── app/
│   ├── api/
│   │   ├── mine/
│   │   │   └── route.ts
│   │   └── opportunities/
│   │       └── route.ts
│   └── residencies/
│       └── page.tsx
```

All residency-miner logic lives under `src/lib/residency-miner/`. This keeps it isolated from the rest of the site. If it ever needs to be extracted into its own repo, move that directory and the two API routes.

## Environment Variables

Add to the existing `.env.local` and Vercel project settings:

```
DATABASE_URL=postgresql://<user>:<pass>@<host>.neon.tech/residency_miner?sslmode=require
ANTHROPIC_API_KEY=sk-ant-...
CRON_SECRET=<random string for securing the cron endpoint>
```

## Database Schema

### `src/lib/residency-miner/schema.sql`

Run this once against the Neon database to initialize.

```sql
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
```

## Data Model

### `src/lib/residency-miner/types.ts`

```typescript
export interface Opportunity {
  /** Deterministic ID: sha256(lowercase(org + name + deadlineYear)), truncated to 16 chars */
  id: string;

  /** Name of the residency/fellowship (e.g., "MacDowell Fellowship") */
  name: string;

  /** Sponsoring organization (e.g., "MacDowell") */
  org: string;

  /** Canonical URL to the opportunity listing or application page */
  url: string;

  /** Application deadline as ISO 8601 date string (YYYY-MM-DD), or "rolling" */
  deadline: string;

  /** Applicable genres */
  genre: Genre[];

  /** Duration as a human-readable string (e.g., "2 weeks", "1 month", "varies") */
  duration: string;

  /** Stipend amount in USD, or null if no stipend / unclear */
  stipend: number | null;

  /** Physical location (e.g., "Peterborough, NH") or "Remote" */
  location: string;

  /** Eligibility notes (e.g., "US citizens only", "emerging writers") or "Open" */
  eligibility: string;

  /** 1-3 sentence description */
  description: string;

  /** ISO 8601 datetime when this record was first created */
  firstSeen: string;

  /** ISO 8601 datetime when this record was last updated by a mining run */
  lastUpdated: string;

  /** User-managed status */
  status: Status;

  /** URL of the source page this was extracted from */
  sourceUrl: string;
}

export type Genre =
  | "fiction"
  | "nonfiction"
  | "poetry"
  | "screenwriting"
  | "multi"
  | "other";

export type Status = "new" | "reviewed" | "bookmarked" | "applied" | "skipped";

export interface MineRunLog {
  timestamp: string;
  sourcesFetched: number;
  newFound: number;
  updated: number;
  errors: { url: string; error: string }[];
}
```

## Database Layer

### `src/lib/residency-miner/db.ts`

Use `@neondatabase/serverless` with its `neon()` SQL tagged template function. This is the recommended driver for Vercel serverless — it uses HTTP by default, no connection pooling needed.

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
```

**Exported functions**:

```typescript
/** Return all opportunities, optionally filtered. Build WHERE clauses dynamically. */
export async function getOpportunities(filters?: {
  status?: Status;
  genre?: Genre;
  deadlineBefore?: string;
  deadlineAfter?: string;
}): Promise<Opportunity[]>;

/**
 * Upsert a single opportunity by id.
 * Uses INSERT ... ON CONFLICT (id) DO UPDATE.
 * On conflict: update all fields EXCEPT first_seen and status.
 * Set last_updated to NOW().
 */
export async function upsertOpportunity(opp: Opportunity): Promise<void>;

/** Update only the status of an opportunity. */
export async function updateStatus(id: string, status: Status): Promise<void>;

/** Insert a run log row. */
export async function logRun(log: MineRunLog): Promise<void>;

/** Get the most recent run log. */
export async function getLastRun(): Promise<MineRunLog | null>;
```

**Column name mapping**: The TypeScript interface uses camelCase (`firstSeen`, `lastUpdated`, `sourceUrl`). The Postgres columns use snake_case (`first_seen`, `last_updated`, `source_url`). Map between them in this module. All other code uses the TypeScript interface — no raw SQL outside this file.

**Design constraint**: This is the only file that imports `@neondatabase/serverless`. All other modules interact with the database through these functions.

## Source Configuration

### `src/lib/residency-miner/sources.ts`

```typescript
export interface Source {
  name: string;
  url: string;
  type: "aggregator" | "org_listing" | "calendar";
}

export const SOURCES: Source[] = [
  // Aggregators
  {
    name: "Poets & Writers Grants & Awards",
    url: "https://www.pw.org/grants",
    type: "aggregator",
  },
  {
    name: "The Review Review",
    url: "https://www.thereviewreview.net/residencies",
    type: "aggregator",
  },
  {
    name: "Authors Publish Residencies",
    url: "https://www.authorspublish.com/category/residencies/",
    type: "aggregator",
  },
  {
    name: "NewPages Classifieds",
    url: "https://www.newpages.com/classifieds/",
    type: "aggregator",
  },

  // Individual orgs
  {
    name: "MacDowell",
    url: "https://www.macdowell.org/apply",
    type: "org_listing",
  },
  { name: "Yaddo", url: "https://www.yaddo.org/apply/", type: "org_listing" },
  {
    name: "Hedgebrook",
    url: "https://www.hedgebrook.org/apply",
    type: "org_listing",
  },
  {
    name: "Ragdale",
    url: "https://ragdale.org/residencies/",
    type: "org_listing",
  },
  { name: "VCCA", url: "https://www.vcca.com/apply/", type: "org_listing" },
  {
    name: "Ucross",
    url: "https://www.ucrossfoundation.org/residency-program/",
    type: "org_listing",
  },
  {
    name: "Millay Arts",
    url: "https://www.millayarts.org/residencies",
    type: "org_listing",
  },
  {
    name: "Bread Loaf",
    url: "https://www.middlebury.edu/bread-loaf-conferences/bl-writers",
    type: "org_listing",
  },
  {
    name: "Sewanee Writers Conference",
    url: "https://new.sewanee.edu/sewanee-writers-conference/",
    type: "org_listing",
  },
  {
    name: "Tin House Summer Workshop",
    url: "https://tinhouse.com/workshop/",
    type: "org_listing",
  },
];
```

New sources are added by appending to this array. No other code changes needed.

## LLM Extraction

### `src/lib/residency-miner/extract.ts`

```typescript
export async function extractOpportunities(
  html: string,
  source: Source,
): Promise<Omit<Opportunity, "id" | "firstSeen" | "lastUpdated" | "status">[]>;
```

**Implementation**:

1. Strip `<script>`, `<style>`, `<nav>`, `<footer>` tags from the HTML. Truncate to 80,000 characters.

2. Call `claude-sonnet-4-20250514` via the Anthropic SDK with `max_tokens: 4096`.

3. System prompt:

```
You are a data extraction assistant. You will receive HTML content from a webpage
that lists writer residencies, fellowships, or conferences.

Extract every distinct opportunity you can find. For each, return a JSON object
with these fields:

- name (string): Name of the residency, fellowship, or conference
- org (string): Sponsoring organization
- url (string): Direct link to the opportunity or application page. If only a relative path is available, prepend the base domain.
- deadline (string): Application deadline as YYYY-MM-DD. If only a month is given, use the last day of that month. If no deadline is stated, use "rolling".
- genre (string[]): One or more of: "fiction", "nonfiction", "poetry", "screenwriting", "multi", "other". Use "multi" if open to multiple literary genres.
- duration (string): Length of the residency (e.g., "2 weeks", "1 month"). Use "varies" if not stated.
- stipend (number | null): Stipend in USD. null if none or not stated.
- location (string): Physical location. "Remote" if applicable. "Unknown" if not stated.
- eligibility (string): Key eligibility requirements. "Open" if none stated.
- description (string): 1-3 sentence summary.
- sourceUrl (string): Set to "${sourceUrl}"

Respond ONLY with a JSON array. No markdown fences, no preamble. If no opportunities found, respond with [].
```

4. Parse response as JSON. On parse failure, log the error, return empty array. Do not retry.

## Deduplication

### `src/lib/residency-miner/dedupe.ts`

```typescript
import { createHash } from "crypto";

export function generateId(
  org: string,
  name: string,
  deadline: string,
): string {
  const year = deadline === "rolling" ? "rolling" : deadline.slice(0, 4);
  const input = `${org.toLowerCase().trim()}|${name.toLowerCase().trim()}|${year}`;
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}
```

During the mining run, after extraction:

1. Compute `id` for each extracted opportunity.
2. Upsert into Postgres via `INSERT ... ON CONFLICT (id) DO UPDATE`. On conflict: update all fields EXCEPT `first_seen` and `status`. Set `last_updated` to `NOW()`.
3. If no conflict, the row is inserted with defaults (`first_seen = NOW()`, `status = 'new'`).

## API Routes

### `POST /api/mine`

Located at `src/app/api/mine/route.ts`.

**Auth**: Verify `Authorization: Bearer <CRON_SECRET>` header. Return 401 if invalid. Vercel cron requests automatically include this header when `CRON_SECRET` is set as an env var.

**Flow**:

1. Iterate over `SOURCES`.
2. For each source, `fetch()` the URL with a 15-second timeout and browser-like `User-Agent`.
3. On success, call `extractOpportunities(html, source)`.
4. For each result, compute `id` via `generateId()`, then upsert.
5. Track counts: sourcesFetched, newFound, updated, errors.
6. Write a row to `run_logs`.
7. Return the run log as JSON, status 200.

**Error handling**: If a single source fails, log it in `errors` and continue. Never abort the full run.

**Timeout**: Vercel hobby plan allows 60 seconds per function invocation. With ~15 sources, use `Promise.allSettled()` to process sources in parallel and stay within the limit.

### `GET /api/opportunities`

Located at `src/app/api/opportunities/route.ts`.

**Query parameters** (all optional):

- `status` — filter by status value
- `genre` — filter by genre (uses `@>` array contains operator)
- `deadlineAfter` — ISO date string
- `deadlineBefore` — ISO date string
- `sort` — `deadline` (default) or `firstSeen`
- `order` — `asc` (default) or `desc`

**Response**: JSON array of `Opportunity` objects (camelCase, mapped from snake_case in db.ts).

### `PATCH /api/opportunities`

Same route file, handles PATCH method.

**Request body**:

```json
{ "id": "abc123...", "status": "bookmarked" }
```

**Validation**: Reject if `status` is not a valid `Status` value. Return 400. The `valid_status` CHECK constraint in Postgres is a second safety net.

**Response**: Updated `Opportunity` object.

## Page

### `src/app/residencies/page.tsx`

A client-side page (or hybrid with server-side initial fetch) that:

1. Fetches `/api/opportunities` on load.
2. Renders a filterable list of opportunities.
3. Filter controls: genre (multi-select), status (dropdown), deadline range.
4. Default view: sorted by deadline ascending, status not `skipped`, deadline >= today.
5. Each item shows: name, org, deadline, stipend, location, genre tags.
6. Expandable detail: full description, eligibility, link to apply.
7. Status dropdown per item that sends a PATCH to `/api/opportunities`.
8. Last run timestamp displayed at the bottom.

**Design**: Match the existing ws-gong.com site styles. Functional reference page, not a showcase.

## Vercel Configuration

Add to the existing `vercel.json` (or create if it doesn't exist):

```json
{
  "crons": [
    {
      "path": "/api/mine",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

Runs every Monday at 9:00 AM UTC. On Hobby plan, cron frequency is daily minimum — deduplication makes extra runs harmless.

## Neon Setup

1. Create a free account at https://neon.tech
2. Create a new project. The free tier includes one project with a 0.5 GiB database.
3. Copy the connection string from the Neon dashboard. It will look like:
   `postgresql://username:password@ep-something-123456.us-east-2.aws.neon.tech/residency_miner?sslmode=require`
4. Set as `DATABASE_URL` in Vercel environment variables and `.env.local`.
5. Run `schema.sql` against the database using the Neon SQL Editor in the dashboard, or via `psql`.

## Manual Run

```bash
curl -X POST https://ws-gong.com/api/mine -H "Authorization: Bearer <CRON_SECRET>"
```

## Future Enhancements (Not V1)

- Additional sources: Submittable search, Twitter/X hashtags, newsletter parsing.
- Email digest via Resend: weekly summary of new opportunities.
- Scoring: rank by profile fit (fiction, novel-length, POC-focused, stipend).
- Deadline reminders: notify N days before bookmarked deadlines.
- Integration with broader submissions tracker (Neon is already the right DB for this).
- Caching: store fetched HTML to avoid re-fetching unchanged pages.
