import { ImapFlow } from "imapflow";

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
 * Search iCloud INBOX for an email matching the given subject substring.
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
      const lock = await client.getMailboxLock("INBOX");
      try {
        const uids = await client.search({ subject: subjectQuery });
        if (Array.isArray(uids) && uids.length > 0) {
          const msg = await client.fetchOne(uids[uids.length - 1], {
            envelope: true,
          });
          return {
            subject: msg.envelope.subject,
            from: msg.envelope.from?.[0]?.address ?? "",
            date: msg.envelope.date,
          };
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
 * Delete all emails whose subject contains the given query string.
 * Used to clean up e2e test emails after verification.
 */
export async function deleteEmails(subjectQuery: string): Promise<number> {
  const client = new ImapFlow(IMAP_CONFIG);
  let deleted = 0;
  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
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
