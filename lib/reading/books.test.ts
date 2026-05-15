import { test } from "node:test";
import assert from "node:assert/strict";
import { books, orderedBooks } from "./books.ts";

test("orderedBooks puts 'reading' entries before finished entries", () => {
  let seenFinished = false;
  for (const b of orderedBooks) {
    if (b.finished === "reading") {
      assert.equal(
        seenFinished,
        false,
        `'reading' entry ${b.title} appeared after a finished entry`,
      );
    } else {
      seenFinished = true;
    }
  }
});

test("finished entries are in reverse-chronological order", () => {
  const finished = orderedBooks
    .filter(
      (
        b,
      ): b is (typeof orderedBooks)[number] & {
        finished: `${number}-${number}-${number}`;
      } => b.finished !== "reading",
    )
    .map((b) => b.finished);
  const sorted = [...finished].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  assert.deepEqual(finished, sorted);
});

test("every book in the seed type-checks at runtime", () => {
  for (const b of books) {
    assert.equal(typeof b.title, "string");
    assert.equal(typeof b.author, "string");
    const finishedOk =
      b.finished === "reading" || /^\d{4}-\d{2}-\d{2}$/.test(b.finished);
    assert.ok(finishedOk, `${b.title} finished field malformed: ${b.finished}`);
  }
});
