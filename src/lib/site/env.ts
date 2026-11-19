// The one reader of SLUSHPILE_URL (ESLint bans others), so the rewrite and the
// nav slot always agree. Trailing slash stripped for `${url}/slushpile` joins.
export const slushpileUrl =
  process.env.SLUSHPILE_URL?.trim().replace(/\/$/, "") || null;
