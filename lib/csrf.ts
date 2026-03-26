import { randomBytes, createHash } from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET || randomBytes(32).toString("hex");

export function generateToken(): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(salt + CSRF_SECRET)
    .digest("hex");
  return `${salt}.${hash}`;
}

export function validateToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const expected = createHash("sha256")
    .update(salt + CSRF_SECRET)
    .digest("hex");
  return hash === expected;
}
