import { test, expect } from "@playwright/test";

test.describe("Reading", () => {
  test("renders heading and is reachable from nav", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Reading" }).click();
    await expect(page).toHaveURL(/\/reading$/);
    await expect(
      page.getByRole("heading", { name: /^Reading$/i }),
    ).toBeVisible();
  });

  test("shows empty-state copy when seed is empty", async ({ page }) => {
    await page.goto("/reading");
    // With an empty books seed the page should render its empty marker rather
    // than a Currently reading or Finished section.
    const hasReading = await page
      .getByRole("heading", { name: /^Currently reading$/i })
      .count();
    const hasFinished = await page
      .getByRole("heading", { name: /^Finished$/i })
      .count();

    if (hasReading === 0 && hasFinished === 0) {
      await expect(page.getByText(/empty for the moment/i)).toBeVisible();
    } else {
      // Seed has at least one book; verify at least one entry renders.
      const items = page.locator("main ul li");
      expect(await items.count()).toBeGreaterThanOrEqual(1);
    }
  });
});
