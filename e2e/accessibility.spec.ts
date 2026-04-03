import { test, expect } from "@playwright/test";

test.describe("Skip-to-content link", () => {
  test("exists and targets #main on site pages", async ({ page }) => {
    await page.goto("/about");

    const skipLink = page.getByRole("link", { name: /skip to content/i });
    await expect(skipLink).toBeAttached();
    await expect(skipLink).toHaveAttribute("href", "#main");

    // The target element exists
    await expect(page.locator("main#main")).toBeAttached();
  });
});

test.describe("Image alt text", () => {
  test("home page image has alt text", async ({ page }) => {
    await page.goto("/");

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt, `Image ${i} should have alt text`).toBeTruthy();
    }
  });
});

test.describe("Form accessibility", () => {
  test("contact form inputs have accessible names", async ({ page }) => {
    await page.goto("/contact");

    // All form inputs should be findable by their accessible name
    await expect(page.getByLabel("Name")).toBeAttached();
    await expect(page.getByLabel("Email")).toBeAttached();
    await expect(page.getByLabel("Subject")).toBeAttached();
    await expect(page.getByLabel("Message")).toBeAttached();

    // Submit button is accessible
    await expect(page.getByRole("button", { name: /send/i })).toBeAttached();
  });

  test("honeypot field is hidden from assistive tech", async ({ page }) => {
    await page.goto("/contact");

    const honeypot = page.locator("input[name='website']");
    await expect(honeypot).toHaveAttribute("aria-hidden", "true");
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
  });
});

test.describe("Keyboard navigation", () => {
  test("can tab through nav links", async ({ page }) => {
    await page.goto("/about");

    // Tab into the page — first interactive element should receive focus
    await page.keyboard.press("Tab");

    // Keep tabbing — at some point a link in the header should be focused
    let foundNavLink = false;
    for (let i = 0; i < 10; i++) {
      const focused = page.locator(":focus");
      const tagName = await focused
        .evaluate((el) => el.tagName.toLowerCase())
        .catch(() => "");
      const isInHeader = await focused
        .evaluate((el) => !!el.closest("header"))
        .catch(() => false);

      if (tagName === "a" && isInHeader) {
        foundNavLink = true;
        break;
      }
      await page.keyboard.press("Tab");
    }

    expect(foundNavLink).toBe(true);
  });

  test("send button is keyboard-reachable on contact form", async ({
    page,
  }) => {
    await page.goto("/contact");

    // Tab until we reach the Send button
    let foundSendBtn = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      const text = await focused.textContent().catch(() => "");
      if (text?.match(/send/i)) {
        foundSendBtn = true;
        break;
      }
    }

    expect(foundSendBtn).toBe(true);
  });
});
