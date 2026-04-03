import { ImapFlow } from "imapflow";

const E2E_FOLDER = "E2E";

const IMAP_CONFIG = {
  host: "imap.mail.me.com",
  port: 993,
  secure: true,
  auth: {
    user: process.env.IMAP_USER ?? "billygong@me.com",
    pass: process.env.IMAP_PASS ?? "",
  },
  logger: false as const,
};

/**
 * Ensure the E2E mailbox folder exists, creating it if needed.
 */
async function ensureFolder(client: ImapFlow): Promise<void> {
  const mailboxes = await client.list();
  const exists = mailboxes.some(
    (m) => m.path === E2E_FOLDER || m.name === E2E_FOLDER,
  );
  if (!exists) {
    await client.mailboxCreate(E2E_FOLDER);
  }
}

/**
 * Search iCloud INBOX for an email matching the given subject substring.
 * When found, moves it to the E2E folder to keep INBOX clean.
 * Retries up to `maxRetries` times with `delayMs` between attempts to
 * allow for delivery lag.
 */
export async function waitForEmail(
  subjectQuery: string,
  { maxRetries = 6, delayMs = 5000 } = {},
): Promise<{ subject: string; from: string; date: Date } | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const client = new ImapFlow(IMAP_CONFIG);
    try {
      await client.connect();
      await ensureFolder(client);

      const lock = await client.getMailboxLock("INBOX");
      try {
        const uids = await client.search({ subject: subjectQuery });
        if (Array.isArray(uids) && uids.length > 0) {
          const msg = await client.fetchOne(uids[uids.length - 1], {
            envelope: true,
          });

          // Move all matching emails to E2E folder
          await client.messageMove(uids, E2E_FOLDER);

          if (msg && msg.envelope) {
            return {
              subject: msg.envelope.subject ?? "",
              from: msg.envelope.from?.[0]?.address ?? "",
              date: msg.envelope.date ?? new Date(),
            };
          }
        }
      } finally {
        lock.release();
      }
      await client.logout();
    } catch {
      // connection error — retry
    }

    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return null;
}

/**
 * Delete all emails whose subject contains the given query string
 * from the E2E folder.
 */
export async function deleteEmails(subjectQuery: string): Promise<number> {
  const client = new ImapFlow(IMAP_CONFIG);
  let deleted = 0;
  try {
    await client.connect();
    await ensureFolder(client);

    const lock = await client.getMailboxLock(E2E_FOLDER);
    try {
      const uids = await client.search({ subject: subjectQuery });
      if (Array.isArray(uids) && uids.length > 0) {
        await client.messageDelete(uids);
        deleted = uids.length;
      }
    } finally {
      lock.release();
    }
    await client.logout();
  } catch {
    // ignore cleanup errors
  }
  return deleted;
}
