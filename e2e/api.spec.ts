import { test, expect } from "@playwright/test";

test.describe("Resume API", () => {
  test("GET without token returns 403", async ({ request }) => {
    const response = await request.get("/api/resume");
    expect(response.status()).toBe(403);
  });

  test("HEAD without token returns 403", async ({ request }) => {
    const response = await request.head("/api/resume");
    expect(response.status()).toBe(403);
  });

  test("GET with invalid token returns 403", async ({ request }) => {
    const response = await request.get("/api/resume?token=bogus.token");
    expect(response.status()).toBe(403);
  });
});

test.describe("Resume PDF generation (admin-gated)", () => {
  // /api/laboratory/* is Basic-Auth protected by proxy.ts. Without credentials
  // every request — valid or malformed — must short-circuit to 401 before any
  // handler runs. Happy-path and validation behavior are covered by unit tests.
  test("POST without auth returns 401", async ({ request }) => {
    const response = await request.post("/api/laboratory/generate", {
      data: { name: { first: "Test", last: "User" } },
    });
    expect(response.status()).toBe(401);
  });

  test("POST with empty body without auth returns 401", async ({ request }) => {
    const response = await request.post("/api/laboratory/generate", {
      data: {},
    });
    expect(response.status()).toBe(401);
  });
});

test.describe("RSS feed", () => {
  test("returns valid XML with channel element", async ({ request }) => {
    const response = await request.get("/feed");
    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("xml");

    const body = await response.text();
    expect(body).toContain("<channel>");
    expect(body).toContain("</channel>");
  });
});

test.describe("404 handling", () => {
  test("unknown path returns 404 with recovery link", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist-12345");
    expect(response?.status()).toBe(404);

    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  test("unknown API route returns 404", async ({ request }) => {
    const response = await request.get("/api/nonexistent-endpoint");
    expect(response.status()).toBe(404);
  });
});
