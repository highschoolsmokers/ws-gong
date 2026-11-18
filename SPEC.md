# ws-gong.com — Specification

The personal site of W.S. Gong: a Next.js 16 App Router app on Vercel. One
page carries the work, writing, résumé, and contact form; its biographical
copy syncs from the resumes-cvs master résumé (§14). This file is the single
spec; the code should match it.

## 1. Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4,
Geist. Vercel hosting (Node ≥ 24), Nodemailer over SMTP, Zod, Sentry (server
and edge only), Vercel Analytics and Speed Insights. Playwright and the Node
test runner. ESLint 9, Prettier, Husky + lint-staged. pnpm 12, pinned by
`packageManager` so Vercel and CI install with the same version.

## 2. Routes

| Path                                               | Source                   | Notes                                                                         |
| -------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------- |
| `/`                                                | `app/(site)/page.tsx`    | The site (§3)                                                                 |
| `/colophon`, `/terms`                              | `app/(site)/…`           | Static pages                                                                  |
| `/reading`, `/reading/<slug>`                      | `app/(site)/reading/`    | Reading log index and one page per reviewed book (§4)                         |
| `/links`                                           | `app/(bare)/links`       | Instagram link-in-bio page on the grid; no site chrome, not in nav or sitemap |
| `/feed`                                            | `app/feed/route.ts`      | RSS 2.0 of Substack posts and reviews (`Substack`, `Review`), cached 1 h      |
| `/fabulosa-books/*`                                | `public/fabulosa-books/` | Static seven-part tutorial; `/fabulosa-books` rewrites to its index (§11)     |
| `/slushpile/*`                                     | rewrite                  | Separate app at `SLUSHPILE_URL` (basePath `/slushpile`); 404 when unset       |
| `/wsgong_tech_writer_resume.pdf`, `/wsgong_cv.pdf` | rewrite                  | Résumé and public CV PDFs in public Vercel Blob storage                       |
| sitemap, robots, manifest, OG image                | `app/*.ts(x)`            | Standard metadata routes                                                      |

Redirects (permanent, 308): `/code/*` and `/narratives-code/*` → `/#code`;
`/about` → `/#about`; `/narratives` → `/#writing`; `/cv` and `/resume` →
`/#cv`; `/contact` → `/#contact`; `/reading` → `/` while the reading log is empty;
`/residencies` → `/slushpile`. The `/reading` redirect is decided when
`next.config.ts` loads, so restart `pnpm dev` after adding the first book.

`app/(site)/layout.tsx` wraps every page but `/links` in the masthead, the
anchor nav (`Nav.tsx`, stacked in columns 11–12), and a footer: the copyright
in columns 1–4, Colophon, Terms, and Substack stacked from the
column-5 line, and the theme toggle on the column-11 line. The masthead is
the H1 on `/` and a home link elsewhere. `app/not-found.tsx` renders the 404
inside the same layout.

`/links` exists for the Instagram bio link: a short list of profiles for
visitors arriving from Instagram, laid out with the shared `Section` and
`Rows`. The site's nav, footer, and sitemap don't link to it.

The Fabulosa tutorial is plain HTML under the site's CSP, so everything it
loads is self-hosted: Geist from `public/fabulosa-books/fonts/` (OFL), and no
external scripts (each page has one inline pre-paint theme script). Syntax highlighting is baked into the HTML by
`pnpm highlight:tutorial` (highlight.js, a dev dependency; colors in its
`style.css`); rerun it after editing any code sample. The tutorial's canonical index URL is
`/fabulosa-books` (no trailing slash, which 308s); the sitemap, the Code list,
and the Contents links in parts 1 and 7 use it. Its pages apply the site's stored theme
choice with the same pre-paint script as `app/layout.tsx`.

## 3. Home page

Numbered sections, straight after the masthead, each a label column (4 of 12) and a content column (8).
Section 00 is fixed; the rest count up from 01, and an omitted section leaves
no gap in the numbering. The statement (`site.statement`) isn't shown on the page; it
feeds the meta description and share text (§7).

