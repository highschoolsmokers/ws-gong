import { NextResponse } from "next/server";
import { validateProfile } from "@/lib/resumeEditor/schema";
import { renderResume } from "@/lib/resumeEditor/renderer";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const profile = validateProfile(data);
    const pdfBuffer = await renderResume(profile);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resume.pdf",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
