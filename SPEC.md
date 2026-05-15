# ws-gong.com — Technical Specification

> **Status:** Reflects the state after the dual-citizen redesign. Conceptual
> spec lives in [redesign.md](redesign.md); this document records the
> implementation-level details.

## 1. Overview

`ws-gong.com` is the personal site of W.S. Gong (Billy Gong). It is a Next.js
16 App Router application deployed to Vercel. It serves a small portfolio of
narrative and code work, a manual in-repo reading log, a contact form delivered
over SMTP, and an RSS feed of newsletter posts.

Slushpile (`/slushpile/*`) is a **separate Next.js application** maintained at
`~/workspace/slushpile/`. This repo mounts it via a `next.config.ts` rewrite
when `SLUSHPILE_URL` is set; nothing slushpile-related lives in this codebase.

## 2. Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, custom Swiss-grid design tokens; Geist font (Vercel)
- **Hosting:** Vercel (Fluid Compute), `engines.node >= 24`
- **Email:** Nodemailer over SMTP (port 465, secure)
- **Observability:** Sentry (server + edge instrumentation; client SDK
  intentionally disabled to preserve Lighthouse 95 on portfolio pages),
  Vercel Analytics, Vercel Speed Insights
- **Validation:** Zod
- **Testing:** Playwright (chromium / firefox / webkit), Node test runner
  for `lib/code/*.test.ts` and `lib/reading/*.test.ts`
- **Lint / format:** ESLint 9, Prettier, Husky + lint-staged
- **Package manager:** pnpm

## 3. Routing & Layouts

Two App Router groups:

- `app/(site)/` — uses `PageShell` + `Nav` (header masthead, primary nav,
  footer with subscribe link + About / Colophon / Terms / Contact / Links /
  theme toggle).
- `app/(bare)/` — minimal layout for `/links` (Linktree-style page).

Top-level routes:

| Path                    | Type                      | Notes                                                    |
| ----------------------- | ------------------------- | -------------------------------------------------------- |
| `/`                     | Server page               | Statement + latest narrative / code / reading            |
| `/about`                | Server page               | Bio, plain resume PDF link, social icons                 |
| `/narratives`           | Server page               | Published (curated) + Newsletter (Substack)              |
| `/code`                 | Server page               | Featured projects inline + flat list; `ItemList` JSON-LD |
| `/reading`              | Server page               | Manual in-repo reading log                               |
| `/slushpile`            | Rewrite                   | Proxied to `${SLUSHPILE_URL}/slushpile` when set         |
| `/colophon`             | Server page               | Typography, design, stack, tools, source                 |
| `/contact`              | Server page               | Contact form (server action)                             |
| `/terms`                | Server page               | DMCA + AI/ML training prohibition                        |
| `/links`                | Server page (bare layout) | Linktree-style social index                              |
| `/feed`                 | Route handler             | RSS 2.0 feed (Substack posts)                            |
| `/sitemap.xml`          | `app/sitemap.ts`          | Static routes + Fabulosa Books parts 1-7                 |
| `/robots.txt`           | `app/robots.ts`           | Disallows `/api/`, `/monitoring`; advertises sitemap     |
| `/manifest.webmanifest` | `app/manifest.ts`         | PWA manifest, `#f2ede4` theme color                      |
| `/opengraph-image`      | `app/opengraph-image.tsx` | Default OG image                                         |

Configured redirects (`next.config.ts`):

- `/narratives-code` → `/code` (permanent)
- `/narratives-code/:slug` → `/code` (permanent; was `/code/:slug`)
- `/code/:slug` → `/code` (permanent; sub-pages removed)
- `/residencies` → `/slushpile` (302; 404s until `SLUSHPILE_URL` is set)

Configured rewrites (`next.config.ts`, only when `SLUSHPILE_URL` is set):

- `/slushpile` → `${SLUSHPILE_URL}/slushpile`
- `/slushpile/:path*` → `${SLUSHPILE_URL}/slushpile/:path*`

The `/fabulosa-books/` tutorial is served as static assets out of `public/`
and surfaced in the sitemap (`part1.html` … `part7.html`).

### 3.1 Navigation

`app/(site)/Nav.tsx` renders the masthead and primary nav with conditional
slot composition:

