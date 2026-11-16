import { test, expect } from "@playwright/test";
import { orderedBooks } from "../lib/books";

test.describe("Reading", () => {
  test("home Reading section and nav entry follow the books seed", async ({
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
    }
  });
});
