import { test, expect } from "@playwright/test";
import { deleteEmails, requireEnv, waitForEmail } from "./helpers/imap";
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
import { MAX_FILES, MAX_LENGTH, MAX_TOTAL_BYTES } from "../lib/upload";

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

  test("attachments over the limits are refused, by name", async ({ page }) => {
    await openContactForm(page);
    const input = page.locator("input[type='file']");
    const file = (name: string, bytes = 1) => ({
      name,
      mimeType: "application/octet-stream",
      buffer: Buffer.alloc(bytes),
    });
    const refused = page.getByText(/^Not attached/);

    // A blocked type; trailing dots and spaces don't hide it.
    await input.setInputFiles([file("setup.exe"), file("run.bat. ")]);
    await expect(refused).toContainText("setup.exe");
    await expect(refused).toContainText("run.bat");

    // One file past the count limit.
    await input.setInputFiles(
      Array.from({ length: MAX_FILES + 1 }, (_, i) => file(`f${i}.txt`)),
    );
    await expect(refused).toContainText(`f${MAX_FILES}.txt`);
    for (const i of [0, MAX_FILES - 1])
      await expect(page.getByText(`f${i}.txt (`)).toBeVisible();

    // Past the total size limit.
    for (let i = 0; i < MAX_FILES; i++)
      await page.getByRole("button", { name: `Remove f${i}.txt` }).click();
    await input.setInputFiles(file("big.pdf", MAX_TOTAL_BYTES + 1));
    await expect(refused).toContainText("big.pdf");
  });

  test("Send is keyboard-reachable from the first field", async ({ page }) => {
    const f = await openContactForm(page);
    await f.name.focus();
    await tabTo(page, f.send);
  });

  test("fields carry the server's length limits", async ({ page }) => {
    const f = await openContactForm(page);
    await expect(f.name).toHaveAttribute("maxlength", String(MAX_LENGTH.name));
    await expect(f.subject).toHaveAttribute(
      "maxlength",
      String(MAX_LENGTH.subject),
    );
    await expect(f.message).toHaveAttribute(
      "maxlength",
      String(MAX_LENGTH.message),
    );
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
