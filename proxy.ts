import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const isTech =
    hostname.startsWith("tech.") ||
    hostname === "tech.ws-gong.com";

  if (isTech && !request.nextUrl.pathname.startsWith("/tech")) {
    const url = request.nextUrl.clone();
    url.pathname = "/tech" + request.nextUrl.pathname;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
