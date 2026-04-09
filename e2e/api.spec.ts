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

test.describe("CSRF endpoint", () => {
  test("returns JSON with token string", async ({ request }) => {
    const response = await request.get("/api/laboratory/csrf");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("token");
    expect(typeof body.token).toBe("string");
    expect(body.token.length).toBeGreaterThan(0);
  });

  test("returns salt.hash format token", async ({ request }) => {
    const response = await request.get("/api/laboratory/csrf");
    const body = await response.json();
    const parts = (body.token as string).split(".");
    expect(parts).toHaveLength(2);
    expect(parts[0].length).toBeGreaterThan(0);
    expect(parts[1].length).toBeGreaterThan(0);
  });

  test("returns unique tokens per request", async ({ request }) => {
    const r1 = await request.get("/api/laboratory/csrf");
    const r2 = await request.get("/api/laboratory/csrf");
    const t1 = (await r1.json()).token;
    const t2 = (await r2.json()).token;
    expect(t1).not.toBe(t2);
  });
});

test.describe("Resume PDF generation", () => {
  const validProfile = {
    name: { first: "Test", last: "User" },
    title: "Engineer",
    contact: [],
    about: ["Test bio"],
    education: [],
    professional_development: [],
    skills: "TypeScript",
    skill_categories: [],
    experience: [],
    earlier_experience: [],
  };

  test("returns PDF for valid profile", async ({ request }) => {
    const response = await request.post("/api/laboratory/generate", {
      data: validProfile,
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/pdf");
  });

  test("returns 400 for missing name", async ({ request }) => {
    const response = await request.post("/api/laboratory/generate", {
      data: { title: "no name field" },
    });
    expect(response.status()).toBe(400);
  });

  test("returns 400 for empty body", async ({ request }) => {
    const response = await request.post("/api/laboratory/generate", {
      data: {},
    });
    expect(response.status()).toBe(400);
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
