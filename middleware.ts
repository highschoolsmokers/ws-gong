import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BLOCKED_AGENTS = [
  // Generic bots
  "bot",
  "crawler",
  "spider",
  "scraper",
  "crawling",
  // Search engines
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "sogou",
  "exabot",
  "facebot",
  "ia_archiver",
  // AI training crawlers
  "gptbot",
  "chatgpt-user",
  "oai-searchbot",
  "anthropic-ai",
  "claudebot",
  "cohere-ai",
  "cohere-training",
  "ccbot",
  "commoncrawl",
  "diffbot",
  "bytespider",
  "petalbot",
  "applebot",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "amazonbot",
  "brightbot",
  "velenpublicwebcrawler",
  "img2dataset",
  "omgili",
  "omgilibot",
  "rogerbot",
  "screaming frog",
  "dataforseobot",
  "piplbot",
  "archive.org_bot",
  "archive-it",
  // Note: twitterbot, linkedinbot, facebookexternalhit intentionally NOT blocked
  // — needed for social media link preview cards (OG metadata)
];

// Simple in-memory rate limiter (per edge invocation lifetime)
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 500; // requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent")?.toLowerCase() ?? "";

  // Block known bots
  if (BLOCKED_AGENTS.some((agent) => ua.includes(agent))) {
    return new NextResponse(null, { status: 403 });
  }

  // Block empty user agents (likely automated)
  if (!ua || ua.length < 10) {
    return new NextResponse(null, { status: 403 });
  }

  // Rate limit by IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (isRateLimited(ip)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  const response = NextResponse.next();

  // Anti-indexing headers
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
