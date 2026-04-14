// Client-side Sentry is intentionally disabled. The core SDK was adding
// ~65 KB of unused JS and ~2s of render delay to static portfolio pages,
// keeping them below Lighthouse's 95 performance threshold. Error capture
// for the residency-miner (the only place observability actually matters
// in this app) runs server-side via instrumentation.ts and the Sentry
// alerts added in PR #58.
export {};
