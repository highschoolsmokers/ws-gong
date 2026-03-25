import { test, expect } from "@playwright/test";

const pages = [
  "/",
  "/about",
  "/projects",
  "/contact",
  "/resume",
];

const staticRoutes = [
  "/sitemap.xml",
  "/robots.txt",
];

test.describe("Route smoke tests", () => {
  for (const route of [...pages, ...staticRoutes]) {
    test(`${route} returns 200`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
    });
  }

  test("/api/resume returns 403 without token", async ({ request }) => {
    const response = await request.get("/api/resume");
    expect(response.status()).toBe(403);
  });
});

test.describe("Navigation", () => {
  test("home page has correct nav links", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");

    await expect(nav.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projects");
    await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    await expect(nav.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  });
});

test.describe("Contact form", () => {
  test("renders all form fields", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.locator("input[name='name']")).toBeAttached();
    await expect(page.locator("input[name='email']")).toBeAttached();
    await expect(page.locator("textarea[name='message']")).toBeAttached();
    await expect(page.getByRole("button", { name: /send/i })).toBeAttached();
  });

  test("fields are required", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.locator("input[name='name']")).toHaveAttribute("required", "");
    await expect(page.locator("input[name='email']")).toHaveAttribute("required", "");
    await expect(page.locator("textarea[name='message']")).toHaveAttribute("required", "");
  });
});

test.describe("Sitemap", () => {
  test("all sitemap URLs are reachable", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();

    const urls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(0);

    for (const url of urls) {
      // Extract pathname so we test against the current base URL, not the hardcoded domain
      const path = new URL(url).pathname;
      const r = await request.get(path);
      expect(r.status(), `${path} should return 200`).toBe(200);
    }
  });
});

test.describe("OG metadata", () => {
  for (const route of ["/"]) {
    test(`${route} has og:title`, async ({ page }) => {
      await page.goto(route);
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveAttribute("content", /.+/);
    });
  }
});
