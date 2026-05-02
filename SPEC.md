# ws-gong.com — Technical Specification

> **Status:** Rudimentary snapshot of existing functionality as of 2026-05-02. Captures
> what is shipped, not what is intended. To be audited and refined in a later pass.

## 1. Overview

`ws-gong.com` is the personal site of W.S. Gong (Billy Gong). It is a Next.js 16
App Router application deployed to Vercel. It serves a small portfolio of
narrative and code work, an automated weekly-updated residency listings page
backed by Neon Postgres + Anthropic, an HMAC-gated resume PDF, a contact form
delivered over SMTP, and an RSS feed.

## 2. Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, custom Swiss-grid design tokens; Geist font (Vercel)
- **Hosting:** Vercel (Fluid Compute), `engines.node >= 24`
- **Database:** Neon Postgres (`@neondatabase/serverless`)
- **LLM:** Anthropic SDK (`@anthropic-ai/sdk`); models centralized in
  `lib/residency-miner/models.ts` (`EXTRACT_MODEL = claude-haiku-4-5-20251001`,
  `DISCOVERY_MODEL = claude-sonnet-4-6`)
- **Email:** Nodemailer over SMTP (port 465, secure)
- **Observability:** Sentry (server + edge instrumentation; client SDK
  intentionally disabled to keep portfolio pages under Lighthouse 95),
  Vercel Analytics, Vercel Speed Insights
- **Validation:** Zod
- **Testing:** Playwright (chromium / firefox / webkit), Node test runner
  for `lib/residency-miner/*.test.ts`
- **Lint / format:** ESLint 9, Prettier, Husky + lint-staged
- **Package manager:** pnpm

## 3. Routing & Layouts

Two App Router groups:

- `app/(site)/` — uses `PageShell` + `Nav` (header masthead, primary nav,
  footer with subscribe link, terms/colophon/theme toggle).
- `app/(bare)/` — minimal layout for `/links` (Linktree-style page).

Top-level routes:

| Path                    | Type                           | Notes                                                |
| ----------------------- | ------------------------------ | ---------------------------------------------------- |
| `/`                     | Server page                    | Statement, Giacometti plate, latest Substack post    |
| `/about`                | Server page                    | Bio, resume link, social icons                       |
| `/narratives`           | Server page                    | Writing index + Substack feed                        |
| `/code`                 | Server page                    | Project portfolio with JSON-LD `ItemList`            |
| `/code/{slug}`          | Server pages                   | One page per project (10 projects)                   |
| `/residencies`          | Server page (revalidate 3600s) | Reads from Neon, hands off to client list            |
| `/colophon`             | Server page                    | Typography, design, stack, tools, source             |
| `/contact`              | Server page                    | Contact form (server action)                         |
| `/terms`                | Server page                    | DMCA + AI/ML training prohibition                    |
| `/links`                | Server page (bare layout)      | Linktree-style social index                          |
| `/feed`                 | Route handler                  | RSS 2.0 feed (Substack posts + featured projects)    |
| `/sitemap.xml`          | `app/sitemap.ts`               | Static + project URLs + Fabulosa Books parts 1-7     |
| `/robots.txt`           | `app/robots.ts`                | Disallows `/api/`, `/monitoring`; advertises sitemap |
| `/manifest.webmanifest` | `app/manifest.ts`              | PWA manifest, `#f2ede4` theme color                  |
| `/opengraph-image`      | `app/opengraph-image.tsx`      | Default OG image                                     |

Code project pages (under `/code/`):

- `colophon-mcp`, `paperless-mcp`, `lit-verity-mcp`,
  `historical-research-agent`, `lit-research-plugin`,
  `submission-cli`, `submission-watcher-agent`, `writer-utilities`,
  `contact-form`, `swiss-design-workbench`

Configured redirects (`next.config.ts`):

- `/narratives-code` → `/code` (permanent)
- `/narratives-code/:slug` → `/code/:slug` (permanent)

The `/fabulosa-books/` tutorial is served as static assets out of `public/`
and surfaced in the sitemap (`part1.html` … `part7.html`).

