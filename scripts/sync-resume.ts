// pnpm sync:resume — pull the site copy and résumé PDF from resumes-cvs (SPEC §23).
//
// Reads $RESUMES_CVS_DIR/private/out/web/{site.json,resume.pdf} (build them there
// with `.venv/bin/python -m resumekit web`), validates site.json, writes
// content/site.json, and uploads resume.pdf to the public Blob store at the fixed
// pathname the site rewrites to. Prints the diff. Never commits or deploys.
//
//   pnpm sync:resume            content + PDF (needs BLOB_READ_WRITE_TOKEN)
//   pnpm sync:resume --no-pdf   content only

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { siteContentSchema } from "../lib/site/content-schema.ts";

const root = resolve(import.meta.dirname, "..");
const cvs = resolve(root, process.env.RESUMES_CVS_DIR ?? "../resumes-cvs");
const src = join(cvs, "private", "out", "web");
const dest = join(root, "content", "site.json");
const PDF_PATHNAME = "wsgong_tech_writer_resume.pdf";

function fail(message: string): never {
  console.error(`sync:resume: ${message}`);
  process.exit(1);
}

const siteJson = join(src, "site.json");
if (!existsSync(siteJson)) {
  fail(`no ${siteJson}; run \`.venv/bin/python -m resumekit web\` in ${cvs}`);
}

const parsed = siteContentSchema.safeParse(
  JSON.parse(readFileSync(siteJson, "utf8")),
);
if (!parsed.success) fail(`site.json is invalid:\n${parsed.error.message}`);

const text = JSON.stringify(parsed.data, null, 2) + "\n";
const before = existsSync(dest) ? readFileSync(dest, "utf8") : "";
writeFileSync(dest, text);
if (before === text) {
  console.log("content/site.json: unchanged");
} else {
  console.log("content/site.json: updated");
  try {
    execFileSync("git", ["diff", "--no-color", "--", dest], {
      cwd: root,
      stdio: "inherit",
    });
  } catch {
    // git diff exits non-zero only on error; the write already happened.
  }
}

if (process.argv.includes("--no-pdf")) process.exit(0);

const pdf = join(src, "resume.pdf");
if (!existsSync(pdf)) fail(`no ${pdf}`);
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  fail(
    "BLOB_READ_WRITE_TOKEN is unset (put it in .env.local); or pass --no-pdf",
  );
}
const { put } = await import("@vercel/blob");
const blob = await put(PDF_PATHNAME, readFileSync(pdf), {
  access: "public",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/pdf",
  cacheControlMaxAge: 300,
});
console.log(`resume.pdf → ${blob.url}`);
