import raw from "@/content/site.json";
import { siteContentSchema } from "./content-schema";

// Parsed at build time; a malformed site.json fails the build, not a page.
export const site = siteContentSchema.parse(raw);