- When `SLUSHPILE_URL` is unset: `Narratives · Code · Reading` (3 slots)
- When set: `Narratives · Code · Slushpile · Reading` (4 slots)

The masthead is the H1 on the home page and a link to `/` on every other page.

`lib/site/env.ts` is the **single source of truth** for `SLUSHPILE_URL` —
direct `process.env.SLUSHPILE_URL` reads outside this module are
disallowed (see §22 Intentional Decisions).

## 4. Home Page

`app/(site)/page.tsx`:

1. Statement section (Rumpus link, technical writing, AI tooling).
2. **Latest narrative** — most recent Substack post via `getSubstackPosts`.
3. **Latest code** — `latestProject` from [`lib/code/projects.ts`](lib/code/projects.ts) (most recent `addedAt`).
4. **Latest reading** — `latestBook` from [`lib/reading/books.ts`](lib/reading/books.ts) (currently-reading pinned, else most recent finished).

Each row is omitted (the whole `<section>` is not rendered) when its source
yields no entry.

## 5. Code Portfolio

`app/(site)/code/page.tsx` consumes [`lib/code/projects.ts`](lib/code/projects.ts), which
exports a typed `Project[]` with `featured: boolean` and `addedAt: YYYY-MM-DD`.
The page renders:

- A **Featured** section with `featuredProjects` inline (1–3 projects, longer writeups)
- An **Index** section with `listedProjects` as a flat list

It emits a JSON-LD `ItemList` of all projects.

There are no per-project sub-pages and no category groupings.

## 6. Narratives

`app/(site)/narratives/page.tsx` renders two sections:

- **Published** — hand-curated entries (Novel, 14 Hills, Rumpus editing)
- **Newsletter** — all Substack posts from `highschoolsmokers`

## 7. Reading

`app/(site)/reading/page.tsx` consumes [`lib/reading/books.ts`](lib/reading/books.ts), which
exports a typed `Book[]` with `finished: "YYYY-MM-DD" | "reading"`. The page
renders:

- **Currently reading** — books with `finished === "reading"`, pinned in array order
- **Finished** — sorted reverse-chronologically by `finished`

An empty-state copy ("Empty for the moment.") renders when both lists are empty.

## 8. Slushpile (external)

Slushpile is a separate Next.js app at `~/workspace/slushpile/` with its own
Drizzle ORM + Neon Postgres + LLM abstraction + agent pipeline (Collector,
Miner, Verifier, Grader, Personalizer) + shadcn UI. See that repo's
`spec.md`, `roadmap.md`, and `build-order.md` for product detail.

From ws-gong.com's perspective, slushpile is a path-mounted external app.
The mount is purely a `next.config.ts` rewrite + nav slot. Slushpile must
run with `basePath: "/slushpile"` so its `_next/static/*` chunks resolve
through the rewrite.

## 9. Contact Form

`app/(site)/contact/ContactForm.tsx` + server action
`app/(site)/contact/actions.ts:sendMessage` deliver messages over SMTP.

Anti-spam:

- Hidden `website` honeypot field — non-empty rejects the submission.
- Timing check — submissions earlier than `MIN_TIME_MS = 3000` after page
  load are rejected.

Attachments:

- Multipart upload, `MAX_FILES = 5`, per-file `MAX_FILE_SIZE = 5 MB`, total
  `MAX_TOTAL_ATTACHMENT_BYTES = 10 MB` (constants in [lib/upload.ts](lib/upload.ts)).
- `isBlockedAttachmentName` rejects executable extensions before buffering.

Email envelope: `from: SMTP_USER`, `to: CONTACT_EMAIL`, `replyTo: <user>`,
`subject: "[Contact Form] …"`, plain text, header `X-Source: contact-form`.

## 10. RSS Feed

`app/feed/route.ts` returns `application/rss+xml` for the channel
`https://www.ws-gong.com`. It includes all posts from
`getSubstackPosts(SUBSTACK_SUBDOMAIN)` as `<category>Newsletter</category>`
items.

`Cache-Control: s-maxage=3600, stale-while-revalidate`. The root layout
advertises the feed via `alternates.types["application/rss+xml"] = "/feed"`.

## 11. Substack Integration

