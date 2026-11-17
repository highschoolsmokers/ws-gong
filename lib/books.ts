import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

// The reading log: one Markdown file per book in content/reading/<slug>.md,
// frontmatter for the facts and the body for the review (SPEC §4).
// Paths are spelled out at each fs call so Turbopack traces only those folders.

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD");
const frontmatterSchema = z
  .object({
    title: z.string().min(1),
    author: z.string().min(1),
    finished: z.union([z.literal("reading"), day]),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    isbn: z
      .string()
      .regex(/^[\dX-]{10,17}$/)
      .optional(),
    note: z.string().min(1).optional(),
    link: z.url().optional(),
    substack: z.url().optional(),
    goodreads: z.url().optional(),
  })
  .strict();

export type Book = z.infer<typeof frontmatterSchema> & {
  slug: string;
  review: string; // Markdown; empty when the book has no review page
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Flat `key: value` frontmatter between --- fences; quotes are optional.
export function parseBook(slug: string, text: string): Book {
  if (!SLUG.test(slug)) throw new Error(`${slug}.md: slug must be kebab-case`);
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!m) throw new Error(`${slug}.md: missing --- frontmatter`);
  const fields = Object.fromEntries(
    m[1]
      .split("\n")
      .filter((l) => l.trim() && !l.trimStart().startsWith("#"))
      .map((l) => {
        const i = l.indexOf(":");
        if (i < 0) throw new Error(`${slug}.md: bad frontmatter line ${l}`);
        const value = l.slice(i + 1).trim();
        return [l.slice(0, i).trim(), value.replace(/^(["'])(.*)\1$/, "$2")];
      }),
  );
  const parsed = frontmatterSchema.safeParse(fields);
  if (!parsed.success)
    throw new Error(`${slug}.md: ${z.prettifyError(parsed.error)}`);
  return { ...parsed.data, slug, review: m[2].trim() };
}

// Every .md but README.md; a malformed file fails the build.
export function loadBooks(): Book[] {
  return readdirSync(join(process.cwd(), "content", "reading"))
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) =>
      parseBook(
        f.slice(0, -3),
        readFileSync(join(process.cwd(), "content", "reading", f), "utf8"),
      ),
    );
}

// Currently reading first, then finished, newest first; ties by title.
export const orderBooks = (list: Book[]) =>
  [...list].sort(
    (a, b) => key(b).localeCompare(key(a)) || a.title.localeCompare(b.title),
  );
const key = (b: Book) => (b.finished === "reading" ? "9" : b.finished);

export const orderedBooks = orderBooks(loadBooks());
export const reviewed = orderedBooks.filter((b) => b.review);

export const bookHref = (b: Book) => (b.review ? `/reading/${b.slug}` : b.link);
export const coverPath = (b: Book) =>
  existsSync(join(process.cwd(), "public", "covers", `${b.slug}.jpg`))
    ? `/covers/${b.slug}.jpg`
    : null;
export const bookMeta = (b: Book) =>
  [
    b.finished === "reading" ? "Reading" : b.finished,
    b.rating && `${b.rating}/5`,
  ]
    .filter(Boolean)
    .join(" · ");
