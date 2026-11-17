import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { projects } from "./projects.ts";
import { PDFS, blobUrl } from "./site/resume.ts";

// Pins deliberate deletions (SPEC §13) so they don't creep back.
const r = (p: string) => join(import.meta.dirname, "..", p);
const read = (p: string) => readFileSync(r(p), "utf8");

test("removed surfaces stay removed", () => {
  for (const p of [
    // Section pages folded into the one-page home; next.config.ts redirects them.
    ...["about", "code", "narratives", "reading", "resume", "contact"].map(
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
});

test("site copy comes from content/site.json, with no email in it", () => {
  assert.doesNotMatch(read("content/site.json"), /[\w.+-]+@[\w-]+\.\w/);
  for (const p of ["app/(site)/page.tsx", "app/layout.tsx"])
    assert.match(
      read(p),
      /@\/lib\/site\/content/,
      `${p} must read lib/site/content.ts`,
    );
});

test("résumé and CV PDFs point at public Blob storage", () => {
  for (const name of Object.values(PDFS))
    assert.match(
      blobUrl(name),
      /^https:\/\/[\w-]+\.public\.blob\.vercel-storage\.com\/[\w-]+\.pdf$/,
    );
});

// SPEC §6.1: everything on a grid column line, flush left, no ornament.
// Off-grid alignment and decoration are banned in site code and styles.
test("Swiss rules: no off-grid alignment or ornament", () => {
  const walk = (dir: string): string[] =>
    readdirSync(r(dir), { withFileTypes: true }).flatMap((e) =>
      e.isDirectory()
        ? walk(join(dir, e.name))
        : /\.(tsx|css)$/.test(e.name)
          ? [join(dir, e.name)]
          : [],
    );
  // The OG image is a raster composition, not page layout.
  const files = walk("app").filter((f) => !f.endsWith("opengraph-image.tsx"));
  const utilities =
    /(?<![\w-])(?:md:|lg:|sm:)?(?:text-(?:right|center|justify|end)|justify-(?:end|center|between|around|evenly)|justify-self-(?:end|center)|m[lrxse]-auto|self-(?:end|center)|place-\w+-center|float-\w+|rounded(?:-\w+)?|shadow(?:-\w+)?|bg-gradient-\S+)(?![\w-])/g;
  const css =
    /text-align:\s*(?:right|center|justify|end)|margin(?:-left|-inline(?:-start)?)?:\s*[^;]*\bauto\b|justify-(?:content|self):\s*(?:flex-end|end|center|space-\w+)|align-items:\s*(?:flex-end|end)|float:\s*(?:left|right)|box-shadow|border-radius|gradient\(/g;
  const hits = files.flatMap((f) => {
    const text = read(f);
    // .swiss-container centers the grid itself in the window; it is the grid, not an element on it.
    const found = f.endsWith(".css")
      ? (text
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/\.swiss-container\s*\{[^}]*\}/, "")
          .match(css) ?? [])
      : (text.match(utilities) ?? []);
    return found.map((h) => `${f}: ${h}`);
  });
  assert.deepEqual(hits, [], "off-grid alignment or ornament (SPEC §6.1)");
});

test("Work is one flat list: no featured tier, categories, or sub-pages", () => {
  for (const p of projects)
    assert.deepEqual(
      Object.keys(p).sort(),
      ["description", "href", "stack", "title"],
      p.title,
    );
});
