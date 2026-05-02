export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file
export const MAX_FILES = 5;
// Cap aggregate attachment payload so a single submission can't pin a
// serverless function with 5 × MAX_FILE_SIZE = 25 MB of buffered memory.
export const MAX_TOTAL_ATTACHMENT_BYTES = 10 * 1024 * 1024;

// Block executable / script extensions that can ride into the inbox via the
// authenticated SMTP_USER (passing SPF/DKIM). Allowlist would be tighter, but
// users legitimately attach .pdf/.docx/.png/etc. — denylist trades a known
// bad set for an open allow set.
const BLOCKED_EXTENSIONS = new Set([
  "exe",
  "scr",
  "bat",
  "cmd",
  "com",
  "msi",
  "ps1",
  "vbs",
  "js",
  "jse",
  "wsf",
  "wsh",
  "jar",
  "lnk",
  "reg",
  "sh",
  "app",
  "dmg",
  "pkg",
  "iso",
]);

export function isBlockedAttachmentName(filename: string): boolean {
  const ext = filename.toLowerCase().split(".").pop();
  return ext !== undefined && BLOCKED_EXTENSIONS.has(ext);
}
