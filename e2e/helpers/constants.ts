/**
 * Shared data for e2e tests. Copy, links, and routes come from the same
 * sources the site renders from, so content edits don't break tests.
 */

import raw from "../../content/site.json";
import { orderedBooks, reviewed } from "../../lib/books";
import { siteContentSchema } from "../../lib/site/content-schema";
import { slushpileUrl } from "../../lib/site/env";
import { MIN_ELAPSED_MS } from "../../lib/upload";

export const site = siteContentSchema.parse(raw);
export { orderedBooks, reviewed };

/** How far to fast-forward the page clock past the anti-spam minimum. */
export const ANTI_SPAM_MS = MIN_ELAPSED_MS + 500;

/** Max time to wait for the "message sent" confirmation after submit. */
export const SUBMISSION_TIMEOUT_MS = 15_000;

/** Overall timeout for the email delivery verification test. */
export const EMAIL_DELIVERY_TIMEOUT_MS = 120_000;

/** Max Tab presses when checking that something is keyboard-reachable. */
export const MAX_TAB_STEPS = 20;

/** Same flag the rewrite and nav slot read, so the tests can't disagree. */
export const slushpileConfigured = Boolean(slushpileUrl);

/** Every publicly routable page: metadata and Swiss grid checks. */
export const SITE_PAGES = [
  "/",
  "/terms",
  "/colophon",
  "/links",
  ...(orderedBooks.length ? ["/reading"] : []),
  ...reviewed.slice(0, 1).map((b) => `/reading/${b.slug}`),
];

/** Old section pages and the home anchor each redirects to ("" = top). */
export const FOLDED_ROUTES = [
  ["/about", "#about"],
  ["/code", "#code"],
  ["/code/colophon-mcp", "#code"],
  ["/narratives-code/colophon-mcp", "#code"],
  ["/narratives", "#writing"],
  // /reading folds to the top of home only while the log is empty.
  ...(orderedBooks.length ? [] : [["/reading", ""] as const]),
  ["/resume", "#resume"],
  ["/contact", "#contact"],
] as const;

export const STATIC_ROUTES = ["/sitemap.xml", "/robots.txt"] as const;
