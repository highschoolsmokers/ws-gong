import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Blocklist narrowed to AI training crawlers, aggressive SEO/audit scrapers,
// and archiving bots. Search engines (Googlebot, Bingbot, DuckDuckBot, etc.)
// and social preview bots (twitterbot, linkedinbot, facebookexternalhit) are
// intentionally allowed so the portfolio is indexable and its OG cards render.
const BLOCKED_AGENTS = [
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
  "amazonbot",
  "brightbot",
  "velenpublicwebcrawler",
  "img2dataset",
  "omgili",
  "omgilibot",
  // SEO/audit scrapers
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "rogerbot",
  "screaming frog",
  "dataforseobot",
  "piplbot",
  // Archiving bots
  "archive.org_bot",
  "archive-it",
];

// Note: in-memory rate limiting is not effective in serverless/edge environments
// because each invocation gets a fresh memory space. Rate limiting is handled
// at the platform level (Vercel's built-in DDoS protection).

export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent")?.toLowerCase() ?? "";

  if (BLOCKED_AGENTS.some((agent) => ua.includes(agent))) {
    return new NextResponse(null, { status: 403 });
  }

  // Block empty user agents (likely automated)
  if (!ua || ua.length < 10) {
    return new NextResponse(null, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
