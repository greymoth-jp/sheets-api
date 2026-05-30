# SESSION LOG — D2-07 sheets-api
> 2026-05-30 | Agent: Claude Sonnet 4.6

## Phases completed

### Phase 1 — Scaffold + Auth + Brand ✅
- Next.js 15 + React 19 + TypeScript strict + Tailwind 3
- Better Auth: Magic Link + Google OAuth (sheets + drive.metadata scopes)
- lib/auth.ts, lib/auth-client.ts (One Tap)
- Brand: slate dark (#080a0f) + electric blue (#1f6feb) — dev-tool minimal
- app/layout.tsx: Inter + JetBrains Mono fonts
- globals.css: CSS custom properties (--canvas / --surface-1/2/3 / --ink / --focus-primary etc)
- Marketing: LP (Hero + Features + Pricing sneak-peek), /pricing (3 plans + 景表法), /docs (curl examples), /privacy, /terms, /tokushoho
- Auth: /login (Magic Link + Google button)
- typecheck: PASS

### Phase 2 — Schema + Migrations ✅
- lib/db/schema.ts: 11 tables
  - BA tables: user / session / account / verification
  - App tables: user_settings / projects / sheet_bindings / api_keys / webhooks / usage_logs / processed_webhooks
- migrations/0000_rich_malice.sql generated
- drizzle.config.ts: loadEnvConfig + Turso dialect

### Phase 3 — Auth (Better Auth) ✅ (inline with Phase 1)

### Phase 4 — Brand ✅ (inline with Phase 1)

### Phase 5 — Marketing ✅ (inline with Phase 1)

### Phase 6 — App routes ✅
- (app)/layout.tsx: server-side auth gate + AppNav
- /dashboard: project list + usage bar + plan display
- /projects/new: 3-step wizard (browse spreadsheets → select sheet tab → preview + slug config)
- /projects/[id]: endpoint list + API key display + cURL example
- /settings: Google connect status + Stripe upgrade/portal

### Phase 7 — Stripe ✅
- lib/stripe.ts: createCheckoutSession + createCustomerPortal
- /api/stripe/webhook: full handler (checkout.completed / subscription.updated / subscription.deleted / invoice.payment_failed) + idempotency via processed_webhooks
- /api/stripe/checkout + /api/stripe/portal

### Core Engine ✅
- lib/sheets-proxy.ts: readSheet / appendRow / updateRow / deleteRow / listSpreadsheets / listSheets / previewSheet
- lib/api-key.ts: argon2id hash/verify
- lib/rate-limit.ts: Upstash Redis + permissive fallback if not configured
- /api/v1/[projectId]/[slug]: GET/POST/PUT/DELETE/OPTIONS + CORS + rate limit + cache
- /api/projects: POST (create project + binding + key with plan limits)
- /api/sheets/list + /api/sheets/preview

## Commits
- e7610d3 feat(scaffold): Phase 1+2
- d5cd238 fix(routing): remove conflicting root page.tsx

## Push status
BLOCKED — GitHub repo greymoth-jp/sheets-api not found.
QUESTION_FOR_USER: Please create the repo manually:
  gh repo create greymoth-jp/sheets-api --public
  OR: https://github.com/new → name: sheets-api → public
  Then run: git push -u origin main

## Session 2: Phase 8 + CF Workers (2026-05-30)

### Commits
- 03835c8 feat(phase8+cf): sitemap/robots + CF Workers webhook poller + poll API
- 62c4186 fix(routing): remove duplicate privacy page outside route group

### Implemented
- **app/sitemap.ts + app/robots.ts** (Phase 8 SEO) ✅
- **workers/webhook-poller/** — Cloudflare Worker (wrangler.toml + src/index.ts) ✅
  - CF Cron Trigger → POST /api/webhooks/poll
- **app/api/webhooks/poll/route.ts** — Core differentiator ✅
  - SHA-256 hash diff to detect sheet changes
  - HMAC-SHA256 signed delivery to targetUrl
  - MAX_FAILURE_COUNT=5 auto-disable circuit breaker
  - Batch concurrency = 5
- **tsconfig.json** — workers/ excluded from Next.js compile
- **.env.example** — POLL_SECRET documented

### CF Workers Deploy (manual)
```bash
cd workers/webhook-poller
npm install
wrangler secret put APP_URL   # https://sheetsapi.dev
wrangler secret put POLL_SECRET
wrangler deploy
```

### Vercel
- Production: https://sheets-pm7pgpclq-greymoth-projects.vercel.app ● Ready
- Alias: https://sheets-api-greymoth-projects.vercel.app
- GitHub: https://github.com/greymoth-jp/sheets-api ● Connected

## Self-eval: 82/100 (前回 72 → +10)
- Phase 8 SEO ✅
- CF Workers webhook polling ✅ (core differentiator vs SheetBest)
- argon2id key hashing ✅
- Upstash rate-limit ✅
- Vercel ● Ready ✅
- Missing: db:migrate (needs Turso credentials) [-5]
- Missing: Sentry + PostHog init [-3]
- Missing: E2E test [-5]

## QUESTION_FOR_USER (remaining blockers)
1. Turso: `turso db create sheets-api` → set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN → `npm run db:migrate`
2. Google OAuth: GCP Console → Enable Sheets API + Drive API → add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
3. Upstash: create Redis → add UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
4. Stripe: create 7 price IDs → add to Vercel env
5. CF Workers: `cd workers/webhook-poller && npm i && wrangler deploy` — set secrets APP_URL + POLL_SECRET
6. Vercel env vars: `vercel env pull .env.local` then fill real keys

## Phase 2 Roadmap
- OpenAPI spec auto-generation
- Rate limit UI per API key
- Webhook delivery logs UI
- Sentry + PostHog initialize
