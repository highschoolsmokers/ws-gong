// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://4d2eae71fc691017e3ef344cf18aa760@o4511113715515392.ingest.us.sentry.io/4511113720758272",

  // Session Replay is deliberately NOT enabled. It loads ~60 KB of DOM-
  // recording JS that added ~2s of render delay on static portfolio pages
  // and pushed every page below Lighthouse's 95 perf threshold. Client-side
  // error capture still works through the default integration set, and the
  // server-side Sentry config handles the residency-miner alerts where the
  // observability actually matters.

  tracesSampleRate: 0.1,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
