import { test, expect, type Page } from "@playwright/test";
import { SITE_PAGES } from "./helpers/constants";

// SPEC §6.1, checked on the rendered page: elements start on a grid column
// line and end inside the grid; lists draw rules between rows only. Layout is
// engine-specific, so this runs in all three browsers.
const PAGES = [...SITE_PAGES, "/no-such-page"];
const WIDTHS = [1280, 375];

async function audit(page: Page) {
  return page.evaluate(() => {
    const grid = document.querySelector(".swiss-grid")!;
    const cs = getComputedStyle(grid);
    const widths = cs.gridTemplateColumns.split(" ").map(parseFloat);
    const gap = parseFloat(cs.columnGap);
    const box = grid.getBoundingClientRect();
    let x = box.left;
    const lines = widths.map((w) => {
      const start = x;
      x += w + gap;
      return start;
    });
    const onLine = (left: number) => lines.some((l) => Math.abs(l - left) < 1);
    const problems: string[] = [];
    const check = (el: Element, what: string) => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      if (!onLine(r.left))
        problems.push(
          `${what} starts off a column line (${Math.round(r.left)}px)`,
        );
      if (r.right > box.right + 1)
        problems.push(`${what} runs past the grid (${Math.round(r.right)}px)`);
    };
    document
      .querySelectorAll(".masthead, header nav a, footer a, footer button")
      .forEach((el) => check(el, `"${el.textContent?.trim()}"`));
    // Every block placed on the grid: section heads and bodies, the
    // statement, any other grid child, and page titles.
    document
      .querySelectorAll(
        "main .section > *, main .statement > *, main .swiss-grid > *, main h1, .swiss-container > h1",
      )
      .forEach((el, i) =>
        check(el, `block ${i + 1} <${el.tagName.toLowerCase()}>`),
      );
    document.querySelectorAll("main .row-list").forEach((ul, i) => {
      const first = ul.firstElementChild;
      const last = ul.lastElementChild;
      const px = (el: Element | null, side: string) =>
        el
          ? parseFloat(
              getComputedStyle(el).getPropertyValue(`border-${side}-width`),
            )
          : 0;
      if (px(ul, "top") || px(first, "top"))
        problems.push(`list ${i + 1} has a leading rule`);
      if (px(ul, "bottom") || px(last, "bottom"))
        problems.push(`list ${i + 1} has a trailing rule`);
    });
    return problems;
  });
}

// A fresh load at each width: resizing an open page in place raced in
// Firefox (page.evaluate hung until the test timed out).
for (const path of PAGES)
  test(
    `${path} follows the grid (SPEC §6.1)`,
    { tag: "@cross" },
    async ({ page }) => {
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        expect(await audit(page), `at ${width}px`).toEqual([]);
      }
    },
  );
