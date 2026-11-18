# ws-gong.com — Specification

The personal site of W.S. Gong. One home page holds the writing, code, CV, and
contact form. Biographical copy syncs from the résumé master (§14). This file
is the single spec; the code must match it.

## 1. Stack

Only this section names tools; the rest describes behavior.

- Framework: Next.js 16 (App Router), React 19, TypeScript.
- Styling: Tailwind CSS 4. Typeface: Geist, self-hosted.
- Hosting: Vercel (Node ≥ 24); blob storage for the PDFs.
- Services: SMTP mail (Nodemailer), Substack, Open Library, Sentry (server
  only), Vercel Analytics and Speed Insights.
- Libraries: Zod (validation), marked (reviews), highlight.js (tutorial build).
- Tests: Playwright (end to end), Node test runner (unit).
- Tooling: pnpm 12 (pinned), ESLint, Prettier, Husky, lint-staged.

## 2. Routes

| Path                                               | Content                                                     |
| -------------------------------------------------- | ----------------------------------------------------------- |
| `/`                                                | Home (§3)                                                   |
| `/colophon`                                        | How the site is made                                        |
| `/terms`                                           | Terms, privacy, DMCA                                        |
| `/reading`, `/reading/<slug>`                      | Reading log; one page per reviewed book (§4)                |
| `/links`                                           | Instagram bio page; no chrome, not in nav or sitemap        |
| `/feed`                                            | RSS: Substack posts and reviews; cached 1 h                 |
| `/fabulosa-books/*`                                | Static seven-part tutorial                                  |
| `/slushpile/*`                                     | Separate app, proxied when `SLUSHPILE_URL` is set; else 404 |
| `/wsgong_cv.pdf`, `/wsgong_tech_writer_resume.pdf` | Proxied from blob storage                                   |
| sitemap, robots, manifest, share image             | Standard metadata                                           |

Permanent redirects: `/about` → `/#about`; `/narratives` → `/#writing`;
`/code/*`, `/narratives-code/*` → `/#code`; `/cv`, `/resume` → `/#cv`;
`/contact` → `/#contact`; `/residencies` → `/slushpile`; `/reading` → `/`
while the log is empty (decided at server start).

**Chrome** (every page but `/links`): masthead, nav, footer. The masthead is
the h1 on `/`, a home link elsewhere. Nav: columns 11–12, stacked; on phones,
two rows on three 4-column tracks. Footer: copyright (columns 1–4); Colophon,
Terms, Substack (from column 5); theme toggle (column 11).

**Other pages.** Each is a title and labelled sections.

- 404: "404" and a home link. Error: "Error", Try again, Home.
- `/colophon`: Typography, Design, Content, Stack, Tools, Source. Stack and
  Tools come from `lib/colophon.ts`, which reads versions from the package
  manifest.
- `/terms`: Overview (last-updated date), What You May Do, Privacy,
  Third-Party Content, DMCA Policy, AI / ML Training. robots.txt blocks known
  AI-training crawlers and allows search.
- `/reading`: Currently reading, Finished.
- `/reading/<slug>`: title; author section (cover, date, rating, review;
  "Copy for Goodreads" in development only); Also on (when set); back link.
- `/links`: square portrait beside the name; Latest (newest Substack post,
  newest fiction credit, subscribe form); Links (main site first, then
  profiles without Instagram, then Fabulosa Books).

**Tutorial.** Plain HTML. Loads only self-hosted assets: no external fonts or
scripts. Code highlighting is baked into the HTML by `pnpm
highlight:tutorial`. Canonical index: `/fabulosa-books`. Follows the site's
stored theme. Exempt from §6.1.

## 3. Home page

Sections in order, each a label (columns 1–4) and content (5–12), numbered
from 00 with no gaps when one is hidden.

