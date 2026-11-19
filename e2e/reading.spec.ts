import { test, expect } from "@playwright/test";
import { orderedBooks, reviewed } from "../src/lib/books";

// With fixtures (READING_FIXTURES) these must run; only a real, empty log skips.
const empty = (n: number) => !process.env.READING_FIXTURES && n === 0;

// The empty-log redirect and the unknown-slug 404 are covered in http.spec.
test.describe("Reading", () => {
  test("/reading lists every book", async ({ page }) => {
    test.skip(empty(orderedBooks.length), "log is empty; /reading redirects");
    await page.goto("/reading");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Reading");
    await expect(page.locator("main li")).toHaveCount(orderedBooks.length);
  });

  test("a review page renders its book, review, and Review JSON-LD", async ({
    page,
  }) => {
    test.skip(empty(reviewed.length), "no reviews yet");
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
