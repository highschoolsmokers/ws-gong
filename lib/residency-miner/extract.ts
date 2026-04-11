import Anthropic from "@anthropic-ai/sdk";
import type { Opportunity } from "./types";

const anthropic = new Anthropic();

interface ExtractSource {
  name: string;
  url: string;
  type: string;
}

type ExtractedOpportunity = Omit<
  Opportunity,
  "id" | "firstSeen" | "lastUpdated" | "status"
>;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/(p|div|h[1-6]|li|tr|br|hr)[^>]*>/gi, "\n")
    .replace(/<(br|hr)[^>]*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 80_000);
}

export async function extractOpportunities(
  html: string,
  source: ExtractSource,
): Promise<ExtractedOpportunity[]> {
  const content = stripHtml(html);

  const systemPrompt = `You are a data extraction assistant. You will receive HTML content from a webpage
that lists writer residencies, fellowships, or conferences.

Extract every distinct opportunity you can find. For each, return a JSON object
with these fields:

- name (string): Name of the residency, fellowship, or conference
- org (string): Sponsoring organization
- url (string): Direct link to the opportunity or application page. If only a relative path is available, prepend the base domain.
- deadline (string): Application deadline as YYYY-MM-DD. If only a month is given, use the last day of that month. If no deadline is stated, use "rolling".
- genre (string[]): One or more of: "fiction", "nonfiction", "poetry", "screenwriting", "multi", "other". Use "multi" if open to multiple literary genres.
- duration (string): Length of the residency (e.g., "2 weeks", "1 month"). Use "varies" if not stated.
- stipend (number | null): Stipend in USD. null if none or not stated.
- location (string): Physical location. "Remote" if applicable. "Unknown" if not stated.
- eligibility (string): Key eligibility requirements. "Open" if none stated.
- description (string): 1-3 sentence summary.
- sourceUrl (string): Set to "${source.url}"

Respond ONLY with a JSON array. No markdown fences, no preamble. If no opportunities found, respond with [].`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return [];

  try {
    let jsonStr = textBlock.text.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();

    return JSON.parse(jsonStr) as ExtractedOpportunity[];
  } catch {
    console.error(`Failed to parse extraction for ${source.name}`);
    return [];
  }
}
