import raw from "@/content/site.json";
import { SUBSTACK_BASE_URL } from "@/lib/substack";
import { siteContentSchema } from "./content-schema";

// Parsed at build time; a malformed site.json fails the build, not a page.
export const site = siteContentSchema.parse(raw);

export const profiles = [
  { label: "GitHub", url: site.links.github },
  { label: "LinkedIn", url: site.links.linkedin },
  { label: "Substack", url: SUBSTACK_BASE_URL },
  { label: "Instagram", url: "https://www.instagram.com/born.deleuze" },
];
