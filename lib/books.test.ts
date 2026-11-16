import { test } from "node:test";
import assert from "node:assert/strict";
import { orderBooks, type Book } from "./books.ts";

test("reading entries first in seed order, then finished newest first", () => {
  const b = (title: string, finished: Book["finished"]): Book => ({
    title,
    author: "",
    finished,
  });
  const ordered = orderBooks([
    b("old", "2024-01-02"),
    b("r1", "reading"),
    b("new", "2025-03-04"),
    b("r2", "reading"),
  ]);
  assert.deepEqual(
    ordered.map((x) => x.title),
    ["r1", "r2", "new", "old"],
  );
});
