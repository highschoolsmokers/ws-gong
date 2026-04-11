import { NextResponse } from "next/server";
import { extractOpportunities } from "@/lib/residency-miner/extract";
import { generateId } from "@/lib/residency-miner/dedupe";
import {
  upsertOpportunity,
  logRun,
  getActiveSources,
  recordSourceSuccess,
  recordSourceFailure,
} from "@/lib/residency-miner/db";
import type {
  Opportunity,
  MineRunLog,
  Source,
} from "@/lib/residency-miner/types";

export const maxDuration = 300;

const MAX_CONCURRENCY = 6;

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
      const response = await fetch(source.url, {
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
        const id = generateId(raw.org, raw.name, raw.deadline);
        const opp: Opportunity = {
          ...raw,
          id,
          firstSeen: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };

        await upsertOpportunity(opp);
        log.newFound++;
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

  return NextResponse.json(log);
}
