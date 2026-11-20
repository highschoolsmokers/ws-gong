/**
 * Shared data for e2e tests. Copy, links, and routes come from the same
 * sources the site renders from, so content edits don't break tests.
 */

import { orderedBooks, reviewed } from "../../src/lib/books";
import { slushpileUrl } from "../../src/lib/site/env";
import { TUTORIAL_PATH, partPath } from "../../src/lib/tutorial";
import { tutorial } from "../../src/lib/tutorial-content";

export { site } from "../../src/lib/site/content";

/** Same flag the rewrite and nav slot read, so the tests can't disagree. */
export const slushpileConfigured = Boolean(slushpileUrl);

/** Every publicly routable page: metadata, hydration, and grid checks. */
export const SITE_PAGES = [
  "/",
  "/terms",
  "/colophon",
  "/links",
  ...(orderedBooks.length ? ["/reading"] : []),
  ...reviewed.slice(0, 1).map((b) => `/reading/${b.slug}`),
  TUTORIAL_PATH,
  ...tutorial.parts.map((p) => partPath(p.slug)),
];
