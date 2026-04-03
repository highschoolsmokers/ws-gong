import type { Page } from "@playwright/test";
import path from "path";
import fs from "fs";
import { ANTI_SPAM_DELAY_MS } from "./constants";

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

/**
 * Fill in the contact form fields using accessible labels.
 * Does NOT submit — call {@link submitContactForm} afterward.
 */
export async function fillContactForm(
  page: Page,
  data: ContactFormData,
): Promise<void> {
  await page.getByLabel("Name").fill(data.name);
  await page.getByLabel("Email").fill(data.email);
  if (data.subject) {
    await page.getByLabel("Subject").fill(data.subject);
  }
  await page.getByLabel("Message").fill(data.message);
}

/**
 * Wait out the anti-spam timer and click Send.
 */
export async function submitContactForm(page: Page): Promise<void> {
  await page.waitForTimeout(ANTI_SPAM_DELAY_MS);
  await page.getByRole("button", { name: /send/i }).click();
}

/**
 * Create a temporary file, run a callback with the file path,
 * and clean up afterward — regardless of test outcome.
 */
export async function withTempFile(
  filename: string,
  content: string,
  fn: (filePath: string) => Promise<void>,
): Promise<void> {
  const filePath = path.join(__dirname, "..", filename);
  fs.writeFileSync(filePath, content);
  try {
    await fn(filePath);
  } finally {
    fs.unlinkSync(filePath);
  }
}
