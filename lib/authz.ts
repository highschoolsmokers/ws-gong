import { timingSafeEqual } from "crypto";

/**
 * Constant-time comparison of a Bearer-scheme Authorization header against a
 * shared secret. Returns false if either side is missing or the tokens differ
 * in any byte.
 */
export function timingSafeBearer(
  request: Request,
  expected: string | undefined,
): boolean {
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;
  const token = header.slice(prefix.length);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
