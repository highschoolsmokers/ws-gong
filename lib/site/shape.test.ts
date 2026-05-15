import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Static-shape audit. These tests fail loudly if a removed surface, deleted
// dependency, or banned config value comes back. They pin the deliberate
// deletions from the dual-citizen redesign (see SPEC.md §22).

const repoRoot = join(import.meta.dirname, "..", "..");
const r = (p: string) => join(repoRoot, p);

test("slushpile is owned by the rewrite, not this repo", () => {
  assert.equal(
    existsSync(r("app/(site)/slushpile")),
    false,
    "app/(site)/slushpile/ must not exist — slushpile is mounted via next.config.ts rewrite",
  );
  assert.equal(
    existsSync(r("app/api/slushpile")),
    false,
    "app/api/slushpile/ must not exist — slushpile owns its own API routes",
  );
});

test("residency miner is excised", () => {
  assert.equal(
    existsSync(r("lib/residency-miner")),
    false,
    "lib/residency-miner/ moved to the slushpile repo — see SPEC.md §22",
  );
  for (const cron of [
    "app/api/discover-sources",
    "app/api/mine",
    "app/api/heartbeat",
    "app/api/prune-logs",
  ]) {
    assert.equal(
      existsSync(r(cron)),
      false,
      `${cron}/ must not exist — cron pipeline moved to the slushpile repo`,
    );
  }
});

test("resume HMAC gate is removed", () => {
  assert.equal(
    existsSync(r("app/api/resume")),
    false,
    "app/api/resume/ must not exist — resume PDF is now a public static asset",
  );
  assert.equal(
    existsSync(r("app/(site)/resume")),
    false,
    "app/(site)/resume/ must not exist — ResumeLink component removed",
  );
  assert.equal(
    existsSync(r("lib/resumeToken.ts")),
    false,
    "lib/resumeToken.ts must not exist — HMAC gate removed",
  );
  assert.equal(
    existsSync(r("public/wsgong_tech_writer_resume.pdf")),
    true,
    "Resume PDF must live in public/ as a static asset",
  );
});

test("no per-project sub-pages under /code", () => {
  const codeDir = r("app/(site)/code");
  const entries = readdirSync(codeDir);
  for (const entry of entries) {
    const path = join(codeDir, entry);
    if (statSync(path).isDirectory()) {
      assert.fail(
        `Unexpected subdirectory app/(site)/code/${entry}/ — /code is flat post-redesign`,
      );
    }
  }
});

test("package.json drops Anthropic + Neon", () => {
  const pkg = JSON.parse(readFileSync(r("package.json"), "utf-8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  assert.equal(
    deps["@anthropic-ai/sdk"],
    undefined,
    "@anthropic-ai/sdk must not be a dependency — Anthropic moved to slushpile",
  );
  assert.equal(
    deps["@neondatabase/serverless"],
    undefined,
    "@neondatabase/serverless must not be a dependency — Neon moved to slushpile",
  );
});

test("vercel.json has no crons", () => {
  const vercel = JSON.parse(readFileSync(r("vercel.json"), "utf-8"));
  assert.ok(
    !vercel.crons || vercel.crons.length === 0,
    "vercel.json must not declare crons — pipeline moved to slushpile repo",
  );
});

test("next.config.ts does not reference the private resume bundle", () => {
  const config = readFileSync(r("next.config.ts"), "utf-8");
  assert.equal(
    config.includes("outputFileTracingIncludes"),
    false,
    "next.config.ts must not contain outputFileTracingIncludes — resume PDF is static in public/",
  );
  assert.equal(
    config.includes("./private/"),
    false,
    "next.config.ts must not reference private/ — the directory was removed",
  );
});

test("RESUME_SECRET is referenced nowhere in non-test source", () => {
  // Walks the source tree and asserts the symbol is gone. Test files are
  // allowed to mention removed symbols inside assertion messages.
  const sourceDirs = ["app", "lib", "e2e", "scripts"];
  const visited: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (
        /\.(ts|tsx|js|mjs|cjs)$/.test(entry) &&
        !/\.(test|spec)\.(ts|tsx|js|mjs|cjs)$/.test(entry)
      ) {
        visited.push(path);
      }
    }
  };
  for (const sd of sourceDirs) {
    if (existsSync(r(sd))) walk(r(sd));
  }
  for (const file of visited) {
    const content = readFileSync(file, "utf-8");
    assert.equal(
      content.includes(
        // Split so this file does not match itself if anyone widens the rule.
        "RESUME" + "_SECRET",
      ),
      false,
      `${file} still references the removed HMAC env — see SPEC.md §22`,
    );
  }
});
