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

// Split `files` into those that fit, in order, and the names of those
// refused: a blocked type, past the count, or past the total size, counting
// any files `already` attached. The form and the server action both use it.
export function splitAttachments<T extends { name: string; size: number }>(
  files: T[],
  already: { size: number }[] = [],
) {
  const kept: T[] = [];
  const refused: string[] = [];
  let total = already.reduce((n, f) => n + f.size, 0);
  for (const f of files)
    if (
      isBlockedAttachmentName(f.name) ||
      already.length + kept.length >= MAX_FILES ||
      total + f.size > MAX_TOTAL_BYTES
    )
      refused.push(f.name);
    else {
      kept.push(f);
      total += f.size;
    }
  return { kept, refused };
}
