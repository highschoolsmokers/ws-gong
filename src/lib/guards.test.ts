import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import pkg from "../../package.json" with { type: "json" };
import { projects } from "./projects.ts";
import { PDFS, blobUrl } from "./site/schema.ts";

// Repo-wide guards: §13 decisions stay decided, §6.1 holds in code, client
// code stays off the server, and SPEC.md and the code agree (§12 drift guards).

const root = join(import.meta.dirname, "..", "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const walk = (dir: string, ext = /\.(ts|tsx|mjs)$/): string[] =>
  readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? walk(join(dir, e.name), ext)
      : ext.test(e.name)
        ? [join(dir, e.name)]
        : [],
  );
const spec = read("docs/SPEC.md");
const nextConfig = read("next.config.ts");
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
// Code the site and its tooling run (this file excepted: its patterns would match).
const sources = [
  ...["src", "scripts", "e2e"].flatMap((d) => walk(d)),
  ...[
    "next.config.ts",
    "src/instrumentation.ts",
    "playwright.config.ts",
    "eslint.config.mjs",
  ],
].filter((f) => f !== "src/lib/guards.test.ts");

// §13 ------------------------------------------------------------------------

test("removed surfaces stay removed", () => {
  for (const p of [
    // Section pages folded into the home page; next.config.ts redirects them.
    ...["about", "code", "narratives", "cv", "resume", "contact"].map(
      (s) => `src/app/(site)/${s}`,
    ),
    "src/app/(site)/slushpile", // mounted by rewrite from its own repo
    "src/lib/residency-miner", // moved to the slushpile repo
    "src/app/api", // no API routes: no crons, no résumé gate
    ...Object.values(PDFS).map((name) => `public/${name}`), // in blob storage
    "src/instrumentation-client.ts", // client Sentry SDK stays off
  ])
    assert.equal(existsSync(join(root, p)), false, `${p} must not exist`);
});

test("dropped dependencies stay dropped", () => {
  const all = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const d of ["@anthropic-ai/sdk", "@neondatabase/serverless"])
    assert.equal(d in all, false, `${d} moved to slushpile`);
});

test("site copy comes from content/site.json, with no email in it", () => {
  assert.doesNotMatch(read("content/site.json"), /[\w.+-]+@[\w-]+\.\w/);
  for (const p of ["src/app/(site)/page.tsx", "src/app/layout.tsx"])
    assert.match(read(p), /@\/lib\/site\/content/, `${p} must read it`);
});

test("PDFs point at public blob storage", () => {
  for (const name of Object.values(PDFS))
    assert.match(
      blobUrl(name),
      /^https:\/\/[\w-]+\.public\.blob\.vercel-storage\.com\/[\w-]+\.pdf$/,
    );
});

test("Code is one flat list: no featured tier, categories, or sub-pages", () => {
  for (const p of projects)
    assert.deepEqual(
      Object.keys(p).sort(),
      ["description", "href", "stack", "title"],
      p.title,
    );
});

// §6.1 -----------------------------------------------------------------------

