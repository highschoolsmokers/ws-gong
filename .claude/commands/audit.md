---
description: Hard audit of ws-gong.com — code, site against docs/SPEC.md, design against the Swiss rules, and the live site. Applies code consolidations that change nothing visible; reports the rest for approval.
---

Run a hard, adversarial audit of this repo and the live site. Assume drift exists
and hunt for it. Step 6 applies code consolidations that change nothing visible;
everything else is reported and waits for approval (step 7).

Every finding gets: severity (blocker / drift / cleanup), `file:line` or URL, the
rule or SPEC section it breaks, and a one-line fix. No finding without evidence.

## 1. Mechanical (run them; report the output, not a summary of hopes)

```bash
pnpm lint && pnpm typecheck && pnpm test:unit
pnpm exec prettier --check .
pnpm build
pnpm audit --audit-level=moderate
```

Then start the production build (`pnpm start`) and run the full Playwright suite
against it on chromium, including `e2e/swiss.spec.ts`. A failing or skipped test
is a finding; name why it skipped.

## 2–4. Reviews (run as parallel subagents; each gets the paths, not your conclusions)

**2. Code against docs/SPEC.md.** Every factual claim in docs/SPEC.md must match the code:
the routes table vs `src/app/`; redirects, rewrites, and headers vs `next.config.ts`;
the environment table vs every `process.env` read; scripts vs `package.json`; the
layout tree vs the files on disk; §13 decisions vs `src/lib/guards.test.ts`.
Also the reverse: behavior in code that docs/SPEC.md doesn't describe.

**3. Code-level minimization.** Goal: the fewest lines that do the job.
Find dead code (unused exports, files, CSS classes, dependencies, env reads,
schema fields that are always empty), duplication to consolidate, abstractions
with one caller, defensive code against states the types rule out, stale
comments, and config with one setting. For each, give the consolidated form and
the lines saved.

**4. Design against docs/SPEC.md §6.1.** Render `/`, `/colophon`, `/terms`, `/links`,
a 404 at 1280 px and 375 px, light and dark. Check every element against the
seven rules — grid column lines, nothing in the margin, flush left, asymmetry,
weights 700/500/400, rules between rows only, token spacing — including what the
automated guards can't reach (footer, `/links`, overlays, error and 404 pages).

## 5. Live site

Against https://www.ws-gong.com: every sitemap URL and every redirect resolves as
docs/SPEC.md says; security headers match `next.config.ts`; no console errors on any
page (capture from page load, not after); the live copy matches
`content/site.json` on `main`. Note whether `main` equals `origin/main` and
whether production was deployed from it.

## 6. Consolidate (applied every run)

Apply every step-3 finding that leaves behavior and rendered output unchanged:
delete dead code, files, CSS, and dependencies; merge duplicates; inline
single-caller abstractions; drop defensive code and stale comments. Aim for the
fewest lines.

Prove it changed nothing a visitor sees:
1. Before editing, with the production build running, save each page's
   rendered HTML text and a 1280 px and 375 px screenshot (`/`,
   `/colophon`, `/terms`, `/links`, a 404), plus the response headers.
2. After editing, rebuild, rerun step 1, and capture the same set.
3. Any difference in text, markup structure, screenshots, or headers means a
   consolidation changed output: revert that change and report it instead.

Report each kept change with the lines saved, and the total.

## 7. Wait for approval

Anything that changes what a visitor sees, any design fix, any docs/SPEC.md rule
change, and anything outside this repo: report it and wait. Never commit, push,
or deploy.

## Output

One report, most severe first, grouped by step, with totals (findings by
severity, lines removed). End with the list of changes awaiting approval.
