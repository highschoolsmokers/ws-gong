import { NextRequest, NextResponse } from "next/server";
import {
  getOpportunities,
  updateStatus,
  getLastRun,
} from "@/lib/residency-miner/db";
import type { Status, Genre } from "@/lib/residency-miner/types";

const VALID_STATUSES: Status[] = [
  "new",
  "reviewed",
  "bookmarked",
  "applied",
  "skipped",
];
const VALID_GENRES: Genre[] = [
  "fiction",
  "nonfiction",
  "poetry",
  "screenwriting",
  "multi",
  "other",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status") as Status | null;
  const genre = searchParams.get("genre") as Genre | null;
  const deadlineAfter = searchParams.get("deadlineAfter");
  const deadlineBefore = searchParams.get("deadlineBefore");
  const sort = searchParams.get("sort") as "deadline" | "firstSeen" | null;
  const order = searchParams.get("order") as "asc" | "desc" | null;

  const opportunities = await getOpportunities({
    ...(status && VALID_STATUSES.includes(status) ? { status } : {}),
    ...(genre && VALID_GENRES.includes(genre) ? { genre } : {}),
    ...(deadlineAfter ? { deadlineAfter } : {}),
    ...(deadlineBefore ? { deadlineBefore } : {}),
    sort: sort === "firstSeen" ? "firstSeen" : "deadline",
    order: order === "desc" ? "desc" : "asc",
  });

  const lastRun = await getLastRun();

  return NextResponse.json({ opportunities, lastRun });
}

export async function PATCH(request: NextRequest) {
  let body: { id?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id || !body.status) {
    return NextResponse.json(
      { error: "id and status are required" },
      { status: 400 },
    );
  }

  if (!VALID_STATUSES.includes(body.status as Status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  await updateStatus(body.id, body.status as Status);

  return NextResponse.json({ success: true, id: body.id, status: body.status });
}
