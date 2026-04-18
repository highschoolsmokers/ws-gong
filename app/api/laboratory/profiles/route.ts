import { NextResponse } from "next/server";
import { readdir, mkdir, writeFile } from "fs/promises";
import path from "path";

const PROFILES_DIR = path.join(process.cwd(), "profiles");
const MAX_BODY_BYTES = 256 * 1024;

export async function GET() {
  try {
    const entries = await readdir(PROFILES_DIR);
    const names = entries
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
      .sort();
    return NextResponse.json(names);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json([]);
    }
    throw err;
  }
}

export async function POST(request: Request) {
  const len = Number(request.headers.get("content-length") ?? 0);
  if (len > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const { name, data } = JSON.parse(raw);
  if (!name || !data) {
    return NextResponse.json(
      { error: "Missing name or data" },
      { status: 400 },
    );
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return NextResponse.json(
      { error: "Invalid profile name" },
      { status: 400 },
    );
  }
  await mkdir(PROFILES_DIR, { recursive: true });
  const filePath = path.join(PROFILES_DIR, `${name}.json`);
  await writeFile(filePath, JSON.stringify(data, null, 2));
  return NextResponse.json({ saved: name });
}
