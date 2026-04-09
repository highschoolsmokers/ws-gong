import { test, expect } from "@playwright/test";

const tutorialPages = [
  { path: "/fabulosa-books/part1.html", title: "Welcome to Fabulosa Books" },
  { path: "/fabulosa-books/part2.html", title: "How Agents Think" },
  { path: "/fabulosa-books/part3.html", title: "Setting Up Shop" },
  {
    path: "/fabulosa-books/part4.html",
    title: "The Foundation — Data and Database",
  },
  {
    path: "/fabulosa-books/part5.html",
    title: "Your First Agent — The Availability Agent",
  },
  {
    path: "/fabulosa-books/part6.html",
    title: "The Specialist Team — Multi-Agent Orchestration",
  },
  { path: "/fabulosa-books/part7.html", title: "Making It Real" },
];

// ---------------------------------------------------------------------------
// Code page – Documentation Engineering section
// ---------------------------------------------------------------------------
test.describe("Documentation Engineering section", () => {
  test("has Documentation Engineering heading on /code", async ({ page }) => {
    await page.goto("/code");
    await expect(
      page.getByRole("heading", { name: /Documentation Engineering/i }),
    ).toBeVisible();
  });

  test("has Fabulosa Books tutorial link", async ({ page }) => {
    await page.goto("/code");
    const link = page.getByRole("link", {
      name: /Fabulosa Books Scheduler/i,
    });
    await expect(link).toBeAttached();
    await expect(link).toHaveAttribute("href", "/fabulosa-books/");
  });
});

// ---------------------------------------------------------------------------
// Tutorial index page
// ---------------------------------------------------------------------------
test.describe("Fabulosa Books index", () => {
  test("loads with styled content", async ({ page }) => {
    await page.goto("/fabulosa-books/");
    await expect(page.locator("h1")).toContainText(
      "Building a Multi-Agent Scheduling System",
    );
    // Stylesheet loaded — check body has non-default background
    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).getPropertyValue("background-color"),
    );
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("has site nav link back to /code", async ({ page }) => {
    await page.goto("/fabulosa-books/");
    const siteNav = page.locator("nav.site-nav");
    await expect(siteNav).toBeVisible();
    const link = siteNav.getByRole("link", { name: /W\.S\. Gong/i });
    await expect(link).toHaveAttribute("href", "/code");
  });

  test("has links to all 7 parts", async ({ page }) => {
    await page.goto("/fabulosa-books/");
    for (const part of tutorialPages) {
      await expect(
        page.locator(`a[href="${part.path}"]`),
        `Should link to ${part.path}`,
      ).toBeAttached();
    }
  });
});

// ---------------------------------------------------------------------------
// Tutorial part pages
// ---------------------------------------------------------------------------
test.describe("Fabulosa Books part pages", () => {
  for (const part of tutorialPages) {
    test(`${part.title} loads with heading and site nav`, async ({ page }) => {
      await page.goto(part.path);

      await expect(page.locator("h1")).toContainText(part.title);

      // Site nav back to main site
      const siteNav = page.locator("nav.site-nav");
      await expect(siteNav).toBeVisible();
      await expect(
        siteNav.getByRole("link", { name: /W\.S\. Gong/i }),
      ).toHaveAttribute("href", "/code");

      // Page nav exists
      await expect(page.locator("nav.page-nav")).toBeVisible();
    });
  }

  test("part 1 has Contents link in page nav", async ({ page }) => {
    await page.goto("/fabulosa-books/part1.html");
    const pageNav = page.locator("nav.page-nav");
    await expect(
      pageNav.getByRole("link", { name: /Contents/i }),
    ).toHaveAttribute("href", "/fabulosa-books/index.html");
  });

  test("part 7 has back to Contents link", async ({ page }) => {
    await page.goto("/fabulosa-books/part7.html");
    await expect(
      page.getByRole("link", { name: /Back to Contents/i }),
    ).toHaveAttribute("href", "/fabulosa-books/index.html");
  });

  test("stylesheet is loaded on part pages", async ({ page }) => {
    await page.goto("/fabulosa-books/part3.html");
    const fontFamily = await page.evaluate(() =>
      getComputedStyle(document.body).getPropertyValue("font-family"),
    );
    expect(fontFamily).toContain("Geist");
  });
});

// ---------------------------------------------------------------------------
// Cross-navigation
// ---------------------------------------------------------------------------
test.describe("Fabulosa Books cross-navigation", () => {
  test("can navigate from /code to tutorial and back", async ({ page }) => {
    await page.goto("/code");

    await page.getByRole("link", { name: /Fabulosa Books Scheduler/i }).click();
    await expect(page).toHaveURL(/\/fabulosa-books/);

    await page.locator("nav.site-nav").getByRole("link").click();
    await expect(page).toHaveURL(/\/code\/?$/);
  });
});
