import { NextRequest, NextResponse } from "next/server";
import { getOpportunities, getLastRun } from "@/lib/residency-miner/db";
import type { Genre } from "@/lib/residency-miner/types";

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

  const genre = searchParams.get("genre") as Genre | null;
  const deadlineAfter = searchParams.get("deadlineAfter");
  const deadlineBefore = searchParams.get("deadlineBefore");
  const sort = searchParams.get("sort") as "deadline" | "firstSeen" | null;
  const order = searchParams.get("order") as "asc" | "desc" | null;

  const opportunities = await getOpportunities({
    ...(genre && VALID_GENRES.includes(genre) ? { genre } : {}),
    ...(deadlineAfter ? { deadlineAfter } : {}),
    ...(deadlineBefore ? { deadlineBefore } : {}),
    sort: sort === "firstSeen" ? "firstSeen" : "deadline",
    order: order === "desc" ? "desc" : "asc",
  });

  const lastRun = await getLastRun();

  return NextResponse.json({ opportunities, lastRun });
}
