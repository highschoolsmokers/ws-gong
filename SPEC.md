# ws-gong.com — Technical Specification

> **Status:** Reflects the one-page redesign (2026-11): the home page is the
> site, and its copy syncs from resumes-cvs (§23). [redesign.md](redesign.md)
> holds the earlier dual-citizen concept; where they differ, this file wins.

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

- `app/(site)/` — uses `PageShell` + `Nav` (header masthead, anchor nav into
  the home sections, footer with About / Colophon / Terms / Links / Subscribe /
  theme toggle).
- `app/(bare)/` — minimal layout for `/links` (Linktree-style page).

Top-level routes:

| Path                    | Type                      | Notes                                                        |
| ----------------------- | ------------------------- | ------------------------------------------------------------ |
| `/`                     | Server page               | One page: statement, Work, Writing, Reading, Résumé, Contact |
| `/about`                | Server page               | Bio (from `content/site.json`) and social links              |
| `/slushpile`            | Rewrite                   | Proxied to `${SLUSHPILE_URL}/slushpile` when set             |
| `/colophon`             | Server page               | Typography, design, stack, tools, source                     |
| `/contact`              | Server page               | Contact form (server action)                                 |
| `/terms`                | Server page               | DMCA + AI/ML training prohibition                            |
| `/links`                | Server page (bare layout) | Linktree-style social index                                  |
| `/feed`                 | Route handler             | RSS 2.0 feed (Substack posts)                                |
| `/sitemap.xml`          | `app/sitemap.ts`          | Static routes + Fabulosa Books parts 1-7                     |
| `/robots.txt`           | `app/robots.ts`           | Disallows `/api/`, `/monitoring`; advertises sitemap         |
| `/manifest.webmanifest` | `app/manifest.ts`         | PWA manifest, `#f2ede4` theme color                          |
| `/opengraph-image`      | `app/opengraph-image.tsx` | Default OG image                                             |

Configured redirects (`next.config.ts`; all temporary while the one-page layout settles):

- `/code`, `/code/:slug`, `/narratives-code`, `/narratives-code/:slug` → `/#work`
- `/narratives` → `/#writing`; `/reading` → `/#reading`; `/resume` → `/#resume`; `/contact` → `/#contact`
- `/residencies` → `/slushpile` (404s until `SLUSHPILE_URL` is set)

Configured rewrites (`next.config.ts`, only when `SLUSHPILE_URL` is set):

- `/slushpile` → `${SLUSHPILE_URL}/slushpile`
- `/slushpile/:path*` → `${SLUSHPILE_URL}/slushpile/:path*`

The `/fabulosa-books/` tutorial is served as static assets out of `public/`
and surfaced in the sitemap (`part1.html` … `part7.html`).

### 3.1 Navigation

`app/(site)/Nav.tsx` renders the masthead and an anchor nav into the home
sections: `Work · Writing · [Reading] · Résumé · Contact`, plus `Slushpile`
when `SLUSHPILE_URL` is set. `Reading` appears only when `lib/reading/books.ts`
has entries (the layout passes `readingEnabled`).

The masthead is the H1 on the home page and a home link on every other page.

`lib/site/env.ts` is the **single source of truth** for `SLUSHPILE_URL` —
direct `process.env.SLUSHPILE_URL` reads outside this module are
disallowed (see §22 Intentional Decisions).

## 4. Home Page

`app/(site)/page.tsx` is the site. Sections, numbered in order (an omitted
section leaves no gap in the numbering):

1. **Statement** — `content/site.json` → `statement`, one line per entry.
2. **Work** (`#work`) — `featuredProjects` then `listedProjects` from
   [`lib/code/projects.ts`](lib/code/projects.ts), hand-maintained. Emits the
   projects `ItemList` JSON-LD.
3. **Writing** (`#writing`) — Fiction (`site.published`), Editing
   (`site.editing`), and the five latest Substack posts with a subscribe link.
4. **Reading** (`#reading`) — up to five entries from
   [`lib/reading/books.ts`](lib/reading/books.ts) (currently reading first);
   omitted when the log is empty.
