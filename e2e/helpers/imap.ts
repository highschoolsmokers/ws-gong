import { test } from "@playwright/test";
import { ImapFlow } from "imapflow";

// Mail tests (@smtp, @infra): their env checks and the inbox they watch.

/** Skip without the variable locally; fail in CI, so a missing secret can't pass green. */
export function requireEnv(name: string): void {
  if (process.env[name]) return;
  if (process.env.CI)
    throw new Error(
      `${name} must be set in CI: check the workflow env and repo secret.`,
    );
  test.skip(true, `${name} not set (local dev)`);
}

const FOLDER = "E2E";
const config = {
  host: "imap.mail.me.com",
  port: 993,
  secure: true,
  // The form delivers to CONTACT_EMAIL, so that is the inbox to watch.
  auth: {
    user: process.env.IMAP_USER ?? process.env.CONTACT_EMAIL ?? "",
    pass: process.env.IMAP_PASS ?? "",
  },
  logger: false as const,
};

// Connect, make sure the E2E folder exists, lock `box`, run, clean up.
async function withMailbox<T>(box: string, fn: (c: ImapFlow) => Promise<T>) {
  const client = new ImapFlow(config);
  await client.connect();
  try {
    const boxes = await client.list();
    if (!boxes.some((m) => m.path === FOLDER || m.name === FOLDER))
      await client.mailboxCreate(FOLDER);
    const lock = await client.getMailboxLock(box);
    try {
      return await fn(client);
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

type Received = { subject: string; attachments: string[] };

/** Wait for a message whose subject contains `query`; move matches out of INBOX. */
export async function waitForEmail(
  query: string,
  { maxRetries = 20, delayMs = 5000 } = {},
): Promise<Received | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const subject = await withMailbox("INBOX", async (c) => {
        const uids = await c.search({ subject: query });
        if (!uids || !uids.length) return null;
        const msg = await c.fetchOne(uids[uids.length - 1], {
          envelope: true,
          bodyStructure: true,
        });
        await c.messageMove(uids, FOLDER);
        if (!msg) return null;
        // Every attachment's filename, from the message's MIME tree.
        type Part = {
          dispositionParameters?: { filename?: string };
          childNodes?: Part[];
        };
        const names = (p?: Part): string[] =>
          p
            ? [
                p.dispositionParameters?.filename ?? [],
                ...(p.childNodes ?? []).flatMap(names),
              ].flat()
            : [];
        return {
          subject: msg.envelope?.subject ?? "",
          attachments: names(msg.bodyStructure as Part),
        };
      });
      if (subject !== null) return subject;
    } catch {
      // Connection error: retry.
    }
    if (attempt < maxRetries) await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
}

/** Delete the E2E folder's messages whose subject contains `query`. */
export async function deleteEmails(query: string): Promise<void> {
  try {
    await withMailbox(FOLDER, async (c) => {
      const uids = await c.search({ subject: query });
      if (uids && uids.length) await c.messageDelete(uids);
    });
  } catch {
    // Cleanup is best-effort.
  }
}
