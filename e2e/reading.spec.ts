import { test, expect } from "@playwright/test";
import { orderedBooks, reviewed } from "../lib/books";

test.describe("Reading", () => {
  test("home Reading section and nav entry follow content/reading", async ({
    page,
  }) => {
    await page.goto("/");
    const section = page.locator("section#reading");
    const navLink = page.locator("header nav").getByRole("link", {
      name: "Reading",
    });
    if (orderedBooks.length === 0) {
      await expect(section).not.toBeAttached();
      await expect(navLink).not.toBeAttached();
    } else {
      await expect(section.locator("li").first()).toBeVisible();
      await expect(navLink).toHaveAttribute("href", "/#reading");
      await expect(
        section.getByRole("link", { name: /All reading/ }),
      ).toHaveAttribute("href", "/reading");
    }
  });

  test("/reading lists every book, or folds to home while empty", async ({
    page,
  }) => {
    await page.goto("/reading");
    if (orderedBooks.length === 0) {
      expect(new URL(page.url()).pathname).toBe("/");
      return;
    }
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

  test("an unknown review slug is a 404", async ({ page }) => {
    const res = await page.goto("/reading/no-such-book");
    expect(res?.status()).toBe(404);
  });
});
