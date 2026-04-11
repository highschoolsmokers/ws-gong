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

  const { candidates, rawText } = await findCandidates(existingSources);

  const log: DiscoveryLog = {
    timestamp: new Date().toISOString(),
    candidates: candidates.length,
    added: 0,
    rejected: [],
  };

  if (candidates.length === 0 && rawText.length > 0) {
    log.rejected.push({
      url: "(parse)",
      reason: `parse_failure — raw: ${rawText.slice(0, 800)}`,
    });
  }

  // Filter out obvious duplicates before validation
  const freshCandidates: Candidate[] = [];
  for (const c of candidates) {
    if (existingUrls.has(normalizeUrl(c.url))) {
      log.rejected.push({ url: c.url, reason: "duplicate" });
    } else {
      freshCandidates.push(c);
    }
  }

  // Validate in parallel
  const validations = await Promise.all(
    freshCandidates.map(async (c) => ({
      candidate: c,
      result: await validateUrl(c.url),
    })),
  );

  for (const { candidate, result } of validations) {
    if (log.added >= MAX_NEW_SOURCES) {
      log.rejected.push({ url: candidate.url, reason: "cap_reached" });
      continue;
    }

    if (!result.ok) {
      log.rejected.push({ url: candidate.url, reason: result.reason });
      continue;
    }

    const normalized = normalizeUrl(candidate.url);
    if (existingUrls.has(normalized)) {
      log.rejected.push({ url: candidate.url, reason: "duplicate" });
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
): Promise<{ candidates: Candidate[]; rawText: string }> {
  const existingList = existingSources
    .map((s) => `- ${s.name}: ${s.url}`)
    .join("\n");

  const systemPrompt = `You are a research assistant finding new WRITING and LITERARY residency, fellowship, and workshop listing pages on the web. You have a web_search tool — use it to find legitimate, currently active programs we don't already track.

We already track these sources:
${existingList}

Your job: find URLs that point to LISTING pages or APPLICATION pages — not homepages — for programs open to writers of fiction, nonfiction, poetry, playwriting, screenwriting, literary translation, or literary criticism.

STRICT REQUIREMENTS:
- The source's primary or dominant discipline must be WRITING or LITERARY ARTS. Reject:
  * Visual art, painting, sculpture, ceramics, photography, filmmaking, music, dance, theater directing, curatorial, craft, architecture, design — unless the page is an explicit multi-discipline aggregator that clearly includes writers as an accepted discipline.
- The program must be open to ENGLISH-LANGUAGE writers. Reject any program that requires applicants to write in a non-English language or whose working language is not English.
- Reject pages that require JavaScript to render content, are login-gated or paywalled, are nomination-only, or are defunct/stale.

Run multiple targeted searches. After each search, evaluate results.

After your research is complete, respond with a JSON array of candidates. You may include brief explanatory text before the array, but the response MUST contain a parseable JSON array. Each candidate object:
- name: short display name
- url: full URL to the listing/apply page
- type: "aggregator" or "org_listing"
- reason: one short phrase why this is worth adding

Example:
[
  {"name": "Example Residency", "url": "https://example.org/apply", "type": "org_listing", "reason": "well-established Italian writing program"}
]

Aim for 12-15 candidates. If nothing good is found, return [].`;

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

  const textBlocks = response.content.filter(
    (b): b is Extract<typeof b, { type: "text" }> => b.type === "text",
  );
  const combinedText = textBlocks.map((b) => b.text).join("\n\n");

  const candidates = parseCandidates(combinedText);
  return { candidates, rawText: combinedText };
}

function parseCandidates(text: string): Candidate[] {
  // Try markdown fence first
  const fenceMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
  if (fenceMatch) {
    const parsed = tryParseArray(fenceMatch[1]);
    if (parsed) return parsed;
  }

  // Try to find first top-level JSON array anywhere in the text
  const firstBracket = text.indexOf("[");
  if (firstBracket !== -1) {
    // Find matching close bracket via depth counting
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = firstBracket; i < text.length; i++) {
      const ch = text[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) {
          const parsed = tryParseArray(text.slice(firstBracket, i + 1));
          if (parsed) return parsed;
          break;
        }
      }
    }
  }

  return [];
}

function tryParseArray(str: string): Candidate[] | null {
  try {
    const parsed = JSON.parse(str) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isValidCandidate);
  } catch {
    return null;
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
