import { test, expect, type Page } from "@playwright/test";

// SPEC §6.1, checked on the rendered page: elements start on a grid column
// line and end inside the grid; lists draw rules between rows only.
const PAGES = ["/", "/colophon", "/terms", "/links", "/no-such-page"];

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
    document
      .querySelectorAll("main .section > *, main .statement > *")
      .forEach((el, i) =>
        check(el, `section block ${i + 1} <${el.tagName.toLowerCase()}>`),
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

for (const width of [1280, 375])
  for (const path of PAGES) {
    test(`${path} at ${width}px follows the grid (SPEC §6.1)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      expect(await audit(page)).toEqual([]);
    });
  }