### 3.1 Navigation

`app/(site)/Nav.tsx` renders the masthead and primary nav:

- Narratives, Code, Residencies, About

The masthead is the H1 on the home page and a link to `/` on every other page.

## 4. Home Page

`app/(site)/page.tsx`:

1. Statement section (Rumpus link, technical writing, AI tooling).
2. Plate 01 — Giacometti, _The Palace at 4 a.m._ (`public/images/giacometti_palace_4am.jpg`,
   priority loaded).
3. "Latest" section pulling the most recent Substack post via
   `getSubstackPosts("highschoolsmokers", 1)`.

## 5. Code Portfolio

`app/(site)/code/page.tsx` defines three categories — AI Engineering,
Developer Tools, Web & Design — each with a typed `Project` array
(`href`, `title`, `description`, `stack`, `tags`). Emits a JSON-LD
`ItemList` of all projects.

Each project page is a static MDX-free server component documenting that
single project (overview, structure, principles, stack, external links).
`/code/contact-form` reuses the lab `ContactForm` component (demo only,
non-sending).

## 6. Narratives

`app/(site)/narratives/page.tsx` renders three hand-curated entries
(Novel in progress, 14 Hills, Rumpus editing) followed by all Substack
posts from the `highschoolsmokers` subdomain.

## 7. Residencies (Residency Miner)

The residencies feature has its own subsystem under `lib/residency-miner/`
plus four route handlers under `app/api/`. It automatically discovers
sources, mines them weekly for opportunities, and renders a filterable
list at `/residencies`.

### 7.1 Pipeline

```
GET /api/discover-sources  (Vercel cron, Sun 09:00 UTC)
  → Anthropic web_search → tool-use report_candidates
  → URL validation (HTTP, content-type, body length, residency + writing keyword regexes)
  → INSERT INTO sources (dedup on normalized URL)
  → INSERT INTO discovery_logs

GET /api/mine              (Vercel cron, Mon 09:00 UTC)
  → SELECT active sources
  → fetch HTML (15s timeout, retry once on 5xx/429, browser UA)
  → extractOpportunities(html, source)  [Anthropic tool-use → Zod validate]
  → upsertOpportunity(...)               [INSERT ... ON CONFLICT (id) DO UPDATE]
  → recordSourceSuccess / recordSourceFailure
  → INSERT INTO run_logs
  → revalidatePath("/residencies") (always; zero-yield runs still must refresh
                                    the "Last scan" footer to reflect reality)
  → Sentry warning if low yield (sourcesFetched ≥ 5 and newFound/sourcesFetched < 0.4)

GET /api/heartbeat         (Vercel cron, daily 10:00 UTC)
  → getLastRun(); Sentry error if older than 7.5 days

GET /api/prune-logs        (Vercel cron, monthly, day 1 at 10:00 UTC)
  → DELETE FROM run_logs / discovery_logs older than 90 days
```

All four routes are GET (Vercel cron uses GET) and authenticate with
`Authorization: Bearer <CRON_SECRET>` via `lib/authz.ts:timingSafeBearer`.
`maxDuration = 300` on `/api/mine` and `/api/discover-sources`.
`/api/mine` runs sources with a concurrency cap of 3 to stay under
Anthropic input-tokens-per-minute limits.

### 7.2 Data Model

TypeScript types live in `lib/residency-miner/types.ts`:

- `Opportunity` — `id`, `name`, `org`, `url`, `deadline` (strict
  `YYYY-MM-DD` or the literal lowercase `"rolling"` — enforced by Zod regex
  in `extract.ts` and the `valid_deadline_format` CHECK in
  migration `002_deadline_format.sql`), `genre[]`, `duration`, `stipend`,
  `stipendMax`, `location`, `eligibility`, `description`, `firstSeen`,
  `lastUpdated`, `sourceUrl`
- `Genre` — `fiction | nonfiction | poetry | screenwriting | multi | other`
- `Source` — `id`, `name`, `url`, `type` (`aggregator | org_listing`),
  `status` (`active | inactive`), `discoveredAt`, `lastFetchedAt`,
  `lastSuccessAt`, `successCount`, `failureCount`, `consecutiveFailures`
