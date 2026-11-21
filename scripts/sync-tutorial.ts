// pnpm sync:tutorial — pull the Fabulosa Books tutorial into the site (SPEC §15).
//
// The text and code live in the fabulosa-books repo, whose own tests keep the
// code blocks identical to its reference app. This script reads that repo's
// html/ pages from $FABULOSA_BOOKS_DIR (default ../fabulosa-books) and writes:
//
//   content/fabulosa-books.json      titles, descriptions, and each section's HTML
//   public/fabulosa-books/images/    the images the pages use, and no others;
//                                    an image already here is kept as is
//
// Along the way it bakes in syntax highlighting (the CSP allows no scripts
// from elsewhere), makes code blocks focusable so a keyboard can scroll them,
// and rewrites links and image paths to the site's /fabulosa-books routes.
// The site's layout and globals.css style the result.
//
//   pnpm sync:tutorial            write the files, print what changed
//   pnpm sync:tutorial --check    exit 1 if the content is out of date

import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import hljs from "highlight.js";
import {
  TUTORIAL_PATH,
  partPath,
  tutorialSchema,
} from "../src/lib/tutorial.ts";

const root = resolve(import.meta.dirname, "..");
const repo = resolve(
  root,
  process.env.FABULOSA_BOOKS_DIR ?? "../fabulosa-books",
);
const html = join(repo, "html");
const dest = join(root, "content", "fabulosa-books.json");
const imagesOut = join(root, "public", "fabulosa-books", "images");
const check = process.argv.includes("--check");

function fail(message: string): never {
  console.error(`sync:tutorial: ${message}`);
  process.exit(1);
}

if (!existsSync(join(html, "index.html")))
  fail(`no tutorial at ${html}; set FABULOSA_BOOKS_DIR`);

const git = (...a: string[]) =>
  execFileSync("git", a, { cwd: repo, encoding: "utf8" }).trim();
const source = git("rev-parse", "HEAD");
if (git("status", "--porcelain", "--", "html"))
  fail(
    `${html} has uncommitted changes; commit them so the source is a real commit`,
  );

const read = (f: string) => readFileSync(join(html, f), "utf8");
const ENTITIES: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&amp;": "&",
  "&rarr;": "→",
  "&larr;": "←",
  "&ndash;": "–",
  "&mdash;": "—",
  "&nbsp;": " ",
};
// Named entities the source uses, and any numeric one (&#39;, &#x27;).
const decode = (s: string) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) =>
      String.fromCodePoint(parseInt(h, 16)),
    )
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&[a-z]+;/g, (e) => ENTITIES[e] ?? e);
const text = (s: string) =>
  decode(s.replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
const one = (s: string, re: RegExp, what: string) =>
  s.match(re)?.[1] ?? fail(`missing ${what}`);

// Code blocks name their language in the source; highlight.js knows each name.
const LANGUAGES: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  json: "json",
  sql: "sql",
  bash: "bash",
  plaintext: "plaintext",
};
function highlight(block: string): string {
  return block.replace(
    /<pre><code class="language-(\w+)"[^>]*>([\s\S]*?)<\/code><\/pre>/g,
    (_, lang: string, body: string) => {
      const language =
        LANGUAGES[lang] ?? fail(`unknown code language "${lang}"`);
      const { value } = hljs.highlight(decode(body), { language });
      return `<pre tabindex="0"><code class="hljs language-${language}">${value}</code></pre>`;
    },
  );
}

const images = new Set<string>();
function adapt(block: string): string {
  return (
    highlight(block)
      .replace(/ data-source="[^"]*"/g, "")
      .replace(
        /(<img[^>]*?) src="images\/([^"]+)"/g,
        (_, pre: string, file: string) => {
          images.add(file);
          return `${pre} src="${TUTORIAL_PATH}/images/${file}" loading="lazy"`;
        },
      )
      .replace(
        /href="(part\d+)\.html"/g,
        (_, slug: string) => `href="${partPath(slug)}"`,
      )
      .replace(/href="index\.html"/g, `href="${TUTORIAL_PATH}"`)
      // Drop the source's indentation between tags, but never inside <pre>.
      .split(/(<pre[\s\S]*?<\/pre>)/)
      .map((part, i) => (i % 2 ? part : part.replace(/\n\s*/g, "\n")))
      .join("")
      .trim()
  );
}

