import { defineConfig } from "@playwright/test";

// Against a deployed site (BASE_URL set) we test what's there; otherwise
// Playwright starts the production server itself (run `pnpm build` first).
const deployed = process.env.BASE_URL;
const baseURL = deployed || "http://localhost:3000";

// Engine-sensitive tests (layout, focus, form behavior, fonts) carry @cross
// and run in all three browsers. Everything else is server-rendered output
// that doesn't vary by engine, so it runs once, in Chromium.
const CROSS = /@cross/;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  // Mail tests send real email; they run only when asked for (MAIL_E2E=1).
  grepInvert: process.env.MAIL_E2E ? undefined : /@infra|@smtp/,
  use: {
    baseURL,
    trace: "on-first-retry",
    ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET && {
      extraHTTPHeaders: {
        "x-vercel-protection-bypass":
          process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
        "x-vercel-set-bypass-cookie": "true",
      },
    }),
  },
  webServer: deployed
    ? undefined
    : {
        command: "pnpm start",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" }, grep: CROSS },
    { name: "webkit", use: { browserName: "webkit" }, grep: CROSS },
  ],
});
