import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import { slushpileUrl } from "./lib/site/env";

const nextConfig: NextConfig = {
  // Serve source maps for production JS so Lighthouse (and stacktraces in the
  // console) can resolve minified frames back to original sources.
  productionBrowserSourceMaps: true,
  async redirects() {
    return [
      {
        source: "/narratives-code",
        destination: "/code",
        permanent: true,
      },
      {
        source: "/narratives-code/:slug",
        destination: "/code",
        permanent: true,
      },
      {
        // /code/{slug} sub-pages no longer exist. Inbound links from search
        // engines, the about page's inline references, and feed items all
        // collapse to the flat /code page.
        source: "/code/:slug",
        destination: "/code",
        permanent: true,
      },
      {
        // /residencies became slushpile (a separate app, mounted via rewrite).
        // When SLUSHPILE_URL is unset, /slushpile 404s — accepted.
        source: "/residencies",
        destination: "/slushpile",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    // /slushpile lives in a separate Next.js app. When SLUSHPILE_URL is set,
    // proxy the path through to that deployment. Slushpile must run with
    // basePath: "/slushpile" so its _next/static/* chunks resolve under the
    // same prefix.
    if (!slushpileUrl) return [];
    return [
      {
        source: "/slushpile",
        destination: `${slushpileUrl}/slushpile`,
      },
      {
        source: "/slushpile/:path*",
        destination: `${slushpileUrl}/slushpile/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
          // 2-year HSTS with subdomains; preload-eligible. Keep this even with
          // Vercel's edge defaults so the policy travels with the codebase.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Static portfolio doesn't use any of these capabilities; deny by
          // default so a future XSS or third-party include can't request them.
          {
            key: "Permissions-Policy",
            value: [
              "accelerometer=()",
              "camera=()",
              "geolocation=()",
              "gyroscope=()",
              "magnetometer=()",
              "microphone=()",
              "payment=()",
              "usb=()",
              "interest-cohort=()",
              "browsing-topics=()",
            ].join(", "),
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              // *.ingest.sentry.io covers regional ingest hosts (us, de, etc.)
              // that *.sentry.io's single-label wildcard does not match.
              "connect-src 'self' https://va.vercel-scripts.com https://*.sentry.io https://*.ingest.sentry.io",
              // Sentry Session Replay (and some Next.js bundling shims) spawn
              // Web Workers from blob: URLs; without this the CSP blocks them
              // and Lighthouse flags console errors on every page.
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "high-school-smokers",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
