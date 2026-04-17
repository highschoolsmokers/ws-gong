import { NextResponse } from "next/server";
import { generateToken } from "@/lib/resumeToken";

export async function GET() {
  return NextResponse.json({ token: generateToken() });
}
