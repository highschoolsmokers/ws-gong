import { test, expect } from "@playwright/test";
import { SITE_PAGES } from "./helpers/constants";

// ---------------------------------------------------------------------------
// OG metadata
// ---------------------------------------------------------------------------
test.describe("OG metadata", () => {
  for (const route of SITE_PAGES) {
    test(`${route} has og:title`, async ({ page }) => {
      const res = await page.goto(route);
      test.skip(res?.status() !== 200, "Page not available");

      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(
        ogTitle,
        `${route} should have an og:title meta tag`,
      ).toHaveAttribute("content", /.+/, { timeout: 5000 });
    });
  }
});

// ---------------------------------------------------------------------------
// JSON-LD structured data
// ---------------------------------------------------------------------------
test.describe("JSON-LD", () => {
  test("home page has Person structured data", async ({ page }) => {
    await page.goto("/");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();

    const content = await jsonLd.textContent();
    const data = JSON.parse(content!);
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe("W.S. Gong");
  });
});

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------
test.describe("Sitemap", () => {
  test("all sitemap URLs are reachable", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();
    const urls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(urls.length, "Sitemap should have at least 1 URL").toBeGreaterThan(
      0,
    );

    for (const url of urls) {
      const path = new URL(url).pathname;
      const r = await request.get(path);
      expect(r.status(), `${path} should return 200`).toBe(200);
    }
  });
});

// ---------------------------------------------------------------------------
// RSS feed
// ---------------------------------------------------------------------------
test.describe("RSS feed", () => {
  test("returns valid XML", async ({ request }) => {
    const response = await request.get("/feed");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("xml");

    const body = await response.text();
    expect(body, "Feed should contain a <channel> element").toContain(
      "<channel>",
    );
  });
});

// ---------------------------------------------------------------------------
// Web manifest
// ---------------------------------------------------------------------------
test.describe("Web manifest", () => {
  test("returns valid manifest", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);

    const manifest = await response.json();
    expect(manifest.name, "Manifest should have a name").toBeDefined();
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(
      manifest.icons?.length,
      "Manifest should have at least 1 icon",
    ).toBeGreaterThan(0);
  });
});