// Each page's <main> is a run of <div class="section"><h2>…</h2>
// <div class="section-content">…</div></div>.
function sections(page: string) {
  const main = one(page, /<main id="main">([\s\S]*?)<\/main>/, "<main>");
  return main
    .split('<div class="section">')
    .slice(1)
    .map((chunk) => {
      const title = text(one(chunk, /<h2>([\s\S]*?)<\/h2>/, "section <h2>"));
      const start = chunk.indexOf('<div class="section-content">');
      if (start < 0) fail(`section "${title}" has no content`);
      const body = chunk
        .slice(start + '<div class="section-content">'.length)
        .replace(/\s*<\/div>\s*<\/div>\s*$/, "");
      return { title, html: adapt(body) };
    });
}

const index = read("index.html");
const descriptions = new Map(
  [
    ...index.matchAll(
      /href="(part\d+)\.html">[\s\S]*?<span class="part-desc">([\s\S]*?)<\/span>/g,
    ),
  ].map(([, slug, desc]) => [slug, text(desc)]),
);
const slugs = readdirSync(html)
  .filter((f) => /^part\d+\.html$/.test(f))
  .map((f) => f.replace(".html", ""))
  .sort((a, b) => parseInt(a.slice(4)) - parseInt(b.slice(4)));

const tutorial = tutorialSchema.parse({
  source,
  title: text(one(index, /<h1>([\s\S]*?)<\/h1>/, "index <h1>")),
  subtitle: text(
    one(index, /<p class="subtitle">([\s\S]*?)<\/p>/, "index subtitle"),
  ),
  parts: slugs.map((slug) => {
    const page = read(`${slug}.html`);
    return {
      slug,
      title: text(one(page, /<h1>([\s\S]*?)<\/h1>/, `${slug} <h1>`)),
      description:
        descriptions.get(slug) ?? fail(`index has no description for ${slug}`),
      sections: sections(page),
    };
  }),
});

const json = `${JSON.stringify(tutorial, null, 2)}\n`;
const before = existsSync(dest) ? readFileSync(dest, "utf8") : "";
const present = existsSync(imagesOut) ? readdirSync(imagesOut) : [];
const staleImages = present.filter((f) => !images.has(f));
const missingImages = [...images].filter((f) => !present.includes(f));

if (check) {
  const stale = [
    ...(json === before ? [] : [dest]),
    ...staleImages.map((f) => `extra image ${f}`),
    ...missingImages.map((f) => `missing image ${f}`),
  ];
  if (stale.length)
    fail(
      `out of date with fabulosa-books ${source.slice(0, 7)}:\n  ${stale.join("\n  ")}`,
    );
  console.log(
    `sync:tutorial: up to date with fabulosa-books ${source.slice(0, 7)}`,
  );
  process.exit(0);
}

writeFileSync(dest, json);
mkdirSync(imagesOut, { recursive: true });
// Copy only new images: the site may keep an optimized version of one.
for (const f of missingImages)
  copyFileSync(join(html, "images", f), join(imagesOut, f));
for (const f of staleImages) rmSync(join(imagesOut, f));

const sectionCount = tutorial.parts.reduce((n, p) => n + p.sections.length, 0);
console.log(
  `sync:tutorial: ${tutorial.parts.length} parts, ${sectionCount} sections, ${images.size} image(s) from fabulosa-books ${source.slice(0, 7)}` +
    (json === before ? " (no change)" : ""),
);
if (staleImages.length)
  console.log(`  removed images: ${staleImages.join(", ")}`);
