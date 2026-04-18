/**
 * Shared constants for e2e tests.
 * Keep magic numbers here with explanations so tests stay readable.
 */

/** Server-side anti-spam timer — form submissions within this window are rejected. */
export const ANTI_SPAM_DELAY_MS = 3500;

/** Max time to wait for the "message sent" confirmation after form submit. */
export const SUBMISSION_TIMEOUT_MS = 15_000;

/** Server-side validation response timeout. */
export const VALIDATION_TIMEOUT_MS = 10_000;

/** IMAP polling: max attempts before giving up on email delivery. */
export const IMAP_MAX_RETRIES = 20;

/** IMAP polling: delay between retry attempts. */
export const IMAP_RETRY_DELAY_MS = 5_000;

/** Overall timeout for the email delivery verification test. */
export const EMAIL_DELIVERY_TIMEOUT_MS = 120_000;

/** Max Tab key presses when testing keyboard navigation reach. */
export const MAX_TAB_STEPS_NAV = 10;
export const MAX_TAB_STEPS_FORM = 20;

/**
 * All publicly routable pages — used by smoke tests and OG metadata checks.
 * Admin-gated routes (Basic Auth via proxy.ts) are excluded: /code/resume-generator.
 */
export const SITE_PAGES = [
  "/",
  "/about",
  "/narratives",
  "/code",
  "/contact",
  "/terms",
  "/colophon",
  "/links",
  "/code/colophon-mcp",
  "/code/paperless-mcp",
  "/code/submission-cli",
  "/code/writer-utilities",
  "/code/die-neue-grafik",
  "/code/contact-form",
] as const;

export const STATIC_ROUTES = ["/sitemap.xml", "/robots.txt"] as const;
