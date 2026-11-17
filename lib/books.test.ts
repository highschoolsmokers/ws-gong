import { test } from "node:test";
import assert from "node:assert/strict";
import { orderBooks, parseBook, type Book } from "./books.ts";
import { feedHtml, goodreadsHtml, reviewHtml } from "./review.ts";

test("reading entries first, then finished newest first", () => {
  const b = (title: string, finished: Book["finished"]): Book => ({
    title,
    author: "",
    finished,
    slug: title,
    review: "",
  });
  const ordered = orderBooks([
    b("old", "2024-01-02"),
    b("r2", "reading"),
    b("new", "2025-03-04"),
    b("r1", "reading"),
  ]);
  assert.deepEqual(
    ordered.map((x) => x.title),
    ["r1", "r2", "new", "old"],
  );
});

const file = `---
title: "Pachinko"
author: Min Jin Lee
finished: 2026-10-01
rating: 4
isbn: 978-1455563920
---

A *family* saga.

::: spoiler
Noa **dies**.
:::

The end.
`;

test("parseBook reads frontmatter and the review body", () => {
  const b = parseBook("pachinko", file);
  assert.equal(b.title, "Pachinko");
  assert.equal(b.rating, 4);
  assert.equal(b.finished, "2026-10-01");
  assert.match(b.review, /^A \*family\* saga\./);
});

test("parseBook rejects bad files", () => {
  assert.throws(() => parseBook("Bad_Slug", file), /kebab-case/);
  assert.throws(() => parseBook("x", "no frontmatter"), /frontmatter/);
  assert.throws(
    () => parseBook("x", file.replace("rating: 4", "rating: 9")),
    /rating/,
  );
  assert.throws(
    () => parseBook("x", file.replace("rating: 4", "stars: 4")),
    /stars/,
  );
});

test("spoilers: hidden on the site, dropped from the feed, tagged for Goodreads", () => {
  const { review } = parseBook("pachinko", file);
  const site = reviewHtml(review);
  assert.match(site, /<details class="spoiler"><summary>Spoiler<\/summary>/);
  assert.match(site, /Noa <strong>dies<\/strong>/);

  const feed = feedHtml(review, "https://example.com/r");
  assert.doesNotMatch(feed, /dies/);
  assert.match(feed, /Spoiler hidden/);

  const gr = goodreadsHtml(review);
  assert.equal(
    gr,
    "A <i>family</i> saga.\n\n<spoiler>Noa <b>dies</b>.</spoiler>\n\nThe end.",
  );
});
