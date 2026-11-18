import { test, expect } from "@playwright/test";
import { stack, tools } from "../lib/colophon";
import { ELSEWHERE_ON_HOME, linkUrl } from "../lib/site/content-schema";
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
    const about = page.locator("section#about");
    await expect(about).toContainText(site.bio[0]);
    await expect(
      about.getByRole("img", { name: /portrait of W\.S\. Gong/i }),
    ).toBeVisible();
    for (const id of ["code", "writing", "cv", "contact"])
      await expect(page.locator(`section#${id} h2`)).toBeVisible();
    await expect(
      page.locator('section#code a[href^="/fabulosa-books"]'),
    ).toContainText(/Fabulosa Books/i);
    await expect(
      page
        .locator("section#code")
        .getByRole("link", { name: /More on GitHub/ }),
    ).toHaveAttribute("href", linkUrl(site.links, "GitHub"));
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
      ["CV", "/#cv"],
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

  test("every master link appears on the home page", async ({ page }) => {
    for (const { label, url } of site.links)
      expect(
        await page.locator(`a[href^="${url.replace(/\/$/, "")}"]`).count(),
        `${label} is linked on /`,
      ).toBeGreaterThan(0);
  });

  test("CV section: CV first, then résumé and profiles; Substack form", async ({
    page,
  }) => {
    const resume = page.locator("section#cv");
    const rows = await resume.locator("li").allTextContents();
    expect(rows.slice(0, 2).map((r) => r.trim())).toEqual([
      "CV (PDF)",
      "Résumé (PDF)",
    ]);
    await expect(
      resume.getByRole("link", { name: /résumé \(pdf\)/i }),
    ).toHaveAttribute("href", `/${PDFS.resume}`);
    await expect(
      resume.getByRole("link", { name: /^cv \(pdf\)/i }),
    ).toHaveAttribute("href", `/${PDFS.cv}`);
    // Every master link but those with their own place on the page, in order.
    expect(rows.slice(2).map((r) => r.replace("↗", "").trim())).toEqual(
      site.links
        .filter((l) => !ELSEWHERE_ON_HOME.includes(l.label))
        .map((l) => l.label),
    );

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
    await expect(footer.getByRole("link", { name: "Substack" })).toBeAttached();
    await expect(
      page.getByRole("link", { name: /skip to content/i }),
    ).toHaveAttribute("href", "#main");
    await expect(page.locator("main#main")).toBeAttached();
  });

  for (const [path, headings] of [
    [
      "/terms",
      [
        "Overview",
        "What You May Do",
        "Privacy",
        "Third-Party Content",
        "DMCA Policy",
        "AI / ML Training",
      ],
    ],
    [
      "/colophon",
      ["Typography", "Design", "Content", "Stack", "Tools", "Source"],
    ],
  ] as const)
    test(`${path} has its sections`, async ({ page }) => {
      await page.goto(path);
      for (const name of headings)
        await expect(
          page.getByRole("heading", { name, exact: true }),
        ).toBeVisible();
    });

  test("/colophon lists the stack and tools from lib/colophon", async ({
    page,
  }) => {
    await page.goto("/colophon");
    for (const { label } of [...stack, ...tools])
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /\/ws-gong$/ }),
    ).toHaveAttribute("href", `${linkUrl(site.links, "GitHub")}/ws-gong`);
  });

  test("/links is bare: h1 home link, external cards, no chrome", async ({
    page,
  }) => {
    await page.goto("/links");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveText("W.S. Gong");
    await expect(h1.getByRole("link")).toHaveAttribute("href", "/");
    await expect(
      page.getByRole("img", { name: /portrait of W\.S\. Gong/i }),
    ).toBeVisible();
    expect(
      await page.locator("a[target='_blank']").count(),
    ).toBeGreaterThanOrEqual(5);
    await expect(page.locator("header")).not.toBeAttached();
    await expect(page.locator("footer")).not.toBeAttached();
    await expect(
      page.getByRole("link", { name: /ws-gong\.com/ }),
    ).toHaveAttribute("href", "/");
    const list = page.locator("section", {
      has: page.getByRole("heading", { name: "Links" }),
    });
    // The main site, then every master link but Instagram, in master order.
    const labels = await list.locator("li").allTextContents();
    expect(labels.map((l) => l.replace("↗", "").trim())).toEqual([
      "ws-gong.comwriting, code, CV",
      ...site.links.filter((l) => l.label !== "Instagram").map((l) => l.label),
    ]);
    // Visitors arrive from Instagram; no link back there.
    await expect(
      page.locator(`a[href="${linkUrl(site.links, "Instagram")}"]`),
    ).toHaveCount(0);
  });

  for (const path of ["/", "/links"])
    test(`${path}: the Substack button fits its form at phone and tablet widths`, async ({
      page,
    }) => {
      for (const width of [320, 768]) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        const form = page.getByRole("form", { name: "Subscribe on Substack" });
        const [f, b] = await Promise.all([
          form.boundingBox(),
          form.getByRole("button").boundingBox(),
        ]);
        expect(
          b!.x + b!.width,
          `button inside the form at ${width}px`,
        ).toBeLessThanOrEqual(f!.x + f!.width + 0.5);
      }
    });

  test("/links leads with the latest story (and post, when Substack answers)", async ({
    page,
  }) => {
    await page.goto("/links");
    const latest = page.locator("section", {
      has: page.getByRole("heading", { name: "Latest" }),
    });
    await expect(latest).toContainText(site.published[0].title);
    await expect(
      latest.getByRole("form", { name: "Subscribe on Substack" }),
    ).toHaveAttribute("action", /substack\.com\/subscribe$/);
    // Latest comes before the profile links.
    const headings = await page.locator("main h2, h2").allTextContents();
    expect(headings.indexOf("Latest")).toBeLessThan(headings.indexOf("Links"));
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
