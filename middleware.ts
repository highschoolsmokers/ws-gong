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

// Note: in-memory rate limiting is not effective in serverless/edge environments
// because each invocation gets a fresh memory space. Rate limiting is handled
// at the platform level (Vercel's built-in DDoS protection).

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

  const response = NextResponse.next();

  // Anti-indexing headers
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
