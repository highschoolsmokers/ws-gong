import { test } from "node:test";
import assert from "node:assert/strict";
import { issueToken, tokenIsValid } from "./form-token.ts";
import {
  MAX_TOKEN_AGE_MS,
  MIN_ELAPSED_MS,
  isBlockedAttachmentName,
} from "./upload.ts";

const KEY = "test-key";
const T0 = 1_800_000_000_000;

test("a token passes only after the minimum and before it goes stale", () => {
  const t = issueToken(KEY, T0);
  assert.equal(tokenIsValid(t, KEY, T0 + MIN_ELAPSED_MS - 1), false);
  assert.equal(tokenIsValid(t, KEY, T0 + MIN_ELAPSED_MS), true);
  assert.equal(tokenIsValid(t, KEY, T0 + MAX_TOKEN_AGE_MS), true);
  assert.equal(tokenIsValid(t, KEY, T0 + MAX_TOKEN_AGE_MS + 1), false);
});

test("forged, re-dated, or missing tokens fail", () => {
  const later = T0 + MIN_ELAPSED_MS;
  const t = issueToken(KEY, T0);
  assert.equal(tokenIsValid(t, "other-key", later), false);
  // Backdating the timestamp breaks the signature.
  const [, sig] = t.split(".");
  assert.equal(tokenIsValid(`${T0 - 60_000}.${sig}`, KEY, later), false);
  for (const bad of ["", "123", ".", `${T0}.`, "x.y"])
    assert.equal(tokenIsValid(bad, KEY, later), false, JSON.stringify(bad));
});

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
