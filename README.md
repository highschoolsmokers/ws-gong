# ws-gong

Personal site of W.S. Gong. Built with Next.js 16 (App Router), React 19, Tailwind 4, and deployed to Vercel.

## Features

- Portfolio pages: `/about`, `/code`, `/narratives`, `/colophon`, `/contact`
- Residency miner: automated weekly discovery + extraction of writing residencies and fellowships ([lib/residency-miner/](lib/residency-miner))
- Resume generator: Zod-validated profile → PDF via `pdfkit` ([lib/resumeEditor/](lib/resumeEditor))
- Gated resume endpoint with HMAC tokens (`/api/resume`)

## Local development

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## Scripts

| Script           | Purpose            |
| ---------------- | ------------------ |
| `pnpm dev`       | Next.js dev server |
| `pnpm build`     | Production build   |
| `pnpm lint`      | ESLint             |
| `pnpm typecheck` | `tsc --noEmit`     |
| `pnpm test:e2e`  | Playwright suite   |

## Required environment variables

Set these in Vercel (or `.env.local` for dev):

| Name                | Purpose                                                                       |
| ------------------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL`      | Neon Postgres connection string for the residency miner                       |
| `ANTHROPIC_API_KEY` | Used by `extract` + `discover-sources`                                        |
| `CRON_SECRET`       | Bearer token the Vercel cron sends to `/api/mine` and `/api/discover-sources` |
| `RESUME_SECRET`     | HMAC key for the gated resume PDF (**required in prod**)                      |
| `ADMIN_USER`        | HTTP Basic Auth user for `/code/resume-generator` and `/api/laboratory/*`     |
| `ADMIN_PASSWORD`    | HTTP Basic Auth password (same gate)                                          |
| `SENTRY_DSN`        | Sentry project DSN (optional — observability disabled if unset)               |

## Deployment

Crons (`vercel.json`): `/api/discover-sources` Sun 09:00 UTC, `/api/mine` Mon 09:00 UTC.
