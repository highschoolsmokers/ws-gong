import { test } from "@playwright/test";

/**
 * Skip a test when an env var isn't set — but fail loudly in CI so missing
 * secrets don't silently produce green builds.
 */
export function requireEnv(name: string): void {
  if (process.env[name]) return;
  if (process.env.CI) {
    throw new Error(
      `${name} must be set in CI. Check the workflow's \`env:\` block and the corresponding repo secret.`,
    );
  }
  test.skip(true, `${name} not set (local dev)`);
}
