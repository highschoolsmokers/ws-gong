import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const file = readFileSync(join(process.cwd(), "private", "gong_resume.pdf"));
  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=\"gong_resume.pdf\"",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
