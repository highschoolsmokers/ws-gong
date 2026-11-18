import { test, expect } from "@playwright/test";
import { orderedBooks, reviewed } from "./helpers/constants";

// The empty-log redirect and the unknown-slug 404 are covered in http.spec.
test.describe("Reading", () => {
  test("/reading lists every book", async ({ page }) => {
    test.skip(orderedBooks.length === 0, "log is empty; /reading redirects");
    await page.goto("/reading");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Reading");
    await expect(page.locator("main li")).toHaveCount(orderedBooks.length);
  });

  test("a review page renders its book, review, and Review JSON-LD", async ({
    page,
  }) => {
    test.skip(reviewed.length === 0, "no reviews yet");
    const b = reviewed[0];
    await page.goto(`/reading/${b.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(b.title);
    await expect(page.locator(".review")).not.toBeEmpty();
    const ld = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(ld.some((t) => JSON.parse(t)["@type"] === "Review")).toBe(true);
  });
});
