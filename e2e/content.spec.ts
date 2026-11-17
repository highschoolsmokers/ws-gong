import { test, expect } from "@playwright/test";
import raw from "../content/site.json";
import { siteContentSchema } from "../lib/site/content-schema";

const site = siteContentSchema.parse(raw);

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

  test("home has Code, Writing, Résumé and Contact sections", async ({
    page,
  }) => {
    await page.goto("/");
    for (const id of ["code", "writing", "resume", "contact"]) {
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

  test("newsletter form hands the email to Substack's subscribe page", async ({
    page,
  }) => {
    await page.goto("/");
    const form = page.getByRole("form", { name: "Subscribe on Substack" });
    await expect(form).toHaveAttribute("action", /substack\.com\/subscribe$/);
    await expect(form).toHaveAttribute("method", "get");
    await expect(form.locator('input[name="email"]')).toHaveAttribute(
      "type",
      "email",
    );
  });

  test("the Now line follows site.json", async ({ page }) => {
    await page.goto("/");
    const now = page.locator("section#about").getByRole("heading", {
      name: "Now",
    });
    if (site.now) await expect(now).toBeVisible();
    else await expect(now).not.toBeAttached();
  });

  for (const [path, headings] of [
    ["/terms", ["Overview", "DMCA Policy", "AI / ML Training"]],
    ["/colophon", ["Typography", "Design", "Stack", "Tools", "Source"]],
  ] as const)
    test(`${path} has its sections`, async ({ page }) => {
      await page.goto(path);
      for (const name of headings)
        await expect(
          page.getByRole("heading", { name, exact: true }),
        ).toBeVisible();
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
