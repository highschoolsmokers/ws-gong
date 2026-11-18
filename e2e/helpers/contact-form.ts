import { expect, type Locator, type Page } from "@playwright/test";
import { ANTI_SPAM_MS, MAX_TAB_STEPS } from "./constants";

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

/** The contact section's controls, found by accessible name. */
export function contactForm(page: Page) {
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

/**
 * Open the contact section with a controllable clock, so the anti-spam
 * minimum is skipped rather than waited out.
 */
export async function openContactForm(page: Page) {
  await page.clock.install();
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

/** Jump the page clock past the anti-spam minimum and click Send. */
export async function submitContactForm(page: Page): Promise<void> {
  await page.clock.fastForward(ANTI_SPAM_MS);
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