- **00 About** `#about` — the portrait (4 of the content column's 8 columns;
  6 on phones), directly above the writer bio, `site.bio[0]`. The former `/about` page folded in here.
- **Writing** `#writing` — two lists, **Fiction** (credits from `site.json`)
  and **Substack** (the five latest posts; hidden when the fetch fails), then
  a Substack subscribe form. Forthcoming credits come first, with no link. Substack
  refuses sign-ups from other servers (403), so the form is a plain GET to
  Substack's subscribe page in a new tab, which prefills `email`; the reader
  confirms there.
- **Reading** `#reading` — up to five books, currently reading first, each
  linking to its review (or its `link`), then a link to `/reading`; section
  and nav entry hidden while the log is empty.
- **Code** `#code` — one list, `lib/projects.ts` in array order
  (hand-maintained); emits an `ItemList` JSON-LD.
- **CV** `#cv` — CV PDF, résumé PDF, then the profiles (LinkedIn,
  GitHub, Substack, Instagram).
- **Contact** `#contact` — the contact form (§5).

All layout comes from `app/components/ui.tsx`: `PageTitle`, `Section`,
`Rows`/`Row`, and `ext` (props for an external link).

## 4. Content sources

- `content/site.json` (§14), parsed at build time by `lib/site/content.ts`
  against `lib/site/content-schema.ts`. It also exports `profiles` (LinkedIn,
  GitHub, Substack, Instagram), the one list behind the CV section's rows, the
  `/links` page, and the Person JSON-LD `sameAs`. Copy that `site.json`
  doesn't carry lives beside it: `JOB_TITLE` and `KNOWS_ABOUT` (Person
  JSON-LD) and `FEED_DESCRIPTION` (the RSS channel); keep them in step with
  the statement.
- `lib/projects.ts`: `{ href, title, description, stack }[]`, shown in array order.
- `content/reading/<slug>.md` (format in its `README.md`): flat frontmatter
  (`title`, `author`, `finished: YYYY-MM-DD | reading`, optional `rating` 1–5,
  `isbn`, `note`, `link`, `substack`, `goodreads`) and a Markdown review.
  A ` # …` after an unquoted value is a comment; `lib/books.test.ts` parses
  the README's template so it stays valid. With `READING_FIXTURES` set (the
  E2E build only), `lib/books.ts` reads `e2e/fixtures/reading/` instead.
  `lib/books.ts` loads and validates them at build time (a bad file fails the
  build); a book with a review body gets `/reading/<slug>` with Review JSON-LD.
  `lib/review.ts` renders reviews with `marked`: `::: spoiler` blocks become
  `<details>` on the site, are left out of the feed, and become `<spoiler>`
  in the Goodreads copy (a "Copy for Goodreads" button in development only).
  Covers: `pnpm covers` saves Open Library covers to `public/covers/<slug>.jpg`
  for books with an `isbn`, so `img-src` stays `'self'`. Ratings show as "4/5".
  Reviews are written here first; Goodreads and Substack get manual copies.
- `lib/substack.ts`: `getSubstackPosts(limit)` over
  `/api/v1/posts`, which returns `{ posts, nextCursor }`; revalidated hourly, 5 s
  timeout. Returns `[]` on any failure so its section hides; a non-OK response
  throws first so the data cache retries rather than caching the empty list.

## 5. Contact form

