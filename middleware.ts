import { NextRequest, NextResponse } from "next/server";

const BLOCKED_AGENTS = [
  // Generic bots
  "bot", "crawler", "spider", "scraper", "crawling",
  // Search engines
  "googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider",
  "yandexbot", "sogou", "exabot", "facebot", "ia_archiver",
  // AI training crawlers
  "gptbot", "chatgpt-user", "oai-searchbot", "anthropic-ai", "claudebot",
  "cohere-ai", "cohere-training", "ccbot", "commoncrawl",
  "diffbot", "bytespider", "petalbot", "applebot",
  "semrushbot", "ahrefsbot", "mj12bot", "dotbot",
  "amazonbot", "brightbot", "velenpublicwebcrawler",
  "img2dataset", "omgili", "omgilibot", "facebookexternalhit",
  "twitterbot", "linkedinbot", "rogerbot", "screaming frog",
  "dataforseobot", "piplbot", "archive.org_bot", "archive-it",
];

export function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent")?.toLowerCase() ?? "";

  const isBot = BLOCKED_AGENTS.some((agent) => ua.includes(agent));

  if (isBot) {
    return new NextResponse(null, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
