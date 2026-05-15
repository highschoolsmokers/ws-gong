import { test, expect } from "@playwright/test";

// /slushpile is owned by the slushpile repo and mounted via a `next.config.ts`
// rewrite when SLUSHPILE_URL is set. We don't run slushpile in the e2e env,
// so the paired-state guard runs in two modes depending on what's set.
const slushpileConfigured = Boolean(process.env.SLUSHPILE_URL);

test.describe("Slushpile mount", () => {
  test("nav slot presence matches SLUSHPILE_URL state", async ({ page }) => {
    await page.goto("/");
    const navItems = page.locator("header nav ul li");
    const labels = await navItems.allTextContents();

    if (slushpileConfigured) {
      expect(labels).toEqual(["Narratives", "Code", "Slushpile", "Reading"]);
    } else {
      expect(labels).toEqual(["Narratives", "Code", "Reading"]);
    }
  });

  test("/slushpile route behavior matches SLUSHPILE_URL state", async ({
    page,
  }) => {
    const response = await page.goto("/slushpile");
    if (slushpileConfigured) {
      // Rewrite proxies to the upstream deployment; expect a non-error status.
      // We don't assert content (the slushpile app owns its own UI).
      expect(response?.status() ?? 0).toBeLessThan(500);
    } else {
      // Path is unmounted: Next serves a 404 (no /slushpile route exists).
      expect(response?.status()).toBe(404);
    }
  });

  test("/residencies redirects to /slushpile", async ({ page }) => {
    const response = await page.goto("/residencies");
    // Lands at /slushpile, which 404s when SLUSHPILE_URL is unset (acceptable
    // by spec). Either way the final URL is /slushpile.
    expect(page.url()).toMatch(/\/slushpile$/);
    if (!slushpileConfigured) {
      expect(response?.status()).toBe(404);
    }
  });
});
