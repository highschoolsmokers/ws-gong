import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { validateProfile } from "@/lib/resumeEditor/schema";
import { renderResume } from "@/lib/resumeEditor/renderer";

// Best-effort in-memory cache: keyed by hash(profile) so an unchanged preview
// avoids re-rendering. Scoped to the current Fluid Compute instance, so the
// hit rate depends on request pinning — this is an optimization, not a
// durability guarantee.
const pdfCache = new Map<string, Buffer>();
const MAX_CACHE = 20;
const MAX_BODY_BYTES = 256 * 1024;

function cacheKey(data: unknown): string {
  return createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

export async function POST(request: Request) {
  try {
    const len = Number(request.headers.get("content-length") ?? 0);
    if (len > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    // Missing Content-Length or chunked body: also cap after read.
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    const data = JSON.parse(raw);
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
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
