# Deployment

## Vercel integration: Neon preview action

The Neon Marketplace integration registers a deployment action that
Vercel runs before the build step. For this project the action is
restricted to `production` only; previews bypass it and reuse the
static `DATABASE_URL` (and friends) synced to the Preview environment.

If the integration is reinstalled or its config is reset, Vercel will
run the Neon action on preview deploys again, and they will all fail
with `BUILD_FAILED` in ~1.3s with no build logs — the error surfaces
in the dashboard as "Provisioning integrations failed".

### To re-apply the fix

```sh
# Confirm IDs (should match below)
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v1/storage/stores?teamId=team_Zg8A05ZQLUbn7lysyomiJZBB" \
  | jq '.stores[] | select(.name=="residency_miner")
        | {store: .id, spc: .projectsMetadata[0].id,
           actions: .projectsMetadata[0].deployments}'

# Expected: store_GlOVjlGeeh9AM3vP, spc_bMtecqOiH0AIoy8H
# If actions.environments includes "preview", re-apply:

curl -s -X PATCH \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v1/storage/stores/store_GlOVjlGeeh9AM3vP/connections/spc_bMtecqOiH0AIoy8H?teamId=team_Zg8A05ZQLUbn7lysyomiJZBB" \
  -d '{"deployments":{"actions":[{"environments":["production"],"slug":"Neon"}],"required":true}}'
```

`VERCEL_TOKEN` comes from `~/Library/Application Support/com.vercel.cli/auth.json` (`jq -r .token`).

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

- Neon: `DATABASE_URL`, `POSTGRES_*`, `PG*`, `NEON_PROJECT_ID`
- App: `ANTHROPIC_API_KEY`, `CRON_SECRET`, `SMTP_*`, `CONTACT_EMAIL`, `SENTRY_AUTH_TOKEN`

Preview-specific: Vercel also injects `VERCEL_URL`, `VERCEL_ENV`, etc. automatically.
