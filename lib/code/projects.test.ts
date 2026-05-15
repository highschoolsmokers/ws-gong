import { test } from "node:test";
import assert from "node:assert/strict";
import { projects, featuredProjects, latestProject } from "./projects.ts";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

test("at least one project is marked featured", () => {
  assert.ok(featuredProjects.length >= 1, "expected at least one featured");
});

test("every project carries a YYYY-MM-DD addedAt", () => {
  for (const p of projects) {
    assert.match(p.addedAt, datePattern, `${p.title} addedAt malformed`);
  }
});

test("latestProject is the most recent by addedAt", () => {
  const sorted = [...projects].sort((a, b) =>
    a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : 0,
  );
  assert.equal(latestProject.title, sorted[0].title);
});

test("no project carries a category field", () => {
  // The flat-list redesign drops the AI Engineering / Developer Tools / Web &
  // Design groupings. A reintroduced `category` would silently restore them.
  for (const p of projects) {
    assert.equal(
      (p as unknown as { category?: unknown }).category,
      undefined,
      `${p.title} has a category field`,
    );
  }
});
