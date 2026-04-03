import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Header & masthead
// ---------------------------------------------------------------------------
test.describe("Navigation", () => {
  test("header has nav links to main sections", async ({ page }) => {
    await page.goto("/");
    const navLinks = page.locator("header").getByRole("link");
    expect(
      await navLinks.count(),
      "Header should have at least 2 nav links",
    ).toBeGreaterThanOrEqual(2);
  });

  test("masthead is static text on index, link on sub-pages", async ({
    page,
  }) => {
    await page.goto("/");
    const h1 = page.locator("header h1");
    await expect(h1).toContainText("W.S.");

    // On index the masthead is NOT a link
    const homeLink = h1.getByRole("link", { name: /W\.S\./i });
    await expect(homeLink).not.toBeAttached();

    // On sub-pages it links to /
    await page.goto("/about");
    const aboutH1Link = page
      .locator("header h1")
      .getByRole("link", { name: /W\.S\./i });
    await expect(aboutH1Link).toHaveAttribute("href", "/");
  });

  test("has Narratives link pointing to /narratives", async ({ page }) => {
    await page.goto("/");
    const link = page
      .locator("header")
      .getByRole("link", { name: "Narratives" });
    await expect(link).toHaveAttribute("href", "/narratives");
  });

  test("has Code link pointing to /code", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("header").getByRole("link", { name: "Code" });
    await expect(link).toHaveAttribute("href", "/code");
  });

  test("Narratives link is disabled on its own page", async ({ page }) => {
    await page.goto("/narratives");
    const link = page
      .locator("header")
      .getByRole("link", { name: "Narratives" });
    await expect(link).toHaveClass(/pointer-events-none/);
  });

  test("Code link is disabled on its own page", async ({ page }) => {
    await page.goto("/code");
    const link = page.locator("header").getByRole("link", { name: "Code" });
    await expect(link).toHaveClass(/pointer-events-none/);
  });

  test("nav appears on site pages", async ({ page }) => {
    for (const route of ["/", "/about", "/narratives", "/code", "/contact"]) {
      await page.goto(route);
      await expect(
        page.locator("header"),
        `Header should be visible on ${route}`,
      ).toBeVisible();
    }
  });
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

  test("author name links to home", async ({ page }) => {
    await page.goto("/links");
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
    await expect(page.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  test("old /projects route returns 404", async ({ page }) => {
    const response = await page.goto("/projects");
    expect(response?.status()).toBe(404);
  });
});
