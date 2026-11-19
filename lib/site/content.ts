import raw from "@/content/site.json" with { type: "json" };
import { siteContentSchema } from "./schema";

export const SITE_URL = "https://www.ws-gong.com";

// Copy that site.json doesn't carry: the tagline (home title, share image),
// structured data, and the feed.
export const TAGLINE = "Stories & Systems";
export const JOB_TITLE = "Writer, Editor, and Developer";
export const KNOWS_ABOUT = [
  "Fiction Writing",
  "Technical Writing",
  "AI Tooling",
  "Model Context Protocol",
  "Developer Documentation",
];
// Spoken after every link or form that opens a new tab; not shown.
export const NEW_TAB_NOTICE = "(opens in new tab)";
export const FEED_DESCRIPTION =
  "Writing by W.S. Gong: fiction, essays, and notes.";

// Parsed at build time; a malformed site.json fails the build, not a page.
export const site = siteContentSchema.parse(raw);
