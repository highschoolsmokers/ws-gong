import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Contact form validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("required fields block empty submission via browser validation", async ({
    page,
  }) => {
    const sendBtn = page.getByRole("button", { name: /send/i });
    await sendBtn.click();

    // Form should not have submitted — no success or error message
    await expect(page.getByText(/message sent/i)).not.toBeVisible();
    await expect(page.getByText(/please enter/i)).not.toBeVisible();

    // Name field should be invalid (browser native validation)
    const nameValid = await page
      .locator("input[name='name']")
      .evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(nameValid).toBe(false);
  });

  test("invalid email shows server validation error", async ({ page }) => {
    // Disable browser validation so the server can validate instead
    await page
      .locator("form")
      .evaluate((el: HTMLFormElement) => el.setAttribute("novalidate", ""));

    await page.fill("input[name='name']", "Test User");
    await page.fill("input[name='email']", "not-an-email");
    await page.fill("textarea[name='message']", "Test message content here.");

    // Wait for anti-spam timer
    await page.waitForTimeout(3500);
    await page.getByRole("button", { name: /send/i }).click();

    await expect(page.getByText(/please enter a valid email/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("missing message is blocked by browser validation", async ({
    page,
  }) => {
    await page.fill("input[name='name']", "Test User");
    await page.fill("input[name='email']", "test@example.com");
    // Leave message empty

    await page.getByRole("button", { name: /send/i }).click();

    const messageValid = await page
      .locator("textarea[name='message']")
      .evaluate((el: HTMLTextAreaElement) => el.validity.valid);
    expect(messageValid).toBe(false);
  });
});

test.describe("Contact form file attachments", () => {
  test("attaching a file shows it in the list", async ({ page }) => {
    await page.goto("/contact");

    // Create a small temp file for upload
    const tmpFile = path.join(__dirname, "test-upload.txt");
    fs.writeFileSync(tmpFile, "e2e test file content");

    try {
      const fileInput = page.locator("input[type='file']");
      await fileInput.setInputFiles(tmpFile);

      await expect(page.getByText("test-upload.txt")).toBeVisible();
    } finally {
      fs.unlinkSync(tmpFile);
    }
  });

  test("removing an attached file", async ({ page }) => {
    await page.goto("/contact");

    const tmpFile = path.join(__dirname, "test-remove.txt");
    fs.writeFileSync(tmpFile, "file to remove");

    try {
      const fileInput = page.locator("input[type='file']");
      await fileInput.setInputFiles(tmpFile);

      await expect(page.getByText("test-remove.txt")).toBeVisible();

      await page
        .getByRole("button", { name: /remove test-remove\.txt/i })
        .click();

      await expect(page.getByText("test-remove.txt")).not.toBeVisible();
    } finally {
      fs.unlinkSync(tmpFile);
    }
  });
});
