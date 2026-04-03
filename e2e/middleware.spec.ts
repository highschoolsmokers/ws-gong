import { test, expect } from "@playwright/test";

const NORMAL_BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";

// ---------------------------------------------------------------------------
// Bot blocking
// ---------------------------------------------------------------------------
test.describe("Middleware: bot blocking", () => {
  const blockedAgents: [string, string][] = [
    ["Googlebot", "Googlebot/2.1 (+http://www.google.com/bot.html)"],
    ["GPTBot", "Mozilla/5.0 (compatible; GPTBot/1.0)"],
    ["CCBot", "CCBot/2.0"],
    ["ClaudeBot", "Mozilla/5.0 (compatible; ClaudeBot/1.0)"],
    ["AhrefsBot", "Mozilla/5.0 (compatible; AhrefsBot/7.0)"],
  ];

  for (const [name, ua] of blockedAgents) {
    test(`blocks ${name}`, async ({ request }) => {
      const response = await request.get("/", {
        headers: { "user-agent": ua },
      });
      expect(response.status(), `${name} should be blocked with 403`).toBe(403);
    });
  }

  test("blocks empty user agent", async ({ request }) => {
    const response = await request.get("/", {
      headers: { "user-agent": "" },
    });
    expect(response.status(), "Empty UA should be blocked").toBe(403);
  });

  test("blocks very short user agent", async ({ request }) => {
    const response = await request.get("/", {
      headers: { "user-agent": "curl/7" },
    });
    expect(response.status(), "Short UA should be blocked").toBe(403);
  });
});

// ---------------------------------------------------------------------------
// Allowed agents
// ---------------------------------------------------------------------------
test.describe("Middleware: allowed agents", () => {
  test("allows normal browser", async ({ request }) => {
    const response = await request.get("/", {
      headers: { "user-agent": NORMAL_BROWSER_UA },
    });
    expect(response.status(), "Normal browser should not be blocked").not.toBe(
      403,
    );
  });

  test("allows Facebook link preview", async ({ request }) => {
    const response = await request.get("/", {
      headers: {
        "user-agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      },
    });
    expect(
      response.status(),
      "Facebook crawler should not be blocked",
    ).not.toBe(403);
  });
});

// ---------------------------------------------------------------------------
// Anti-indexing headers
// ---------------------------------------------------------------------------
test.describe("Middleware: anti-indexing headers", () => {
  test("sets X-Robots-Tag header", async ({ request }) => {
    const response = await request.get("/", {
      headers: { "user-agent": NORMAL_BROWSER_UA },
    });
    expect(
      response.headers()["x-robots-tag"],
      "Response should include noindex directive",
    ).toContain("noindex");
  });
});