[`lib/substack.ts`](lib/substack.ts) exports `SUBSTACK_SUBDOMAIN = "highschoolsmokers"`,
`SUBSTACK_BASE_URL`, and `getSubstackPosts(subdomain, limit = 10)`.

- Subdomain validated with `^[a-z0-9][a-z0-9-]{0,62}$`.
- `next.revalidate = 3600`, `AbortSignal.timeout(5000)`.
- Items parsed with `substackPostSchema` (Zod); failures dropped.
- Non-OK responses throw so Next's data cache retries on next request.
- Outer try/catch returns `[]` to the page so the section just disappears.

Posts surface on `/`, `/narratives`, and `/feed`. The footer subscribe link
on every page and the `/links` Linktree entry both use `SUBSTACK_BASE_URL`.

## 12. Theming

`app/components/ThemeToggle.tsx`:

- Three states: `system | light | dark`, cycled in that order.
- Persisted in `localStorage["theme"]`. `system` removes the key.
- Applied via `data-theme` attribute on `<html>`.
- Cross-tab sync via the `storage` event.

A tiny inline `<script>` in `app/layout.tsx`'s `<head>` reads
`localStorage.theme` and sets `data-theme` synchronously, before any CSS
evaluates `prefers-color-scheme`. `<html suppressHydrationWarning>` keeps
React from flagging the script-set attribute.

## 13. SEO & Metadata

Root metadata (`app/layout.tsx`):

- `metadataBase: https://www.ws-gong.com`
- Title template `"%s — W.S. Gong"`, default `"W.S. Gong"`
- Person JSON-LD with `worksFor`, `sameAs` (GitHub, LinkedIn, Substack,
  Instagram), `knowsAbout` keywords.
- OpenGraph site name + URL.

Per-page metadata is set on every route. `/code` adds an `ItemList` JSON-LD.

`app/sitemap.ts` computes `lastModified` from a module-level `buildTime`
constant, not `new Date()` per request, so the same crawl returns the same
timestamp across all URLs.

## 14. HTTP Headers (`next.config.ts`)

