import { NextResponse } from "next/server";
import { readFile, writeFile, unlink, mkdir } from "fs/promises";
import path from "path";

const PROFILES_DIR = path.join(process.cwd(), "profiles");
const MAX_BODY_BYTES = 256 * 1024;

function safeName(raw: string): string | null {
  if (!/^[a-zA-Z0-9_-]+$/.test(raw)) return null;
  const resolved = path.resolve(PROFILES_DIR, `${raw}.json`);
  if (!resolved.startsWith(PROFILES_DIR + path.sep)) return null;
  return raw;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name: raw } = await params;
  const name = safeName(raw);
  if (!name) {
    return NextResponse.json(
      { error: "Invalid profile name" },
      { status: 400 },
    );
  }
  const filePath = path.join(PROFILES_DIR, `${name}.json`);
  try {
    const content = await readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw err;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const len = Number(request.headers.get("content-length") ?? 0);
  if (len > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  const { name: raw } = await params;
  const name = safeName(raw);
  if (!name) {
    return NextResponse.json(
      { error: "Invalid profile name" },
      { status: 400 },
    );
  }
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  const data = JSON.parse(body);
  await mkdir(PROFILES_DIR, { recursive: true });
  const filePath = path.join(PROFILES_DIR, `${name}.json`);
  await writeFile(filePath, JSON.stringify(data, null, 2));
  return NextResponse.json({ saved: name });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name: raw } = await params;
  const name = safeName(raw);
  if (!name) {
    return NextResponse.json(
      { error: "Invalid profile name" },
      { status: 400 },
    );
  }
  const filePath = path.join(PROFILES_DIR, `${name}.json`);
  try {
    await unlink(filePath);
    return NextResponse.json({ deleted: name });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw err;
  }
}
