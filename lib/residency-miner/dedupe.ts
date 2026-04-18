import { createHash } from "crypto";

// Deterministic ID based on the normalized program name and deadline year.
// We intentionally DO NOT include `org` in the hash because extractors often
// produce different org variants for the same program (e.g. "Banff Centre"
// vs "Banff Centre for Arts & Creativity"). Normalizing the name and hashing
// it with the year gives one stable ID per program regardless of which
// source page it was scraped from.
export function normalizeName(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      // Strip diacritics (e.g., "é" → "e") so "Théâtre" matches "Theatre".
      .replace(/[\u0300-\u036f]/g, "")
      // Unify "&" ↔ "and"
      .replace(/\s*&\s*/g, " and ")
      // Drop common leading articles
      .replace(/^(the|a|an)\s+/, "")
      // Strip any 4-digit year anywhere in the string
      .replace(/\b\d{4}\b/g, "")
      // Drop punctuation
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

export function generateId(name: string, deadline: string): string {
  const year = deadline === "rolling" ? "rolling" : deadline.slice(0, 4);
  const input = `${normalizeName(name)}|${year}`;
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Force https, drop www., lowercase host, strip trailing slash, drop hash
    // and tracking params.
    const host = u.host.toLowerCase().replace(/^www\./, "");
    const pathname = u.pathname.replace(/\/+$/, "") || "/";
    const keptSearch = [...u.searchParams.entries()]
      .filter(([k]) => !/^utm_|^ref$|^fbclid$|^gclid$/i.test(k))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    return `https://${host}${pathname}${keptSearch ? `?${keptSearch}` : ""}`;
  } catch {
    return url.toLowerCase().trim().replace(/\/+$/, "");
  }
}

export function generateSourceId(url: string): string {
  return createHash("sha256")
    .update(normalizeUrl(url))
    .digest("hex")
    .slice(0, 16);
}
