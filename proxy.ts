import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";

const REALM = "Laboratory";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${REALM}"` },
  });
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function proxy(request: NextRequest) {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASSWORD;

  // Fail closed without revealing misconfiguration. If the operator forgot
  // to set ADMIN_USER/ADMIN_PASSWORD, the surface looks identical to a
  // correctly configured "wrong password" response.
  if (!expectedUser || !expectedPass) return unauthorized();

  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return unauthorized();

  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6), "base64").toString("utf-8");
  } catch {
    return unauthorized();
  }

  const idx = decoded.indexOf(":");
  if (idx === -1) return unauthorized();
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);

  if (!safeEqual(user, expectedUser) || !safeEqual(pass, expectedPass)) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/code/resume-generator/:path*", "/api/laboratory/:path*"],
};
