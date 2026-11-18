import { test, expect } from "@playwright/test";
import { PDFS } from "../lib/site/resume";
import { tabTo } from "./helpers/contact-form";
import { orderedBooks, site, slushpileConfigured } from "./helpers/constants";

// Rendered pages: structure and copy, checked against the content they're
// built from. Interaction and focus tests carry @cross (all three engines).

test.describe("Home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders every section from content", async ({ page }) => {
    await expect(page.getByRole("region", { name: "Statement" })).toContainText(
      site.statement[0],
    );
    const about = page.locator("section#about");
    await expect(about).toContainText(site.bio[0]);
    await expect(
      about.getByRole("img", { name: /portrait of W\.S\. Gong/i }),
    ).toBeVisible();
    const now = about.getByRole("heading", { name: "Now" });
    if (site.now) await expect(now).toBeVisible();
    else await expect(now).not.toBeAttached();
    for (const id of ["code", "writing", "resume", "contact"])
      await expect(page.locator(`section#${id} h2`)).toBeVisible();
    await expect(
      page.locator('section#code a[href^="/fabulosa-books"]'),
    ).toContainText(/Fabulosa Books/i);
  });

  test("masthead is the h1; nav anchors land on real sections", async ({
    page,
  }) => {
    const header = page.locator("header");
    await expect(header.locator("h1")).toContainText("W.S.");
    await expect(header.locator("h1").getByRole("link")).not.toBeAttached();

    const nav = header.locator("nav");
    const expected = [
      ["Code", "/#code"],
      ["About", "/#about"],
      ["Writing", "/#writing"],
      ["Résumé", "/#resume"],
      ["Contact", "/#contact"],
      ...(orderedBooks.length ? [["Reading", "/#reading"]] : []),
    ];
    for (const [name, href] of expected)
      await expect(nav.getByRole("link", { name })).toHaveAttribute(
        "href",
        href,
      );
    for (const href of await nav
      .locator("a[href^='/#']")
      .evaluateAll((as) => as.map((a) => a.getAttribute("href")!)))
      await expect(page.locator(href.slice(1))).toBeAttached();

    const slush = nav.getByRole("link", { name: "Slushpile" });
    if (slushpileConfigured) await expect(slush).toBeAttached();
    else await expect(slush).not.toBeAttached();
  });

  test("résumé links and newsletter form", async ({ page }) => {
    const resume = page.locator("section#resume");
    await expect(
      resume.getByRole("link", { name: /résumé \(pdf\)/i }),
    ).toHaveAttribute("href", `/${PDFS.resume}`);
    await expect(
      resume.getByRole("link", { name: /^cv \(pdf\)/i }),
    ).toHaveAttribute("href", `/${PDFS.cv}`);
    await expect(
      resume.getByRole("link", { name: /linkedin/i }),
    ).toHaveAttribute("href", /linkedin\.com\/in\//);

    const form = page.getByRole("form", { name: "Subscribe on Substack" });
    await expect(form).toHaveAttribute("action", /substack\.com\/subscribe$/);
    await expect(form).toHaveAttribute("method", "get");
    await expect(form.locator('input[name="email"]')).toHaveAttribute(
      "type",
      "email",
    );
  });

  test("Reading section follows content/reading", async ({ page }) => {
    const section = page.locator("section#reading");
    if (!orderedBooks.length) return expect(section).not.toBeAttached();
    await expect(section.locator("li").first()).toBeVisible();
    await expect(
      section.getByRole("link", { name: /All reading/ }),
    ).toHaveAttribute("href", "/reading");
  });
});

test.describe("Inner pages", () => {
  test("site chrome: home link, footer, skip link", async ({ page }) => {
    await page.goto("/colophon");
    await expect(
      page.locator("header").getByRole("link", { name: /W\.S\. Gong, home/i }),
    ).toHaveAttribute("href", "/");
    const footer = page.locator("footer");
    await expect(footer).toContainText(/© \d{4} W\.S\. Gong/);
    await expect(
      footer.getByRole("link", { name: /subscribe/i }),
    ).toBeAttached();
    await expect(
      page.getByRole("link", { name: /skip to content/i }),
    ).toHaveAttribute("href", "#main");
    await expect(page.locator("main#main")).toBeAttached();
  });

  for (const [path, headings] of [
    ["/terms", ["Overview", "DMCA Policy", "AI / ML Training"]],
    ["/colophon", ["Typography", "Design", "Stack", "Tools", "Source"]],
  ] as const)
    test(`${path} has its sections`, async ({ page }) => {
      await page.goto(path);
      for (const name of headings)
        await expect(
          page.getByRole("heading", { name, exact: true }),
        ).toBeVisible();
    });

  test("/links is bare: h1 home link, external cards, no chrome", async ({
    page,
  }) => {
    await page.goto("/links");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveText("W.S. Gong");
    await expect(h1.getByRole("link")).toHaveAttribute("href", "/");
    expect(
      await page.locator("a[target='_blank']").count(),
    ).toBeGreaterThanOrEqual(5);
    await expect(page.locator("header")).not.toBeAttached();
    await expect(page.locator("footer")).not.toBeAttached();
  });

  test("404 page offers a way home", async ({ page }) => {
    await page.goto("/no-such-page");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByRole("link", { name: "← Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

test.describe("Interaction", { tag: "@cross" }, () => {
  test("theme toggle cycles Auto → Light → Dark → Auto", async ({ page }) => {
    await page.goto("/colophon");
    const toggle = page.getByRole("button", { name: /color theme/i });
    const html = page.locator("html");
    await expect(toggle).toContainText("Auto");
    await toggle.click();
    await expect(toggle).toContainText("Light");
    await expect(html).toHaveAttribute("data-theme", "light");
    await toggle.click();
    await expect(toggle).toContainText("Dark");
    await expect(html).toHaveAttribute("data-theme", "dark");
    await toggle.click();
    await expect(toggle).toContainText("Auto");
  });

  test("keyboard reaches the skip link first, then the nav", async ({
    page,
  }) => {
    await page.goto("/colophon");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: /skip to content/i }),
    ).toBeFocused();
    await tabTo(page, page.locator("header nav a").first());
  });
});
