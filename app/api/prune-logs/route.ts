import { NextResponse } from "next/server";
import { pruneLogs } from "@/lib/residency-miner/db";
import { timingSafeBearer } from "@/lib/authz";

const KEEP_DAYS = 90;

export async function POST(request: Request) {
  if (!timingSafeBearer(request, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const deleted = await pruneLogs(KEEP_DAYS);
  return NextResponse.json({ keepDays: KEEP_DAYS, deleted });
}
