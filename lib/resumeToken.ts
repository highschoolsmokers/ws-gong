import { createHmac, timingSafeEqual } from "crypto";

// Tokens are reusable within a short window, not single-use. Single-use would
// require server-side nonce storage — overkill for a personal PDF gate. The
// TTL is the primary replay bound: short enough that a leaked referrer-log
// URL goes stale quickly, long enough that a legitimate click survives page
// hydration delays.
const TTL_MS = 2 * 60 * 1000; // 2 minutes

function getSecret(): string {
  const s = process.env.RESUME_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESUME_SECRET must be set in production");
    }
    return "dev-secret-change-me";
  }
  return s;
}

export function generateToken(): string {
  const ts = Date.now().toString();
  const sig = createHmac("sha256", getSecret()).update(ts).digest("hex");
  return `${ts}.${sig}`;
}

export function verifyToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [ts, sig] = parts;

  const expected = createHmac("sha256", getSecret()).update(ts).digest("hex");
  try {
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex")))
      return false;
  } catch {
    return false;
  }

  if (Date.now() - parseInt(ts, 10) > TTL_MS) return false;
  return true;
}
