// pnpm highlight:tutorial — bake syntax highlighting into the Fabulosa tutorial.
//
// Runs highlight.js over every <pre><code> block in public/fabulosa-books/*.html
// and writes the <span class="hljs-…"> markup into the file, so the pages need
// no script and no CDN (the site's CSP allows 'self' only). Idempotent: an
// already-highlighted block is stripped back to text and highlighted again, so
// rerun it after editing any code sample. Colors live in style.css.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import hljs from "highlight.js";

const dir = join(process.cwd(), "public", "fabulosa-books");
const ENTITIES: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
  "&amp;": "&",
};
const decode = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&(?:lt|gt|quot|#39|#x27|amp);/g, (e) => ENTITIES[e]);

// The blocks carry no language, and auto-detection misreads short shell
// snippets and prose prompts, so pick from the content.
const SHELL = /^(?:npm|npx|node|git|cd|vercel|mkdir|[A-Z_]+=)/;
const TS = /\b(?:import|export|const|let|function|interface|type|await)\b|=>/;
const language = (code: string) =>
  code.split("\n").every((l) => !l.trim() || SHELL.test(l.trim()))
    ? "bash"
    : TS.test(code) && /[;{}()=]/.test(code)
      ? "typescript"
      : "plaintext";

for (const file of readdirSync(dir).filter((f) => f.endsWith(".html"))) {
  const path = join(dir, file);
  const before = readFileSync(path, "utf8");
  let blocks = 0;
  const after = before.replace(
    /<pre><code(?: class="[^"]*")?>([\s\S]*?)<\/code><\/pre>/g,
    (_, body: string) => {
      blocks++;
      const code = decode(body);
      const lang = language(code);
      const { value } = hljs.highlight(code, { language: lang });
      return `<pre><code class="hljs language-${lang}">${value}</code></pre>`;
    },
  );
  if (after !== before) writeFileSync(path, after);
  console.log(`${file}: ${blocks} block(s)`);
}