5. **Résumé** (`#resume`) — the PDF (`RESUME_PATH`), LinkedIn, GitHub
   (`site.links`).
6. **Contact** (`#contact`) — the contact form (§9).

Section and row primitives live in `app/(site)/_home/ui.tsx`.

## 5. Code Portfolio

The Work section (§4) renders `lib/code/projects.ts`: a typed `Project[]`
with `featured: boolean` and `addedAt: YYYY-MM-DD`. No per-project sub-pages,
no category groupings.

## 6. Writing

Fiction and editing entries come from `content/site.json` (§23); the
newsletter comes from Substack (§11).

## 7. Reading

[`lib/reading/books.ts`](lib/reading/books.ts) exports a typed `Book[]` with
`finished: "YYYY-MM-DD" | "reading"` and `orderedBooks` (currently reading
first, then finished, newest first).

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

`app/(site)/_home/ContactForm.tsx` + server action
`app/(site)/_home/actions.ts:sendMessage` deliver messages over SMTP. The form
renders at the end of the home page.

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

Posts surface on `/` (Writing) and `/feed`. The footer subscribe link
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
- Description built from `site.statement`; Person JSON-LD with `jobTitle`,
  `sameAs` (GitHub and LinkedIn from `site.links`, Substack, Instagram),
  `knowsAbout` keywords.
- OpenGraph site name + URL.

Per-page metadata is set on every route. `/` adds the projects `ItemList` JSON-LD.

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
| `BLOB_READ_WRITE_TOKEN`                            | `pnpm sync:resume`     | Local only (`.env.local`): uploads the resume PDF to Blob    |
| `RESUMES_CVS_DIR`                                  | `pnpm sync:resume`     | Path to the resumes-cvs checkout; default `../resumes-cvs`   |

## 18. Testing

- **Unit:** `lib/code/projects.test.ts`, `lib/reading/books.test.ts` via `pnpm test:unit`
  (`node --test --experimental-strip-types`).
- **E2E:** Playwright tests under `e2e/` — accessibility, api, contact,
  content, fabulosa-books, metadata, navigation, reading, slushpile, smoke.
  Helpers in `e2e/helpers/`. Run on chromium / firefox / webkit, 2 workers,
  fully parallel.

## 19. Scripts

| Script             | Command                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `pnpm dev`         | `next dev`                                                                                 |
| `pnpm build`       | `next build`                                                                               |
| `pnpm start`       | `next start`                                                                               |
| `pnpm lint`        | `eslint`                                                                                   |
| `pnpm typecheck`   | `tsc --noEmit`                                                                             |
| `pnpm test:unit`   | Node test runner over `lib/code/*.test.ts` + `lib/reading/*.test.ts`                       |
| `pnpm test:e2e`    | Playwright                                                                                 |
| `pnpm prepare`     | `husky`                                                                                    |
| `pnpm sync:resume` | `node scripts/sync-resume.ts`: pull site content and the resume PDF from resumes-cvs (§23) |

`scripts/make-favicon.mjs` is a one-shot generator used to produce
`public/apple-touch-icon.png` from the W.S. Gong mark.

## 20. Repository Layout