Applied to `(.*)`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Permissions-Policy` denies accelerometer, camera, geolocation,
  gyroscope, magnetometer, microphone, payment, usb, interest-cohort,
  browsing-topics
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
- Client SDK intentionally disabled ([instrumentation-client.ts](instrumentation-client.ts)
  exports nothing) to preserve Lighthouse 95.
- `withSentryConfig` (in `next.config.ts`):
  - org `high-school-smokers`, project `javascript-nextjs`
  - `tunnelRoute: "/monitoring"` (also disallowed in `robots.ts`)
  - `automaticVercelMonitors: true` — kept as a no-op for future crons
  - tree-shakes Sentry debug logging
- Server + edge captures cover contact-form errors and any unhandled route
  errors. No cron-driven captures remain in this repo.

## 16. Cron Jobs

None. The previous residency-miner pipeline (`/api/discover-sources`,
`/api/mine`, `/api/heartbeat`, `/api/prune-logs`) moved out of this repo
when the work was reframed as the slushpile app. `vercel.json` keeps only
its `ignoreCommand`.

## 17. Environment Variables

| Name                                               | Used in                | Purpose                                                      |
| -------------------------------------------------- | ---------------------- | ------------------------------------------------------------ |
| `SLUSHPILE_URL`                                    | nav slot + rewrite     | Upstream slushpile deployment. When unset, slot hidden + 404 |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | contact form           | SMTP credentials (port defaults to 465, secure)              |
| `CONTACT_EMAIL`                                    | contact form           | Inbox the form delivers to                                   |
| `SENTRY_DSN`                                       | Sentry instrumentation | Optional; observability disabled if unset                    |
| `BASE_URL`                                         | Playwright             | Override base URL in CI                                      |
| `VERCEL_AUTOMATION_BYPASS_SECRET`                  | Playwright             | Bypass Vercel preview protection in CI                       |

## 18. Testing

- **Unit:** `lib/code/projects.test.ts`, `lib/reading/books.test.ts` via `pnpm test:unit`
  (`node --test --experimental-strip-types`).
- **E2E:** Playwright tests under `e2e/` — accessibility, api, contact,
  content, fabulosa-books, metadata, navigation, reading, slushpile, smoke.
  Helpers in `e2e/helpers/`. Run on chromium / firefox / webkit, 2 workers,
  fully parallel.

## 19. Scripts

| Script           | Command                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `pnpm dev`       | `next dev`                                                           |
| `pnpm build`     | `next build`                                                         |
| `pnpm start`     | `next start`                                                         |
| `pnpm lint`      | `eslint`                                                             |
| `pnpm typecheck` | `tsc --noEmit`                                                       |
| `pnpm test:unit` | Node test runner over `lib/code/*.test.ts` + `lib/reading/*.test.ts` |
| `pnpm test:e2e`  | Playwright                                                           |
| `pnpm prepare`   | `husky`                                                              |

`scripts/make-favicon.mjs` is a one-shot generator used to produce
`public/apple-touch-icon.png` from the W.S. Gong mark.

## 20. Repository Layout

```
app/
  (site)/                site-shell route group (PageShell + Nav + footer)
    page.tsx             home (statement + 3 latest rows)
    Nav.tsx
    layout.tsx
    error.tsx
    about/
    code/                portfolio page (featured + index)
    colophon/
    contact/             real form + server action
    narratives/          Published + Newsletter sections
    reading/             manual reading log
    terms/
  (bare)/
    links/               linktree-style page
  feed/                  RSS 2.0
  layout.tsx, manifest.ts, opengraph-image.tsx, sitemap.ts, robots.ts,
  global-error.tsx, not-found.tsx
lib/
  code/
    projects.ts          typed Project[]; featured + addedAt
    projects.test.ts
  reading/
    books.ts             typed Book[]; reading-first ordering
    books.test.ts
  site/
    env.ts               SLUSHPILE_URL single source of truth
  substack.ts            Substack posts fetcher + SUBSTACK_SUBDOMAIN
  upload.ts              attachment limits + extension denylist
public/
  fabulosa-books/        static tutorial site (parts 1-7 + index)
  images/                site imagery
  wsgong_tech_writer_resume.pdf   resume (intentionally public)
  apple-touch-icon.png, *.svg
e2e/                     Playwright tests + helpers
scripts/                 make-favicon.mjs
docs/                    deployment.md
redesign.md              conceptual redesign spec
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
- Reintroduce `lib/residency-miner/`, Anthropic/Neon SDKs, or cron handlers — that work belongs in the slushpile repo (see §22).
- Write defensive code against conditions that can't occur given the types.

## 22. Intentional Decisions

Things that look like accidents but aren't. Each one was removed or deviated
from a "default" choice on purpose; do not regress them without revisiting
the rationale.

- **Slushpile lives in a separate repo and is mounted via Vercel rewrite.** Looks accidental: a major site surface with no code in this repo. Deliberate: slushpile has its own stack (Drizzle, six-agent architecture, shadcn UI) that does not belong inside the Swiss portfolio. Mount via `next.config.ts` rewrite to `${SLUSHPILE_URL}/slushpile/(.*)`; nav slot gated by env presence.
- **Resume PDF served as a static public asset.** The decorative HMAC gate is removed; the resume is intended to be findable. Do not reintroduce the gate without product justification.
- **`/code` flattened — no sub-pages, no categories.** 10 detail pages and 3 category groupings disappeared deliberately. The dual-citizen home plus featured-plus-list `/code` carries the engineering identity without resume-bloat.
- **Anthropic + Neon dependencies dropped.** The previous SPEC documented an Anthropic + Neon pipeline; that pipeline moved to the slushpile repo.
- **`SLUSHPILE_URL` has one reader.** `lib/site/env.ts` is the single source of truth; direct `process.env.SLUSHPILE_URL` reads anywhere else are an anti-pattern (rewrite + nav slot must agree on the flag state).
- **Client Sentry SDK disabled.** [instrumentation-client.ts](instrumentation-client.ts) is empty by design — the core SDK added ~65 KB of unused JS and ~2 s render delay, dropping portfolio pages below the Lighthouse 95 performance threshold. Server + edge instrumentation still runs via `instrumentation.ts`.
- **Public production source maps.** `productionBrowserSourceMaps: true` ships source maps so Lighthouse and the browser console can resolve minified frames back to original sources. The site has no proprietary client logic, so the disclosure is acceptable.
- **`automaticVercelMonitors: true` retained despite no crons.** Harmless when there is nothing to monitor; rearmed automatically if any future cron is added.
