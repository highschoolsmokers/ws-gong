// Contact-form limits, shared by the form, the server action, and e2e.

// Submissions sooner than this after the form's token was issued (on the
// server's clock) are treated as bots; tokens older than a day are stale.
export const MIN_ELAPSED_MS = 3000;
export const MAX_TOKEN_AGE_MS = 24 * 60 * 60 * 1000;

// Field lengths, enforced by maxLength in the form and again by the server.
export const MAX_LENGTH = { name: 200, subject: 200, message: 10_000 };

export const MAX_FILES = 5;
// Vercel caps a function request body at 4.5 MB, and next.config.ts raises
// Next's 1 MB server-action limit to match, so attachments share 4 MB.
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024;

// Executables and scripts could ride into the inbox past SPF/DKIM via
// SMTP_USER; a denylist keeps ordinary documents and images attachable.
// Trailing dots and spaces are dropped first: "evil.exe." is "evil.exe".
const BLOCKED = new Set(
  "exe scr bat cmd com msi ps1 vbs js jse wsf wsh jar lnk reg sh app dmg pkg iso".split(
    " ",
  ),
);

export const isBlockedAttachmentName = (name: string) =>
  BLOCKED.has(
    name
      .toLowerCase()
      .replace(/[.\s]+$/, "")
      .split(".")
      .pop() ?? "",
  );
