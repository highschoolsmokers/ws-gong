// Client-side Sentry is intentionally disabled. The core SDK was adding
// ~65 KB of unused JS and ~2 s of render delay to static portfolio pages,
// keeping them below Lighthouse's 95 performance threshold. Server-side
// error capture still runs via instrumentation.ts.
//
// Sentry's build step prints "ACTION REQUIRED: export onRouterTransitionStart"
// because this file is empty. The hook cannot exist without enabling the
// client SDK, so the warning is the intended state — accept it.
export {};
