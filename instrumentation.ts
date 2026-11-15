import * as Sentry from "@sentry/nextjs";

// Server and edge only. The client SDK stays off: it cost ~65 KB and ~2 s of
// render time on static pages (SPEC §13).
export function register() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
    enableLogs: true,
    sendDefaultPii: false,
  });
}

export const onRequestError = Sentry.captureRequestError;
