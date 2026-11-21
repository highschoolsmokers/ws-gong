import { test, expect } from "@playwright/test";
import { TUTORIAL_PATH, partPath } from "../src/lib/tutorial";
import { tutorial, tutorialPaths } from "../src/lib/tutorial-content";

// The tutorial is site pages built from content/fabulosa-books.json (SPEC §15).
// The grid, hydration, console, metadata, and redirect checks cover it through
// SITE_PAGES and REDIRECTS; these check what is particular to it.
const parts = tutorial.parts.map((p, i) => ({
  ...p,
  i,
  path: partPath(p.slug),
}));

test("contents lists every part", async ({ page }) => {
  await page.goto(TUTORIAL_PATH);
  await expect(page.locator("h1")).toHaveText(tutorial.title);
  for (const p of parts)
    await expect(
      page.locator(`main a.row[href="${p.path}"]`),
      p.path,
    ).toContainText(p.title);
});

for (const part of parts)
  test(`${part.path}: title, sections, highlighted code, links onward`, async ({
    page,
  }) => {
    await page.goto(part.path);

    await expect(page.locator("h1")).toHaveText(part.title);
    // One section per synced section, then Continue.
    await expect(page.locator("main section h2")).toHaveText([
      ...part.sections.map((s) => s.title),
      "Continue",
    ]);
    const onward = page.locator("main section").last();
    const next = parts[part.i + 1];
    const prev = parts[part.i - 1];
    if (next)
      await expect(onward.locator(`a[href="${next.path}"]`)).toBeVisible();
    if (prev)
      await expect(onward.locator(`a[href="${prev.path}"]`)).toBeVisible();
    await expect(onward.locator(`a[href="${TUTORIAL_PATH}"]`)).toBeVisible();

    for (const code of await page.locator(".tutorial pre code").all())
      await expect(code).toHaveClass(/\bhljs\b/);
    for (const pre of await page.locator(".tutorial pre").all())
      await expect(pre).toHaveAttribute("tabindex", "0");

    // Lazy images below the fold haven't loaded, so request each one.
    const srcs = await page.$$eval("main img", (imgs) =>
      imgs.map((img) => (img as HTMLImageElement).src),
    );
    for (const src of srcs)
      expect((await page.request.get(src)).ok(), src).toBe(true);
  });

test(
  "every tutorial page fits a 375px phone",
  { tag: "@cross" },
  async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    for (const path of tutorialPaths) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        ),
        `${path} scrolls sideways`,
      ).toBeLessThanOrEqual(0);
    }
  },
);
