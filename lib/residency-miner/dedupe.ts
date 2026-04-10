import { createHash } from "crypto";

export function generateId(
  org: string,
  name: string,
  deadline: string,
): string {
  const year = deadline === "rolling" ? "rolling" : deadline.slice(0, 4);
  const input = `${org.toLowerCase().trim()}|${name.toLowerCase().trim()}|${year}`;
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}
