import { readFileSync, statSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/resumeToken";

const pdfPath = join(process.cwd(), "private", "wsgong_tech_writer_resume.pdf");

const headers = {
  "Content-Type": "application/pdf",
  "Content-Disposition": 'inline; filename="wsgong_tech_writer_resume.pdf"',
  "X-Robots-Tag": "noindex, nofollow",
};

export async function HEAD(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !verifyToken(token)) {
    return new NextResponse(null, { status: 403 });
  }
  const { size } = statSync(pdfPath);
  return new NextResponse(null, {
    headers: { ...headers, "Content-Length": String(size) },
  });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !verifyToken(token)) {
    return new NextResponse(null, { status: 403 });
  }
  const file = readFileSync(pdfPath);
  return new NextResponse(file, { headers });
}
