import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Page content — structural checks
// ---------------------------------------------------------------------------
test.describe("Page content", () => {
  test("section 00 About holds the writer bio and the portrait", async ({
    page,
  }) => {
    await page.goto("/");
    const about = page.locator("section#about");
    await expect(about).toContainText("writer, editor, and software developer");
    await expect(
      about.getByRole("img", { name: /portrait of W\.S\. Gong/i }),
    ).toBeVisible();
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
      resume.getByRole("link", { name: /^cv \(pdf\)/i }),
    ).toHaveAttribute("href", "/wsgong_cv.pdf");
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
      "Writer.",
    );
  });
});

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
test.describe("Footer", () => {
  test("shows the copyright year and a subscribe link", async ({ page }) => {
    await page.goto("/colophon");
    const footer = page.locator("footer");
    await expect(footer).toContainText(new Date().getFullYear().toString());
    await expect(
      footer.getByRole("link", { name: /subscribe/i }),
    ).toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Dark mode toggle
// ---------------------------------------------------------------------------
test.describe("Dark mode toggle", () => {
  test("cycles through themes on click", async ({ page }) => {
    await page.goto("/colophon");
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
