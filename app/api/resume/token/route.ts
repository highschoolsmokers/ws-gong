import { NextResponse } from "next/server";
import { generateToken } from "@/lib/resumeToken";

// Intentionally unauthenticated and unrate-limited. The PDF is meant to be
// linked from /about; this endpoint just hands out short-lived tokens so the
// /api/resume URL goes stale in referrer logs after ~2 minutes. It is NOT a
// secrecy gate — anyone can mint a token. If the threat model ever changes
// (e.g. private resume), replace the gate with a stable random URL or wire
// up a real auth provider rather than rate-limiting this endpoint.
export async function GET() {
  return NextResponse.json({ token: generateToken() });
}
