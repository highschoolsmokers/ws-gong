import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/resumeToken";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token || !verifyToken(token)) {
    return new NextResponse(null, { status: 403 });
  }

  const file = readFileSync(join(process.cwd(), "private", "gong_resume.pdf"));
  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=\"gong_resume.pdf\"",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
