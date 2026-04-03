import { test, expect } from "@playwright/test";

const projectSubPages = [
  { href: "/narratives-code/paperless-mcp", title: "Paperless MCP Server" },
  { href: "/narratives-code/submission-cli", title: "Submission CLI" },
  { href: "/narratives-code/writer-utilities", title: "Writer Utilities" },
  { href: "/narratives-code/resume-generator", title: "Resume Generator" },
  { href: "/narratives-code/die-neue-grafik", title: "Die Neue Grafik" },
  { href: "/narratives-code/contact-form", title: "Contact Form" },
];

// ---------------------------------------------------------------------------
// Listing page
// ---------------------------------------------------------------------------
test.describe("Narratives-code listing", () => {
  test("masthead shows W.S. Gong", async ({ page }) => {
    await page.goto("/narratives-code");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toContainText("W.S.");
    await expect(h1).toContainText("Gong");
  });

  test("renders all project cards with working links", async ({ page }) => {
    await page.goto("/narratives-code");

    for (const project of projectSubPages) {
      const link = page.getByRole("link", { name: new RegExp(project.title) });
      await expect(link, `${project.title} card should exist`).toBeAttached();
      await expect(link).toHaveAttribute("href", project.href);
    }
  });

  test("has Narratives and Code sections", async ({ page }) => {
    await page.goto("/narratives-code");
    await expect(
      page.getByRole("heading", { name: /^Narratives$/i }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Code$/i })).toBeVisible();
  });

  test("Narratives section appears before Code section", async ({ page }) => {
    await page.goto("/narratives-code");
    const narrativesBox = await page
      .getByRole("heading", { name: /^Narratives$/i })
      .boundingBox();
    const codeBox = await page
      .getByRole("heading", { name: /^Code$/i })
      .boundingBox();

    expect(
      narrativesBox,
      "Narratives heading should have a bounding box",
    ).not.toBeNull();
    expect(codeBox, "Code heading should have a bounding box").not.toBeNull();
    expect(
      narrativesBox!.y,
      "Narratives should appear above Code",
    ).toBeLessThan(codeBox!.y);
  });

  test("Narratives section shows Substack posts or fallback", async ({
    page,
  }) => {
    await page.goto("/narratives-code");

    // Look for external links within the Narratives heading's parent section,
    // or the "Coming soon." fallback text.
    const narrativesHeading = page.getByRole("heading", {
      name: /^Narratives$/i,
    });
    const section = narrativesHeading.locator("..");
    const extLinks = section.locator("a[target='_blank']");
    const fallback = page.getByText("Coming soon.");

    const linkCount = await extLinks.count();
    const hasFallback = await fallback.isVisible();

    expect(
      linkCount > 0 || hasFallback,
      "Narratives should show Substack posts or a 'Coming soon.' fallback",
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Sub-pages
// ---------------------------------------------------------------------------
test.describe("Project sub-pages", () => {
  for (const project of projectSubPages) {
    test(`${project.title} has heading and back link`, async ({ page }) => {
      await page.goto(project.href);

      await expect(
        page.getByRole("heading").first(),
        `${project.title} should have a heading`,
      ).toBeVisible();

      await expect(
        page.getByRole("link", { name: /all projects/i }).first(),
      ).toHaveAttribute("href", "/narratives-code");
    });
  }

  const projectsWithGitHub = [
    "/narratives-code/paperless-mcp",
    "/narratives-code/submission-cli",
    "/narratives-code/writer-utilities",
  ];

  for (const route of projectsWithGitHub) {
    test(`${route} has GitHub link`, async ({ page }) => {
      await page.goto(route);
      const githubLink = page.getByRole("link", { name: /github/i });
      await expect(
        githubLink.first(),
        `${route} should have a GitHub link`,
      ).toBeAttached();
      await expect(githubLink.first()).toHaveAttribute("target", "_blank");
    });
  }
});

// ---------------------------------------------------------------------------
// Cross-navigation
// ---------------------------------------------------------------------------
test.describe("Project cross-navigation", () => {
  test("can navigate from listing to sub-page and back", async ({ page }) => {
    await page.goto("/narratives-code");

    await page.getByRole("link", { name: /Paperless MCP Server/ }).click();
    await expect(page).toHaveURL(/\/narratives-code\/paperless-mcp/);

    await page
      .getByRole("link", { name: /all projects/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/narratives-code\/?$/);
  });
});
