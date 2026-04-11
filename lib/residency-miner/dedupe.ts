import { createHash } from "crypto";

// Deterministic ID based on the normalized program name and deadline year.
// We intentionally DO NOT include `org` in the hash because extractors often
// produce different org variants for the same program (e.g. "Banff Centre"
// vs "Banff Centre for Arts & Creativity"). Normalizing the name and hashing
// it with the year gives one stable ID per program regardless of which
// source page it was scraped from.
export function generateId(name: string, deadline: string): string {
  const year = deadline === "rolling" ? "rolling" : deadline.slice(0, 4);
  const normalizedName = name
    .toLowerCase()
    .trim()
    .replace(/\s*\d{4}\s*$/, "")
    .replace(/\s+/g, " ");
  const input = `${normalizedName}|${year}`;
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

export function generateSourceId(url: string): string {
  const normalized = url.toLowerCase().trim().replace(/\/+$/, "");
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}
