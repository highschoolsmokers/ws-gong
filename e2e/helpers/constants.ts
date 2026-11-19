/**
 * Shared data for e2e tests. Copy, links, and routes come from the same
 * sources the site renders from, so content edits don't break tests.
 */

import raw from "../../content/site.json" with { type: "json" };
import { orderedBooks, reviewed } from "../../src/lib/books";
import { siteContentSchema } from "../../src/lib/site/schema";
import { slushpileUrl } from "../../src/lib/site/env";

export const site = siteContentSchema.parse(raw);

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
];