`app/(site)/ContactForm.tsx` submits (via `onSubmit`, so a failed send keeps
the visitor's text) to the server action `app/(site)/actions.ts`. Spam
guards: a hidden `contact_hp` field that autofill and password managers are
told to skip, and a 3-second minimum on the server's clock. On first focus
the form asks the server action `issueFormToken` for a timestamp signed with
HMAC (`lib/form-token.ts`, keyed by `CONTACT_FORM_SECRET`, else `SMTP_PASS`);
a submission passes only with a valid token between 3 s and 24 h old
(`MIN_ELAPSED_MS`, `MAX_TOKEN_AGE_MS` in `lib/upload.ts`). Field checks run
first, so validation errors come back without waiting. Name and subject are
capped at 200 characters and the message at 10,000 (`MAX_LENGTH`: the form's
`maxLength` and the server both enforce it). Visitors see one generic failure for guard, config, and SMTP
faults; the function log records the reason (`Contact form rejected: …`).
Attachments: up to 5 files, 4 MB total, executable extensions refused, with
trailing dots and spaces stripped first (`lib/upload.ts`); `next.config.ts` raises the server-action body limit to
Vercel's 4.5 MB request cap. Mail goes from `SMTP_USER` to `CONTACT_EMAIL`,
reply-to the sender, subject `[Contact Form] …`, header
`X-Source: contact-form`.

## 6. Design and theming

The site follows the Swiss International Typographic Style (Müller-Brockmann,
_Grid Systems in Graphic Design_; Ruder, _Typographie_). These rules are
binding; §6.3 lists the guards that enforce them.

### 6.1 Rules

1. **The grid is the foundation.** One 12-column grid (`.swiss-grid`,
   `--gutter`, `--margin`, 72 rem maximum) governs every page. No element
   floats free of it.
2. **Everything sits on a column line, inside the grid.** An element starts
   on a column line and ends within the grid; nothing extends into the margin.
   When content is wider than its columns, it spans more columns; it never
   breaks the grid.
3. **Flush left, ragged right.** No right-aligned, centered, or justified
   text or blocks on the site. Alignment comes from position on the grid, not
   from pushing items to an edge (`ml-auto`, `justify-end`, `text-right`,
   `mx-auto` and the like are off-grid).
4. **Asymmetric balance.** Label left (columns 1–4), content right (5–12).
   The masthead takes columns 1–7; the nav takes columns 11–12, starting on
   the column-11 line.
5. **Hierarchy through scale and position, not decoration.** No shadows,
   gradients, rounded corners, or ornament. Weights: 700 for display (the
   masthead, page titles), 500 for titles, labels, and emphasis, 400 for body.
6. **Rules are structural.** A full rule tops each section. Lists draw
   hairlines between rows only: never above the first row or below the last,
   which would double the section rule.
7. **Whitespace is structural.** Gutters and margins come from the
   `--gutter` and `--margin` tokens; all other spacing from Tailwind's
   0.25 rem scale and the section rhythm. No arbitrary pixel values.

### 6.2 Tokens and theming

Tokens live in `app/globals.css` as `light-dark()` values: white and
near-black, one muted gray, one soft rule color, one error red (errors
only), Geist. `ThemeToggle` cycles
system → light → dark, stores the choice in `localStorage.theme`, and sets
`data-theme` on `<html>`, which pins `color-scheme`. An inline script in
`app/layout.tsx` applies a stored choice before first paint. Print styles hide
the chrome and the form.

### 6.3 Guards

- **Static** (`lib/shape.test.ts`, unit tests and CI): across every `.tsx`
  and `.css` file in `app/` (except `opengraph-image.tsx`), no off-grid
  alignment utilities or edge-pushing values, and no ornament: `rounded`,
  `shadow`, `bg-gradient`, `float`, `self-center`, or CSS `box-shadow`,
  `border-radius`, `gradient(`.
- **Rendered** (`e2e/swiss.spec.ts`, Playwright): on every page (one review
  page), the 404,
  and `/links`, at 1280 px and 375 px, the masthead, nav, footer, and section
  content start on a grid column line and end inside the grid, and no list
  draws a rule above its first row or below its last.
- **Hooks** (`.claude/settings.json`): after every edit, a Swiss-style review
  prompt flags violations of §6.1 in layout files, and a command hook flags
  e2e anti-patterns (fixed waits, `.nth()`, silent `.catch`, CSS `name=`
  selectors).
- **Audit** (`.claude/commands/audit.md`, `/audit`): the full code, spec,
  design, and live-site audit.

## 7. Metadata

Root metadata sets the title template `%s — W.S. Gong`, a description built
from the statement, the RSS alternate, the Person JSON-LD, and the site-wide
Open Graph fields (site name, type); pages set only a title and description,
which Next.js also uses for `og:title` and `og:description`, so every page
keeps the share image. The home page title is absolute. The sitemap uses one timestamp per build.

## 8. Headers and monitoring

Every route: `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy:
no-referrer`, `Cross-Origin-Opener-Policy: same-origin`, two-year HSTS with
preload, a Permissions-Policy denying unused device and tracking features, and
a CSP: self plus Vercel Analytics; `'unsafe-inline'` scripts and styles (Next's
inline bootstrap and the theme script; nonces would make every page dynamic);
`data:` images; `base-uri 'none'`, `object-src 'none'`, `form-action 'self'`
plus the Substack origin (the Substack subscribe form), and `frame-ancestors 'none'`. Production browser source maps are
public. Sentry runs on the server and edge (`instrumentation.ts`: `register`
plus `onRequestError`); there is no client SDK.

## 9. Environment

| Name                                                                | Purpose                                                                                                                                                              |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL` | Contact form; port 465 uses TLS, others STARTTLS (default 465)                                                                                                       |
| `CONTACT_FORM_SECRET`                                               | Optional key for the contact form's anti-spam token; falls back to `SMTP_PASS`                                                                                       |
| `SENTRY_DSN`                                                        | Optional; Sentry off when unset                                                                                                                                      |
| `SENTRY_AUTH_TOKEN`                                                 | Optional, build only: `withSentryConfig` uploads source maps when set                                                                                                |
| `SLUSHPILE_URL`                                                     | Optional slushpile mount; read only in `lib/site/env.ts`, by app code and the e2e suite alike                                                                        |
| `BLOB_READ_WRITE_TOKEN`, `RESUMES_CVS_DIR`                          | `pnpm sync:resume`, local `.env.local` only; `RESUMES_CVS_DIR` defaults to `../resumes-cvs`                                                                          |
| `BASE_URL`, `VERCEL_AUTOMATION_BYPASS_SECRET`                       | Playwright target and preview bypass                                                                                                                                 |
| `IMAP_PASS`, `IMAP_USER`                                            | Mail-delivery e2e test; `IMAP_USER` defaults to `CONTACT_EMAIL`                                                                                                      |
| `MAIL_E2E`                                                          | Opt in to the mail-sending e2e tests (`@smtp`, `@infra`), which are excluded otherwise                                                                               |
| `READING_FIXTURES`                                                  | E2E build and tests only: read `e2e/fixtures/reading/`; set at both or neither                                                                                       |
| `CI`                                                                | Playwright retries, reporter, workers, `forbidOnly`, no server reuse; required e2e secrets fail instead of skip; Sentry build output                                 |
| `NODE_ENV`                                                          | Set by Next: development adds `'unsafe-eval'` to the CSP; Sentry samples 100% in development, 10% in production; the Goodreads copy button shows only in development |

The Vercel project still holds unused variables from the old residency
pipeline (`DATABASE_URL` and the Postgres set, `ANTHROPIC_API_KEY`,
`CRON_SECRET`, `RESUME_SECRET`, `ADMIN_*`); remove them with `vercel env rm`.

## 10. Scripts and tests

`pnpm dev | build | start | lint | typecheck` (`next typegen && tsc`, so
route types exist on a clean checkout; delete a stale `.next/dev` if it
fails), `pnpm test:unit` (Node test
runner over `lib/**/*.test.ts`: reading-log parsing, ordering, and spoilers, the contact-form token and
attachment names, the colophon's stack and tools against `package.json`
(`lib/colophon.ts` reads versions from it; every runtime dependency must be
credited), the §13 shape guards, the §6.3 static Swiss guard, and a guard
that no `"use client"` file reaches a Node-only module through its imports,
which would otherwise surface as an opaque Turbopack panic),
`pnpm test:e2e` (Playwright: every test in Chromium; tests tagged `@cross`,
the engine-sensitive ones, also in Firefox and WebKit), and
`pnpm sync:resume` (§14), `pnpm covers` (§4), and `pnpm highlight:tutorial` (§2). CI runs lint, typecheck, unit tests, a Prettier
check, the build, and `pnpm audit --audit-level=high`
(`.github/workflows/checks.yml`); `pnpm-workspace.yaml` overrides patched
transitive versions and ignores one advisory with no fix yet, each with a note
on when to drop it. The E2E workflow (`browser.yml`) runs
the Playwright suite, in Playwright's Docker image, against a local
production build built with `READING_FIXTURES`, on every PR and push to main.
Tests tagged `@smtp` or `@infra` send mail, so they run only on a manual
dispatch against a deployed URL (or locally with `MAIL_E2E=1`); that step is
advisory (`continue-on-error`). Locally: `READING_FIXTURES=1 pnpm build &&
READING_FIXTURES=1 pnpm test:e2e`. Husky: `commit-msg` requires a conventional type (`feat`, `fix`,
`docs`, `refactor`, `chore`, …), `pre-commit` runs lint-staged, and `pre-push`
blocks any push that updates or deletes remote `main`, and otherwise runs
lint, typecheck, and unit tests (skipped when the push only deletes branches).

## 11. Layout

```
app/(site)/        page.tsx (home), Nav, layout, ContactForm + actions, error,
                   colophon/, terms/, reading/ (index, [slug] + CopyForGoodreads),
                   portrait.png
app/(bare)/links/  Linktree page
app/components/    ui.tsx, icons.tsx, ThemeToggle.tsx
app/               layout, globals.css, feed/, sitemap, robots, manifest,
                   opengraph-image, not-found, favicon.ico
lib/               projects, books (+ test), colophon (+ test), form-token (+ test), review,
                   shape.test, site/{content, content-schema, env, resume},
                   substack, upload
public/            fabulosa-books/ (static tutorial; its own styles, outside
                   §6.1), icon.svg, apple-touch-icon.png
content/site.json  synced copy (§14)
content/reading/   one Markdown file per book (§4)
public/covers/     book covers from `pnpm covers`
scripts/           sync-resume.ts, fetch-covers.ts, highlight-tutorial.ts
e2e/               Playwright specs, helpers, fixtures/reading/
```

## 12. Anti-patterns

- No abstraction without two callers; no config value with one setting.
- No defensive code against states the types rule out.
- Never catch errors to make a test pass.
- Flag any new dependency in the commit message.
- Never hand-edit `content/site.json` or hardcode bio, statement, or credits
  in a page; change the master in resumes-cvs and re-sync.
- Never commit a résumé document.

## 13. Intentional decisions

`lib/shape.test.ts` pins the removals and dropped dependencies below, the
project list's shape, and §12's rule that `site.json` carries no email; the
ESLint rule in `eslint.config.mjs` pins the `SLUSHPILE_URL` gate.

- **One page, not five.** Section pages folded into the home page (2026-11);
  add a section rather than a page. The one exception is `/reading` and its
  review pages (2026-11): reviews are long-form text with their own URLs.
- **Slushpile lives in its own repo**, mounted by a rewrite with its nav slot
  gated on `SLUSHPILE_URL`. The old residency miner, its crons, and the
  Anthropic and Neon dependencies moved there.
- **The résumé PDF is public, in Blob storage, not git**, with no access gate.
- **No client Sentry SDK.** It cost about 65 KB and 2 s of render time on
  static pages. Server and edge capture remain.
- **Code is one flat list**: no featured tier, categories, or per-project pages.

## 14. Résumé sync and publishing

The statement, bio, fiction credits, and LinkedIn and GitHub links
come from the resumes-cvs master, not from page text. In the master: a
forthcoming credit is written `*Venue*, forthcoming.`.

1. In resumes-cvs: `.venv/bin/python -m resumekit web` writes
   `private/out/web/site.json`, `resume.pdf` (the devdocs base), and `cv.pdf`
   (the educational CV without its private sections, such as References). The
   statement and bio live in the master's `## Website` section. The build
   refuses an email address or any guard Layer 3 error.
2. Here: `pnpm sync:resume` validates `site.json`, writes `content/site.json`,
   prints the diff, and uploads both PDFs to Blob at their fixed paths (`PDFS` in
   `lib/site/resume.ts`). Use
   `--no-pdf` for the copy only. It never commits or deploys.
3. Review the diff, commit, and open a PR; merging to `main` deploys (the
   Vercel project is Git-connected; `vercel deploy --prod` is the manual
   fallback).
