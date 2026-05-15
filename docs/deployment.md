# Deployment

## Environments

| Env        | Source                                  | When                  |
| ---------- | --------------------------------------- | --------------------- |
| Production | `main` branch, auto-deploy              | Every merge to `main` |
| Preview    | Any other branch, auto-deploy           | Every push            |
| Local      | `pnpm dev` / `pnpm build && pnpm start` | Developer machine     |

Direct pushes to `main` are blocked by the `pre-push` hook. Use a PR.

## Build pipeline

1. **pre-commit** (husky) — `lint-staged` runs Prettier and ESLint on staged files.
2. **pre-push** (husky) — blocks push to `main`; runs `pnpm lint` + `pnpm typecheck` (fast, ~5s).
3. **CI** (`.github/workflows/ci.yml`) — runs on every push and PR to `main`: install, lint, typecheck, build, audit (moderate), prettier `--check`.
4. **Vercel** — builds and deploys on every push. Preview URL posted to the PR.
5. **E2E** (`.github/workflows/e2e.yml`) — Playwright smoke tests, triggered on successful Vercel deploy.

## Environment variables

Synced via the Vercel dashboard or CLI (`vercel env ls`). All three
environments (Production, Preview, Development) should have:

- **App:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL`, `SENTRY_AUTH_TOKEN`
- **Slushpile mount (optional):** `SLUSHPILE_URL` — when set, `/slushpile` proxies to that deployment via a `next.config.ts` rewrite; nav slot appears. When unset, slot is hidden and `/slushpile` 404s.

Preview-specific: Vercel also injects `VERCEL_URL`, `VERCEL_ENV`, etc. automatically.

### After the dual-citizen redesign

The Neon Marketplace integration, `DATABASE_URL`, `ANTHROPIC_API_KEY`, and
`CRON_SECRET` are no longer used by this repo — that pipeline now lives in
the slushpile repo. Remove these from the Vercel project via
`vercel env rm` across all targets (production / preview / development) when
convenient; the deploy does not depend on them.