test("Swiss rules: no off-grid alignment or ornament", () => {
  // The share image is a raster composition, not page layout.
  const files = walk("src/app", /\.(tsx|css)$/).filter(
    (f) => !f.endsWith("opengraph-image.tsx"),
  );
  const utilities =
    /(?<![\w-])(?:md:|lg:|sm:)?(?:text-(?:right|center|justify|end)|justify-(?:end|center|between|around|evenly)|justify-self-(?:end|center)|m[lrxse]-auto|self-(?:end|center)|place-\w+-center|float-\w+|rounded(?:-\w+)?|shadow(?:-\w+)?|bg-gradient-\S+)(?![\w-])/g;
  const css =
    /text-align:\s*(?:right|center|justify|end)|margin(?:-left|-inline(?:-start)?)?:\s*[^;]*\bauto\b|justify-(?:content|self):\s*(?:flex-end|end|center|space-\w+)|align-items:\s*(?:flex-end|end)|float:\s*(?:left|right)|box-shadow|border-radius|gradient\(/g;
  const hits = files.flatMap((f) => {
    const text = read(f);
    // .swiss-container centers the grid in the window; it is the grid itself.
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

// Rule 7: spacing and sizes come from tokens. A bracketed Tailwind value in
// markup must be built from one, like gap-[var(--gutter)]; one-off sizes are
// named in globals.css instead.
test("Swiss rule 7: no one-off values in markup", () => {
  const hits = walk("src/app", /\.tsx$/)
    .filter((f) => !f.endsWith("opengraph-image.tsx"))
    .flatMap((f) =>
      [...read(f).matchAll(/[\w:-]+-\[([^\]]+)\]/g)]
        .filter((m) => !m[1].includes("var(--"))
        .map((m) => `${f}: ${m[0]}`),
    );
  assert.deepEqual(hits, [], "one-off values in markup (SPEC §6.1 rule 7)");
});

// Client/server boundary ----------------------------------------------------

// A client component that reaches a Node-only module (lib/books reads the
// reading log with node:fs) makes Turbopack panic mid-build with no hint of
// where. Walk every "use client" file's imports and name the chain instead.
// A "use server" file is a boundary: the client gets RPC stubs, not its code.
test("client components never import Node-only modules", () => {
  const resolve = (from: string, spec: string) => {
    const base = spec.startsWith("@/")
      ? `src/${spec.slice(2)}`
      : join(from, "..", spec);
    return ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]
      .map((ext) => base + ext)
      .find((p) => existsSync(join(root, p)) && /\.tsx?$/.test(p));
  };
  const IMPORT =
    /(?:^|\n)\s*((?:import|export)\s[^;]*?)from\s+["']([^"']+)["']/g;
  const NODE = /^(node:|fs$|path$|os$|child_process$|crypto$)/;
  for (const entry of walk("src/app", /\.tsx?$/).filter((f) =>
    /^["']use client["']/.test(read(f).trimStart()),
  )) {
    const seen = new Set<string>();
    const visit = (file: string, chain: string[]) => {
      if (seen.has(file)) return;
      seen.add(file);
      if (chain.length && /^["']use server["']/.test(read(file).trimStart()))
        return;
      for (const [, stmt, spec] of read(file).matchAll(IMPORT)) {
        if (/^(import|export)\s+type\s/.test(stmt)) continue; // erased at build
        if (NODE.test(spec))
          assert.fail(`${[...chain, file].join(" → ")} imports ${spec}`);
        if (spec.startsWith(".") || spec.startsWith("@/")) {
          const next = resolve(file, spec);
          if (next) visit(next, [...chain, file]);
        }
      }
    };
    visit(entry, []);
  }
});

// §12 drift guards: SPEC.md against the code ----------------------------------

test("§2 routes: every page in app/ is listed, every listed path exists", () => {
  // app/(group)/a/[slug]/page.tsx → /a/<slug>
  const routes = walk("src/app")
    .filter((f) => /\/(page\.tsx|route\.ts)$/.test(f))
    .map(
      (f) =>
        (
          "/" +
          relative("src/app", f)
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
  const served = (p: string) =>
    routes.includes(p) ||
    existsSync(join(root, "public", p.replace(/\/\*$/, ""))) ||
    nextConfig.includes(`"${p.replace(/\*$/, ":path*")}"`) ||
    Object.values(PDFS).some((name) => p === `/${name}`);
  assert.deepEqual(
    listed.filter((p) => !served(p)),
    [],
    "§2 lists paths nothing serves",
  );
});

test("§2 redirects match next.config.ts, source and destination", () => {
  const norm = (p: string) => p.replace(/\/:slug\*$/, "/*");
  const configured = [
    ...nextConfig.matchAll(/"(\/[^"]*)":\s*"(\/[^"]*)"/g),
  ].map((m) => `${norm(m[1])} → ${m[2]}`);
  const para = section(2).split("Permanent redirects")[1].split("\n\n")[0];
  const listed = para.split(";").flatMap((clause) => {
    const [from, to] = clause.split("→");
    if (!to) return [];
    const dest = code(to)[0];
    return code(from)
      .filter((p) => p.startsWith("/"))
      .map((src) => `${src} → ${dest}`);
  });
  assert.deepEqual(
    [...new Set(configured)].sort(),
    [...new Set(listed)].sort(),
    "redirects in §2 vs next.config.ts",
  );
});

test("§9 environment: every variable read is listed, every listed one is read", () => {
  // process.env.X, process.env["X"], and requireEnv("X") in e2e.
  const reads = new Set(
    sources.flatMap((f) =>
      [
        ...read(f).matchAll(
          /process\.env(?:\.([A-Z0-9_]+)|\[["']([A-Z0-9_]+)["']\])|requireEnv\(["']([A-Z0-9_]+)["']\)/g,
        ),
      ].map((m) => m[1] ?? m[2] ?? m[3]),
    ),
  );
  const listed = new Set(
    section(9)
      .split("\n")
      .filter((l) => l.startsWith("| `"))
      .flatMap((l) => code(l.split("|")[1]))
      .filter((v) => /^[A-Z0-9_]+$/.test(v)),
  );
  const toolsOnly = new Set(["SENTRY_AUTH_TOKEN"]); // read by the Sentry build plugin
  assert.deepEqual(
    [...reads].filter((v) => !listed.has(v)).sort(),
    [],
    "variables read but not in §9",
  );
  assert.deepEqual(
    [...listed].filter((v) => !reads.has(v) && !toolsOnly.has(v)).sort(),
    [],
    "variables in §9 that nothing reads",
  );
});

test("§10 scripts: each pnpm script is named in the spec, each named one exists", () => {
  const scripts = Object.keys(pkg.scripts).filter((s) => s !== "prepare");
  const named = new Set(
    [
      ...spec.matchAll(/pnpm ([a-z][a-z0-9:]*(?: \| [a-z][a-z0-9:]*)*)/g),
    ].flatMap((m) => m[1].split(" | ")),
  );
  const builtin = new Set(["audit", "install"]);
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

test("§ references in code, styles, and docs point at real sections", () => {
  const headings = new Set(
    [...spec.matchAll(/^#{2,3} (\d+(?:\.\d+)?)\.? /gm)].map((m) => m[1]),
  );
  const files = [
    ...sources,
    ...walk("src/app", /\.css$/),
    ...walk(".claude/commands", /\.md$/),
    "README.md",
    "docs/SPEC.md",
  ];
  const bad = files.flatMap((f) =>
    [...read(f).matchAll(/§(\d+(?:\.\d+)?)/g)]
      .map((m) => m[1])
      .filter((n) => !headings.has(n))
      .map((n) => `${f}: §${n}`),
  );
  assert.deepEqual(bad, [], "references to sections that don't exist");
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
  // As code would type or display it: no scheme, "www.", or trailing slash.
  const bare = links.map((l) =>
    l.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
  );
  const typed = sources
    .filter((f) => /^src\//.test(f))
    .flatMap((f) => {
      let text = read(f);
      // A project's own repo URL is project data, not a profile link.
      for (const p of projects) text = text.replaceAll(p.href, "");
      return bare.filter((url) => text.includes(url)).map((u) => `${f}: ${u}`);
    });
  assert.deepEqual(typed, [], "links typed into code instead of site.json");
});
