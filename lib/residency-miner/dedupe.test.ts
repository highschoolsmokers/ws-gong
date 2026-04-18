import { test } from "node:test";
import assert from "node:assert/strict";
import { generateId, normalizeName, normalizeUrl } from "./dedupe.ts";

test("normalizeName folds diacritics", () => {
  assert.equal(normalizeName("Théâtre Residency"), "theatre residency");
});

test("normalizeName unifies & and 'and'", () => {
  assert.equal(
    normalizeName("Academy & Residency"),
    normalizeName("Academy and Residency"),
  );
});

test("normalizeName strips leading articles", () => {
  assert.equal(
    normalizeName("The Elizabeth George Foundation"),
    normalizeName("Elizabeth George Foundation"),
  );
});

test("normalizeName strips 4-digit years anywhere", () => {
  assert.equal(
    normalizeName("2026 Fellowship in Poetry"),
    normalizeName("Fellowship in Poetry"),
  );
  assert.equal(
    normalizeName("Fellowship 2026 Fall"),
    normalizeName("Fellowship Fall"),
  );
});

test("normalizeName drops punctuation and collapses whitespace", () => {
  assert.equal(
    normalizeName("MacDowell — Writers' Residency!!"),
    "macdowell writers residency",
  );
});

test("generateId stable across casing and trailing year", () => {
  assert.equal(
    generateId("Yaddo Writers Residency 2026", "2026-03-01"),
    generateId("yaddo writers residency", "2026-03-01"),
  );
});

test("generateId differs by year", () => {
  assert.notEqual(
    generateId("Yaddo", "2026-03-01"),
    generateId("Yaddo", "2027-03-01"),
  );
});

test("generateId rolling bucket", () => {
  assert.equal(generateId("Yaddo", "rolling"), generateId("Yaddo", "rolling"));
});

test("normalizeUrl forces https + drops www", () => {
  assert.equal(
    normalizeUrl("http://www.example.com/path"),
    "https://example.com/path",
  );
});

test("normalizeUrl strips trailing slash", () => {
  assert.equal(
    normalizeUrl("https://example.com/apply/"),
    "https://example.com/apply",
  );
});

test("normalizeUrl drops tracking params and hash, sorts rest", () => {
  assert.equal(
    normalizeUrl("https://example.com/apply?utm_source=x&b=2&a=1#section"),
    "https://example.com/apply?a=1&b=2",
  );
});

test("normalizeUrl invariant: differently-cased scheme and host collapse", () => {
  assert.equal(
    normalizeUrl("HTTPS://Example.COM/Apply"),
    "https://example.com/Apply",
  );
});

test("normalizeUrl fallback on bad input", () => {
  // Invalid URL shouldn't throw.
  assert.doesNotThrow(() => normalizeUrl("not a url"));
});
