import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getLastRun } from "@/lib/residency-miner/db";
import { timingSafeBearer } from "@/lib/authz";

// Mine cron runs weekly (Mon 09:00 UTC); heartbeat checks daily at 10:00 UTC.
// 7d12h is "the run is more than half a cycle late" — caught on the first or
// second daily check after a missed Monday rather than a full week later.
const STALE_AFTER_MS = 7.5 * 24 * 60 * 60 * 1000;

// Vercel cron jobs invoke endpoints with HTTP GET.
export async function GET(request: Request) {
  if (!timingSafeBearer(request, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const last = await getLastRun();
  if (!last) {
    Sentry.captureMessage("residency miner heartbeat: no run_logs entries", {
      level: "error",
    });
    return NextResponse.json({ status: "no_runs" }, { status: 200 });
  }

  const ageMs = Date.now() - new Date(last.timestamp).getTime();
  if (ageMs > STALE_AFTER_MS) {
    Sentry.captureMessage(
      `residency miner heartbeat: last run ${Math.round(ageMs / 3_600_000)}h ago`,
      { level: "error", extra: { lastRunAt: last.timestamp, ageMs } },
    );
    return NextResponse.json(
      { status: "stale", lastRunAt: last.timestamp, ageMs },
      { status: 200 },
    );
  }

  return NextResponse.json({ status: "ok", lastRunAt: last.timestamp, ageMs });
}
