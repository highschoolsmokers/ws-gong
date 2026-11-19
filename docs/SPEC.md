# ws-gong.com — Specification

The personal site of W.S. Gong. One home page holds the writing, code, CV, and
contact form. Copy, links, and PDFs sync from the résumé master (§14). This file
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
while the log is empty (decided at build).

**Chrome** (every page but `/links`): masthead, nav, footer. The masthead is
the h1 on `/`, a home link elsewhere. Nav: columns 11–12, stacked; on phones,
rows of three 4-column tracks. Footer: copyright (columns 1–4); Colophon,
Terms, Substack (from column 5); theme toggle (column 11). Footer links and
the toggle are at least 24 px tall to tap. Every link or form that opens a new
tab says so to screen readers (`NEW_TAB_NOTICE`), not on screen.

**Other pages.** Each is a title and labelled sections.

- 404: "404" and a home link. Error: "Error", Try again, Home.
- `/colophon`: Typography, Design, Content, Stack, Tools, Source. Stack and
  Tools come from `src/lib/colophon.ts`, which reads versions from the package
  manifest.
- `/terms`: Overview (last-updated date), What You May Do, Privacy,
  Third-Party Content, DMCA Policy, AI / ML Training. robots.txt blocks known
  AI-training crawlers and allows search.
- `/reading`: Currently reading, Finished.
- `/reading/<slug>`: title; author section (cover, date, rating, review;
  "Copy for Goodreads" in development only); Also on (when set); back link.
- `/links`: square portrait beside the name; Latest (newest Substack post,
  newest fiction credit, subscribe form); Links (main site, then every master
  link except Instagram, in master order).

**`/links` and Instagram.** Instagram allows one link, in the profile bio;
`/links` is where it points. It is built for a follower on a phone, arriving
from Instagram: who this is (the portrait matches the Instagram picture), what
is new (latest post and story, subscribe form), and where to go next (the main
site, the other profiles). It omits Instagram, since visitors come from there,
and nothing else on the site links to it. Everything on it updates from the
master and Substack. Set the bio link to `www.ws-gong.com/links?ref=ig` so
analytics can count visits from Instagram.

**Tutorial.** Plain HTML. Loads only self-hosted assets: no external fonts or
scripts. Code highlighting is baked into the HTML by `pnpm
highlight:tutorial`, which also makes each code block focusable so a keyboard
can scroll it. Its navs carry labels. Canonical index: `/fabulosa-books`. Follows the site's
stored theme. Exempt from §6.1.

## 3. Home page

Sections in order, each a label (columns 1–4) and content (5–12), numbered
from 00 with no gaps when one is hidden.

- **00 About**: portrait centered over the bio (the content's columns 3–6
  of 8; 2–7 on tablets; 3–10 of 12 on phones), bio below.
- **Writing**: Fiction credits (forthcoming first, unlinked); five latest
  Substack posts (hidden if the fetch fails); subscribe form. Substack refuses
  server sign-ups, so the form opens Substack's subscribe page with the email
  filled in; the reader confirms there.
- **Reading**: up to five books, current first, each linking to its review or
  link; then a link to `/reading`. Hidden while the log is empty.
- **Code**: hand-ordered list of selected projects; then "More on GitHub".
- **CV**: CV, résumé, then every master link not shown elsewhere on the page
  (GitHub is under Code; Substack is in Writing and the footer).
- **Contact**: the form (§5).

The statement is not shown; it feeds the description (§7). The home title and
share image carry the tagline, "Stories & Systems".

## 4. Content sources

- **Site copy**: `content/site.json` (§14): statement, bio, fiction credits,
  and links. Validated at build. Copy it lacks (tagline, job title, topics,
  feed description) sits beside it in `src/lib/site/content.ts`, one constant
  each.
- **Links**: every link the site shows, as label and URL, in the master's
  order. They feed the home page, `/links`, and the Person structured data;
  the Substack link also sets the feed and subscribe URLs. GitHub and Substack
  are required. A label without an icon gets a generic one.
- **Projects**: `src/lib/projects.ts`: href, title, description, stack. Shown in
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
  none and hides the list until the page next refreshes (within the hour).

## 5. Contact form

- Every field has a visible label above it; Subject reads "(optional)".
- Errors and the refused-attachment note are announced to screen readers; on
  success, focus moves to the confirmation.
- A failed send keeps the visitor's text.
- Spam guards: a hidden honeypot field; a server-signed timestamp, valid 3 s
  to 24 h after first focus.
- Limits: name and subject 200 characters, message 10,000; up to 5
  attachments, 4 MB total, no executable types. The form refuses a file past a
  limit and names it; the server refuses a message carrying one, never sends
  it with the file dropped.
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
7. **Structural space.** Gutter and margin tokens, the 0.25 rem scale, and
   named tokens in the stylesheet (type sizes, fine row spacing). No one-off
   values in markup.

### 6.2 Theme

White, near-black, one gray, a soft hairline color for row rules (section
rules are near-black), red for errors only. Light or
dark follows the system until the visitor picks one; the choice is stored and
applied before first paint. Print hides chrome and forms.

### 6.3 Guards

- **Static** (unit): no off-grid alignment or ornament classes or CSS in
  `src/app/` (share image excepted). It matches words in `.tsx` files, comments
  included, so they must avoid the banned words too; CSS comments are skipped.
  A bracketed value in markup must be built from a token (rule 7).
- **Rendered** (end to end): every page, a review page, the 404, and
  `/links`, at 1280 and 375 px: chrome and section content on column lines
  and inside the grid; no rule above a list's first row or below its last.
- **Editor hooks**: flag §6.1 violations after edits, and flaky test patterns
  (fixed waits, `.nth()`, silent catches, `name=` selectors).
