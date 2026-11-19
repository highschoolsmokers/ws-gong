import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_FILES,
  MAX_TOTAL_BYTES,
  isBlockedAttachmentName,
  splitAttachments,
} from "./upload.ts";

test("blocked attachments can't hide behind trailing dots or spaces", () => {
  for (const name of [
    "a.exe",
    "A.EXE",
    "a.exe.",
    "a.exe ",
    "a.exe . ",
    "x.pdf.js",
  ])
    assert.equal(isBlockedAttachmentName(name), true, name);
  for (const name of ["essay.pdf", "photo.JPG", "notes.txt", "no-extension"])
    assert.equal(isBlockedAttachmentName(name), false, name);
});

const file = (name: string, size = 1) => ({ name, size });

test("splitAttachments keeps what fits and names the rest", () => {
  // Blocked type, wherever it falls.
  assert.deepEqual(
    splitAttachments([file("a.pdf"), file("b.exe"), file("c.txt")]),
    { kept: [file("a.pdf"), file("c.txt")], refused: ["b.exe"] },
  );
  // One past the count.
  const many = Array.from({ length: MAX_FILES + 1 }, (_, i) =>
    file(`${i}.txt`),
  );
  const byCount = splitAttachments(many);
  assert.equal(byCount.kept.length, MAX_FILES);
  assert.deepEqual(byCount.refused, [`${MAX_FILES}.txt`]);
  // Past the total size; a smaller file after it still fits.
  assert.deepEqual(
    splitAttachments([
      file("big.pdf", MAX_TOTAL_BYTES - 10),
      file("too-big.pdf", 11),
      file("small.txt", 10),
    ]).refused,
    ["too-big.pdf"],
  );
});

test("splitAttachments counts files already attached", () => {
  const already = Array.from({ length: MAX_FILES - 1 }, () => file("x", 1));
  assert.deepEqual(splitAttachments([file("a"), file("b")], already).refused, [
    "b",
  ]);
  assert.deepEqual(
    splitAttachments([file("c", 2)], [file("x", MAX_TOTAL_BYTES - 1)]).refused,
    ["c"],
  );
});
