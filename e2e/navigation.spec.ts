import { test, expect } from "@playwright/test";
import { FOLDED_ROUTES } from "./helpers/constants";

// ---------------------------------------------------------------------------
// Header & masthead
// ---------------------------------------------------------------------------
test.describe("Navigation", () => {
  test("masthead is the h1 on home, a home link elsewhere", async ({
    page,
  }) => {
    await page.goto("/");
    const h1 = page.locator("header h1");
    await expect(h1).toContainText("W.S.");
    await expect(h1.getByRole("link")).not.toBeAttached();

    await page.goto("/colophon");
    await expect(
      page.locator("header").getByRole("link", { name: /W\.S\. Gong, home/i }),
    ).toHaveAttribute("href", "/");
  });

  test("nav links are anchors into home sections", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("header nav");
    for (const [name, href] of [
      ["Code", "/#code"],
      ["About", "/#about"],
      ["Writing", "/#writing"],
      ["Résumé", "/#resume"],
      ["Contact", "/#contact"],
    ]) {
      await expect(nav.getByRole("link", { name })).toHaveAttribute(
        "href",
        href,
      );
    }
  });

  test("every nav anchor has a matching section on home", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page
      .locator("header nav a[href^='/#']")
      .evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
    for (const href of hrefs) {
      await expect(page.locator(href.slice(1))).toBeAttached();
    }
  });

  test("nav appears on site pages", async ({ page }) => {
    for (const route of ["/", "/colophon", "/terms"]) {
      await page.goto(route);
      await expect(
        page.locator("header"),
        `Header should be visible on ${route}`,
      ).toBeVisible();
    }
  });
});

test.describe("Folded section pages", () => {
  for (const [route, anchor] of FOLDED_ROUTES) {
    test(`${route} redirects to /${anchor}`, async ({ page }) => {
      await page.goto(route);
      expect(new URL(page.url()).pathname).toBe("/");
      expect(new URL(page.url()).hash).toBe(anchor);
    });
  }
});

// ---------------------------------------------------------------------------
// Links page — bare layout, no chrome
// ---------------------------------------------------------------------------
test.describe("Links page", () => {
  test("renders link cards with external targets", async ({ page }) => {
    await page.goto("/links");
    const links = page.locator("a[target='_blank']");
    await expect(links.first()).toBeVisible({ timeout: 5000 });
    expect(
      await links.count(),
      "Links page should have at least 5 external links",
    ).toBeGreaterThanOrEqual(5);
  });

  test("author name is the h1 and links to home", async ({ page }) => {
    await page.goto("/links");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "W.S. Gong",
    );
    await expect(page.getByRole("link", { name: /gong/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  test("has no header or footer (bare layout)", async ({ page }) => {
    await page.goto("/links");
    await expect(page.locator("header")).not.toBeAttached();
    await expect(page.locator("footer")).not.toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Not found
// ---------------------------------------------------------------------------
test.describe("Not found page", () => {
  test("returns 404 with message and home link", async ({ page }) => {
    const response = await page.goto("/nonexistent-page-xyz");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByRole("link", { name: "← Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
