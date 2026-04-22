import { test, expect } from "@playwright/test";

const projectSubPages = [
  { href: "/code/paperless-mcp", title: "Paperless MCP Server" },
  { href: "/code/submission-cli", title: "Submission CLI" },
  { href: "/code/writer-utilities", title: "Writer Utilities" },
  { href: "/code/contact-form", title: "Contact Form" },
];

// ---------------------------------------------------------------------------
// Narratives listing page
// ---------------------------------------------------------------------------
test.describe("Narratives listing", () => {
  test("has Narratives heading", async ({ page }) => {
    await page.goto("/narratives");
    await expect(
      page.getByRole("heading", { name: /^Narratives$/i }),
    ).toBeVisible();
  });

  test("shows Substack posts or writing projects", async ({ page }) => {
    await page.goto("/narratives");

    const narrativesHeading = page.getByRole("heading", {
      name: /^Narratives$/i,
    });
    const section = narrativesHeading.locator("..");
    const extLinks = section.locator("a[target='_blank']");
    const listItems = section.locator("li");

    expect(
      await listItems.count(),
      "Narratives page should have at least 1 item",
    ).toBeGreaterThanOrEqual(1);

    // Should have either Substack links or static writing projects
    const linkCount = await extLinks.count();
    expect(
      linkCount,
      "Narratives page should have external links",
    ).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Code listing page
// ---------------------------------------------------------------------------
test.describe("Code listing", () => {
  test("has Code heading", async ({ page }) => {
    await page.goto("/code");
    await expect(page.getByRole("heading", { name: /^Code$/i })).toBeVisible();
  });

  test("renders all project cards with working links", async ({ page }) => {
    await page.goto("/code");

    for (const project of projectSubPages) {
      const link = page.getByRole("link", { name: new RegExp(project.title) });
      await expect(link, `${project.title} card should exist`).toBeAttached();
      await expect(link).toHaveAttribute("href", project.href);
    }
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
      ).toHaveAttribute("href", "/code");
    });
  }

  const projectsWithGitHub = [
    "/code/paperless-mcp",
    "/code/submission-cli",
    "/code/writer-utilities",
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
    await page.goto("/code");

    await page.getByRole("link", { name: /Paperless MCP Server/ }).click();
    await expect(page).toHaveURL(/\/code\/paperless-mcp/);

    await page
      .getByRole("link", { name: /all projects/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/code\/?$/);
  });
});
