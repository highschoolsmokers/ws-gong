import { test, expect } from "@playwright/test";
import { waitForEmail, deleteEmails } from "./helpers/imap";
import {
  fillContactForm,
  openContactForm,
  submitContactForm,
  tabTo,
} from "./helpers/contact-form";
import {
  EMAIL_DELIVERY_TIMEOUT_MS,
  SUBMISSION_TIMEOUT_MS,
} from "./helpers/constants";
import { requireEnv } from "./helpers/required-env";

// Form behavior differs by engine (constraint validation, file inputs,
// focus order), so these run everywhere.
test.describe("Contact form", { tag: "@cross" }, () => {
  test("required fields are marked and enforced", async ({ page }) => {
    const f = await openContactForm(page);
    for (const field of [f.name, f.email, f.message])
      await expect(field).toHaveAttribute("required", "");
    await expect(f.subject).not.toHaveAttribute("required", "");

    // Empty submit: the browser blocks it, nothing is sent.
    await f.send.click();
    expect(
      await f.name.evaluate((el: HTMLInputElement) => el.validity.valid),
    ).toBe(false);

    // Name and email but no message: still blocked, on the message.
    await f.name.fill("Test User");
    await f.email.fill("test@example.com");
    await f.send.click();
    expect(
      await f.message.evaluate((el: HTMLTextAreaElement) => el.validity.valid),
    ).toBe(false);
    await expect(page.getByText(/message sent/i)).not.toBeAttached();
  });

  test("server rejects a bad email and keeps what was typed", async ({
    page,
  }) => {
    const f = await openContactForm(page);
    // Skip browser validation so the server's check is what's tested.
    await f.form.evaluate((el) => el.setAttribute("novalidate", ""));
    await fillContactForm(page, {
      name: "Test User",
      email: "not-an-email",
      message: "Test message content here.",
    });
    await submitContactForm(page);
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
    await expect(f.message).toHaveValue("Test message content here.");
  });

  test("attachments can be added and removed", async ({ page }) => {
    await openContactForm(page);
    await page.locator("input[type='file']").setInputFiles({
      name: "test-upload.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("x"),
    });
    await expect(page.getByText("test-upload.txt")).toBeVisible();
    await page
      .getByRole("button", { name: /remove test-upload\.txt/i })
      .click();
    await expect(page.getByText("test-upload.txt")).not.toBeAttached();
  });

  test("Send is keyboard-reachable from the first field", async ({ page }) => {
    const f = await openContactForm(page);
    await f.name.focus();
    await tabTo(page, f.send);
  });

  test("honeypot is hidden from people, AT, and password managers", async ({
    page,
  }) => {
    await page.goto("/#contact");
    const hp = page.locator("input[name='contact_hp']");
    await expect(hp).toHaveAttribute("aria-hidden", "true");
    await expect(hp).toHaveAttribute("tabindex", "-1");
    await expect(hp).toHaveAttribute("data-1p-ignore", "");
  });
});

// Real mail: run by hand against a deployed URL (MAIL_E2E=1).
test.describe("Contact form delivery", () => {
  test("sends without the optional subject @smtp", async ({ page }) => {
    requireEnv("SMTP_HOST");
    await openContactForm(page);
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

  test("the email actually arrives @infra", async ({ page }) => {
    requireEnv("IMAP_PASS");
    test.setTimeout(EMAIL_DELIVERY_TIMEOUT_MS);
    const token = `e2e-${Date.now()}`;
    await openContactForm(page);
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
    expect(await waitForEmail(token)).toContain(token);
    await deleteEmails(token);
  });
});
