import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { PDFS } from "./site/resume.ts";

// Drift guards (SPEC §12): the spec's checkable claims against the code.
// Each test reads both sides, so a change to either that the other doesn't
// follow fails here.

const root = join(import.meta.dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const spec = read("SPEC.md");
const nextConfig = read("next.config.ts");
const pkg = JSON.parse(read("package.json"));

// The body of "## N." up to the next "## ".
const section = (n: number) => {
  const m = new RegExp(
    `^## ${n}\\. .*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))`,
    "m",
  ).exec(spec);
  assert.ok(m, `SPEC has a §${n}`);
  return m[1];
};
const code = (text: string) =>
  [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1]);

// Source files the site and its tooling run, not tests' own fixtures.
const SOURCE_DIRS = ["app", "lib", "scripts", "e2e"];
const ROOT_FILES = [
  "next.config.ts",
  "instrumentation.ts",
  "playwright.config.ts",
  "eslint.config.mjs",
];
const walk = (dir: string): string[] =>
  readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? walk(join(dir, e.name))
      : /\.(ts|tsx|mjs)$/.test(e.name)
        ? [join(dir, e.name)]
        : [],
  );
const sources = [...SOURCE_DIRS.flatMap(walk), ...ROOT_FILES].filter(
  (f) => !f.endsWith("spec.test.ts"),
);

test("§2 routes: every page in app/ is listed, every listed path exists", () => {
  // app/(group)/a/[slug]/page.tsx → /a/<slug>
  const routes = walk("app")
    .filter((f) => /\/(page\.tsx|route\.ts)$/.test(f))
    .map(
      (f) =>
        (
          "/" +
          relative("app", f)
            .replace(/\/?(page\.tsx|route\.ts)$/, "")
            .split("/")
            .filter((s) => !/^\(.*\)$/.test(s))
            .map((s) => s.replace(/^\[(.+)\]$/, "<$1>"))
            .join("/")
        ).replace(/\/$/, "") || "/",
    );
  const listed = code(section(2).split("Permanent redirects")[0]).filter((p) =>
    p.startsWith("/"),
  );
  assert.deepEqual(
    routes.filter((r) => !listed.includes(r)),
    [],
    "pages missing from §2",
  );
  const resolves = (p: string) =>
    routes.includes(p) ||
    existsSync(join(root, "public", p.replace(/\/\*$/, ""))) ||
    nextConfig.includes(`"${p.replace(/\*$/, ":path*")}"`) ||
    Object.values(PDFS).some((name) => p === `/${name}`);
  assert.deepEqual(
    listed.filter((p) => !resolves(p)),
    [],
    "§2 lists paths nothing serves",
  );
});

test("§2 redirects match next.config.ts", () => {
  const norm = (p: string) => p.replace(/\/:slug\*$/, "/*");
  const configured = [...nextConfig.matchAll(/"(\/[^"]*)":\s*"\/[^"]*"/g)].map(
    (m) => norm(m[1]),
  );
  const para = section(2).split("Permanent redirects")[1].split("\n\n")[0];
  // Sources are the paths before each →.
  const listed = para
    .split(";")
    .flatMap((clause) => code(clause.split("→")[0]))
    .filter((p) => p.startsWith("/"));
  assert.deepEqual(
    [...new Set(configured)].sort(),
    [...new Set(listed)].sort(),
    "redirect sources in §2 vs next.config.ts",
  );
});

test("§9 environment: every variable read is listed, every listed one is read", () => {
  const read = new Set(
    sources.flatMap((f) =>
      [
        ...readFileSync(join(root, f), "utf8").matchAll(
          /process\.env\.([A-Z0-9_]+)/g,
        ),
      ].map((m) => m[1]),
    ),
  );
  const table = section(9)
    .split("\n")
    .filter((l) => l.startsWith("| `"));
  const listed = new Set(
    table
      .flatMap((l) => code(l.split("|")[1]))
      .filter((v) => /^[A-Z0-9_]+$/.test(v)),
  );
  // Read by tools, not our code.
  const external = new Set(["SENTRY_AUTH_TOKEN"]);
  assert.deepEqual(
    [...read].filter((v) => !listed.has(v)).sort(),
    [],
    "variables the code reads but §9 doesn't list",
  );
  assert.deepEqual(
    [...listed].filter((v) => !read.has(v) && !external.has(v)).sort(),
    [],
    "variables §9 lists but nothing reads",
  );
});

test("§10 scripts: each pnpm script is named in the spec, each named one exists", () => {
  const scripts = Object.keys(pkg.scripts).filter((s) => s !== "prepare");
  const named = new Set(
    [
      ...spec.matchAll(/pnpm ([a-z][a-z0-9:]*(?: \| [a-z][a-z0-9:]*)*)/g),
    ].flatMap((m) => m[1].split(" | ")),
  );
  const builtin = new Set(["audit", "install", "dev"]);
  assert.deepEqual(
    scripts.filter((s) => !named.has(s)),
    [],
    "package.json scripts the spec doesn't name",
  );
  assert.deepEqual(
    [...named].filter((s) => !scripts.includes(s) && !builtin.has(s)),
    [],
    "pnpm commands the spec names that don't exist",
  );
});

test("§ references in code and spec point at real sections", () => {
  const headings = new Set(
    [...spec.matchAll(/^#{2,3} (\d+(?:\.\d+)?)\.? /gm)].map((m) => m[1]),
  );
  const refs = [
    ...sources.map((f) => [f, readFileSync(join(root, f), "utf8")] as const),
    ["SPEC.md", spec] as const,
  ].flatMap(([f, text]) =>
    [...text.matchAll(/§(\d+(?:\.\d+)?)/g)]
      .map((m) => m[1])
      .filter((n) => !headings.has(n))
      .map((n) => `${f}: §${n}`),
  );
  assert.deepEqual(refs, [], "references to sections that don't exist");
});

test("§11 layout: every listed path exists, every top-level folder is listed", () => {
  const block = /```\n([\s\S]*?)```/.exec(section(11))![1];
  const listed = block
    .split("\n")
    .map((l) => l.split(/\s{2,}/)[0])
    .filter(Boolean);
  assert.deepEqual(
    listed.filter((p) => !existsSync(join(root, p))),
    [],
    "§11 lists paths that don't exist",
  );
  const ignored = new Set([
    "node_modules",
    "test-results",
    "playwright-report",
  ]);
  const folders = readdirSync(root).filter(
    (d) =>
      !d.startsWith(".") &&
      !ignored.has(d) &&
      statSync(join(root, d)).isDirectory(),
  );
  assert.deepEqual(
    folders.filter((d) => !listed.some((p) => p.split("/")[0] === d)),
    [],
    "top-level folders §11 doesn't list",
  );
});

test("links come only from site.json: none typed into app/ or lib/", () => {
  const { links } = JSON.parse(read("content/site.json")) as {
    links: { url: string }[];
  };
  const typed = sources
    // lib/projects.ts holds each project's own repo URL, not a profile link.
    .filter((f) => /^(app|lib)\//.test(f) && f !== "lib/projects.ts")
    .flatMap((f) => {
      const text = readFileSync(join(root, f), "utf8");
      // The URL without scheme or "www.", as code would type or display it.
      return links
        .map((l) =>
          l.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
        )
        .filter((url) => text.includes(url))
        .map((url) => `${f}: ${url}`);
    });
  assert.deepEqual(
    typed,
    [],
    "link hosts typed into code instead of site.json",
  );
});
