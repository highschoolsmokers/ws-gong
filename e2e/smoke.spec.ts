import { test, expect } from "@playwright/test";
import { SITE_PAGES, STATIC_ROUTES } from "./helpers/constants";

// ---------------------------------------------------------------------------
// Route smoke tests — every page returns 200
// ---------------------------------------------------------------------------
test.describe("Route smoke tests", () => {
  for (const route of [...SITE_PAGES, ...STATIC_ROUTES]) {
    test(`${route} returns 200`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status(), `${route} should return 200`).toBe(200);
    });
  }

  test("/api/resume returns 403 without token", async ({ request }) => {
    const response = await request.get("/api/resume");
    expect(response.status()).toBe(403);
  });
});
