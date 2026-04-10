import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { validateProfile } from "@/lib/resumeEditor/schema";
import { renderResume } from "@/lib/resumeEditor/renderer";

const pdfCache = new Map<string, Buffer>();
const MAX_CACHE = 20;

function cacheKey(data: unknown): string {
  return createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const profile = validateProfile(data);

    const key = cacheKey(profile);
    let pdfBuffer = pdfCache.get(key);
    if (!pdfBuffer) {
      pdfBuffer = await renderResume(profile);
      if (pdfCache.size >= MAX_CACHE) {
        const oldest = pdfCache.keys().next().value!;
        pdfCache.delete(oldest);
      }
      pdfCache.set(key, pdfBuffer);
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resume.pdf",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isValidationError =
      message.startsWith("Missing") || message.startsWith("Profile");
    return NextResponse.json(
      { error: message },
      { status: isValidationError ? 400 : 500 },
    );
  }
}
