import { createHmac, timingSafeEqual } from "node:crypto";
import { MAX_TOKEN_AGE_MS, MIN_ELAPSED_MS } from "./upload.ts";

// The contact form's anti-spam timer, on the server's clock: the form asks
// for a signed timestamp when a visitor first focuses it, and a submission
// passes only if that signature checks out and enough time has gone by.
// Server-only (node:crypto); the client gets the token through a server action.

const sign = (ts: string, key: string) =>
  createHmac("sha256", key).update(`contact-form:${ts}`).digest("base64url");

export const issueToken = (key: string, now = Date.now()) =>
  `${now}.${sign(String(now), key)}`;

export function tokenIsValid(token: string, key: string, now = Date.now()) {
  const [ts, sig = ""] = token.split(".");
  const want = Buffer.from(sign(ts, key));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return false;
  const age = now - Number(ts);
  return age >= MIN_ELAPSED_MS && age <= MAX_TOKEN_AGE_MS;
}
