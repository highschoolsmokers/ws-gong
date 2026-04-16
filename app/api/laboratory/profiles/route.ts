import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PROFILES_DIR = path.join(process.cwd(), "profiles");

export async function GET() {
  if (!fs.existsSync(PROFILES_DIR)) {
    return NextResponse.json([]);
  }
  const names = fs
    .readdirSync(PROFILES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort();
  return NextResponse.json(names);
}

export async function POST(request: Request) {
  const token = request.headers.get("x-api-token");
  if (token !== process.env.NEXT_PUBLIC_API_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, data } = await request.json();
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
  fs.mkdirSync(PROFILES_DIR, { recursive: true });
  const filePath = path.join(PROFILES_DIR, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return NextResponse.json({ saved: name });
}
