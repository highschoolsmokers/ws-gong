# ws-gong.com — Specification

The personal site of W.S. Gong: a Next.js 16 App Router app on Vercel. One
page carries the work, writing, résumé, and contact form; its biographical
copy syncs from the resumes-cvs master résumé (§14). This file is the single
spec; the code should match it.

## 1. Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4,
Geist. Vercel hosting (Node ≥ 24), Nodemailer over SMTP, Zod, Sentry (server
and edge only), Vercel Analytics and Speed Insights. Playwright and the Node
test runner. ESLint 9, Prettier, Husky + lint-staged. pnpm.

## 2. Routes

| Path                                               | Source                   | Notes                                                                         |
| -------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------- |
| `/`                                                | `app/(site)/page.tsx`    | The site (§3)                                                                 |
| `/colophon`, `/terms`                              | `app/(site)/…`           | Static pages                                                                  |
| `/links`                                           | `app/(bare)/links`       | Instagram link-in-bio page on the grid; no site chrome, not in nav or sitemap |
| `/feed`                                            | `app/feed/route.ts`      | RSS 2.0 of Substack posts, cached 1 h                                         |
| `/fabulosa-books/*`                                | `public/fabulosa-books/` | Static seven-part tutorial; `/fabulosa-books` rewrites to its index           |
| `/slushpile/*`                                     | rewrite                  | Separate app at `SLUSHPILE_URL` (basePath `/slushpile`); 404 when unset       |
| `/wsgong_tech_writer_resume.pdf`, `/wsgong_cv.pdf` | rewrite                  | Résumé and public CV PDFs in public Vercel Blob storage                       |
| sitemap, robots, manifest, OG image                | `app/*.ts(x)`            | Standard metadata routes                                                      |

Redirects (temporary while the one-page layout settles): `/code/*` and
`/narratives-code/*` → `/#work`; `/about` → `/#about`; `/narratives` → `/#writing`; `/reading`,
`/resume`, `/contact` → their anchors; `/residencies` → `/slushpile`.

`app/(site)/layout.tsx` wraps every page but `/links` in the masthead, the
anchor nav (`Nav.tsx`, stacked in columns 11–12), and a footer: the copyright
in columns 1–4, Colophon, Terms, and Subscribe stacked from the
column-5 line, and the theme toggle on the column-11 line. The masthead is
the H1 on `/` and a home link elsewhere. `app/not-found.tsx` renders the 404
inside the same layout.

`/links` exists for the Instagram bio link: a short list of profiles for
visitors arriving from Instagram, laid out with the shared `Section` and
`Rows`. The site's nav, footer, and sitemap don't link to it.

## 3. Home page

An unnumbered lead, the **statement** (`site.statement`, one line each), then
numbered sections, each a label column (4 of 12) and a content column (8).
Section 00 is fixed; the rest count up from 01, and an omitted section leaves
no gap in the numbering.

- **00 About** `#about` — the portrait at the text block's width, directly
  above the writer bio, `site.bio[0]`. The former `/about` page folded in here.
- **Writing** `#writing` — fiction from `site.json`, the five latest
  Substack posts, a subscribe link.
- **Work** `#work` — one list, `lib/projects.ts` in array order
  (hand-maintained); emits an `ItemList` JSON-LD.
- **Reading** `#reading` — up to five of `lib/books.ts`, currently
  reading first; section and nav entry hidden while the log is empty.
- **Résumé** `#resume` — résumé PDF, CV PDF, then the profiles (LinkedIn,
  GitHub, Substack, Instagram).
- **Contact** `#contact` — the contact form (§5).

All layout comes from `app/components/ui.tsx`: `PageTitle`, `Section`,
`Rows`/`Row`, and `ext` (props for an external link).

## 4. Content sources

- `content/site.json` (§14), parsed at build time by `lib/site/content.ts`
  against `lib/site/content-schema.ts`. It also exports `profiles` (LinkedIn,
  GitHub, Substack, Instagram), the one list behind the Résumé rows, the
  `/links` page, and the Person JSON-LD `sameAs`.
- `lib/projects.ts`: `{ href, title, description, stack }[]`, shown in array order.
- `lib/books.ts`: `{ title, author, finished: "YYYY-MM-DD" | "reading", note?, link? }[]`.
- `lib/substack.ts`: `getSubstackPosts(limit)`, revalidated hourly, 5 s
  timeout. Returns `[]` on any failure so its section hides; a non-OK response
  throws first so the data cache retries rather than caching the empty list.

## 5. Contact form

