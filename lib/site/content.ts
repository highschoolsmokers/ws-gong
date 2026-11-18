import raw from "@/content/site.json";
import { siteContentSchema } from "./content-schema";

export const SITE_URL = "https://www.ws-gong.com";

// Copy that site.json doesn't carry: structured data and the feed.
export const JOB_TITLE = "Writer, Editor, and Developer";
export const KNOWS_ABOUT = [
  "Fiction Writing",
  "Technical Writing",
  "AI Tooling",
  "Model Context Protocol",
  "Developer Documentation",
];
export const FEED_DESCRIPTION =
  "Writing by W.S. Gong: fiction, essays, and notes.";

// Parsed at build time; a malformed site.json fails the build, not a page.
export const site = siteContentSchema.parse(raw);

// Every link, in the master's order (§4). Nothing here is typed by hand.
export const profiles = site.links;
