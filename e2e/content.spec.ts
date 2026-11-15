import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Page content — structural checks
// ---------------------------------------------------------------------------
test.describe("Page content", () => {
  test("about page has multiple sections and external links", async ({
    page,
  }) => {
    await page.goto("/about");
    const headings = page.getByRole("heading");
    expect(
      await headings.count(),
      "About page should have at least 3 headings",
    ).toBeGreaterThanOrEqual(3);

    const extLinks = page.locator("a[target='_blank']");
    expect(
      await extLinks.count(),
      "About page should have at least 2 external links",
    ).toBeGreaterThanOrEqual(2);
  });

  test("about page links home and to the contact section", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("link", { name: /on the home page/i }),
    ).toHaveAttribute("href", "/");
    await expect(
      page.getByRole("link", { name: /get in touch/i }),
    ).toHaveAttribute("href", "/#contact");
  });

  test("home has Work, Writing, Résumé and Contact sections", async ({
    page,
  }) => {
    await page.goto("/");
    for (const id of ["work", "writing", "resume", "contact"]) {
      await expect(page.locator(`section#${id} h2`)).toBeVisible();
    }
  });

  test("résumé section links the PDF and LinkedIn", async ({ page }) => {
    await page.goto("/");
    const resume = page.locator("section#resume");
    await expect(
      resume.getByRole("link", { name: /résumé \(pdf\)/i }),
    ).toHaveAttribute("href", "/wsgong_tech_writer_resume.pdf");
    await expect(
      resume.getByRole("link", { name: /linkedin/i }),
    ).toHaveAttribute("href", /linkedin\.com\/in\/ws-gong/);
  });

  test("terms page has legal sections", async ({ page }) => {
    await page.goto("/terms");
    expect(
      await page.getByRole("heading").count(),
      "Terms page should have at least 3 headings",
    ).toBeGreaterThanOrEqual(3);
  });

  test("colophon page has sections and external links", async ({ page }) => {
    await page.goto("/colophon");
    expect(
      await page.getByRole("heading").count(),
      "Colophon should have at least 4 headings",
    ).toBeGreaterThanOrEqual(4);
    expect(
      await page.locator("a[target='_blank']").count(),
      "Colophon should have at least 1 external link",
    ).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------
test.describe("Home page", () => {
  test("has intro text", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Statement" })).toContainText(
      /fiction editor/i,
    );
  });
});

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
test.describe("Footer", () => {
  test("visible on site pages with copyright", async ({ page }) => {
    await page.goto("/about");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible({ timeout: 5000 });
    await expect(footer).toContainText(new Date().getFullYear().toString());
  });
});

// ---------------------------------------------------------------------------
// Dark mode toggle
// ---------------------------------------------------------------------------
test.describe("Dark mode toggle", () => {
  test("toggle is present in footer", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("button", { name: /color theme/i }),
    ).toBeVisible();
  });

  test("cycles through themes on click", async ({ page }) => {
    await page.goto("/about");
    const toggle = page.getByRole("button", { name: /color theme/i });

    await expect(toggle).toContainText("Auto");
    await toggle.click();
    await expect(toggle).toContainText("Light");
    await toggle.click();
    await expect(toggle).toContainText("Dark");

    const theme = await page.locator("html").getAttribute("data-theme");
    expect(theme, "data-theme should be 'dark' after two clicks").toBe("dark");

    await toggle.click();
    await expect(toggle).toContainText("Auto");
  });
});

// ---------------------------------------------------------------------------
// Newsletter in footer
// ---------------------------------------------------------------------------
test.describe("Newsletter in footer", () => {
  test("footer has newsletter subscribe link", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.locator("footer").getByRole("link", { name: /subscribe/i }),
    ).toBeAttached();
  });
});