- `MineRunLog` — `timestamp`, `sourcesFetched`, `newFound`, `updated`, `errors[]`
- `DiscoveryLog` — `timestamp`, `candidates`, `added`, `rejected[]`

Postgres tables — canonical DDL lives in
[`lib/residency-miner/schema.sql`](lib/residency-miner/schema.sql) with
incremental migrations under
[`lib/residency-miner/migrations/`](lib/residency-miner/migrations/):

- `opportunities` — primary key `id`; columns include `genre TEXT[]`,
  `stipend`, `stipend_max`, `first_seen`, `last_updated`, `source_url`.
  ID = first 16 hex chars of `sha256(normalizedName + "|" + year)`.
  Org is intentionally NOT in the hash because extractors emit
  inconsistent org names.
- `sources` — primary key `id`, unique `url`, with `consecutive_failures`
  and a deactivation threshold of 4 consecutive failures.
- `run_logs` — append-only mining run history with JSONB `errors`.
- `discovery_logs` — append-only discovery history with JSONB `rejected`.

Both runtime row schemas are validated with Zod (`opportunityRowSchema`,
`sourceRowSchema`); malformed rows are reported to Sentry and filtered
out rather than crashing the request.

### 7.3 Extraction (`lib/residency-miner/extract.ts`)

- HTML stripped of `<script>`, `<style>`, `<nav>`, `<footer>`, comments,
  most tags; entities decoded; whitespace normalized; truncated to
  `MAX_CONTENT_CHARS = 20_000` (Sentry info on truncation).
- Anthropic call: `EXTRACT_MODEL`, `max_tokens: 8192`, `temperature: 0`,
  cached system prompt (`cache_control: ephemeral`), forced tool-use of
  `report_opportunities`.
- System prompt enforces: writing/literary disciplines only, English-language
  only, multi-discipline residencies extract only writer tracks.
- Each returned item is parsed by `extractedSchema` (Zod); rejected items
  are reported to Sentry and dropped.
- `stop_reason === "max_tokens"` is reported to Sentry.

### 7.4 Discovery (`app/api/discover-sources/route.ts`)

- Anthropic call: `DISCOVERY_MODEL`, `max_tokens: 8192`, `temperature: 0`,
  cached system prompt, two tools (`web_search_20250305` with `max_uses: 6`,
  and `report_candidates`).
- Strict English-language, writing-primary filter encoded in the prompt.
- Cap of `MAX_NEW_SOURCES = 10` per run.
- Validation regexes: `KEYWORD_PATTERN` (residency vocabulary) AND
  `WRITING_KEYWORD_PATTERN` (writing-specific vocabulary). Bodies under
  `MIN_BODY_LENGTH = 2000` are rejected. Non-`text/html` content-types
  are rejected.
- Sentry warning when zero candidates are returned.

### 7.5 Page (`app/(site)/residencies/page.tsx` + `ResidenciesList.tsx`)

- Server component fetches all opportunities sorted by deadline asc, plus
  `getLastRun()` and `getSourceStats()`. It also computes `today` (ISO
  YYYY-MM-DD) and passes it as a prop so SSR and the first CSR pass agree
  on the past-deadline filter — important for `/residencies?genre=…` deep
  links and for crawler-visible HTML.
- `revalidate = 3600`; `revalidatePath("/residencies")` is also called
  from the mine cron after every run.
- Client list filters by genre (URL param `?genre=…`) and hides past
  deadlines (`o.deadline < today` unless `"rolling"`). "Index" footer
  shows last scan time, fetched/extracted/error counts, source counts,
  and the next-Monday-09:00-UTC scan time (the "next scan" string is
  formatted client-side post-mount to avoid SSR/CSR locale divergence).

## 8. Resume PDF Gate

Source: `private/wsgong_tech_writer_resume.pdf` (included in
`outputFileTracingIncludes` so it ships with the function bundle).

Endpoints:

