import raw from "../../content/fabulosa-books.json" with { type: "json" };
import { partPath, TUTORIAL_PATH, tutorialSchema } from "./tutorial";

// Parsed at build time; a malformed sync fails the build, not a page.
export const tutorial = tutorialSchema.parse(raw);

// The contents page, then each part: the sitemap and the e2e page lists.
export const tutorialPaths = [
  TUTORIAL_PATH,
  ...tutorial.parts.map((p) => partPath(p.slug)),
];
