import { readdirSync, readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

// The tutorial is static HTML in public/; the list of parts comes from the
// files themselves, so adding a part adds its tests.
const DIR = "public/fabulosa-books";
const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  hellip: "…",
  nbsp: " ",
};
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&(\w+);/g, (m, name) => ENTITIES[name] ?? m)
    .trim();
const parts = readdirSync(DIR)
  .filter((f) => /^part\d+\.html$/.test(f))
  .sort((a, b) => parseInt(a.slice(4)) - parseInt(b.slice(4)))
  .map((f) => ({
    path: `/fabulosa-books/${f}`,
    title: text(
      readFileSync(`${DIR}/${f}`, "utf8").match(
        /<h1[^>]*>([\s\S]*?)<\/h1>/,
      )![1],
    ),
  }));

test("index loads styled and links every part", async ({ page }) => {
  await page.goto("/fabulosa-books");
  await expect(page.locator("h1")).toContainText(
    "Building a Multi-Agent Scheduling System",
  );
  expect(
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
  ).not.toBe("rgba(0, 0, 0, 0)");
  await expect(
    page.locator("nav.site-nav").getByRole("link", { name: /W\.S\. Gong/i }),
  ).toHaveAttribute("href", "/#code");
  for (const p of parts)
    await expect(page.locator(`a[href="${p.path}"]`), p.path).toBeAttached();
});

for (const [i, part] of parts.entries())
  test(`${part.path}: heading, navs, clean load`, async ({ page }) => {
    const problems: string[] = [];
    page.on("pageerror", (e) => problems.push(e.message));
    page.on("console", (m) => m.type() === "error" && problems.push(m.text()));
    page.on("requestfailed", (r) => problems.push(`failed: ${r.url()}`));
    await page.goto(part.path);

    await expect(page.locator("h1")).toContainText(part.title);
    await expect(
      page.locator("nav.site-nav").getByRole("link", { name: /W\.S\. Gong/i }),
    ).toHaveAttribute("href", "/#code");
    const hrefs = (nav: string) =>
      page
        .locator(`nav.${nav} a`)
        .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(await hrefs("page-nav")).toEqual(await hrefs("bottom-nav"));
    if (i === 0)
      await expect(
        page.locator("nav.page-nav").getByRole("link", { name: /Contents/i }),
      ).toHaveAttribute("href", "/fabulosa-books");
    if (i === parts.length - 1)
      await expect(
        page
          .locator("nav.bottom-nav")
          .getByRole("link", { name: /Back to Contents/i }),
      ).toHaveAttribute("href", "/fabulosa-books");

    // Lazy images below the fold haven't loaded, so request each one.
    const srcs = await page.$$eval("img", (imgs) =>
      imgs.map((img) => (img as HTMLImageElement).src),
    );
    const bad = (
      await Promise.all(
        srcs.map(async (s) => ((await page.request.get(s)).ok() ? null : s)),
      )
    ).filter(Boolean);
    expect(bad, "broken images").toEqual([]);
    expect(problems).toEqual([]);
  });

test.describe("Rendering", { tag: "@cross" }, () => {
  test("Geist loads (self-hosted; the CSP blocks font CDNs)", async ({
    page,
  }) => {
    await page.goto(parts[0].path);
    expect(
      await page.evaluate(async () => {
        await document.fonts.ready;
        return document.fonts.check("16px Geist");
      }),
    ).toBe(true);
  });

  test("every page fits a 375px phone", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    for (const path of ["/fabulosa-books", ...parts.map((p) => p.path)]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        ),
        `${path} scrolls sideways`,
      ).toBeLessThanOrEqual(0);
    }
  });
});

test("code blocks are highlighted", async ({ page }) => {
  await page.goto("/fabulosa-books/part4.html");
  await expect(
    page.locator("pre code.hljs .hljs-keyword").first(),
  ).toBeAttached();
});

test("home → tutorial → back to the Code section", async ({ page }) => {
  await page.goto("/");
  await page.locator('section#code a[href^="/fabulosa-books"]').click();
  await expect(page).toHaveURL(/\/fabulosa-books/);
  await page.locator("nav.site-nav").getByRole("link").click();
  await expect(page).toHaveURL(/\/#code$/);
});
