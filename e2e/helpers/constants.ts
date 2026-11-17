/**
 * Shared constants for e2e tests.
 * Keep magic numbers here with explanations so tests stay readable.
 */

import { orderedBooks, reviewed } from "../../lib/books";
import { MIN_ELAPSED_MS } from "../../lib/upload";

/** Wait past the server's anti-spam minimum, with margin, before submitting. */
export const ANTI_SPAM_DELAY_MS = MIN_ELAPSED_MS + 500;

/** Max time to wait for the "message sent" confirmation after form submit. */
export const SUBMISSION_TIMEOUT_MS = 15_000;

/** Server-side validation response timeout. */
export const VALIDATION_TIMEOUT_MS = 10_000;

/** Overall timeout for the email delivery verification test. */
export const EMAIL_DELIVERY_TIMEOUT_MS = 120_000;

/** Max Tab key presses when testing keyboard navigation reach. */
export const MAX_TAB_STEPS_NAV = 10;
export const MAX_TAB_STEPS_FORM = 20;

/**
 * All publicly routable pages — OG metadata and Swiss grid checks.
 */
export const SITE_PAGES = [
  "/",
  "/terms",
  "/colophon",
  "/links",
  ...(orderedBooks.length ? ["/reading"] : []),
  ...reviewed.slice(0, 1).map((b) => `/reading/${b.slug}`),
];

/** Old section pages and the home anchor each now redirects to ("" = top). */
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
