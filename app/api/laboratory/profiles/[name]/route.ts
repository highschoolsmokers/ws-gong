import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PROFILES_DIR = path.join(process.cwd(), "profiles");

function safeName(raw: string): string | null {
  if (!/^[a-zA-Z0-9_-]+$/.test(raw)) return null;
  const resolved = path.resolve(PROFILES_DIR, `${raw}.json`);
  if (!resolved.startsWith(PROFILES_DIR + path.sep)) return null;
  return raw;
}

function isAuthorized(request: Request): boolean {
  const token = request.headers.get("x-api-token");
  return token === process.env.NEXT_PUBLIC_API_TOKEN;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name: raw } = await params;
  const name = safeName(raw);
  if (!name) {
    return NextResponse.json({ error: "Invalid profile name" }, { status: 400 });
  }
  const filePath = path.join(PROFILES_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name: raw } = await params;
  const name = safeName(raw);
  if (!name) {
    return NextResponse.json({ error: "Invalid profile name" }, { status: 400 });
  }
  const data = await request.json();
  fs.mkdirSync(PROFILES_DIR, { recursive: true });
  const filePath = path.join(PROFILES_DIR, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return NextResponse.json({ saved: name });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name: raw } = await params;
  const name = safeName(raw);
  if (!name) {
    return NextResponse.json({ error: "Invalid profile name" }, { status: 400 });
  }
  const filePath = path.join(PROFILES_DIR, `${name}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return NextResponse.json({ deleted: name });
  }
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
