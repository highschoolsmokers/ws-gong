import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.RESUME_SECRET ?? "dev-secret-change-me";
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export function generateToken(): string {
  const ts = Date.now().toString();
  const sig = createHmac("sha256", SECRET).update(ts).digest("hex");
  return `${ts}.${sig}`;
}

export function verifyToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [ts, sig] = parts;

  const expected = createHmac("sha256", SECRET).update(ts).digest("hex");
  try {
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex")))
      return false;
  } catch {
    return false;
  }

  if (Date.now() - parseInt(ts, 10) > TTL_MS) return false;
  return true;
}