- **Audit**: `/audit` checks code, spec, design, and the live site.

## 7. Metadata

Title template `%s — W.S. Gong`; the home title stands alone ("W.S. Gong —"
and the tagline). Description from the statement. Every page: RSS link, Person structured data, share image;
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
| `VERCEL`                                                            | Set by the host: renders the analytics scripts only on Vercel            |
| `SENTRY_DSN`                                                        | Optional; no monitoring when unset                                       |
| `SENTRY_AUTH_TOKEN`                                                 | Optional, build: uploads source maps                                     |
| `SLUSHPILE_URL`                                                     | Optional slushpile proxy; read in one place                              |
| `BLOB_READ_WRITE_TOKEN`, `RESUMES_CVS_DIR`                          | `pnpm sync`, local only; dir defaults to `../resumes-cvs`                |
| `BASE_URL`, `VERCEL_AUTOMATION_BYPASS_SECRET`                       | End-to-end target; preview bypass                                        |
| `IMAP_USER`, `IMAP_PASS`                                            | Mail-delivery test; user defaults to `CONTACT_EMAIL`                     |
| `MAIL_E2E`                                                          | Opt in to mail-sending tests                                             |
| `READING_FIXTURES`                                                  | End-to-end build and tests: use fixture books                            |
| `CI`                                                                | 4 workers, retries, no `.only`; missing test secrets fail                |
| `NODE_ENV`                                                          | Development: looser script policy, full trace sampling, Goodreads button |

Remove the stale host variables from the old residency pipeline
(`DATABASE_URL` and the Postgres set, `ANTHROPIC_API_KEY`, `CRON_SECRET`,
`RESUME_SECRET`, `ADMIN_*`).

## 10. Scripts and tests

- `pnpm dev | build | start | lint | typecheck`.
- `pnpm test:unit`: reading log, spoilers, form token, attachment limits (shared by form and server),
  colophon versus manifest, §13 pins, §6.3 static guard, §12 drift guards,
  and no client file importing server-only code.
- `pnpm test:e2e`: everything in Chromium; tests tagged `@cross` also in
  Firefox and WebKit. Locally: `READING_FIXTURES=1 pnpm build &&
READING_FIXTURES=1 pnpm test:e2e`.
- `pnpm sync` (§14), `pnpm covers` (§4), `pnpm highlight:tutorial`
  (§2).
- CI, on PRs: lint, typecheck, unit tests, format check, dependency audit
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
src/app/(site)/        home, layout, chrome (masthead, nav, footer), contact
                       form and action, error,
                       colophon/, terms/, reading/
src/app/(bare)/links/  /links and its icons
src/app/components/    layout primitives, shared rows, theme toggle, subscribe
                       form
src/app/               root layout, styles, portrait, feed/, metadata routes,
                       404
src/lib/               projects, books, colophon, form token, review,
                       substack, upload, site/ (content, env, schema:
                       site.json and PDFs), tests (guards.test: §6.3 static,
                       §12 drift, §13 pins)
content/               site.json (§14), reading/ (§4)
public/                fabulosa-books/, covers/, icons
scripts/               sync, fetch-covers, highlight-tutorial
docs/                  this spec
e2e/                   specs, helpers, fixtures/reading/
```

## 12. Guardrails and anti-patterns

### Guardrails

Each holds on every change; the parenthesis names what enforces it.

- **Content has one source.** Copy with a source (`site.json`, the reading
  log, Substack, the manifest) is read from it, never retyped in a page or
  test. (Review; tests read the same sources.)
- **Links come from the master.** No link is typed into code; every master
  link appears on the home page and on `/links` (Instagram excepted). (Drift
  guards; end-to-end tests.)
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

`src/lib/guards.test.ts` fails when spec and code disagree:

- §2 routes: every page is listed; every listed path is served.
- §2 redirects: sources and destinations match the configured redirects.
- §9 environment: every variable read is listed; every listed one is read
  (except those only tools read).
- §10 scripts: every package script is named; every named one exists.
- § references: every `§` in code, styles, commands, README, and spec has a
  heading.
- §11 layout: every listed path exists; every top-level folder is listed.
- Links: no `site.json` link typed into `src/` (project repo URLs
  excepted).

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

Pinned by `src/lib/guards.test.ts` (removals, dropped dependencies, project shape,
no email in `site.json`) and a lint rule (`SLUSHPILE_URL` read in one place).

- **One page.** Former section pages are home sections; add a section, not a
  page. Exception: `/reading`, whose reviews need their own URLs.
- **Slushpile is a separate repo**, proxied, its nav entry gated on
  `SLUSHPILE_URL`.
- **PDFs are public, in blob storage**, not git, with no gate.
- **No client error SDK**: it cost ~65 KB and ~2 s on static pages.
- **Code is one flat list**: no tiers, categories, or project pages.

## 14. Résumé sync and publishing

The master in resumes-cvs is the source for the statement, bio, fiction
credits, links, and both PDFs. New facts reach it through its update
interview, which ends by reminding the user to sync; Substack posts need
nothing (§4). A forthcoming credit is written `*Venue*, forthcoming.`; links
are `- Label: URL` under Website → `### Links {#site-links}`.

One command, `pnpm sync`, does everything:

1. Runs `resumekit web` in resumes-cvs, which writes `site.json`, `resume.pdf`,
   and `cv.pdf` (public sections only) to `private/out/web/` and refuses any
   email address or guard error.
2. Validates and writes `content/site.json`; prints the diff.
3. Uploads both PDFs to their fixed paths.
4. With `--pr`, commits `content/site.json` on a new branch and opens a PR.
   Merging deploys; `vercel deploy --prod` is the fallback.

`--no-pdf` skips the PDFs; `--no-build` reuses the last build.