```
app/
  (site)/                site-shell route group (PageShell + Nav + footer)
    page.tsx             the one-page home (§4)
    _home/               section/row primitives, contact form + server action
    Nav.tsx
    layout.tsx
    error.tsx
    about/
    colophon/
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
    content-schema.ts    zod schema for content/site.json
    content.ts           parsed site copy (build-time)
    resume.ts            résumé PDF path and Blob URL
  substack.ts            Substack posts fetcher + SUBSTACK_SUBDOMAIN
  upload.ts              attachment limits + extension denylist
public/
  fabulosa-books/        static tutorial site (parts 1-7 + index)
  images/                site imagery
  apple-touch-icon.png, *.svg
e2e/                     Playwright tests + helpers
content/                 site.json: published bio, statement, entries (§23)
scripts/                 make-favicon.mjs, sync-resume.ts
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
- Commit a résumé document (PDF, DOCX, or résumé data in code). The PDF lives in Vercel Blob; résumé facts live in resumes-cvs.
- Hand-edit `content/site.json` or hardcode bio, statement, or published-entry text in a page. Change it in resumes-cvs and re-sync.

## 22. Intentional Decisions

Things that look like accidents but aren't. Each one was removed or deviated
from a "default" choice on purpose; do not regress them without revisiting
the rationale.

- **Slushpile lives in a separate repo and is mounted via Vercel rewrite.** Looks accidental: a major site surface with no code in this repo. Deliberate: slushpile has its own stack (Drizzle, six-agent architecture, shadcn UI) that does not belong inside the Swiss portfolio. Mount via `next.config.ts` rewrite to `${SLUSHPILE_URL}/slushpile/(.*)`; nav slot gated by env presence.
- **Resume PDF served publicly from Vercel Blob, not git.** The decorative HMAC gate is removed; the resume is intended to be findable. It lives in a public Blob store so no résumé document enters this public repo. Do not reintroduce the gate without product justification.
- **One page, not five.** `/narratives`, `/code`, `/reading`, `/resume`, and `/contact` folded into home sections (2026-11); `next.config.ts` redirects each to its anchor. Do not reintroduce section pages; add a home section instead. No page embeds the PDF, so every route keeps `frame-ancestors 'none'`.
- **Work is flat — no sub-pages, no categories.** Featured plus index carries the engineering identity without résumé bloat.
- **Anthropic + Neon dependencies dropped.** The previous SPEC documented an Anthropic + Neon pipeline; that pipeline moved to the slushpile repo.
- **`SLUSHPILE_URL` has one reader.** `lib/site/env.ts` is the single source of truth; direct `process.env.SLUSHPILE_URL` reads anywhere else are an anti-pattern (rewrite + nav slot must agree on the flag state).
- **Client Sentry SDK disabled.** [instrumentation-client.ts](instrumentation-client.ts) is empty by design — the core SDK added ~65 KB of unused JS and ~2 s render delay, dropping portfolio pages below the Lighthouse 95 performance threshold. Server + edge instrumentation still runs via `instrumentation.ts`.
- **Public production source maps.** `productionBrowserSourceMaps: true` ships source maps so Lighthouse and the browser console can resolve minified frames back to original sources. The site has no proprietary client logic, so the disclosure is acceptable.
- **`automaticVercelMonitors: true` retained despite no crons.** Harmless when there is nothing to monitor; rearmed automatically if any future cron is added.

## 23. Résumé Sync

The bio, home statement, published entries, and resume PDF come from the
resumes-cvs master résumé, not from hand-written page text.

- **Source.** In resumes-cvs, `.venv/bin/python -m resumekit web` writes `private/out/web/site.json` and `private/out/web/resume.pdf` (the devdocs base). `site.json` holds only statement, bio, fiction publications, the editing role, and the LinkedIn and GitHub links; the build refuses an email address or any guard Layer 3 error. The statement and bio live in the master's `## Website` section.
- **`pnpm sync:resume`.** Reads `$RESUMES_CVS_DIR/private/out/web/`, validates `site.json` against `lib/site/content-schema.ts`, writes `content/site.json`, uploads `resume.pdf` to the public Blob store at the fixed pathname (`BLOB_READ_WRITE_TOKEN` from `.env.local`), and prints the diff and the PDF URL. `--no-pdf` syncs the copy only. It never commits or deploys.
- **Readers.** The home statement, Writing, and Résumé links, the `/about` bio, the `/links` page, and the root metadata read `content/site.json` through `lib/site/content.ts`. Work stays hand-maintained in `lib/code/projects.ts`.
- **Publishing.** The user reviews the diff, commits `content/site.json`, and deploys with the Vercel CLI (the project is not Git-connected).
- **Privacy.** `content/site.json` holds only what the site shows. No résumé document enters git.
