// Single source of truth for site-level env flags. ESLint bans
// `process.env.SLUSHPILE_URL` reads outside this module so that the rewrite,
// the nav slot, and any future consumer all observe the same state.

function readSlushpileUrl(): string | null {
  const raw = process.env.SLUSHPILE_URL;
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Strip trailing slash so callers can concatenate `/slushpile/...` without
  // producing `//slushpile/...` against the upstream deployment.
  return trimmed.replace(/\/$/, "");
}

export const slushpileUrl: string | null = readSlushpileUrl();