- `GET /api/resume/token` — `lib/resumeToken.ts:generateToken()` returns
  `{ token: "<ts>.<hmac-sha256(ts, RESUME_SECRET)>" }`.
- `HEAD /api/resume?token=…` — returns size headers for UI display.
- `GET /api/resume?token=…` — streams the PDF.

Tokens are reusable within a 2-minute TTL (`TTL_MS = 2 * 60 * 1000`).
Verification uses `timingSafeEqual`. `RESUME_SECRET` is required in
production (throws on missing).

The gate is intentionally decorative: the `/api/resume/token` endpoint is
unauthenticated and unrate-limited. Anyone can mint a token. The point is
short URL freshness in referrer logs, not access control. If the threat
model changes, replace the gate rather than rate-limiting the mint.

Headers on PDF responses:

- `Content-Type: application/pdf`
- `Content-Disposition: inline; filename="wsgong_tech_writer_resume.pdf"`
- `X-Robots-Tag: noindex, nofollow`
- `Cache-Control: no-store` (prevents back-button replay after token expiry)

`app/(site)/resume/ResumeLink.tsx` fetches a token on mount, shows
`Download PDF (NN KB)`, refreshes every 90 seconds (well inside the
2-minute TTL), and renders a retry button on failure.

## 9. Contact Form

Two form components share a UI but differ in transport:

- **Real form** — `app/(site)/contact/ContactForm.tsx` + server action
  `app/(site)/contact/actions.ts:sendMessage`. Uses Nodemailer SMTP.
- **Lab demo** — `app/(site)/code/ContactForm.tsx`, used by
  `/code/contact-form`. Validates and pretends to send; never delivers
  email. Pre-fills the subject from a `?from=` query parameter.

Real-form anti-spam:

- Hidden `website` honeypot field — non-empty rejects the submission.
- Timing check — submissions earlier than `MIN_TIME_MS = 3000` after
  page load are rejected (form embeds `_t` from `Date.now()`).

Real-form attachments:

