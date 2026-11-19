import { expect, type Locator, type Page } from "@playwright/test";
import { MIN_ELAPSED_MS } from "../../lib/upload";

/** Real wait past the server's anti-spam minimum before a real send. */
const ANTI_SPAM_MS = MIN_ELAPSED_MS + 500;

/** Max Tab presses when checking that something is keyboard-reachable. */
const MAX_TAB_STEPS = 20;

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

/** The contact section's controls, found by accessible name. */
function contactForm(page: Page) {
  const section = page.locator("section#contact");
  return {
    form: section.locator("form"),
    name: section.getByLabel("Name"),
    email: section.getByLabel("Email"),
    subject: section.getByLabel("Subject"),
    message: section.getByLabel("Message"),
    send: section.getByRole("button", { name: /send/i }),
  };
}

export async function openContactForm(page: Page) {
  await page.goto("/#contact");
  return contactForm(page);
}

export async function fillContactForm(
  page: Page,
  data: ContactFormData,
): Promise<void> {
  const f = contactForm(page);
  await f.name.fill(data.name);
  await f.email.fill(data.email);
  if (data.subject) await f.subject.fill(data.subject);
  await f.message.fill(data.message);
}

/**
 * Click Send. The anti-spam timer runs on the server's clock from the form's
 * first focus, so a submission meant to reach SMTP first waits it out for
 * real; validation errors come back before the timer is checked.
 */
export async function submitContactForm(
  page: Page,
  { pastAntiSpam = false } = {},
): Promise<void> {
  if (pastAntiSpam) await new Promise((r) => setTimeout(r, ANTI_SPAM_MS));
  await contactForm(page).send.click();
}

/** Press Tab until `target` has focus; fails if it isn't reachable. */
export async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let i = 0; i < MAX_TAB_STEPS; i++) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((el) => el === document.activeElement)) return;
  }
  await expect(
    target,
    `not reachable in ${MAX_TAB_STEPS} Tab presses`,
  ).toBeFocused({ timeout: 1 });
}
