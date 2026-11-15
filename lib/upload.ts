export const MAX_FILES = 5;
// Vercel caps a function request body at 4.5 MB, and next.config.ts raises
// Next's 1 MB server-action limit to match, so attachments share 4 MB.
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024;

// Executables and scripts could ride into the inbox past SPF/DKIM via
// SMTP_USER; a denylist keeps ordinary documents and images attachable.
const BLOCKED = new Set(
  "exe scr bat cmd com msi ps1 vbs js jse wsf wsh jar lnk reg sh app dmg pkg iso".split(
    " ",
  ),
);

export const isBlockedAttachmentName = (name: string) =>
  BLOCKED.has(name.toLowerCase().split(".").pop() ?? "");