- Multipart upload, max `MAX_FILES = 5`, max `MAX_FILE_SIZE = 5 MB` per
  file, max `MAX_TOTAL_ATTACHMENT_BYTES = 10 MB` aggregate (constants in
  `lib/upload.ts`). Files exceeding the per-file size are dropped client-
  side; the count cap stops the loop server-side; the total-bytes cap
  skips oversize files but keeps checking smaller ones (so a big PDF
  followed by a small image doesn't drop the image silently).
- `isBlockedAttachmentName` rejects executable / script extensions
  (`.exe`, `.scr`, `.bat`, `.cmd`, `.com`, `.msi`, `.ps1`, `.vbs`, `.js`,
  `.jse`, `.wsf`, `.wsh`, `.jar`, `.lnk`, `.reg`, `.sh`, `.app`, `.dmg`,
  `.pkg`, `.iso`) before the file is buffered. Denylist not allowlist —
  legitimate attachments are unbounded by extension type.

Email envelope:

- `from: SMTP_USER`, `to: CONTACT_EMAIL`, `replyTo: <user email>`,
  `subject: "[Contact Form] …"`, plain text body, attachments, header
  `X-Source: contact-form`.

## 10. RSS Feed

`app/feed/route.ts` returns `application/rss+xml` for the channel
`https://www.ws-gong.com`:

- All posts from `getSubstackPosts("highschoolsmokers")` as `<category>Newsletter</category>`, each with `<pubDate>` from the Substack `post_date`.
- Five hand-curated project items (Fabulosa Books, Paperless MCP,
  Submission CLI, Writer Utilities, Contact Form) as `<category>Project</category>`,
  each with a stable `date` field that becomes `<pubDate>` so RSS readers
  sort and dedupe predictably (without it, Feedly/Reeder treat dateless
  items as "now" on every fetch).
- All title/description text passes through a small inline `cdata()`
  helper that escapes any `]]>` in user-supplied content (Substack post
  titles can contain anything) by emitting `]]]]><![CDATA[>`.
- `Cache-Control: s-maxage=3600, stale-while-revalidate`.

The root layout advertises the feed via
`alternates.types["application/rss+xml"] = "/feed"`.

## 11. Substack Integration (`lib/substack.ts`)

`getSubstackPosts(subdomain, limit = 10)`:

- Subdomain validated with `^[a-z0-9][a-z0-9-]{0,62}$`.
- Calls `https://<subdomain>.substack.com/api/v1/posts?limit=…`,
  `next.revalidate = 3600`, `AbortSignal.timeout(5000)`.
- Each item parsed with `substackPostSchema` (Zod); failures dropped.
- Non-OK responses and malformed payloads `throw` so Next's data cache
  treats the call as a failed fetch and retries on the next request,
  rather than caching `[]` for the full hour and silently hiding the
  newsletter section across the site. The outer try/catch still returns
  `[]` to the page, so the section just disappears for one request.

Posts surface on `/`, `/narratives`, and `/feed`.

## 12. Theming

`app/components/ThemeToggle.tsx`:

- Three states: `system | light | dark`, cycled in that order.
- Persisted in `localStorage["theme"]`. `system` removes the key.
- Applied via `data-theme` attribute on `<html>`.
- Cross-tab sync via the `storage` event.
- `applyTheme` runs in a `useEffect` (not during render) so React's
  concurrent renderer can't double-invoke the DOM write.

To prevent a flash-of-light-theme for returning dark-mode users, a tiny
inline `<script>` in `app/layout.tsx`'s `<head>` reads `localStorage.theme`
and sets `data-theme` synchronously, before any CSS evaluates
`prefers-color-scheme`. The `<html>` element carries `suppressHydrationWarning`
so React doesn't flag the script-set attribute as a hydration mismatch.

## 13. SEO & Metadata

Root metadata (`app/layout.tsx`):

- `metadataBase: https://www.ws-gong.com`
- Title template `"%s — W.S. Gong"`, default `"W.S. Gong"`
- Person JSON-LD with `worksFor` (The Rumpus), `sameAs` (GitHub, LinkedIn,
  Substack, Instagram), `knowsAbout` keywords.
- OpenGraph site name + URL.
- `icons.apple = /apple-touch-icon.png`.

Per-page metadata is set on every route. `/code` adds an `ItemList`
JSON-LD.

`app/sitemap.ts` computes `lastModified` from a module-level `buildTime`
constant, not `new Date()` per request, so the same crawl returns the
same timestamp across all URLs and successive crawls only see "modified"
when the deployment changed.

## 14. HTTP Headers (`next.config.ts`)

Applied to `(.*)`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Permissions-Policy` denies accelerometer, camera, geolocation,
  gyroscope, magnetometer, microphone, payment, usb, interest-cohort,
  browsing-topics — the static portfolio uses none of these.
- `Content-Security-Policy`:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com`
  - `style-src 'self' 'unsafe-inline'`
  - `img-src 'self' data: https:`
  - `font-src 'self'`
  - `connect-src 'self' https://va.vercel-scripts.com https://*.sentry.io https://*.ingest.sentry.io`
  - `worker-src 'self' blob:`
  - `frame-ancestors 'none'`

`productionBrowserSourceMaps: true` so Lighthouse / Sentry can resolve
minified frames.

## 15. Sentry

- `sentry.server.config.ts`, `sentry.edge.config.ts`, registered via
  `instrumentation.ts` (`register()` + `onRequestError`).
- Client SDK intentionally disabled (`instrumentation-client.ts` exports
  nothing) to preserve Lighthouse performance on portfolio pages.
- `withSentryConfig` (in `next.config.ts`):
  - org `high-school-smokers`, project `javascript-nextjs`
  - `tunnelRoute: "/monitoring"` (also disallowed in `robots.ts`)
  - `automaticVercelMonitors: true`
  - tree-shakes Sentry debug logging
- Captured signals (residency miner): truncated extraction content (info),
  `max_tokens` stops, malformed rows, rejected extracted items, low-yield
  runs (warning), zero discovery candidates (warning), heartbeat staleness
  (error), missing run logs (error).

## 16. Cron Jobs (`vercel.json`)

| Path                    | Schedule                               | Purpose                                                 |
| ----------------------- | -------------------------------------- | ------------------------------------------------------- |
| `/api/discover-sources` | `0 9 * * 0` (Sun 09:00 UTC)            | Discover new residency sources                          |
| `/api/mine`             | `0 9 * * 1` (Mon 09:00 UTC)            | Mine active sources for opportunities                   |
| `/api/prune-logs`       | `0 10 1 * *` (1st of month, 10:00 UTC) | Delete `run_logs` / `discovery_logs` older than 90 days |
| `/api/heartbeat`        | `0 10 * * *` (daily 10:00 UTC)         | Page Sentry if mine has not run in > 7.5 days           |

`vercel.json` also sets an `ignoreCommand` that skips deploys when only
docs/config/test-fixture files change.

## 17. Environment Variables

| Name                                               | Used in                | Purpose                                         |
| -------------------------------------------------- | ---------------------- | ----------------------------------------------- |
| `DATABASE_URL`                                     | residency miner        | Neon Postgres connection string                 |
| `ANTHROPIC_API_KEY`                                | extract + discovery    | Anthropic SDK auth                              |
| `CRON_SECRET`                                      | all four cron handlers | Bearer token verified by `timingSafeBearer`     |
| `RESUME_SECRET`                                    | resume token           | HMAC key (required in production)               |
| `SENTRY_DSN`                                       | Sentry instrumentation | Optional; observability disabled if unset       |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | contact form           | SMTP credentials (port defaults to 465, secure) |
| `CONTACT_EMAIL`                                    | contact form           | Inbox the form delivers to                      |
| `BASE_URL`                                         | playwright             | Override base URL in CI                         |
| `VERCEL_AUTOMATION_BYPASS_SECRET`                  | playwright             | Bypass Vercel preview protection in CI          |

## 18. Testing

- **Unit:** `lib/residency-miner/dedupe.test.ts` via `pnpm test:unit`
  (`node --test --experimental-strip-types`).
- **E2E:** Playwright tests under `e2e/` —
  `accessibility.spec.ts`, `api.spec.ts`, `contact.spec.ts`,
  `content.spec.ts`, `fabulosa-books.spec.ts`, `metadata.spec.ts`,
  `navigation.spec.ts`, `projects.spec.ts`, `smoke.spec.ts`. Helpers in
  `e2e/helpers/` (`imap.ts` for verifying contact email delivery,
  `contact-form.ts`, `constants.ts`, `required-env.ts`). Run on
  chromium / firefox / webkit, 2 workers, fully parallel.

## 19. Scripts

| Script           | Command                                               |
| ---------------- | ----------------------------------------------------- |
| `pnpm dev`       | `next dev`                                            |
| `pnpm build`     | `next build`                                          |
| `pnpm start`     | `next start`                                          |
| `pnpm lint`      | `eslint`                                              |
| `pnpm typecheck` | `tsc --noEmit`                                        |
| `pnpm test:unit` | Node test runner over `lib/residency-miner/*.test.ts` |
| `pnpm test:e2e`  | Playwright                                            |
| `pnpm prepare`   | `husky`                                               |

`scripts/make-favicon.mjs` is a one-shot generator used to produce
`public/apple-touch-icon.png` from the W.S. Gong mark.

## 20. Repository Layout

```
app/
  (site)/                site-shell route group (PageShell + Nav + footer)
    page.tsx             home
    Nav.tsx
    layout.tsx
    error.tsx
    about/
    code/                portfolio + 10 project pages, ContactForm (lab demo)
    colophon/
    contact/             real form + server action
    narratives/
    residencies/         server page + ResidenciesList client component
    resume/              ResumeLink client component
    terms/
  (bare)/
    links/               linktree-style page
  api/
    mine/                cron — weekly extraction
    discover-sources/    cron — weekly source discovery
    heartbeat/           cron — staleness monitor
    prune-logs/          cron — log retention
    resume/              token + gated PDF
  components/            PageShell, PageTitle, ThemeToggle
  feed/                  RSS 2.0
  layout.tsx, manifest.ts, opengraph-image.tsx, sitemap.ts, robots.ts,
  global-error.tsx, not-found.tsx
lib/
  authz.ts               timingSafeBearer
  resumeToken.ts         HMAC token generate/verify
  substack.ts            Substack posts fetcher (Zod-validated)
  upload.ts              MAX_FILES, MAX_FILE_SIZE, MAX_TOTAL_ATTACHMENT_BYTES, isBlockedAttachmentName
  residency-miner/
    db.ts                Neon client + all SQL
    extract.ts           Anthropic tool-use extraction
    dedupe.ts            normalizeName / normalizeUrl / generateId / generateSourceId
    dedupe.test.ts       unit tests
    models.ts            EXTRACT_MODEL / DISCOVERY_MODEL
    types.ts             shared types
    schema.sql           canonical DDL
    migrations/          incremental schema migrations
private/
  wsgong_tech_writer_resume.pdf   gated by /api/resume
public/
  fabulosa-books/        static tutorial site (parts 1-7 + index)
  images/                site imagery (Giacometti plate, etc.)
  apple-touch-icon.png, *.svg
e2e/                     Playwright tests + helpers
scripts/                 make-favicon.mjs
docs/                    deployment.md
sentry.{server,edge}.config.ts, instrumentation.ts, instrumentation-client.ts
next.config.ts, vercel.json, playwright.config.ts, postcss.config.mjs
tsconfig.json, eslint.config.mjs
package.json, pnpm-lock.yaml
```

## 21. Anti-Patterns

Do not:

- Add abstractions until there are two concrete callers.
- Catch errors to make tests pass; fix the underlying behavior.
- Add a config value that has only one real setting.
- Introduce a new dependency without flagging it in the PR description.
- Run schema changes ad-hoc against the live database. Commit them as numbered, reversible migration files under `lib/residency-miner/migrations/` and update `schema.sql` to match the resulting state, so a fresh DB and a migrated DB end up identical.
- Write defensive code against conditions that can't occur given the types.

## 22. Intentional Decisions

Items that look like accidents but are deliberate. Each one was removed
or deviated from a "default" choice on purpose; do not regress them
without revisiting the linked rationale.

- **No per-opportunity status workflow.** The `status` column,
  `valid_status` CHECK, status dropdown, status filter, and PATCH
  endpoint were removed in [#46](https://github.com/highschoolsmokers/ws-gong/pull/46)
  ("triage workflow added complexity without matching actual usage
  patterns"). The `GET /api/opportunities` JSON endpoint was then
  removed in [#54](https://github.com/highschoolsmokers/ws-gong/pull/54)
  when `/residencies` became a fully cached ISR server component. Do
  not reintroduce either without product justification.
- **Dedup hash excludes `org`.** `generateId(name, deadline)` hashes
  only the normalized name and deadline year. Extractors emit
  inconsistent org variants for the same program ("Banff Centre" vs
  "Banff Centre for Arts & Creativity"); including `org` would split
  one program into multiple records. Rationale lives in
  [`lib/residency-miner/dedupe.ts`](lib/residency-miner/dedupe.ts).
- **Client Sentry SDK disabled.** `instrumentation-client.ts` is
  empty by design — the core SDK added ~65 KB of unused JS and ~2 s
  render delay, dropping portfolio pages below the Lighthouse 95
  performance threshold. Server + edge instrumentation still runs
  via `instrumentation.ts`, which is where the residency miner (the
  only place errors actually matter) reports.
- **Public production source maps.** `productionBrowserSourceMaps: true`
  ships source maps so Lighthouse and the browser console can resolve
  minified frames back to original sources. Added in
  [#60](https://github.com/highschoolsmokers/ws-gong/pull/60). The site
  has no proprietary client logic, so the disclosure is acceptable.
- **Cron handlers export GET, not POST.** Vercel cron invokes endpoints
  with HTTP GET; a POST-only handler returns 405 silently and the cron
  appears to "work" while doing nothing. Every cron route in
  `app/api/*/route.ts` carries the comment
  `// Vercel cron jobs invoke endpoints with HTTP GET.` to make the
  invariant load-bearing.
