import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getAllSources,
  insertSource,
  logDiscovery,
} from "@/lib/residency-miner/db";
import { generateSourceId } from "@/lib/residency-miner/dedupe";
import type { DiscoveryLog, SourceType } from "@/lib/residency-miner/types";

export const maxDuration = 300;

const MAX_NEW_SOURCES = 10;
const MIN_BODY_LENGTH = 2000;
const KEYWORD_PATTERN =
  /\b(residency|residencies|fellowship|fellowships|application|applications|deadline|writers?|authors?|artists?|workshop)\b/i;

const anthropic = new Anthropic();

interface Candidate {
  name: string;
  url: string;
  type: SourceType;
  reason?: string;
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingSources = await getAllSources();
  const existingUrls = new Set(existingSources.map((s) => normalizeUrl(s.url)));

  const candidates = await findCandidates(existingSources);

  const log: DiscoveryLog = {
    timestamp: new Date().toISOString(),
    candidates: candidates.length,
    added: 0,
    rejected: [],
  };

  for (const candidate of candidates) {
    if (log.added >= MAX_NEW_SOURCES) break;

    const normalized = normalizeUrl(candidate.url);
    if (existingUrls.has(normalized)) {
      log.rejected.push({ url: candidate.url, reason: "duplicate" });
      continue;
    }

    const validation = await validateUrl(candidate.url);
    if (!validation.ok) {
      log.rejected.push({ url: candidate.url, reason: validation.reason });
      continue;
    }

    const id = generateSourceId(candidate.url);
    const inserted = await insertSource({
      id,
      name: candidate.name,
      url: candidate.url,
      type: candidate.type,
    });

    if (inserted) {
      log.added++;
      existingUrls.add(normalized);
    } else {
      log.rejected.push({ url: candidate.url, reason: "duplicate (db)" });
    }
  }

  await logDiscovery(log);

  return NextResponse.json(log);
}

async function findCandidates(
  existingSources: { name: string; url: string }[],
): Promise<Candidate[]> {
  const existingList = existingSources
    .map((s) => `- ${s.name}: ${s.url}`)
    .join("\n");

  const systemPrompt = `You are a research assistant finding new writing residency, fellowship, and workshop listing pages on the web. You have a web_search tool available — use it to find legitimate, currently active programs we don't already track.

We already track these sources:
${existingList}

Your job: find URLs that point to LISTING pages or APPLICATION pages — not homepages — for writing residencies, fellowships, conferences, or workshops. Aim for geographic and genre diversity beyond what we have. Avoid:
- Pages that require JavaScript to render content
- Login-gated or paywalled pages
- Nomination-only programs
- Defunct or stale programs

Run multiple targeted searches. After each search, evaluate results.

When done, respond ONLY with a JSON array of candidates (no markdown fences, no preamble). Each candidate is an object with:
- name: short display name
- url: full URL to the listing/apply page
- type: "aggregator" (lists multiple programs) or "org_listing" (a single org's program)
- reason: one short phrase why this is worth adding

Aim to return 12-15 candidates so we have headroom after validation. If you cannot find good candidates, return [].`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 6,
      },
    ],
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content:
          "Find new writing residency, fellowship, and workshop listing pages we don't already track. Prioritize geographic diversity (especially international: Asia, Latin America, Africa) and underrepresented genres (poetry, screenwriting, nonfiction).",
      },
    ],
  });

  const textBlocks = response.content.filter((b) => b.type === "text");
  const finalText = textBlocks[textBlocks.length - 1];
  if (!finalText || finalText.type !== "text") return [];

  try {
    let jsonStr = finalText.text.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();

    const parsed = JSON.parse(jsonStr) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidCandidate);
  } catch {
    return [];
  }
}

function isValidCandidate(c: unknown): c is Candidate {
  if (typeof c !== "object" || c === null) return false;
  const obj = c as Record<string, unknown>;
  return (
    typeof obj.name === "string" &&
    typeof obj.url === "string" &&
    obj.url.startsWith("http") &&
    (obj.type === "aggregator" || obj.type === "org_listing")
  );
}

async function validateUrl(
  url: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      return { ok: false, reason: `HTTP ${response.status}` };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return { ok: false, reason: `non-html: ${contentType}` };
    }

    const html = await response.text();
    if (html.length < MIN_BODY_LENGTH) {
      return { ok: false, reason: `body too short (${html.length} bytes)` };
    }

    if (!KEYWORD_PATTERN.test(html)) {
      return { ok: false, reason: "no residency keywords found" };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

function normalizeUrl(url: string): string {
  return url.toLowerCase().trim().replace(/\/+$/, "");
}