- **00 About**: portrait (4 of the content's 8 columns; 6 on phones), bio
  below.
- **Writing**: Fiction credits (forthcoming first, unlinked); five latest
  Substack posts (hidden if the fetch fails); subscribe form. Substack refuses
  server sign-ups, so the form opens Substack's subscribe page with the email
  filled in; the reader confirms there.
- **Reading**: up to five books, current first, each linking to its review or
  link; then a link to `/reading`. Hidden while the log is empty.
- **Code**: hand-ordered list of selected projects; then "More on GitHub".
- **CV**: CV, résumé, LinkedIn, Instagram.
- **Contact**: the form (§5).

The statement is not shown; it feeds the description and share text (§7).

## 4. Content sources

- **Site copy**: `content/site.json` (§14): statement, bio, fiction credits,
  profile links. Validated at build. Copy it lacks (job title, topics, feed
  description) sits beside it and tracks the statement. One profile list feeds
  the CV section, `/links`, and the Person structured data.
- **Projects**: `lib/projects.ts`: href, title, description, stack. Shown in
  order.
- **Reading log**: one Markdown file per book in `content/reading/` (format
  in its README). Frontmatter: title, author, finished (date or `reading`);
  optional rating 1–5, ISBN, note, link, Substack and Goodreads URLs. A body
  is a review and gets its own page with Review structured data. A bad file
  fails the build. `::: spoiler` blocks fold on the site, drop from the feed,
  and become `<spoiler>` in the Goodreads copy. Ratings read "4/5".
  `pnpm covers` saves covers by ISBN to `public/covers/`. Reviews are written
  here first; other copies are manual. End-to-end builds read
  `e2e/fixtures/reading/` instead (`READING_FIXTURES`).
- **Substack**: latest posts, refreshed hourly, 5 s timeout. A failure yields
  none, hides the list, and is retried on the next request.

## 5. Contact form

- A failed send keeps the visitor's text.
- Spam guards: a hidden honeypot field; a server-signed timestamp, valid 3 s
  to 24 h after first focus.
- Limits: name and subject 200 characters, message 10,000; up to 5
  attachments, 4 MB total, no executable types.
- Field errors return at once. Every other failure shows one generic message
  and logs the reason.
- Mail: from the site account to `CONTACT_EMAIL`, reply-to the sender,
  subject `[Contact Form] …`, header `X-Source: contact-form`.

## 6. Design and theming

Swiss International Typographic Style (Müller-Brockmann, _Grid Systems in
Graphic Design_; Ruder, _Typographie_). Binding; §6.3 enforces it.

### 6.1 Rules

1. **One grid.** 12 columns, fixed gutter and margin, 72 rem maximum, on
   every page.
2. **On the grid.** Every element starts on a column line and ends inside the
   grid. Wider content spans more columns; nothing enters the margin.
3. **Flush left.** No centered, right-aligned, or justified text or blocks;
   no pushing to an edge. Position comes from columns.
4. **Asymmetry.** Labels columns 1–4, content 5–12; masthead 1–7; nav 11–12.
5. **No ornament.** No shadows, gradients, or rounded corners. Weights: 700
   display, 500 titles and labels, 400 text.
6. **Structural rules.** A full rule tops each section. Lists rule between
   rows only.
7. **Structural space.** Gutter and margin tokens; otherwise the 0.25 rem
   scale. No arbitrary values.

### 6.2 Theme

White, near-black, one gray, one rule color, red for errors only. Light or
dark follows the system until the visitor picks one; the choice is stored and
applied before first paint. Print hides chrome and forms.

### 6.3 Guards

- **Static** (unit): no off-grid alignment or ornament classes or CSS in
  `app/` (share image excepted). The check matches words, so comments must
  avoid them too.
- **Rendered** (end to end): every page, a review page, the 404, and
  `/links`, at 1280 and 375 px: chrome and section content on column lines
  and inside the grid; no rule above a list's first row or below its last.
- **Editor hooks**: flag §6.1 violations after edits, and flaky test patterns
  (fixed waits, `.nth()`, silent catches, `name=` selectors).
- **Audit**: `/audit` checks code, spec, design, and the live site.

## 7. Metadata

Title template `%s — W.S. Gong`; the home title stands alone. Description from
the statement. Every page: RSS link, Person structured data, share image;
pages set only title and description. One sitemap timestamp per build.

## 8. Headers and monitoring

Every route: no MIME sniffing, no framing, no referrer, same-origin opener,
two-year HSTS with preload, unused device features denied. Content policy:
self, plus analytics scripts; inline scripts and styles (framework bootstrap,
theme script); `data:` images; no `<base>` or plugins; forms post to self or
Substack; no framing. Public source maps. Server errors go to Sentry; no
client SDK.

## 9. Environment

| Name                                                                | Use                                                                      |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL` | Contact mail; port 465 is TLS (default), others STARTTLS                 |
| `CONTACT_FORM_SECRET`                                               | Optional token key; defaults to `SMTP_PASS`                              |
| `SENTRY_DSN`                                                        | Optional; no monitoring when unset                                       |
| `SENTRY_AUTH_TOKEN`                                                 | Optional, build: uploads source maps                                     |
| `SLUSHPILE_URL`                                                     | Optional slushpile proxy; read in one place                              |
| `BLOB_READ_WRITE_TOKEN`, `RESUMES_CVS_DIR`                          | `pnpm sync:resume`, local only; dir defaults to `../resumes-cvs`         |
| `BASE_URL`, `VERCEL_AUTOMATION_BYPASS_SECRET`                       | End-to-end target; preview bypass                                        |
| `IMAP_USER`, `IMAP_PASS`                                            | Mail-delivery test; user defaults to `CONTACT_EMAIL`                     |
| `MAIL_E2E`                                                          | Opt in to mail-sending tests                                             |
| `READING_FIXTURES`                                                  | End-to-end build and tests: use fixture books                            |
| `CI`                                                                | Stricter, serial test runs; missing test secrets fail                    |
| `NODE_ENV`                                                          | Development: looser script policy, full error sampling, Goodreads button |

Remove the stale host variables from the old residency pipeline
(`DATABASE_URL` and the Postgres set, `ANTHROPIC_API_KEY`, `CRON_SECRET`,
`RESUME_SECRET`, `ADMIN_*`).

## 10. Scripts and tests

- `pnpm dev | build | start | lint | typecheck`.
- `pnpm test:unit`: reading log, spoilers, form token, attachment names,
  colophon versus manifest, §13 pins, §6.3 static guard, §12 drift guards,
  and no client file importing server-only code.
- `pnpm test:e2e`: everything in Chromium; tests tagged `@cross` also in
  Firefox and WebKit. Locally: `READING_FIXTURES=1 pnpm build &&
READING_FIXTURES=1 pnpm test:e2e`.
- `pnpm sync:resume` (§14), `pnpm covers` (§4), `pnpm highlight:tutorial`
  (§2).
- CI: lint, typecheck, unit tests, format check, build, dependency audit
  (high). The end-to-end suite runs against a production build on every PR
  and push to `main`. Mail tests (`@smtp`, `@infra`) run only on manual
  dispatch, advisory.
- Dependency overrides and ignored advisories live in `pnpm-workspace.yaml`,
  each with a note on when to drop it.
- Hooks: commit messages need a conventional type; pre-commit formats and
  lints staged files; pre-push refuses pushes that change remote `main`, and
  otherwise runs lint, typecheck, and unit tests.

## 11. Layout

```
app/(site)/        home, nav, layout, contact form and action, error,
                   colophon/, terms/, reading/, portrait
app/(bare)/links/  /links
app/components/    layout primitives, icons, theme toggle, subscribe form
app/               root layout, styles, feed/, metadata routes, 404
lib/               projects, books, colophon, form token, review, substack,
                   upload, site/ (content, schema, env, PDFs), tests
content/           site.json (§14), reading/ (§4)
public/            fabulosa-books/, covers/, icons
scripts/           sync-resume, fetch-covers, highlight-tutorial
e2e/               specs, helpers, fixtures/reading/
```

## 12. Guardrails and anti-patterns

### Guardrails

Each holds on every change; the parenthesis names what enforces it.

- **Content has one source.** Copy with a source (`site.json`, the reading
  log, Substack, the manifest) is read from it, never retyped in a page or
  test. (Review; tests read the same sources.)
- **No personal data in git.** No email in `site.json`; no résumé documents.
  (Unit test; ignore rules.)
- **Self-hosted by default.** A new external origin needs a content-policy
  change, a Terms Privacy update, and a reason. (Headers; §8.)
- **Privacy matches behavior.** Any change to what the site collects or sends
  updates Terms → Privacy in the same change. (Review.)
- **External services fail soft.** A down service hides its section; the page
  still renders. (Code; end-to-end tests.)
- **Secrets stay on the server.** No secret reaches client code;
  `SLUSHPILE_URL` is read in one place. (Lint rule; client-import test.)
- **Every dependency is accounted for.** Runtime dependencies appear in the
  Colophon; new ones are named in the commit. (Unit test; review.)
- **Design rules hold.** §6.1, checked by §6.3.
- **`main` changes only through PRs.** Every push passes lint, typecheck, and
  unit tests; every PR passes CI and the end-to-end suite. Merging deploys,
  so wait for the preview deploy before merging. (Hooks; CI.)
- **The spec moves with the code.** A change that alters behavior here
  updates this file in the same PR. (Drift guards; `/audit`.)

### Drift guards

`lib/spec.test.ts` fails when spec and code disagree:

- §2 routes: every page is listed; every listed path is served.
- §2 redirects: sources match the configured redirects.
- §9 environment: every variable read is listed; every listed one is read
  (except those only tools read).
- §10 scripts: every package script is named; every named one exists.
- § references: every `§` in code and spec has a heading.
- §11 layout: every listed path exists; every top-level folder is listed.

Claims it can't check (copy, design intent) are covered by §6.3 and `/audit`.

### Anti-patterns

- An abstraction with one caller; a config value with one setting.
- Defensive code against states the types rule out.
- Catching errors to make a test pass.
- Hand-editing `content/site.json`, or hard-coding bio, statement, credits,
  versions, or other sourced copy.
- A new page where a home section would do (§13).
- Client JavaScript where a plain link or form works.
- Layout off the grid: centering, edge-pushing, arbitrary sizes, ornament.
- Tests that sleep, index by position, swallow errors, or assert copy instead
  of reading its source.
- Hand-editing generated output: the tutorial's highlighted code, covers.
- Committing a résumé or any personal document.

## 13. Intentional decisions

Pinned by `lib/shape.test.ts` (removals, dropped dependencies, project shape,
no email in `site.json`) and a lint rule (`SLUSHPILE_URL` read in one place).

- **One page.** Former section pages are home sections; add a section, not a
  page. Exception: `/reading`, whose reviews need their own URLs.
- **Slushpile is a separate repo**, proxied, its nav entry gated on
  `SLUSHPILE_URL`.
- **PDFs are public, in blob storage**, not git, with no gate.
- **No client error SDK**: it cost ~65 KB and ~2 s on static pages.
- **Code is one flat list**: no tiers, categories, or project pages.

## 14. Résumé sync and publishing

Statement, bio, fiction credits, and LinkedIn and GitHub links come from the
master in resumes-cvs. A forthcoming credit is written `*Venue*, forthcoming.`

1. In resumes-cvs, `.venv/bin/python -m resumekit web` writes `site.json`,
   `resume.pdf`, and `cv.pdf` (public sections only) to `private/out/web/`.
   It refuses any email address or guard error.
2. Here, `pnpm sync:resume` validates and writes `content/site.json`, prints
   the diff, and uploads both PDFs to their fixed paths (`--no-pdf` skips
   them). It never commits or deploys.
3. Review, commit, open a PR. Merging to `main` deploys; `vercel deploy
--prod` is the fallback.
