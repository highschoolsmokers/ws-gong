// pnpm sync — bring the site up to date with the résumé master (SPEC §14).
//
// One pass for everything the master feeds: the site copy and links
// (content/site.json) and the CV and résumé PDFs (blob storage).
//
//   1. Runs `resumekit web` in $RESUMES_CVS_DIR (default ../resumes-cvs),
//      which writes private/out/web/{site.json,resume.pdf,cv.pdf}.
//   2. Validates site.json, writes content/site.json, prints the diff.
//   3. Uploads both PDFs to their fixed paths (needs BLOB_READ_WRITE_TOKEN).
//   4. With --pr: commits content/site.json on a new branch and opens a PR.
//      Merging deploys.
//
//   pnpm sync              build, copy, upload
//   pnpm sync --pr         …and open a PR
//   pnpm sync --no-pdf     skip the PDF upload
//   pnpm sync --no-build   use the last build in private/out/web/

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { PDFS, siteContentSchema } from "../lib/site/schema.ts";

const args = new Set(process.argv.slice(2));
const root = resolve(import.meta.dirname, "..");
const cvs = resolve(root, process.env.RESUMES_CVS_DIR ?? "../resumes-cvs");
const src = join(cvs, "private", "out", "web");
const dest = join(root, "content", "site.json");
const git = (...a: string[]) =>
  execFileSync("git", a, { cwd: root, encoding: "utf8" }).trim();
const run = (cmd: string, args: string[], cwd = root) =>
  execFileSync(cmd, args, { cwd, stdio: "inherit" });

function fail(message: string): never {
  console.error(`sync: ${message}`);
  process.exit(1);
}

// --pr commits only content/site.json, so start from a clean tree.
if (args.has("--pr") && git("status", "--porcelain"))
  fail("--pr needs a clean working tree; commit or stash first");

// 1. Build (the venv renders the PDFs; plain python3 is enough with --no-pdf).
if (!args.has("--no-build")) {
  const venv = join(cvs, ".venv", "bin", "python");
  const python = existsSync(venv) ? venv : "python3";
  const build = [
    "-m",
    "resumekit",
    "web",
    ...(args.has("--no-pdf") ? ["--no-pdf"] : []),
  ];
  try {
    run(python, build, cvs);
  } catch {
    fail(`resumekit web failed in ${cvs}`);
  }
}

// 2. Copy and links.
const siteJson = join(src, "site.json");
if (!existsSync(siteJson)) fail(`no ${siteJson}`);
const parsed = siteContentSchema.safeParse(
  JSON.parse(readFileSync(siteJson, "utf8")),
);
if (!parsed.success) fail(`site.json is invalid:\n${parsed.error.message}`);
const text = JSON.stringify(parsed.data, null, 2) + "\n";
const changed = (existsSync(dest) ? readFileSync(dest, "utf8") : "") !== text;
writeFileSync(dest, text);
console.log(`content/site.json: ${changed ? "updated" : "unchanged"}`);
if (changed) run("git", ["diff", "--no-color", "--", dest]);

// 3. PDFs: resume.pdf → PDFS.resume, cv.pdf → PDFS.cv.
if (!args.has("--no-pdf")) {
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    fail(
      "BLOB_READ_WRITE_TOKEN is unset (put it in .env.local), or pass --no-pdf",
    );
  const { put } = await import("@vercel/blob");
  for (const [key, pathname] of Object.entries(PDFS)) {
    const file = join(src, `${key}.pdf`);
    if (!existsSync(file)) fail(`no ${file}`);
    const blob = await put(pathname, readFileSync(file), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/pdf",
      cacheControlMaxAge: 300,
    });
    console.log(`${key}.pdf → ${blob.url}`);
  }
}

// 4. PR. The PDFs are already live; the PR carries the copy and links.
if (args.has("--pr")) {
  if (!changed) {
    console.log("No copy or link changes; no PR needed.");
    process.exit(0);
  }
  const branch = `sync/${new Date().toISOString().slice(0, 10)}-${Date.now() % 100000}`;
  git("switch", "-c", branch);
  git("add", dest);
  git("commit", "-m", "chore(content): sync from the résumé master");
  run("git", ["push", "-u", "origin", branch]);
  run("gh", [
    "pr",
    "create",
    "--fill",
    "--base",
    "main",
    "--body",
    "Synced by `pnpm sync --pr` from the résumé master: copy and links (`content/site.json`). The PDFs were uploaded during the sync. Merging deploys.",
  ]);
}
