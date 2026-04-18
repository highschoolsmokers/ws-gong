import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import Anthropic from "@anthropic-ai/sdk";
import {
  getAllSources,
  insertSource,
  logDiscovery,
} from "@/lib/residency-miner/db";
import { generateSourceId, normalizeUrl } from "@/lib/residency-miner/dedupe";
import { DISCOVERY_MODEL } from "@/lib/residency-miner/models";
import { timingSafeBearer } from "@/lib/authz";
import type { DiscoveryLog, SourceType } from "@/lib/residency-miner/types";

export const maxDuration = 300;

const MAX_NEW_SOURCES = 10;
const MIN_BODY_LENGTH = 2000;
// Intentionally English-only: we only accept programs whose working language
// includes English, so the validator doubles as a language filter. A multi-
// lingual variant would need per-language keyword sets AND a rule to reject
// programs that *only* operate in a non-English language.
const KEYWORD_PATTERN =
  /\b(residency|residencies|fellowship|fellowships|application|applications|deadline|writers?|authors?|artists?|workshop)\b/i;
const WRITING_KEYWORD_PATTERN =
  /\b(writer|writers|writing|fiction|poetry|poet|poets|nonfiction|literary|literature|novelist|playwright|screenwriter|author|authors|manuscript|manuscripts)\b/i;

const anthropic = new Anthropic();

interface Candidate {
  name: string;
  url: string;
  type: SourceType;
  reason?: string;
}

export async function POST(request: Request) {
  if (!timingSafeBearer(request, process.env.CRON_SECRET)) {
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

  const freshCandidates: Candidate[] = [];
  for (const c of candidates) {
    if (existingUrls.has(normalizeUrl(c.url))) {
      log.rejected.push({ url: c.url, reason: "duplicate" });
    } else {
      freshCandidates.push(c);
    }
  }

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
      reason: candidate.reason,
    });

    if (inserted) {
      log.added++;
      existingUrls.add(normalized);
    } else {
      log.rejected.push({ url: candidate.url, reason: "duplicate (db)" });
    }
  }

  await logDiscovery(log);

  if (log.candidates === 0) {
    Sentry.captureMessage("residency discovery: no candidates returned", {
      level: "warning",
      extra: {
        existingSources: existingSources.length,
        rejected: log.rejected,
      },
    });
  }

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

Call the \`report_candidates\` tool exactly once with your final list. Each candidate has:
- name: short display name
- url: full URL to the listing/apply page
- type: "aggregator" or "org_listing"
- reason: one short phrase why this is worth adding

Aim for 12-15 candidates. If nothing good is found, call the tool with an empty array.`;

  const reportTool = {
    name: "report_candidates",
    description: "Return the final list of vetted source candidates.",
    input_schema: {
      type: "object" as const,
      properties: {
        candidates: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              url: { type: "string" },
              type: { type: "string", enum: ["aggregator", "org_listing"] },
              reason: { type: "string" },
            },
            required: ["name", "url", "type"],
          },
        },
      },
      required: ["candidates"],
    },
  };

  const response = await anthropic.messages.create({
    model: DISCOVERY_MODEL,
    max_tokens: 8192,
    temperature: 0,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 6,
      },
      reportTool,
    ],
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content:
          "Find new writing residency, fellowship, and workshop listing pages we don't already track. Prioritize geographic diversity (especially international: Asia, Latin America, Africa) and underrepresented genres (poetry, screenwriting, nonfiction).",
      },
    ],
  });

  const toolUse = response.content.find(
    (b) => b.type === "tool_use" && b.name === "report_candidates",
  );
  const textBlocks = response.content.filter(
    (b): b is Extract<typeof b, { type: "text" }> => b.type === "text",
  );
  const combinedText = textBlocks.map((b) => b.text).join("\n\n");

  if (!toolUse || toolUse.type !== "tool_use") {
    return { candidates: [], rawText: combinedText };
  }

  const raw = (toolUse.input as { candidates?: unknown }).candidates;
  if (!Array.isArray(raw)) return { candidates: [], rawText: combinedText };

  const candidates = raw.filter(isValidCandidate);
  return { candidates, rawText: combinedText };
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

    // Defense against hallucinated or off-topic URLs: require writing-specific
    // vocabulary, not just generic "workshop/deadline/application" signals.
    if (!WRITING_KEYWORD_PATTERN.test(html)) {
      return { ok: false, reason: "no writing-specific keywords found" };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}
