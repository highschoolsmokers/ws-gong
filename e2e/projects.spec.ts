import { test, expect } from "@playwright/test";

const projectSubPages = [
  { href: "/narratives-code/paperless-mcp", title: "Paperless MCP Server" },
  { href: "/narratives-code/submission-cli", title: "Submission CLI" },
  { href: "/narratives-code/writer-utilities", title: "Writer Utilities" },
  { href: "/narratives-code/resume-generator", title: "Resume Generator" },
  { href: "/narratives-code/die-neue-grafik", title: "Die Neue Grafik" },
  { href: "/narratives-code/contact-form", title: "Contact Form" },
];

test.describe("Narratives-code listing", () => {
  test("page title is Narratives. Code.", async ({ page }) => {
    await page.goto("/narratives-code");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toContainText("Narratives.");
    await expect(h1).toContainText("Code.");
  });

  test("renders all project cards with working links", async ({ page }) => {
    await page.goto("/narratives-code");

    for (const project of projectSubPages) {
      const link = page.getByRole("link", { name: new RegExp(project.title) });
      await expect(link).toBeAttached();
      await expect(link).toHaveAttribute("href", project.href);
    }
  });

  test("has Narratives and Code sections", async ({ page }) => {
    await page.goto("/narratives-code");
    await expect(
      page.getByRole("heading", { name: /^Narratives$/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /^Code$/i }),
    ).toBeVisible();
  });

  test("Narratives section appears before Code section", async ({ page }) => {
    await page.goto("/narratives-code");
    const narrativesHeading = page.getByRole("heading", {
      name: /^Narratives$/i,
    });
    const codeHeading = page.getByRole("heading", { name: /^Code$/i });

    const narrativesBox = await narrativesHeading.boundingBox();
    const codeBox = await codeHeading.boundingBox();

    expect(narrativesBox).not.toBeNull();
    expect(codeBox).not.toBeNull();
    expect(narrativesBox!.y).toBeLessThan(codeBox!.y);
  });

  test("Narratives section shows Substack posts or fallback", async ({
    page,
  }) => {
    await page.goto("/narratives-code");

    // Either Substack posts load or "Coming soon." fallback appears
    const substackLinks = page.locator(
      "section:has(h2:text('Narratives')) a[target='_blank']",
    );
    const fallback = page.getByText("Coming soon.");

    const hasLinks = (await substackLinks.count()) > 0;
    const hasFallback = await fallback.isVisible().catch(() => false);

    expect(hasLinks || hasFallback).toBe(true);
  });
});

test.describe("Project sub-pages", () => {
  for (const project of projectSubPages) {
    test(`${project.title} has heading and back link`, async ({ page }) => {
      await page.goto(project.href);

      // Has at least one heading
      await expect(page.getByRole("heading").first()).toBeVisible();

      // Has back link to /narratives-code
      await expect(
        page.getByRole("link", { name: /all projects/i }).first(),
      ).toHaveAttribute("href", "/narratives-code");
    });
  }

  // GitHub links on the three main project pages
  const projectsWithGitHub = [
    "/narratives-code/paperless-mcp",
    "/narratives-code/submission-cli",
    "/narratives-code/writer-utilities",
  ];

  for (const route of projectsWithGitHub) {
    test(`${route} has GitHub link`, async ({ page }) => {
      await page.goto(route);
      const githubLink = page.locator("a[href*='github.com']");
      await expect(githubLink.first()).toBeAttached();
      await expect(githubLink.first()).toHaveAttribute("target", "_blank");
    });
  }
});

test.describe("Project cross-navigation", () => {
  test("can navigate from listing to sub-page and back", async ({ page }) => {
    await page.goto("/narratives-code");

    // Click through to a project
    await page
      .getByRole("link", { name: /Paperless MCP Server/ })
      .click();
    await expect(page).toHaveURL(/\/narratives-code\/paperless-mcp/);

    // Navigate back
    await page
      .getByRole("link", { name: /all projects/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/narratives-code\/?$/);
  });
});
