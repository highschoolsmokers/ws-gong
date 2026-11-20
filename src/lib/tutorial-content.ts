import raw from "../../content/fabulosa-books.json" with { type: "json" };
import { tutorialSchema } from "./tutorial";

// Parsed at build time; a malformed sync fails the build, not a page.
export const tutorial = tutorialSchema.parse(raw);

export const findPart = (slug: string) =>
  tutorial.parts.find((p) => p.slug === slug);
