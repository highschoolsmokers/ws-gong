# ws-gong.com — Redesign Spec

## Posture

Dual-citizen personal site: writing and engineering treated as co-primary, no
hierarchy. The visual layer (Swiss tokens, 12-col grid, cream + black, Geist
sans, label-left + content-right pattern, theme toggle, print stylesheet) is
preserved unchanged from the current build.

**Slushpile is not part of this repo.** Slushpile is a self-contained Next.js
app maintained at `~/workspace/slushpile/` with its own database, LLM
abstraction, agents, crons, and UI system (shadcn/ui — not Swiss). From
ws-gong.com's perspective, slushpile is a **path-mounted external app**: the
nav slot links to `/slushpile`, and a Vercel rewrite proxies the path to the
slushpile deployment.

## Surfaces

### Top-nav (in order)

1. Narratives
2. Code
3. Slushpile _(rendered only when `SLUSHPILE_URL` is set)_
4. Reading

When `SLUSHPILE_URL` is unset, the nav is `Narratives · Code · Reading` and `/slushpile` 404s.

### Footer

About · Colophon · Terms · Contact · Links · Subscribe · theme toggle

### Home (`/`)

Statement (copy retained verbatim from current home), followed by three
"latest" rows **in this order**:

| On-screen label    | Source                       | Picks                                                |
| ------------------ | ---------------------------- | ---------------------------------------------------- |
| `Latest narrative` | Substack `highschoolsmokers` | Most recent post                                     |
| `Latest code`      | `lib/code/projects.ts`       | Project with most recent `addedAt`                   |
| `Latest reading`   | `lib/reading/books.ts`       | Most recent finished entry, or `"reading"` if pinned |

Each row renders nothing (the whole `<section>` is omitted) if its source
yields no entry — same conditional pattern the current home uses for Substack.

No Giacometti plate.

### `/narratives`

Two sections on one page:

- **Published** — hand-curated entries (Novel in progress, 14 Hills, Rumpus editing, future placements)
- **Newsletter** — Substack feed

### `/code`

1–3 featured projects with short writeups inline, followed by a flat list of
the remaining projects (title + 1-line description + outbound links). No
per-project sub-pages. The list below the featured block is flat (no
"AI Engineering / Developer Tools / Web & Design" groupings).

### `/slushpile` (mounted, not implemented here)

A `next.config.ts` rewrite proxies `ws-gong.com/slushpile/(.*)` to the
slushpile deployment URL (`SLUSHPILE_URL`). Slushpile must run with
`basePath: "/slushpile"`. This repo owns nothing inside this path — no pages,
no API routes, no data, no LLM, no crons.

### `/reading` (new)

Manual in-repo reading log. Each entry:

- title
- author
- finished date (`YYYY-MM-DD`) or `"reading"`
- optional note
- optional link

Reverse-chronological, with "currently reading" pinned on top.

### `/about`

Bio, social links, plain link to resume PDF. Kept as a page, demoted from
top-nav to footer.

Resume PDF is served as a static asset from `public/` and is **intentionally
indexable** — no `X-Robots-Tag`, no `Cache-Control: no-store`. The HMAC gate
that existed was decorative (for short-URL freshness in referrer logs), not
access control.

### Kept unchanged

`/colophon`, `/terms`, `/contact`, `/links`, `/feed` (RSS), `/sitemap.xml`,
`/robots.txt`, `/manifest.webmanifest`, theme toggle, print stylesheet,
Substack integration (`highschoolsmokers`), Vercel Analytics, Vercel Speed
Insights, Sentry server + edge instrumentation, all security headers (HSTS,
CSP, Permissions-Policy, etc.), `tunnelRoute: "/monitoring"`,
`productionBrowserSourceMaps`.

`automaticVercelMonitors: true` stays in `next.config.ts` — becomes a no-op
once crons are removed, but is harmless and future-proofs against new crons.

### Removed

