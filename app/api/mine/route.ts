import { NextResponse } from "next/server";
import { SOURCES } from "@/lib/residency-miner/sources";
import { extractOpportunities } from "@/lib/residency-miner/extract";
import { generateId } from "@/lib/residency-miner/dedupe";
import { upsertOpportunity, logRun } from "@/lib/residency-miner/db";
import type { Opportunity, MineRunLog } from "@/lib/residency-miner/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const log: MineRunLog = {
    timestamp: new Date().toISOString(),
    sourcesFetched: 0,
    newFound: 0,
    updated: 0,
    errors: [],
  };

  async function processSource(source: (typeof SOURCES)[number]) {
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
        return;
      }

      const html = await response.text();
      log.sourcesFetched++;

      const extracted = await extractOpportunities(html, source);

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
    } catch (error) {
      log.errors.push({
        url: source.url,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Process all sources in parallel
  await Promise.allSettled(SOURCES.map(processSource));

  await logRun(log);

  return NextResponse.json(log);
}
