import raw from "@/content/site.json";
import { SUBSTACK_BASE_URL } from "@/lib/substack";
import { siteContentSchema } from "./content-schema";

export const SITE_URL = "https://www.ws-gong.com";

// Copy that site.json doesn't carry: structured data and the feed.
export const JOB_TITLE = "Developer and Technical Writer";
export const KNOWS_ABOUT = [
  "Fiction Writing",
  "Technical Writing",
  "AI Tooling",
  "Model Context Protocol",
  "Developer Documentation",
];
export const FEED_DESCRIPTION =
  "Writing by W.S. Gong — fiction, essays, and notes from the editorial desk.";

// Parsed at build time; a malformed site.json fails the build, not a page.
export const site = siteContentSchema.parse(raw);

export const profiles = [
  { label: "LinkedIn", url: site.links.linkedin },
  { label: "GitHub", url: site.links.github },
  { label: "Substack", url: SUBSTACK_BASE_URL },
  { label: "Instagram", url: "https://www.instagram.com/born.deleuze" },
];
