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

| Path                                | Source                   | Notes                                                                   |
| ----------------------------------- | ------------------------ | ----------------------------------------------------------------------- |
| `/`                                 | `app/(site)/page.tsx`    | The site (§3)                                                           |
| `/about`                            | `app/(site)/about`       | Bio from `content/site.json`, profile icons                             |
| `/colophon`, `/terms`               | `app/(site)/…`           | Static pages                                                            |
| `/links`                            | `app/(bare)/links`       | Linktree-style list, no site chrome                                     |
| `/feed`                             | `app/feed/route.ts`      | RSS 2.0 of Substack posts, cached 1 h                                   |
| `/fabulosa-books/*`                 | `public/fabulosa-books/` | Static seven-part tutorial                                              |
| `/slushpile/*`                      | rewrite                  | Separate app at `SLUSHPILE_URL` (basePath `/slushpile`); 404 when unset |
| `/wsgong_tech_writer_resume.pdf`    | rewrite                  | Résumé PDF in public Vercel Blob storage                                |
| sitemap, robots, manifest, OG image | `app/*.ts(x)`            | Standard metadata routes                                                |

Redirects (temporary while the one-page layout settles): `/code/*` and
`/narratives-code/*` → `/#work`; `/narratives` → `/#writing`; `/reading`,
`/resume`, `/contact` → their anchors; `/residencies` → `/slushpile`.

`app/(site)/layout.tsx` wraps every page but `/links` in the masthead, the
anchor nav (`Nav.tsx`), and a footer: About, Colophon, Terms, Links,
Subscribe, theme toggle. The masthead is the H1 on `/` and a home link
elsewhere.

## 3. Home page

Numbered sections, each a label column (4 of 12) and a content column (8);
an omitted section leaves no gap in the numbering.

1. **Statement** — `site.statement`, one line each.
2. **Work** `#work` — featured, then the rest of `lib/code/projects.ts`
   (hand-maintained); emits an `ItemList` JSON-LD.
3. **Writing** `#writing` — fiction and editing from `site.json`, the five
   latest Substack posts, a subscribe link.
4. **Reading** `#reading` — up to five of `lib/reading/books.ts`, currently
   reading first; section and nav entry hidden while the log is empty.
5. **Résumé** `#resume` — PDF, LinkedIn, GitHub.
6. **Contact** `#contact` — the contact form (§5).

All layout comes from `app/components/ui.tsx`: `PageTitle`, `Section`,
`Rows`/`Row`, and `ext` (props for an external link).

## 4. Content sources

- `content/site.json` (§14), parsed at build time by `lib/site/content.ts`
  against `lib/site/content-schema.ts`. It also exports `profiles` (GitHub,
  LinkedIn, Substack, Instagram), the one list behind the About icons, the
  `/links` page, and the Person JSON-LD `sameAs`.
- `lib/code/projects.ts`: `{ href, title, description, stack, featured }[]`.
- `lib/reading/books.ts`: `{ title, author, finished: "YYYY-MM-DD" | "reading" }[]`.
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

Swiss grid: 12 columns, cream and near-black, Geist, label left and content
right, thin rules. Tokens live in `app/globals.css` as `light-dark()` values,
so one set covers both themes. `ThemeToggle` cycles system → light → dark,
stores the choice in `localStorage.theme`, and sets `data-theme` on `<html>`,
which pins `color-scheme`. An inline script in `app/layout.tsx` applies a
stored choice before first paint. Print styles hide the chrome and the form.

## 7. Metadata

Root metadata sets the title template `%s — W.S. Gong`, a description built
from the statement, the RSS alternate, and the Person JSON-LD. Every page sets
its own title and description. The sitemap uses one timestamp per build.

## 8. Headers and monitoring

Every route: `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy:
no-referrer`, two-year HSTS with preload, a Permissions-Policy denying unused
device and tracking features, and a CSP allowing only self plus Vercel
Analytics (`frame-ancestors 'none'`). Production browser source maps are
public. Sentry runs on the server and edge (`instrumentation.ts`: `register`
plus `onRequestError`); there is no client SDK.

## 9. Environment

| Name                                                                | Purpose                                                  |
| ------------------------------------------------------------------- | -------------------------------------------------------- |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL` | Contact form (port defaults to 465)                      |
| `SENTRY_DSN`                                                        | Optional; Sentry off when unset                          |
| `SLUSHPILE_URL`                                                     | Optional slushpile mount; read only in `lib/site/env.ts` |
| `BLOB_READ_WRITE_TOKEN`, `RESUMES_CVS_DIR`                          | `pnpm sync:resume`, local `.env.local` only              |
| `BASE_URL`, `VERCEL_AUTOMATION_BYPASS_SECRET`                       | Playwright target and preview bypass                     |

The Vercel project still holds unused variables from the old residency
pipeline (`DATABASE_URL` and the Postgres set, `ANTHROPIC_API_KEY`,
`CRON_SECRET`, `RESUME_SECRET`, `ADMIN_*`); remove them with `vercel env rm`.

## 10. Scripts and tests

`pnpm dev | build | start | lint | typecheck`, `pnpm test:unit` (Node test
runner over `lib/**/*.test.ts`: book ordering and the shape guards of §13),
`pnpm test:e2e` (Playwright on chromium, firefox, and webkit), and
`pnpm sync:resume` (§14). CI runs lint, typecheck, unit tests, a Prettier
check, the build, and `pnpm audit`.

## 11. Layout

```
app/(site)/        page.tsx (home), Nav, layout, ContactForm + actions, error,
                   about/, colophon/, terms/
app/(bare)/links/  Linktree page
app/components/    ui.tsx, icons.tsx, ThemeToggle.tsx
app/               layout, globals.css, feed/, sitemap, robots, manifest,
                   opengraph-image, not-found
lib/               code/projects, reading/books, site/{content,content-schema,
                   env,resume}, substack, upload
content/site.json  synced copy (§14)
scripts/           sync-resume.ts, make-favicon.mjs
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

`lib/site/shape.test.ts` pins these.

- **One page, not five.** Section pages folded into the home page (2026-11);
  add a section rather than a page.
- **Slushpile lives in its own repo**, mounted by a rewrite with its nav slot
  gated on `SLUSHPILE_URL`. The old residency miner, its crons, and the
  Anthropic and Neon dependencies moved there.
- **The résumé PDF is public, in Blob storage, not git**, with no access gate.
- **No client Sentry SDK.** It cost about 65 KB and 2 s of render time on
  static pages. Server and edge capture remain.
- **Work is flat**: featured plus index, no categories or per-project pages.

## 14. Résumé sync and publishing

The statement, bio, fiction credits, editing role, and LinkedIn and GitHub
links come from the resumes-cvs master, not from page text.

1. In resumes-cvs: `.venv/bin/python -m resumekit web` writes
   `private/out/web/site.json` and `resume.pdf` (the devdocs base). The
   statement and bio live in the master's `## Website` section. The build
   refuses an email address or any guard Layer 3 error.
2. Here: `pnpm sync:resume` validates `site.json`, writes `content/site.json`,
   prints the diff, and uploads the PDF to Blob at its fixed path. Use
   `--no-pdf` for the copy only. It never commits or deploys.
3. Review the diff, commit, and run `vercel deploy --prod` (the Vercel project
   is not Git-connected).
