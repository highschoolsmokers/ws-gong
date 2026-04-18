import Anthropic from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { EXTRACT_MODEL } from "./models";
import type { Opportunity } from "./types";

const anthropic = new Anthropic();

interface ExtractSource {
  name: string;
  url: string;
  type: string;
}

const genreSchema = z.enum([
  "fiction",
  "nonfiction",
  "poetry",
  "screenwriting",
  "multi",
  "other",
]);

const nullableNumber = z.preprocess(
  (v) => (v === "" || v === "N/A" || v === "n/a" ? null : v),
  z.number().nullable(),
);

const extractedSchema = z.object({
  name: z.string().min(1),
  org: z.string().min(1),
  url: z.url(),
  deadline: z.string().min(1),
  genre: z.array(genreSchema).min(1),
  duration: z.string().default("varies"),
  stipend: nullableNumber,
  stipendMax: nullableNumber,
  location: z.string().default("Unknown"),
  eligibility: z.string().default("Open"),
  description: z.string().default(""),
});

export type ExtractedOpportunity = Omit<
  Opportunity,
  "id" | "firstSeen" | "lastUpdated"
>;

function stripHtml(html: string): string {
  return (
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<\/(p|div|h[1-6]|li|tr|br|hr)[^>]*>/gi, "\n")
      .replace(/<(br|hr)[^>]*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      // Decode entities; &amp; must go LAST so literal "&lt;" ("&amp;lt;" in raw
      // HTML) isn't rewritten to "<".
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

const MAX_CONTENT_CHARS = 20_000;

const SYSTEM_PROMPT = `You are a data extraction assistant. You will receive HTML content from a webpage
that lists creative residencies, fellowships, or conferences.

CRITICAL FILTER — Your ONLY job is to extract WRITING and LITERARY opportunities. The discipline being offered to applicants MUST be one of:
- Fiction writing (novels, short stories)
- Nonfiction writing (creative nonfiction, essay, memoir, journalism, literary nonfiction)
- Poetry
- Playwriting
- Screenwriting
- Literary translation
- Literary criticism or book-length scholarly writing

REJECT (do NOT extract) opportunities for:
- Visual art, painting, drawing, printmaking, sculpture, ceramics, photography
- Film, filmmaking, documentary, video, animation (screenwriting is OK)
- Music, sound art, composition, performance
- Dance, choreography, theater directing, acting
- Curatorial practice, art history, museum work
- Craft, design, architecture, fashion
- Interdisciplinary or cross-genre programs where writing is not explicitly a supported discipline

For multi-discipline residencies (e.g., MacDowell, Yaddo, Banff), extract ONLY the specific programs/tracks that accept writers. If the page lists a "Visual Arts Residency" and a "Writers Residency" separately, extract only the writers one. If a program says "open to artists across disciplines including writers," it counts as writing and you should extract it.

IMPORTANT: Only extract opportunities open to ENGLISH-LANGUAGE writers. SKIP any program that:
- Requires applicants to write in a non-English language
- Conducts its working language as anything other than English (or English among others)
When in doubt about language, skip it.

Use the \`report_opportunities\` tool to return the list. Each opportunity has:
- name: Name of the residency, fellowship, or conference
- org: Sponsoring organization
- url: Direct link to the opportunity or application page. If only a relative path is available, prepend the base domain.
- deadline: Application deadline as YYYY-MM-DD. If only a month is given, use the last day of that month. If no deadline is stated, use "rolling".
- genre: One or more of "fiction", "nonfiction", "poetry", "screenwriting", "multi", "other". Use "multi" if open to multiple literary genres.
- duration: Length of the residency (e.g., "2 weeks", "1 month"). Use "varies" if not stated.
- stipend: Minimum stipend in USD (or exact amount if not a range). null if none or not stated.
- stipendMax: Maximum stipend in USD if a range is given (e.g., "$500-$2000" => stipend 500, stipendMax 2000). null if no range or stipend is a single value.
- location: Physical location. "Remote" if applicable. "Unknown" if not stated.
- eligibility: Key eligibility requirements. "Open" if none stated.
- description: 1-3 sentence summary in English.

Call the tool exactly once, even if no opportunities are found (pass an empty array).`;

const reportTool = {
  name: "report_opportunities",
  description: "Return the list of extracted writing opportunities.",
  input_schema: {
    type: "object" as const,
    properties: {
      opportunities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            org: { type: "string" },
            url: { type: "string" },
            deadline: { type: "string" },
            genre: {
              type: "array",
              minItems: 1,
              items: {
                type: "string",
                enum: [
                  "fiction",
                  "nonfiction",
                  "poetry",
                  "screenwriting",
                  "multi",
                  "other",
                ],
              },
            },
            duration: { type: "string" },
            stipend: { type: ["number", "null"] },
            stipendMax: { type: ["number", "null"] },
            location: { type: "string" },
            eligibility: { type: "string" },
            description: { type: "string" },
          },
          required: ["name", "org", "url", "deadline", "genre", "description"],
        },
      },
    },
    required: ["opportunities"],
  },
};

export async function extractOpportunities(
  html: string,
  source: ExtractSource,
): Promise<ExtractedOpportunity[]> {
  const stripped = stripHtml(html);
  const truncated = stripped.length > MAX_CONTENT_CHARS;
  const content = truncated ? stripped.slice(0, MAX_CONTENT_CHARS) : stripped;

  if (truncated) {
    Sentry.captureMessage("residency extract: content truncated", {
      level: "info",
      extra: {
        source: source.name,
        url: source.url,
        originalLength: stripped.length,
      },
    });
  }

  const response = await anthropic.messages.create({
    model: EXTRACT_MODEL,
    max_tokens: 8192,
    temperature: 0,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [reportTool],
    tool_choice: { type: "tool", name: "report_opportunities" },
    messages: [{ role: "user", content }],
  });

  if (response.stop_reason === "max_tokens") {
    Sentry.captureMessage("residency extract: stopped at max_tokens", {
      level: "warning",
      extra: { source: source.name, url: source.url },
    });
  }

  const toolUse = response.content.find(
    (b) => b.type === "tool_use" && b.name === "report_opportunities",
  );
  if (!toolUse || toolUse.type !== "tool_use") return [];

  const raw = (toolUse.input as { opportunities?: unknown }).opportunities;
  if (!Array.isArray(raw)) return [];

  const results: ExtractedOpportunity[] = [];
  for (const item of raw) {
    const parsed = extractedSchema.safeParse(item);
    if (parsed.success) {
      results.push({ ...parsed.data, sourceUrl: source.url });
    } else {
      Sentry.captureMessage("residency extract: opportunity rejected", {
        level: "warning",
        extra: {
          source: source.name,
          url: source.url,
          item,
          issues: parsed.error.issues,
        },
      });
    }
  }
  return results;
}
