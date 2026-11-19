// pnpm covers — save each book's Open Library cover to public/covers/<slug>.jpg.
//
// Only books with an `isbn` and no cover yet. Covers are committed and served
// from the site itself, so the CSP's img-src stays 'self'. Never commits.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadBooks } from "../src/lib/books.ts";

const COVERS_DIR = join(process.cwd(), "public", "covers");

mkdirSync(COVERS_DIR, { recursive: true });
for (const b of loadBooks()) {
  const dest = join(COVERS_DIR, `${b.slug}.jpg`);
  if (!b.isbn || existsSync(dest)) continue;
  // default=false makes a missing cover a 404 instead of a blank image.
  const res = await fetch(
    `https://covers.openlibrary.org/b/isbn/${b.isbn}-L.jpg?default=false`,
    { signal: AbortSignal.timeout(15_000) },
  );
  if (!res.ok) {
    console.log(`${b.slug}: no cover (${res.status})`);
    continue;
  }
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log(`${b.slug}: saved ${dest}`);
}
