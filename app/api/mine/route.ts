import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { extractOpportunities } from "@/lib/residency-miner/extract";
import { generateId } from "@/lib/residency-miner/dedupe";
import {
  upsertOpportunity,
  logRun,
  getActiveSources,
  recordSourceSuccess,
  recordSourceFailure,
} from "@/lib/residency-miner/db";
import { timingSafeBearer } from "@/lib/authz";
import type {
  Opportunity,
  MineRunLog,
  Source,
} from "@/lib/residency-miner/types";

export const maxDuration = 300;

const MAX_CONCURRENCY = 3;
const LOW_YIELD_RATIO = 0.4; // newFound < 40% of sources that succeeded triggers alert
const LOW_YIELD_MIN = 5;

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 1,
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      if (res.status < 500 && res.status !== 429) return res; // don't retry 4xx except 429
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
    }
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }
  throw lastErr;
}

// Vercel cron jobs invoke endpoints with HTTP GET.
export async function GET(request: Request) {
  if (!timingSafeBearer(request, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sources = await getActiveSources();

  const log: MineRunLog = {
    timestamp: new Date().toISOString(),
    sourcesFetched: 0,
    newFound: 0,
    updated: 0,
    errors: [],
  };

  async function processSource(source: Source) {
    try {
      const response = await fetchWithRetry(source.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        log.errors.push({ url: source.url, error: `HTTP ${response.status}` });
        await recordSourceFailure(source.id);
        return;
      }

      const html = await response.text();
      log.sourcesFetched++;

      const extracted = await extractOpportunities(html, {
        name: source.name,
        url: source.url,
        type: source.type,
      });

      for (const raw of extracted) {
        const id = generateId(raw.name, raw.deadline);
        const now = new Date().toISOString();
        const opp: Opportunity = {
          ...raw,
          id,
          firstSeen: now,
          lastUpdated: now,
        };

        try {
          const { inserted } = await upsertOpportunity(opp);
          if (inserted) log.newFound++;
          else log.updated++;
        } catch (err) {
          log.errors.push({
            url: source.url,
            error: `upsert ${opp.name}: ${err instanceof Error ? err.message : String(err)}`,
          });
        }
      }

      await recordSourceSuccess(source.id);
    } catch (error) {
      log.errors.push({
        url: source.url,
        error: error instanceof Error ? error.message : String(error),
      });
      await recordSourceFailure(source.id);
    }
  }

  // Process sources with bounded concurrency to stay under the Anthropic
  // input-tokens-per-minute rate limit. Without this, 40+ parallel extract
  // calls burst past the per-model TPM quota.
  const queue = [...sources];
  const workers = Array.from({ length: MAX_CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const source = queue.shift();
      if (!source) break;
      await processSource(source);
    }
  });
  await Promise.all(workers);

  await logRun(log);

  // Only revalidate the cached page if we actually learned something. If
  // every source failed we'd be replacing good cache with no data.
  if (log.newFound > 0 || log.updated > 0) {
    revalidatePath("/residencies");
  }

  // Early-warning alert: low yield relative to sources that were actually
  // fetched, with a floor to avoid noise on tiny runs.
  const newFraction =
    log.sourcesFetched > 0 ? log.newFound / log.sourcesFetched : 0;
  if (log.sourcesFetched >= LOW_YIELD_MIN && newFraction < LOW_YIELD_RATIO) {
    Sentry.captureMessage(
      `residency miner: low yield (${log.newFound} new / ${log.updated} updated from ${log.sourcesFetched}/${sources.length} sources)`,
      {
        level: "warning",
        extra: {
          newFound: log.newFound,
          updated: log.updated,
          sourcesFetched: log.sourcesFetched,
          sourcesTotal: sources.length,
          errors: log.errors,
        },
      },
    );
  }

  return NextResponse.json(log);
}
