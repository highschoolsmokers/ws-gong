import { test, expect } from "@playwright/test";
import { orderedBooks, reviewed } from "../src/lib/books";
import { SUBSTACK_BASE_URL } from "../src/lib/substack";
import { SITE_PAGES, slushpileConfigured } from "./helpers/constants";

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
  // SPEC §7: every page has a title, share image, feed link, and Person data.
  for (const route of SITE_PAGES)
    test(`${route} is 200 with its metadata`, async ({ request }) => {
      const res = await request.get(route);
      expect(res.status()).toBe(200);
      const html = await res.text();
      expect(meta(html, "og:title")).toBeTruthy();
      expect(meta(html, "og:image")).toBeTruthy();
      expect(html).toMatch(
        /<link rel="alternate" type="application\/rss\+xml" href="[^"]+\/feed"/,
      );
      expect(jsonLd(html).find((d) => d["@type"] === "Person")?.name).toBe(
        "W.S. Gong",
      );
    });

  for (const route of ["/no-such-page", "/reading/no-such-book"])
    test(`${route} is a 404`, async ({ request }) => {
      expect((await request.get(route)).status()).toBe(404);
    });
});

// SPEC §2: old section pages fold into home anchors; all permanent.
const REDIRECTS = [
  ["/about", "/#about"],
  ["/code", "/#code"],
  ["/code/colophon-mcp", "/#code"],
  ["/narratives-code/colophon-mcp", "/#code"],
  ["/narratives", "/#writing"],
  // /reading folds to the top of home only while the log is empty.
  ...(orderedBooks.length ? [] : [["/reading", "/"] as const]),
  ["/cv", "/#cv"],
  ["/resume", "/#cv"],
  ["/contact", "/#contact"],
  // /residencies goes home while the slushpile app isn't proxied.
  ["/residencies", slushpileConfigured ? "/slushpile" : "/"],
] as const;

test("redirects are permanent and land where SPEC §2 says", async ({
  request,
}) => {
  for (const [from, to] of REDIRECTS) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status(), from).toBe(308);
    const url = new URL(res.headers().location, "http://x");
    expect(url.pathname + url.hash, from).toBe(to);
  }
});

test("/slushpile follows SLUSHPILE_URL", async ({ request }) => {
  const status = (await request.get("/slushpile")).status();
  // Mounted: proxied upstream, which owns its own UI. Unmounted: no route.
  if (slushpileConfigured) expect(status).toBeLessThan(500);
  else expect(status).toBe(404);
});

test("security headers (SPEC §8)", async ({ request }) => {
  const h = (await request.get("/")).headers();
  for (const directive of [
    "default-src 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    `form-action 'self' ${SUBSTACK_BASE_URL}`,
    "frame-ancestors 'none'",
  ])
    expect(h["content-security-policy"]).toContain(directive);
  expect(h["cross-origin-opener-policy"]).toBe("same-origin");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["referrer-policy"]).toBe("no-referrer");
  expect(h["strict-transport-security"]).toBe(
    "max-age=63072000; includeSubDomains; preload",
  );
  for (const feature of ["camera", "microphone", "geolocation"])
    expect(h["permissions-policy"]).toContain(`${feature}=()`);
});

test.describe("Feeds and files", () => {
  test("robots.txt blocks AI training crawlers, not search", async ({
    request,
  }) => {
    const res = await request.get("/robots.txt");
    expect(res.ok()).toBe(true);
    const txt = await res.text();
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

  test("every sitemap URL is reachable; /links is left out", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.ok()).toBe(true);
    const paths = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1]).pathname,
    );
    expect(paths.length).toBeGreaterThan(0);
    expect(paths).not.toContain("/links");
    const statuses = await Promise.all(
      paths.map(async (p) => [p, (await request.get(p)).status()] as const),
    );
    expect(statuses.filter(([, s]) => s !== 200)).toEqual([]);
  });

  test("/feed is well-formed RSS with absolute links and every review", async ({
    request,
    page,
  }) => {
    const res = await request.get("/feed");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("xml");
    const xml = await res.text();
    // An escaping bug breaks feed readers silently: parse it as they would.
    const feed = await page.evaluate((src) => {
      const doc = new DOMParser().parseFromString(src, "application/xml");
      return {
        error: doc.querySelector("parsererror")?.textContent ?? null,
        links: [...doc.querySelectorAll("item > link")].map(
          (l) => l.textContent ?? "",
        ),
      };
    }, xml);
    expect(feed.error).toBeNull();
    for (const link of feed.links) expect(link).toMatch(/^https:\/\//);
    for (const b of reviewed)
      expect(feed.links.some((l) => l.endsWith(`/reading/${b.slug}`))).toBe(
        true,
      );
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
