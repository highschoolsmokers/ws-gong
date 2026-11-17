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
// Home Code section links the tutorial
// ---------------------------------------------------------------------------
test.describe("Code section", () => {
  test("has Fabulosa Books tutorial link", async ({ page }) => {
    await page.goto("/");
    const link = page.locator('section#code a[href^="/fabulosa-books"]');
    await expect(link).toBeAttached();
    await expect(link).toContainText(/Fabulosa Books/i);
  });
});

// ---------------------------------------------------------------------------
// Tutorial index page
// ---------------------------------------------------------------------------
test.describe("Fabulosa Books index", () => {
  test("loads with styled content", async ({ page }) => {
    await page.goto("/fabulosa-books");
    await expect(page.locator("h1")).toContainText(
      "Building a Multi-Agent Scheduling System",
    );
    // Stylesheet loaded — check body has non-default background
    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).getPropertyValue("background-color"),
    );
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("has site nav link back to the Code section", async ({ page }) => {
    await page.goto("/fabulosa-books");
    const siteNav = page.locator("nav.site-nav");
    await expect(siteNav).toBeVisible();
    const link = siteNav.getByRole("link", { name: /W\.S\. Gong/i });
    await expect(link).toHaveAttribute("href", "/#code");
  });

  test("has links to all 7 parts", async ({ page }) => {
    await page.goto("/fabulosa-books");
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
      ).toHaveAttribute("href", "/#code");

      // Top and bottom navs carry the same links
      const hrefs = (nav: string) =>
        page
          .locator(`nav.${nav} a`)
          .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
      await expect(page.locator("nav.page-nav")).toBeVisible();
      expect(await hrefs("page-nav")).toEqual(await hrefs("bottom-nav"));
    });
  }

  test("part 1 has Contents link in page nav", async ({ page }) => {
    await page.goto("/fabulosa-books/part1.html");
    const pageNav = page.locator("nav.page-nav");
    await expect(
      pageNav.getByRole("link", { name: /Contents/i }),
    ).toHaveAttribute("href", "/fabulosa-books");
  });

  test("part 7 has back to Contents link", async ({ page }) => {
    await page.goto("/fabulosa-books/part7.html");
    await expect(
      page
        .locator("nav.bottom-nav")
        .getByRole("link", { name: /Back to Contents/i }),
    ).toHaveAttribute("href", "/fabulosa-books");
  });

  test("Geist actually loads (self-hosted; the CSP blocks font CDNs)", async ({
    page,
  }) => {
    await page.goto("/fabulosa-books/part3.html");
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return document.fonts.check("16px Geist");
    });
    expect(loaded).toBe(true);
  });

  test("code blocks are highlighted in the HTML", async ({ page }) => {
    await page.goto("/fabulosa-books/part4.html");
    await expect(
      page.locator("pre code.hljs .hljs-keyword").first(),
    ).toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Every tutorial page: no errors, no blocked requests, fits a phone
// ---------------------------------------------------------------------------
test.describe("Fabulosa Books page health", () => {
  for (const path of ["/fabulosa-books", ...tutorialPages.map((p) => p.path)]) {
    test(`${path} loads without errors, images resolve, fits 375 px`, async ({
      page,
    }) => {
      const problems: string[] = [];
      page.on("pageerror", (e) => problems.push(e.message));
      page.on("console", (m) => {
        if (m.type() === "error") problems.push(m.text());
      });
      page.on("requestfailed", (r) => problems.push(`failed: ${r.url()}`));
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(path, { waitUntil: "networkidle" });
      expect(problems).toEqual([]);
      // Lazy images below the fold haven't loaded yet, so request each one.
      const srcs = await page.$$eval("img", (imgs) =>
        imgs.map((i) => (i as HTMLImageElement).src),
      );
      for (const src of srcs)
        expect((await page.request.get(src)).ok(), src).toBe(true);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, "page must not scroll sideways").toBeLessThanOrEqual(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Cross-navigation
// ---------------------------------------------------------------------------
test.describe("Fabulosa Books cross-navigation", () => {
  test("can navigate from home to tutorial and back", async ({ page }) => {
    await page.goto("/");

    await page.locator('a[href^="/fabulosa-books"]').click();
    await expect(page).toHaveURL(/\/fabulosa-books/);

    await page.locator("nav.site-nav").getByRole("link").click();
    await expect(page).toHaveURL(/\/#code$/);
  });
});
