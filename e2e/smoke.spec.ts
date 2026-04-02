import { test, expect } from "@playwright/test";
import { waitForEmail, deleteEmails } from "./helpers/imap";

const pages = [
  "/",
  "/about",
  "/narratives-code",
  "/contact",
  "/terms",
  "/colophon",
  "/links",
  "/narratives-code/resume-generator",
  "/narratives-code/die-neue-grafik",
  "/narratives-code/contact-form",
];

const staticRoutes = ["/sitemap.xml", "/robots.txt"];

// ---------------------------------------------------------------------------
// Route smoke tests — every page returns 200
// ---------------------------------------------------------------------------
test.describe("Route smoke tests", () => {
  for (const route of [...pages, ...staticRoutes]) {
    test(`${route} returns 200`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
    });
  }

  test("/api/resume returns 403 without token", async ({ request }) => {
    const response = await request.get("/api/resume");
    expect(response.status()).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// Navigation — header links, backlink behavior
// ---------------------------------------------------------------------------
test.describe("Navigation", () => {
  test("header has nav links to main sections", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    const navLinks = header.getByRole("link");
    // Narratives. Code. + About (no home link on index)
    expect(await navLinks.count()).toBeGreaterThanOrEqual(2);
  });

  test("masthead is static text on index, link on sub-pages", async ({
    page,
  }) => {
    // On index: h1 contains "W.S. Gong" but is NOT a link
    await page.goto("/");
    const h1 = page.locator("header h1");
    await expect(h1).toContainText("W.S.");
    const homeLink = page
      .locator("header h1")
      .getByRole("link", { name: /W\.S\./i });
    await expect(homeLink).not.toBeAttached();

    // On sub-pages: h1 wraps a link to /
    await page.goto("/about");
    const aboutH1Link = page
      .locator("header h1")
      .getByRole("link", { name: /W\.S\./i });
    await expect(aboutH1Link).toHaveAttribute("href", "/");
  });

  test("nav has Narratives. Code. link to /narratives-code", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.locator("header");
    const ncLink = header.getByRole("link", { name: "Narratives. Code." });
    await expect(ncLink).toHaveAttribute("href", "/narratives-code");
  });

  test("Narratives. Code. link is disabled on its own page", async ({
    page,
  }) => {
    await page.goto("/narratives-code");
    const header = page.locator("header");
    const ncLink = header.getByRole("link", { name: "Narratives. Code." });
    await expect(ncLink).toHaveClass(/pointer-events-none/);
  });

  test("nav appears on site pages", async ({ page }) => {
    for (const route of ["/", "/about", "/narratives-code", "/contact"]) {
      await page.goto(route);
      await expect(page.locator("header")).toBeVisible();
    }
  });
});

// ---------------------------------------------------------------------------
// Contact form — fields, validation, submission
// ---------------------------------------------------------------------------
test.describe("Contact form", () => {
  test("renders required fields and submit button", async ({ page }) => {
    await page.goto("/contact");

    for (const name of ["name", "email"]) {
      const field = page.locator(`input[name='${name}']`);
      await expect(field).toBeAttached();
      await expect(field).toHaveAttribute("required", "");
    }
    await expect(page.locator("textarea[name='message']")).toBeAttached();
    await expect(page.locator("textarea[name='message']")).toHaveAttribute(
      "required",
      "",
    );
    await expect(page.getByRole("button", { name: /send/i })).toBeAttached();
  });

  test("successful submission", async ({ page }) => {
    test.skip(
      !process.env.SMTP_HOST,
      "SMTP_HOST not set — skipping submission test",
    );
    await page.goto("/contact");

    await page.fill("input[name='name']", "E2E Test");
    await page.fill("input[name='email']", "e2e@test.local");
    await page.fill("input[name='subject']", "[E2E] Smoke test");
    await page.fill(
      "textarea[name='message']",
      "Automated smoke test — please ignore.",
    );

    await page.waitForTimeout(3500); // anti-spam timer

    const sendBtn = page.getByRole("button", { name: /send/i });
    await sendBtn.click();

    // Button briefly shows pending state
    await expect(page.getByRole("button", { name: /sending/i })).toBeVisible();

    // Then confirmation appears
    await expect(page.getByText(/message sent/i)).toBeVisible({
      timeout: 15000,
    });
  });

  test("submission without optional subject", async ({ page }) => {
    test.skip(
      !process.env.SMTP_HOST,
      "SMTP_HOST not set — skipping submission test",
    );
    await page.goto("/contact");

    await page.fill("input[name='name']", "E2E No Subject");
    await page.fill("input[name='email']", "e2e@test.local");
    await page.fill(
      "textarea[name='message']",
      "Automated smoke test without subject — please ignore.",
    );

    await page.waitForTimeout(3500);
    await page.getByRole("button", { name: /send/i }).click();

    await expect(page.getByText(/message sent/i)).toBeVisible({
      timeout: 15000,
    });
  });

  test("email delivery verification", async ({ page }) => {
    test.skip(
      !process.env.IMAP_PASS,
      "IMAP_PASS not set — skipping delivery check",
    );
    test.setTimeout(60000);

    const token = `e2e-${Date.now()}`;
    await page.goto("/contact");

    await page.fill("input[name='name']", "E2E Delivery");
    await page.fill("input[name='email']", "e2e@test.local");
    await page.fill("input[name='subject']", token);
    await page.fill(
      "textarea[name='message']",
      `Delivery verification token: ${token}`,
    );

    await page.waitForTimeout(3500);
    await page.getByRole("button", { name: /send/i }).click();
    await expect(page.getByText(/message sent/i)).toBeVisible({
      timeout: 15000,
    });

    const email = await waitForEmail(token, { maxRetries: 8, delayMs: 5000 });
    expect(email, `Email with "${token}" should arrive`).not.toBeNull();
    expect(email!.subject).toContain(token);

    const deleted = await deleteEmails(token);
    console.log(`[E2E] Cleaned up ${deleted} test email(s)`);
  });
});

// ---------------------------------------------------------------------------
// Page content — structural checks (headings exist, key sections render)
// ---------------------------------------------------------------------------
test.describe("Page content", () => {
  test("about page has multiple sections", async ({ page }) => {
    await page.goto("/about");
    const headings = page.getByRole("heading");
    expect(await headings.count()).toBeGreaterThanOrEqual(3);
    // Has at least one external link (social)
    const extLinks = page.locator("a[target='_blank']");
    expect(await extLinks.count()).toBeGreaterThanOrEqual(2);
  });

  test("about page project links point to /narratives-code", async ({
    page,
  }) => {
    await page.goto("/about");
    const mcpLink = page.getByRole("link", { name: /MCP server/i });
    await expect(mcpLink).toHaveAttribute(
      "href",
      "/narratives-code/paperless-mcp",
    );
    const cliLink = page.getByRole("link", { name: /CLI/i });
    await expect(cliLink).toHaveAttribute(
      "href",
      "/narratives-code/submission-cli",
    );
  });

  test("narratives-code page has content", async ({ page }) => {
    await page.goto("/narratives-code");
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("terms page has legal sections", async ({ page }) => {
    await page.goto("/terms");
    const headings = page.getByRole("heading");
    expect(await headings.count()).toBeGreaterThanOrEqual(3);
  });

  test("colophon page has sections and external links", async ({ page }) => {
    await page.goto("/colophon");
    const headings = page.getByRole("heading");
    expect(await headings.count()).toBeGreaterThanOrEqual(4);
    const extLinks = page.locator("a[target='_blank']");
    expect(await extLinks.count()).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Project sub-pages — back navigation
// ---------------------------------------------------------------------------
test.describe("Project sub-pages", () => {
  const subPages = [
    "/narratives-code/resume-generator",
    "/narratives-code/die-neue-grafik",
    "/narratives-code/contact-form",
  ];

  for (const route of subPages) {
    test(`${route} has back link to /narratives-code`, async ({ page }) => {
      await page.goto(route);
      await expect(
        page.getByRole("link", { name: /all projects/i }).first(),
      ).toHaveAttribute("href", "/narratives-code");
    });
  }
});

// ---------------------------------------------------------------------------
// Links page — bare layout, no chrome
// ---------------------------------------------------------------------------
test.describe("Links page", () => {
  test("renders link cards with external targets", async ({ page }) => {
    await page.goto("/links");
    const links = page.locator("a[target='_blank']");
    await expect(links.first()).toBeVisible({ timeout: 5000 });
    expect(await links.count()).toBeGreaterThanOrEqual(5);
  });

  test("author name links to home", async ({ page }) => {
    await page.goto("/links");
    await expect(page.getByRole("link", { name: /gong/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  test("has no header or footer (bare layout)", async ({ page }) => {
    await page.goto("/links");
    await expect(page.locator("header")).not.toBeAttached();
    await expect(page.locator("footer")).not.toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Not found
// ---------------------------------------------------------------------------
test.describe("Not found page", () => {
  test("returns 404 with message and home link", async ({ page }) => {
    const response = await page.goto("/nonexistent-page-xyz");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  test("old /projects route returns 404", async ({ page }) => {
    const response = await page.goto("/projects");
    expect(response?.status()).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
test.describe("Footer", () => {
  test("visible on site pages with copyright", async ({ page }) => {
    await page.goto("/about"); // use a sub-page to avoid home image load
    const footer = page.locator("footer");
    await expect(footer).toBeVisible({ timeout: 5000 });
    await expect(footer).toContainText(new Date().getFullYear().toString());
  });
});

// ---------------------------------------------------------------------------
// Sitemap, feed, manifest
// ---------------------------------------------------------------------------
test.describe("Sitemap", () => {
  test("all sitemap URLs are reachable", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();
    const urls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(0);

    for (const url of urls) {
      const path = new URL(url).pathname;
      const r = await request.get(path);
      expect(r.status(), `${path} should return 200`).toBe(200);
    }
  });
});

test.describe("RSS feed", () => {
  test("returns valid XML", async ({ request }) => {
    const response = await request.get("/feed");
    expect(response.status()).toBe(200);
    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("xml");
    const body = await response.text();
    expect(body).toContain("<channel>");
  });
});

test.describe("Web manifest", () => {
  test("returns valid manifest", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.name).toBeDefined();
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons?.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// OG metadata
// ---------------------------------------------------------------------------
test.describe("OG metadata", () => {
  for (const route of pages) {
    test(`${route} has og:title`, async ({ page }) => {
      const res = await page.goto(route);
      test.skip(res?.status() !== 200, "Page not available");
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveAttribute("content", /.+/, {
        timeout: 5000,
      });
    });
  }
});

// ---------------------------------------------------------------------------
// Dark mode toggle
// ---------------------------------------------------------------------------
test.describe("Dark mode toggle", () => {
  test("toggle is present in footer", async ({ page }) => {
    await page.goto("/about");
    const toggle = page.getByRole("button", { name: /color theme/i });
    await expect(toggle).toBeVisible();
  });

  test("cycles through themes on click", async ({ page }) => {
    await page.goto("/about");
    const toggle = page.getByRole("button", { name: /color theme/i });
    await expect(toggle).toContainText("Auto");
    await toggle.click();
    await expect(toggle).toContainText("Light");
    await toggle.click();
    await expect(toggle).toContainText("Dark");
    // Verify data-theme attribute is set
    const theme = await page.locator("html").getAttribute("data-theme");
    expect(theme).toBe("dark");
    await toggle.click();
    await expect(toggle).toContainText("Auto");
  });
});

// ---------------------------------------------------------------------------
// Newsletter in footer
// ---------------------------------------------------------------------------
test.describe("Newsletter in footer", () => {
  test("footer has newsletter subscribe link", async ({ page }) => {
    await page.goto("/about");
    const footer = page.locator("footer");
    const subscribe = footer.getByRole("link", {
      name: /subscribe to the newsletter/i,
    });
    await expect(subscribe).toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// JSON-LD structured data
// ---------------------------------------------------------------------------
test.describe("JSON-LD", () => {
  test("home page has Person structured data", async ({ page }) => {
    await page.goto("/");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();
    const content = await jsonLd.textContent();
    const data = JSON.parse(content!);
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe("W.S. Gong");
  });
});

// ---------------------------------------------------------------------------
// Home page content
// ---------------------------------------------------------------------------
test.describe("Home page", () => {
  test("has intro text", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/fiction editor/i)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Middleware — bot blocking, allowed agents, anti-indexing
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
      expect(response.status()).toBe(403);
    });
  }

  test("blocks empty user agent", async ({ request }) => {
    const response = await request.get("/", {
      headers: { "user-agent": "" },
    });
    expect(response.status()).toBe(403);
  });

  test("blocks very short user agent", async ({ request }) => {
    const response = await request.get("/", {
      headers: { "user-agent": "curl/7" },
    });
    expect(response.status()).toBe(403);
  });
});

test.describe("Middleware: allowed agents", () => {
  test("allows normal browser", async ({ request }) => {
    const response = await request.get("/", {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      },
    });
    // 200 = allowed, 429 = allowed but rate-limited (not bot-blocked)
    expect(response.status()).not.toBe(403);
  });

  test("allows Facebook link preview", async ({ request }) => {
    const response = await request.get("/", {
      headers: {
        "user-agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      },
    });
    expect(response.status()).not.toBe(403);
  });
});

test.describe("Middleware: anti-indexing headers", () => {
  test("sets X-Robots-Tag header", async ({ request }) => {
    const response = await request.get("/", {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      },
    });
    expect(response.headers()["x-robots-tag"]).toContain("noindex");
  });
});