- `/residencies` page + `ResidenciesList`
- `lib/residency-miner/` (entire directory) — pipeline, schema, migrations, prompts, dedupe, models, types, tests
- `app/api/{discover-sources,mine,heartbeat,prune-logs}/route.ts`
- All four cron entries in `vercel.json`
- `app/(site)/code/{slug}/` × 10 per-project sub-pages
- Resume HMAC gate: `app/api/resume/route.ts`, `app/api/resume/token/route.ts`, `lib/resumeToken.ts`, `ResumeLink` component
- Giacometti plate section on home

## Data sources

| Surface                    | Source                                                     |
| -------------------------- | ---------------------------------------------------------- |
| Home — latest narrative    | Substack `highschoolsmokers` (existing `getSubstackPosts`) |
| Home — latest code         | Local: `lib/code/projects.ts`                              |
| Home — latest reading      | Local: `lib/reading/books.ts`                              |
| `/narratives` — Published  | Hand-curated in the page module                            |
| `/narratives` — Newsletter | Substack `highschoolsmokers`                               |
| `/code`                    | Local: `lib/code/projects.ts`                              |
| `/slushpile/*`             | Vercel rewrite to `SLUSHPILE_URL` (external)               |
| `/reading`                 | Local: `lib/reading/books.ts`                              |
| `/about` resume link       | Static PDF in `public/`                                    |

## Environment

| Var                                                      | Status                                                      |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| `SLUSHPILE_URL`                                          | **New** — when set, enables `/slushpile` rewrite + nav slot |
| `DATABASE_URL`                                           | **Removed** (no Neon usage left in this repo)               |
| `ANTHROPIC_API_KEY`                                      | **Removed** (no Anthropic usage left in this repo)          |
| `CRON_SECRET`                                            | **Removed** (no crons left in this repo)                    |
| `RESUME_SECRET`                                          | **Removed**                                                 |
| `SENTRY_DSN`, `SMTP_*`, `CONTACT_EMAIL`, Playwright vars | Unchanged                                                   |

## Dependencies — net removal

`package.json` drops:

- `@anthropic-ai/sdk`
- `@neondatabase/serverless`

`package.json` keeps everything else (Sentry, nodemailer, Zod, Substack via `fetch`).

## Redirects

| From                     | To                                                             |
| ------------------------ | -------------------------------------------------------------- |
| `/narratives-code`       | `/code` _(unchanged)_                                          |
| `/narratives-code/:slug` | `/code` _(was `/code/:slug`)_                                  |
| `/code/:slug`            | `/code` _(new — sub-pages removed)_                            |
| `/residencies`           | `/slushpile` _(404s until `SLUSHPILE_URL` is set; acceptable)_ |

## Rewrites (new)

| From                | To                                                    |
| ------------------- | ----------------------------------------------------- |
| `/slushpile`        | `${SLUSHPILE_URL}/slushpile` _(only when set)_        |
| `/slushpile/:path*` | `${SLUSHPILE_URL}/slushpile/:path*` _(only when set)_ |

Implemented in `next.config.ts` `async rewrites()`. When `SLUSHPILE_URL` is
unset, the rewrites function returns `[]`, the path is unmounted, and Next
serves a 404 (no `/slushpile` route exists in `app/`).

## Intentional decisions

Things that look like accidents but aren't. Each one is removed or deviated
from a "default" choice on purpose.

1. **Slushpile lives in a separate repo and is mounted via Vercel rewrite.** Looks accidental: a major site surface with no code in this repo. Deliberate: slushpile has its own stack (Drizzle, six-agent architecture, shadcn UI) that does not belong inside the Swiss portfolio. Mount via `next.config.ts` rewrite to `${SLUSHPILE_URL}/slushpile/(.*)`; nav slot gated by env presence.
2. **Resume PDF served as a static public asset.** The decorative HMAC gate is removed; the resume is intended to be findable. Do not reintroduce the gate without product justification.
3. **`/code` flattened — no sub-pages, no categories.** 10 detail pages and 3 category groupings disappear deliberately. The dual-citizen home plus featured-plus-list `/code` carries the engineering identity without resume-bloat.
4. **Anthropic + Neon dependencies dropped.** The previous SPEC documented an Anthropic + Neon pipeline; that pipeline moved to the slushpile repo.
