# ws-gong

Personal site of W.S. Gong. Built with Next.js 16 (App Router), React 19, Tailwind 4, and deployed to Vercel.

The conceptual spec lives in [redesign.md](redesign.md). The implementation
spec lives in [SPEC.md](SPEC.md).

## Features

- **Home** — statement + latest narrative + latest code + latest reading
- **`/narratives`** — Published (curated) + Newsletter (Substack feed)
- **`/code`** — Featured projects + flat index; JSON-LD `ItemList`
- **`/reading`** — manual in-repo reading log
- **`/slushpile`** — mounted via rewrite to an external Next.js app (`SLUSHPILE_URL`); nav slot gated by env presence
- **`/about`** — bio, social links, plain resume PDF
- **`/contact`** — server-action contact form with SMTP delivery + spam guards
- **`/feed`** — RSS 2.0 of Substack newsletter posts

## Local development

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## Scripts

| Script           | Purpose                                                          |
| ---------------- | ---------------------------------------------------------------- |
| `pnpm dev`       | Next.js dev server                                               |
| `pnpm build`     | Production build                                                 |
| `pnpm lint`      | ESLint                                                           |
| `pnpm typecheck` | `tsc --noEmit`                                                   |
| `pnpm test:unit` | Node test runner (`lib/code/*.test.ts`, `lib/reading/*.test.ts`) |
| `pnpm test:e2e`  | Playwright                                                       |

## Required environment variables

Set these in Vercel (or `.env.local` for dev):

| Name                                               | Purpose                                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `SLUSHPILE_URL`                                    | Upstream slushpile deployment URL. When unset, `/slushpile` 404s + nav slot hidden |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Contact form delivery                                                              |
| `CONTACT_EMAIL`                                    | Inbox the form delivers to                                                         |
| `SENTRY_DSN`                                       | Sentry DSN (optional)                                                              |

## Deployment

Auto-deploys to Vercel on every push. `main` → production. Direct push to
`main` is blocked by the `pre-push` hook — use a PR.
