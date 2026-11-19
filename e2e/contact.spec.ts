import { test, expect } from "@playwright/test";
import { deleteEmails, requireEnv, waitForEmail } from "./helpers/imap";
import {
  fillContactForm,
  openContactForm,
  submitContactForm,
  tabTo,
} from "./helpers/contact-form";
import { MAX_FILES, MAX_LENGTH } from "../src/lib/upload";

/** Wait for "message sent", and for a delivered email. */
const SUBMISSION_TIMEOUT_MS = 15_000;
const EMAIL_DELIVERY_TIMEOUT_MS = 120_000;

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

  // The limits themselves are unit-tested (lib/upload.test.ts); this proves
  // the form applies them, counting files already attached, and can undo.
  test("attachments over the limits are refused, by name", async ({ page }) => {
    await openContactForm(page);
    const input = page.locator("input[type='file']");
    const file = (name: string) => ({
      name,
      mimeType: "application/octet-stream",
      buffer: Buffer.alloc(1),
    });
    const refused = page.getByText(/^Not attached/);

    await input.setInputFiles([file("setup.exe"), file("f0.txt")]);
    await expect(refused).toContainText("setup.exe");
    await expect(page.getByText("f0.txt (")).toBeVisible();

    await input.setInputFiles(
      Array.from({ length: MAX_FILES }, (_, i) => file(`g${i}.txt`)),
    );
    await expect(refused).toContainText(`g${MAX_FILES - 1}.txt`);

    await page.getByRole("button", { name: "Remove f0.txt" }).click();
    await expect(page.getByText("f0.txt (")).not.toBeAttached();
  });

  test("Send is keyboard-reachable from the first field", async ({ page }) => {
    const f = await openContactForm(page);
    await f.name.focus();
    await tabTo(page, f.send);
  });
});

// Server-rendered markup and server checks: the same in every engine.
test.describe("Contact form (server)", () => {
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

  test("markup: the server's length limits; a honeypot no one sees", async ({
    page,
  }) => {
    const f = await openContactForm(page);
    for (const k of ["name", "subject", "message"] as const)
      await expect(f[k]).toHaveAttribute("maxlength", String(MAX_LENGTH[k]));
    // Hidden from people, assistive tech, and password managers.
    const hp = page.locator("section#contact .honeypot");
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
    await submitContactForm(page, { pastAntiSpam: true });
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
    await submitContactForm(page, { pastAntiSpam: true });
    await expect(page.getByText(/message sent/i)).toBeVisible({
      timeout: SUBMISSION_TIMEOUT_MS,
    });
    expect((await waitForEmail(token))?.subject).toContain(token);
    await deleteEmails(token);
  });

  test("an attachment arrives with the email @infra", async ({ page }) => {
    requireEnv("IMAP_PASS");
    test.setTimeout(EMAIL_DELIVERY_TIMEOUT_MS);
    const token = `e2e-attach-${Date.now()}`;
    await openContactForm(page);
    await fillContactForm(page, {
      name: "E2E Attachment",
      email: "e2e@test.local",
      subject: token,
      message: "Attachment delivery check.",
    });
    await page.locator("input[type='file']").setInputFiles({
      name: `${token}.txt`,
      mimeType: "text/plain",
      buffer: Buffer.from(token),
    });
    await submitContactForm(page, { pastAntiSpam: true });
    await expect(page.getByText(/message sent/i)).toBeVisible({
      timeout: SUBMISSION_TIMEOUT_MS,
    });
    expect((await waitForEmail(token))?.attachments).toContain(`${token}.txt`);
    await deleteEmails(token);
  });
});
