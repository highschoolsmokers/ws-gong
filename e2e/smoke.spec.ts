import { test, expect } from "@playwright/test";

const pages = [
  "/",
  "/about",
  "/projects",
  "/contact",
  "/terms",
  "/colophon",
  "/links",
  "/laboratory",
  "/laboratory/resume-generator",
  "/laboratory/die-neue-grafik",
  "/laboratory/contact",
];

const staticRoutes = ["/sitemap.xml", "/robots.txt"];

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

test.describe("Navigation", () => {
  test("home page has correct nav links", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");

    await expect(
      header.getByRole("link", { name: "Projects" }),
    ).toHaveAttribute("href", "/projects");
    await expect(
      header.getByRole("link", { name: "Laboratory" }),
    ).toHaveAttribute("href", "/laboratory");
    await expect(header.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about",
    );
    await expect(header.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  test("backlink to home exists and is disabled on index", async ({ page }) => {
    await page.goto("/");
    const backlink = page
      .locator("header")
      .getByRole("link", { name: /Narratives/i });
    await expect(backlink).toHaveAttribute("href", "/");
    await expect(backlink).toHaveClass(/pointer-events-none/);
  });

  test("backlink is active on sub-pages", async ({ page }) => {
    await page.goto("/about");
    const backlink = page
      .locator("header")
      .getByRole("link", { name: /Narratives/i });
    await expect(backlink).toHaveAttribute("href", "/");
    await expect(backlink).not.toHaveClass(/pointer-events-none/);
  });

  test("nav appears on every main page", async ({ page }) => {
    for (const route of ["/", "/about", "/projects", "/resume", "/contact"]) {
      await page.goto(route);
      await expect(
        page.locator("header").getByRole("link", { name: /Narratives/i }),
      ).toBeVisible();
    }
  });
});

test.describe("Contact form", () => {
  test("renders all form fields", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.locator("input[name='name']")).toBeAttached();
    await expect(page.locator("input[name='email']")).toBeAttached();
    await expect(page.locator("textarea[name='message']")).toBeAttached();
    await expect(page.getByRole("button", { name: /send/i })).toBeAttached();
  });

  test("fields are required", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.locator("input[name='name']")).toHaveAttribute(
      "required",
      "",
    );
    await expect(page.locator("input[name='email']")).toHaveAttribute(
      "required",
      "",
    );
    await expect(page.locator("textarea[name='message']")).toHaveAttribute(
      "required",
      "",
    );
  });
});

test.describe("Sitemap", () => {
  test("all sitemap URLs are reachable", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();

    const urls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(0);

    for (const url of urls) {
      // Extract pathname so we test against the current base URL, not the hardcoded domain
      const path = new URL(url).pathname;
      const r = await request.get(path);
      expect(r.status(), `${path} should return 200`).toBe(200);
    }
  });
});

test.describe("Colophon page", () => {
  test("renders all sections", async ({ page }) => {
    await page.goto("/colophon");
    await expect(page.getByRole("heading", { name: "Typography" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Design" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Stack" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tools" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Source" })).toBeVisible();
  });

  test("has link to Geist font", async ({ page }) => {
    await page.goto("/colophon");
    await expect(page.getByRole("link", { name: "Geist" })).toHaveAttribute(
      "href",
      "https://vercel.com/font",
    );
  });

  test("has link to GitHub repo", async ({ page }) => {
    await page.goto("/colophon");
    await expect(
      page.getByRole("link", { name: /github\.com/ }),
    ).toHaveAttribute("href", "https://github.com/highschoolsmokers/ws-gong");
  });
});

test.describe("Links page", () => {
  test("renders all link cards", async ({ page }) => {
    await page.goto("/links");
    await expect(page.getByRole("link", { name: "The Rumpus" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Substack" })).toBeVisible();
    await expect(page.getByRole("link", { name: "GitHub" })).toBeVisible();
    await expect(page.getByRole("link", { name: "LinkedIn" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Instagram" })).toBeVisible();
  });

  test("links open in new tab", async ({ page }) => {
    await page.goto("/links");
    const links = page.locator("main a[target='_blank']");
    expect(await links.count()).toBeGreaterThanOrEqual(5);
  });

  test("displays author name and tagline", async ({ page }) => {
    await page.goto("/links");
    await expect(page.getByText("W.S. Gong")).toBeVisible();
    await expect(page.getByText("Fiction editor · Writer")).toBeVisible();
  });
});

test.describe("Footer", () => {
  test("shows Terms and Colophon links", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/terms",
    );
    await expect(
      footer.getByRole("link", { name: "Colophon" }),
    ).toHaveAttribute("href", "/colophon");
  });
});

test.describe("OG metadata", () => {
  for (const route of ["/"]) {
    test(`${route} has og:title`, async ({ page }) => {
      await page.goto(route);
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveAttribute("content", /.+/);
    });
  }
});
