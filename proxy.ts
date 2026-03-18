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
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "rogerbot",
  "screaming frog",
  "dataforseobot",
  "piplbot",
  "archive.org_bot",
  "archive-it",
];

export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent")?.toLowerCase() ?? "";
  const isBot = BLOCKED_AGENTS.some((agent) => ua.includes(agent));

  if (isBot) {
    return new NextResponse(null, { status: 403 });
  }

  const hostname = request.headers.get("host") ?? "";
  const isTech = hostname.startsWith("tech.");

  if (
    isTech &&
    !request.nextUrl.pathname.startsWith("/tech") &&
    !request.nextUrl.pathname.startsWith("/api")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/tech" + request.nextUrl.pathname;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
