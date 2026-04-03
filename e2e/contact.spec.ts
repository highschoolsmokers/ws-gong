import { test, expect } from "@playwright/test";
import { waitForEmail, deleteEmails } from "./helpers/imap";
import {
  fillContactForm,
  submitContactForm,
  withTempFile,
} from "./helpers/contact-form";
import {
  ANTI_SPAM_DELAY_MS,
  SUBMISSION_TIMEOUT_MS,
  VALIDATION_TIMEOUT_MS,
  EMAIL_DELIVERY_TIMEOUT_MS,
  IMAP_MAX_RETRIES,
  IMAP_RETRY_DELAY_MS,
} from "./helpers/constants";

// ---------------------------------------------------------------------------
// Field presence
// ---------------------------------------------------------------------------
test.describe("Contact form fields", () => {
  test("renders required fields and submit button", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.getByLabel("Name")).toBeAttached();
    await expect(page.getByLabel("Name")).toHaveAttribute("required", "");
    await expect(page.getByLabel("Email")).toBeAttached();
    await expect(page.getByLabel("Email")).toHaveAttribute("required", "");
    await expect(page.getByLabel("Message")).toBeAttached();
    await expect(page.getByLabel("Message")).toHaveAttribute("required", "");
    await expect(page.getByRole("button", { name: /send/i })).toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
test.describe("Contact form validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("required fields block empty submission via browser validation", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /send/i }).click();

    await expect(page.getByText(/message sent/i)).not.toBeVisible();
    await expect(page.getByText(/please enter/i)).not.toBeVisible();

    const nameValid = await page
      .getByLabel("Name")
      .evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(nameValid, "Name field should be invalid when empty").toBe(false);
  });

  test("invalid email shows server validation error", async ({ page }) => {
    // Bypass browser validation so the server can respond
    await page
      .locator("form")
      .evaluate((el: HTMLFormElement) => el.setAttribute("novalidate", ""));

    await fillContactForm(page, {
      name: "Test User",
      email: "not-an-email",
      message: "Test message content here.",
    });

    await submitContactForm(page);

    await expect(page.getByText(/please enter a valid email/i)).toBeVisible({
      timeout: VALIDATION_TIMEOUT_MS,
    });
  });

  test("missing message is blocked by browser validation", async ({ page }) => {
    await page.getByLabel("Name").fill("Test User");
    await page.getByLabel("Email").fill("test@example.com");

    await page.getByRole("button", { name: /send/i }).click();

    const messageValid = await page
      .getByLabel("Message")
      .evaluate((el: HTMLTextAreaElement) => el.validity.valid);
    expect(messageValid, "Message field should be invalid when empty").toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// Submission (requires SMTP)
// ---------------------------------------------------------------------------
test.describe("Contact form submission", () => {
  test("successful submission", async ({ page }) => {
    test.skip(!process.env.SMTP_HOST, "SMTP_HOST not set");
    await page.goto("/contact");

    await fillContactForm(page, {
      name: "E2E Test",
      email: "e2e@test.local",
      subject: "[E2E] Smoke test",
      message: "Automated smoke test — please ignore.",
    });
    await submitContactForm(page);

    await expect(page.getByRole("button", { name: /sending/i })).toBeVisible();
    await expect(page.getByText(/message sent/i)).toBeVisible({
      timeout: SUBMISSION_TIMEOUT_MS,
    });
  });

  test("submission without optional subject", async ({ page }) => {
    test.skip(!process.env.SMTP_HOST, "SMTP_HOST not set");
    await page.goto("/contact");

    await fillContactForm(page, {
      name: "E2E No Subject",
      email: "e2e@test.local",
      message: "Automated smoke test without subject — please ignore.",
    });
    await submitContactForm(page);

    await expect(page.getByText(/message sent/i)).toBeVisible({
      timeout: SUBMISSION_TIMEOUT_MS,
    });
  });
});

// ---------------------------------------------------------------------------
// Email delivery (requires SMTP + IMAP)
// ---------------------------------------------------------------------------
test.describe("Contact form email delivery", () => {
  test("email delivery verification @infra", async ({ page }) => {
    test.skip(!process.env.IMAP_PASS, "IMAP_PASS not set");
    test.setTimeout(EMAIL_DELIVERY_TIMEOUT_MS);

    const token = `e2e-${Date.now()}`;
    await page.goto("/contact");

    await fillContactForm(page, {
      name: "E2E Delivery",
      email: "e2e@test.local",
      subject: token,
      message: `Delivery verification token: ${token}`,
    });
    await submitContactForm(page);

    await expect(page.getByText(/message sent/i)).toBeVisible({
      timeout: SUBMISSION_TIMEOUT_MS,
    });

    const email = await waitForEmail(token, {
      maxRetries: IMAP_MAX_RETRIES,
      delayMs: IMAP_RETRY_DELAY_MS,
    });
    expect(email, `Email with "${token}" should arrive`).not.toBeNull();
    expect(email!.subject, "Subject should contain the token").toContain(token);

    const deleted = await deleteEmails(token);
    console.log(`[E2E] Cleaned up ${deleted} test email(s)`);
  });
});

// ---------------------------------------------------------------------------
// File attachments
// ---------------------------------------------------------------------------
test.describe("Contact form file attachments", () => {
  test("attaching a file shows it in the list", async ({ page }) => {
    await page.goto("/contact");

    await withTempFile(
      "test-upload.txt",
      "e2e test file content",
      async (filePath) => {
        await page.locator("input[type='file']").setInputFiles(filePath);
        await expect(page.getByText("test-upload.txt")).toBeVisible();
      },
    );
  });

  test("removing an attached file", async ({ page }) => {
    await page.goto("/contact");

    await withTempFile(
      "test-remove.txt",
      "file to remove",
      async (filePath) => {
        await page.locator("input[type='file']").setInputFiles(filePath);
        await expect(page.getByText("test-remove.txt")).toBeVisible();

        await page
          .getByRole("button", { name: /remove test-remove\.txt/i })
          .click();
        await expect(page.getByText("test-remove.txt")).not.toBeVisible();
      },
    );
  });
});
