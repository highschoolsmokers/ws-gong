import { test, expect } from "@playwright/test";
import {
  FOLDED_ROUTES,
  SITE_PAGES,
  STATIC_ROUTES,
  slushpileConfigured,
} from "./helpers/constants";
import { SUBSTACK_BASE_URL } from "../lib/substack";

// Server responses only: status codes, redirects, metadata, feeds. No page is
// rendered, so these run once (Chromium project) and fast.

const meta = (html: string, property: string) =>
  html
    .match(new RegExp(`<meta[^>]*property="${property}"[^>]*>`))?.[0]
    .match(/content="([^"]*)"/)?.[1];

const jsonLd = (html: string) =>
  [
    ...html.matchAll(
      /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((m) => JSON.parse(m[1]));

test.describe("Pages", () => {
  for (const route of SITE_PAGES)
    test(`${route} is 200 with an og:title`, async ({ request }) => {
      const res = await request.get(route);
      expect(res.status()).toBe(200);
      expect(meta(await res.text(), "og:title")).toBeTruthy();
    });

  test("home carries Person structured data", async ({ request }) => {
    const ld = jsonLd(await (await request.get("/")).text());
    expect(ld.find((d) => d["@type"] === "Person")?.name).toBe("W.S. Gong");
  });

  for (const route of ["/no-such-page", "/reading/no-such-book"])
    test(`${route} is a 404`, async ({ request }) => {
      expect((await request.get(route)).status()).toBe(404);
    });
});

test.describe("Redirects", () => {
  for (const [from, anchor] of FOLDED_ROUTES)
    test(`${from} → /${anchor} (permanent)`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(new URL(res.headers().location, "http://x").pathname).toBe("/");
      expect(new URL(res.headers().location, "http://x").hash).toBe(anchor);
    });

  test("/residencies → /slushpile", async ({ request }) => {
    const res = await request.get("/residencies", { maxRedirects: 0 });
    expect(res.status()).toBeGreaterThanOrEqual(301);
    expect(res.status()).toBeLessThanOrEqual(308);
    expect(res.headers().location).toMatch(/\/slushpile$/);
  });
});

test.describe("Slushpile mount", () => {
  test("/slushpile follows SLUSHPILE_URL", async ({ request }) => {
    const status = (await request.get("/slushpile")).status();
    // Mounted: proxied upstream, which owns its own UI. Unmounted: no route.
    if (slushpileConfigured) expect(status).toBeLessThan(500);
    else expect(status).toBe(404);
  });
});

test.describe("Security headers", () => {
  test("CSP locks down base, objects, form targets, and framing; COOP is set", async ({
    request,
  }) => {
    const h = (await request.get("/")).headers();
    const csp = h["content-security-policy"];
    for (const directive of [
      "default-src 'self'",
      "base-uri 'none'",
      "object-src 'none'",
      `form-action 'self' ${SUBSTACK_BASE_URL}`,
      "frame-ancestors 'none'",
    ])
      expect(csp).toContain(directive);
    expect(h["cross-origin-opener-policy"]).toBe("same-origin");
    expect(h["x-content-type-options"]).toBe("nosniff");
  });
});

test.describe("Feeds and files", () => {
  for (const route of STATIC_ROUTES)
    test(`${route} is 200`, async ({ request }) => {
      expect((await request.get(route)).status()).toBe(200);
    });

  test("robots.txt blocks AI training crawlers, not search", async ({
    request,
  }) => {
    const txt = await (await request.get("/robots.txt")).text();
    // Next groups agents that share a rule: each gets its own User-Agent line.
    const blocked = txt
      .split(/\n\s*\n/)
      .find((g) => /Disallow: \/\s*$/m.test(g));
    expect(blocked).toBeDefined();
    for (const bot of ["GPTBot", "ClaudeBot", "Google-Extended", "CCBot"])
      expect(blocked).toContain(`User-Agent: ${bot}`);
    for (const bot of ["Googlebot", "OAI-SearchBot", "Claude-SearchBot"])
      expect(blocked).not.toContain(bot);
    expect(txt).toMatch(/User-Agent: \*\nAllow: \//);
  });

  test("every sitemap URL is reachable", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1]).pathname,
    );
    expect(paths.length).toBeGreaterThan(0);
    const statuses = await Promise.all(
      paths.map(async (p) => [p, (await request.get(p)).status()] as const),
    );
    expect(statuses.filter(([, s]) => s !== 200)).toEqual([]);
  });

  test("/feed is an RSS channel", async ({ request }) => {
    const res = await request.get("/feed");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("xml");
    expect(await res.text()).toContain("<channel>");
  });

  test("web manifest is installable", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.status()).toBe(200);
    const m = await res.json();
    expect(m.name).toBeTruthy();
    expect(m.start_url).toBe("/");
    expect(m.display).toBe("standalone");
    expect(m.icons?.length).toBeGreaterThan(0);
  });

  test("favicon set: ico fallback, SVG with dark variant, touch icon", async ({
    request,
  }) => {
    const html = await (await request.get("/")).text();
    expect(html).toMatch(/<link rel="icon" href="\/favicon\.ico/);
    expect(html).toMatch(
      /<link rel="icon" href="\/icon\.svg" type="image\/svg\+xml"/,
    );
    const svg = await (await request.get("/icon.svg")).text();
    expect(svg).toContain("prefers-color-scheme:dark");
    expect((await request.get("/apple-touch-icon.png")).status()).toBe(200);
  });
});
