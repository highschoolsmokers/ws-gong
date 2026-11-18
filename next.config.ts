import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";
import { orderedBooks } from "./lib/books";
import { slushpileUrl } from "./lib/site/env";
import { PDFS, blobUrl } from "./lib/site/schema";
import { SUBSTACK_BASE_URL } from "./lib/substack";

// 'unsafe-inline' scripts: Next's inline bootstrap and the theme script.
// Nonces would force every page to render dynamically.
const csp = [
  "default-src 'self'",
  // React's development build needs eval for its debug call stacks; production never does.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://va.vercel-scripts.com",
  "frame-ancestors 'none'",
  // These three don't fall back to default-src. Forms post to this site (the
  // contact form) or to Substack (the newsletter form).
  "base-uri 'none'",
  "object-src 'none'",
  `form-action 'self' ${SUBSTACK_BASE_URL}`,
].join("; ");

// The site is one page: old section pages land on their anchors, permanently.
// /reading lands on home while the log is empty (its page and section hide).
// /residencies became the slushpile app.
const redirects = Object.entries({
  "/code/:slug*": "/#code",
  "/narratives-code/:slug*": "/#code",
  "/about": "/#about",
  "/narratives": "/#writing",
  ...(orderedBooks.length ? {} : { "/reading": "/" }),
  "/cv": "/#cv",
  "/resume": "/#cv",
  "/contact": "/#contact",
  "/residencies": "/slushpile",
}).map(([source, destination]) => ({ source, destination, permanent: true }));

const nextConfig: NextConfig = {
  // Public source maps so Lighthouse and the console resolve minified frames.
  productionBrowserSourceMaps: true,
  // Lockfiles above this repo make Next guess a parent folder as the root,
  // which breaks file watching and the dev cache.
  turbopack: { root: __dirname },
  // Contact-form attachments: match Vercel's 4.5 MB request cap (lib/upload.ts).
  experimental: { serverActions: { bodySizeLimit: "4.5mb" } },
  redirects: async () => redirects,
  rewrites: async () => [
    // The résumé and CV PDFs live in public Blob storage, served at fixed paths.
    ...Object.values(PDFS).map((name) => ({
      source: `/${name}`,
      destination: blobUrl(name),
    })),
    // Vercel serves the static tutorial's directory index; `next start` doesn't.
    { source: "/fabulosa-books", destination: "/fabulosa-books/index.html" },
    // Slushpile is a separate app built with basePath "/slushpile".
    ...(slushpileUrl
      ? [
          {
            source: "/slushpile/:path*",
            destination: `${slushpileUrl}/slushpile/:path*`,
          },
        ]
      : []),
  ],
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "Permissions-Policy",
          value:
            "accelerometer camera geolocation gyroscope magnetometer microphone payment usb interest-cohort browsing-topics"
              .split(" ")
              .map((f) => `${f}=()`)
              .join(", "),
        },
        { key: "Content-Security-Policy", value: csp },
      ],
    },
  ],
};

export default withSentryConfig(nextConfig, {
  org: "high-school-smokers",
  project: "javascript-nextjs",
  silent: !process.env.CI,
});
