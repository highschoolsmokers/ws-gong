import { test, expect } from "@playwright/test";
import { MAX_TAB_STEPS_NAV, MAX_TAB_STEPS_FORM } from "./helpers/constants";

// ---------------------------------------------------------------------------
// Skip-to-content link
// ---------------------------------------------------------------------------
test.describe("Skip-to-content link", () => {
  test("exists and targets #main on site pages", async ({ page }) => {
    await page.goto("/about");

    const skipLink = page.getByRole("link", { name: /skip to content/i });
    await expect(skipLink).toBeAttached();
    await expect(skipLink).toHaveAttribute("href", "#main");
    await expect(page.locator("main#main")).toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Image alt text
// ---------------------------------------------------------------------------
test.describe("Image alt text", () => {
  test("all home page images have alt text", async ({ page }) => {
    await page.goto("/");

    const images = page.getByRole("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt, `Image ${i} should have non-empty alt text`).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// Form accessibility
// ---------------------------------------------------------------------------
test.describe("Form accessibility", () => {
  test("contact form inputs have accessible names", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.getByLabel("Name")).toBeAttached();
    await expect(page.getByLabel("Email")).toBeAttached();
    await expect(page.getByLabel("Subject")).toBeAttached();
    await expect(page.getByLabel("Message")).toBeAttached();
    await expect(page.getByRole("button", { name: /send/i })).toBeAttached();
  });

  test("honeypot field is hidden from assistive tech", async ({ page }) => {
    await page.goto("/contact");

    const honeypot = page.locator("input[name='website']");
    await expect(honeypot).toHaveAttribute("aria-hidden", "true");
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
  });
});

// ---------------------------------------------------------------------------
// Keyboard navigation
// ---------------------------------------------------------------------------
test.describe("Keyboard navigation", () => {
  test("can tab to a nav link in the header", async ({ page }) => {
    await page.goto("/about");
    await page.keyboard.press("Tab");

    let foundNavLink = false;
    for (let i = 0; i < MAX_TAB_STEPS_NAV; i++) {
      const focused = page.locator(":focus");
      const tag = await focused
        .evaluate((el) => el.tagName.toLowerCase())
        .catch(() => "");
      const inHeader = await focused
        .evaluate((el) => !!el.closest("header"))
        .catch(() => false);

      if (tag === "a" && inHeader) {
        foundNavLink = true;
        break;
      }
      await page.keyboard.press("Tab");
    }

    expect(
      foundNavLink,
      `Should reach a header nav link within ${MAX_TAB_STEPS_NAV} Tab presses`,
    ).toBe(true);
  });

  test("send button is keyboard-reachable on contact form", async ({
    page,
  }) => {
    await page.goto("/contact");

    let foundSendBtn = false;
    for (let i = 0; i < MAX_TAB_STEPS_FORM; i++) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      const role = await focused
        .evaluate((el) => el.getAttribute("role") ?? el.tagName.toLowerCase())
        .catch(() => "");
      const text = await focused.textContent().catch(() => "");

      if ((role === "button" || role === "BUTTON") && text?.match(/send/i)) {
        foundSendBtn = true;
        break;
      }
    }

    expect(
      foundSendBtn,
      `Should reach Send button within ${MAX_TAB_STEPS_FORM} Tab presses`,
    ).toBe(true);
  });
});
