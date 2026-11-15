import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { featuredProjects } from "../code/projects.ts";

// Pins deliberate deletions (SPEC §13) so they don't creep back.
const r = (p: string) => join(import.meta.dirname, "..", "..", p);
const read = (p: string) => readFileSync(r(p), "utf8");

test("removed surfaces stay removed", () => {
  for (const p of [
    // Section pages folded into the one-page home; next.config.ts redirects them.
    ...["code", "narratives", "reading", "resume", "contact"].map(
      (s) => `app/(site)/${s}`,
    ),
    "app/(site)/slushpile", // mounted by rewrite from its own repo
    "lib/residency-miner", // moved to the slushpile repo
    "app/api", // no API routes: no crons, no résumé gate
    "public/wsgong_tech_writer_resume.pdf", // lives in Vercel Blob
    "instrumentation-client.ts", // client Sentry SDK stays off
  ])
    assert.equal(existsSync(r(p)), false, `${p} must not exist`);
});

test("dropped dependencies stay dropped", () => {
  const { dependencies, devDependencies } = JSON.parse(read("package.json"));
  for (const d of ["@anthropic-ai/sdk", "@neondatabase/serverless"])
    assert.equal(
      { ...dependencies, ...devDependencies }[d],
      undefined,
      `${d} moved to slushpile`,
    );
  assert.ok(!JSON.parse(read("vercel.json")).crons, "no crons");
});

test("site copy comes from content/site.json, with no email in it", () => {
  assert.doesNotMatch(read("content/site.json"), /[\w.+-]+@[\w-]+\.\w/);
  for (const p of ["app/(site)/page.tsx", "app/(site)/about/page.tsx"])
    assert.match(
      read(p),
      /@\/lib\/site\/content/,
      `${p} must read lib/site/content.ts`,
    );
});

test("résumé PDF points at public Blob storage; a project is featured", () => {
  assert.match(
    read("lib/site/resume.ts"),
    /public\.blob\.vercel-storage\.com\//,
  );
  assert.ok(featuredProjects.length > 0);
});