`app/(site)/ContactForm.tsx` submits (via `onSubmit`, so a failed send keeps
the visitor's text) to the server action `app/(site)/actions.ts`. Spam
guards: a hidden `contact_hp` field that autofill and password managers are
told to skip, and a 3-second minimum measured on the visitor's own clock
(`_elapsed`). Visitors see one generic failure for guard, config, and SMTP
faults; the function log records the reason (`Contact form rejected: …`).
Attachments: up to 5 files, 4 MB total, executable extensions refused
(`lib/upload.ts`); `next.config.ts` raises the server-action body limit to
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
7. **Whitespace is structural.** Spacing comes from the tokens and the
   section rhythm, never ad hoc.

### 6.2 Tokens and theming

Tokens live in `app/globals.css` as `light-dark()` values: white and
near-black, one muted gray, one soft rule color, one error red (errors
only), Geist. `ThemeToggle` cycles
system → light → dark, stores the choice in `localStorage.theme`, and sets
`data-theme` on `<html>`, which pins `color-scheme`. An inline script in
`app/layout.tsx` applies a stored choice before first paint. Print styles hide
the chrome and the form.

### 6.3 Guards

- **Static** (`lib/shape.test.ts`, unit tests and CI): no off-grid
  alignment utilities in `app/` and no edge-pushing values in `globals.css`.
- **Rendered** (`e2e/swiss.spec.ts`, Playwright): on every page, the 404,
  and `/links`, at 1280 px and 375 px, the masthead, nav, footer, and section
  content start on a grid column line and end inside the grid, and no list
  draws a rule above its first row or below its last.
- **Hooks** (`.claude/settings.json`): after every edit, a Swiss-style review
  prompt flags violations of §6.1 in layout files, and a command hook flags
  e2e anti-patterns (fixed waits, `.nth()`, silent `.catch`).
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
no-referrer`, two-year HSTS with preload, a Permissions-Policy denying unused
device and tracking features, and a CSP allowing only self plus Vercel
Analytics (`frame-ancestors 'none'`). Production browser source maps are
public. Sentry runs on the server and edge (`instrumentation.ts`: `register`
plus `onRequestError`); there is no client SDK.

## 9. Environment

| Name                                                                | Purpose                                                                                                         |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL` | Contact form; port 465 uses TLS, others STARTTLS (default 465)                                                  |
| `SENTRY_DSN`                                                        | Optional; Sentry off when unset                                                                                 |
| `SLUSHPILE_URL`                                                     | Optional slushpile mount; app code reads it only in `lib/site/env.ts` (e2e specs read it directly)              |
| `BLOB_READ_WRITE_TOKEN`, `RESUMES_CVS_DIR`                          | `pnpm sync:resume`, local `.env.local` only                                                                     |
| `BASE_URL`, `VERCEL_AUTOMATION_BYPASS_SECRET`                       | Playwright target and preview bypass                                                                            |
| `IMAP_PASS`, `IMAP_USER`                                            | Mail-delivery e2e test; `IMAP_USER` defaults to `CONTACT_EMAIL`                                                 |
| `CI`                                                                | Playwright retries and reporter; required e2e secrets fail instead of skip                                      |
| `NODE_ENV`                                                          | Set by Next: development adds `'unsafe-eval'` to the CSP; Sentry samples 100% in development, 10% in production |

The Vercel project still holds unused variables from the old residency
pipeline (`DATABASE_URL` and the Postgres set, `ANTHROPIC_API_KEY`,
`CRON_SECRET`, `RESUME_SECRET`, `ADMIN_*`); remove them with `vercel env rm`.

## 10. Scripts and tests

`pnpm dev | build | start | lint | typecheck`, `pnpm test:unit` (Node test
runner over `lib/**/*.test.ts`: book ordering, the §13 shape guards, and the
§6.3 static Swiss guard),
`pnpm test:e2e` (Playwright on chromium, firefox, and webkit), and
`pnpm sync:resume` (§14). CI runs lint, typecheck, unit tests, a Prettier
check, the build, and `pnpm audit --audit-level=high`. The E2E workflow runs
the Playwright suite against a local production build on every PR and push to
main (CLI deploys send GitHub no deployment event). Tests tagged `@smtp` or
`@infra` send mail, so they run only on a manual dispatch against a deployed
URL.

## 11. Layout

```
app/(site)/        page.tsx (home), Nav, layout, ContactForm + actions, error,
                   colophon/, terms/, portrait.png
app/(bare)/links/  Linktree page
app/components/    ui.tsx, icons.tsx, ThemeToggle.tsx
app/               layout, globals.css, feed/, sitemap, robots, manifest,
                   opengraph-image, not-found, favicon.ico
lib/               projects, books (+ test), shape.test, site/{content,
                   content-schema, env, resume}, substack, upload
public/            fabulosa-books/ (static tutorial; its own styles, outside
                   §6.1), apple-touch-icon.png
content/site.json  synced copy (§14)
scripts/           sync-resume.ts
e2e/               Playwright specs + helpers
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

`lib/shape.test.ts` pins these.

- **One page, not five.** Section pages folded into the home page (2026-11);
  add a section rather than a page.
- **Slushpile lives in its own repo**, mounted by a rewrite with its nav slot
  gated on `SLUSHPILE_URL`. The old residency miner, its crons, and the
  Anthropic and Neon dependencies moved there.
- **The résumé PDF is public, in Blob storage, not git**, with no access gate.
- **No client Sentry SDK.** It cost about 65 KB and 2 s of render time on
  static pages. Server and edge capture remain.
- **Work is one flat list**: no featured tier, categories, or per-project pages.

## 14. Résumé sync and publishing

The statement, bio, fiction credits, and LinkedIn and GitHub links come from
the resumes-cvs master, not from page text.

1. In resumes-cvs: `.venv/bin/python -m resumekit web` writes
   `private/out/web/site.json`, `resume.pdf` (the devdocs base), and `cv.pdf`
   (the educational CV without its private sections, such as References). The
   statement and bio live in the master's `## Website` section. The build
   refuses an email address or any guard Layer 3 error.
2. Here: `pnpm sync:resume` validates `site.json`, writes `content/site.json`,
   prints the diff, and uploads both PDFs to Blob at their fixed paths (`PDFS` in
   `lib/site/resume.ts`). Use
   `--no-pdf` for the copy only. It never commits or deploys.
3. Review the diff, commit, and run `vercel deploy --prod` (the Vercel project
   is not Git-connected).
