import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import { slushpileUrl } from "./lib/site/env";
import { RESUME_BLOB_URL, RESUME_PATH } from "./lib/site/resume";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://va.vercel-scripts.com",
  "frame-ancestors 'none'",
].join("; ");

// The site is one page: old section pages land on their anchors (temporary
// while the layout settles). /residencies became the slushpile app.
const redirects = Object.entries({
  "/code/:slug*": "/#work",
  "/narratives-code/:slug*": "/#work",
  "/narratives": "/#writing",
  "/reading": "/#reading",
  "/resume": "/#resume",
  "/contact": "/#contact",
  "/residencies": "/slushpile",
}).map(([source, destination]) => ({ source, destination, permanent: false }));

const nextConfig: NextConfig = {
  // Public source maps so Lighthouse and the console resolve minified frames.
  productionBrowserSourceMaps: true,
  // Contact-form attachments: match Vercel's 4.5 MB request cap (lib/upload.ts).
  experimental: { serverActions: { bodySizeLimit: "4.5mb" } },
  redirects: async () => redirects,
  rewrites: async () => [
    // The résumé PDF lives in public Blob storage, served at its old path.
    { source: RESUME_PATH, destination: RESUME_BLOB_URL },
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
