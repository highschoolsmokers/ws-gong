import { readFile, stat } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/resumeToken";

const pdfPath = join(process.cwd(), "private", "wsgong_tech_writer_resume.pdf");

const baseHeaders = {
  "Content-Type": "application/pdf",
  "Content-Disposition": 'inline; filename="wsgong_tech_writer_resume.pdf"',
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "private, max-age=300",
};

export async function HEAD(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !verifyToken(token)) {
    return new NextResponse(null, { status: 403 });
  }
  const { size } = await stat(pdfPath);
  return new NextResponse(null, {
    headers: { ...baseHeaders, "Content-Length": String(size) },
  });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !verifyToken(token)) {
    return new NextResponse(null, { status: 403 });
  }
  const file = await readFile(pdfPath);
  return new NextResponse(new Uint8Array(file), { headers: baseHeaders });
}
