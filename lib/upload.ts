export const MAX_FILES = 5;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Aggregate cap so one submission can't buffer 5 × 5 MB in a function.
export const MAX_TOTAL_BYTES = 10 * 1024 * 1024;

// Executables and scripts could ride into the inbox past SPF/DKIM via
// SMTP_USER; a denylist keeps ordinary documents and images attachable.
const BLOCKED = new Set(
  "exe scr bat cmd com msi ps1 vbs js jse wsf wsh jar lnk reg sh app dmg pkg iso".split(
    " ",
  ),
);

export const isBlockedAttachmentName = (name: string) =>
  BLOCKED.has(name.toLowerCase().split(".").pop() ?? "");
