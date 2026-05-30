# 06 Implementation Roadmap — Sheets→REST API
> D2-07 | 2026-05-30 | Phase 1-4 | 5〜6週間 MVP

## Phase 1 — Core API Engine (Week 1-2, ~80h)

### Day 1-2: Project Setup + Google OAuth
```bash
npx create-next-app@latest sheets-api --ts --tailwind --app --src-dir
cd sheets-api
npm install drizzle-orm @auth/drizzle-adapter better-auth googleapis
npm install @upstash/redis @upstash/ratelimit nanoid
```

- Better Auth セットアップ (Google OAuth provider)
- Google Sheets API v4 OAuth 2.0 + Service Account 両対応
- Supabase (Postgres) + Drizzle schema 初期化

### Day 3-4: Endpoint 生成エンジン
```typescript
// src/lib/sheets-proxy.ts
import { google } from "googleapis";

export async function readSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  query?: Record<string, string>
): Promise<{ data: Record<string, unknown>[]; meta: { total: number } }> {
  const sheets = google.sheets({ version: "v4", auth: accessToken });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:ZZ`,
  });
  const [headers, ...rows] = res.data.values ?? [];
  const data = rows.map((row, i) =>
    Object.fromEntries([["_row_id", i + 2], ...headers.map((h, j) => [h, row[j] ?? ""])])
  );
  // filter by query params
  return { data: applyFilter(data, query), meta: { total: data.length } };
}
```

- GET / POST / PUT / DELETE route handlers 実装
- API Key 生成 (nanoid + bcrypt hash 保存)
- CORS whitelist middleware

### Day 5-7: Cache + Rate Limit
```typescript
// src/app/api/v1/[projectId]/[slug]/route.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL! });
const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10000, "1 d") });

export async function GET(req: Request, { params }) {
  const apiKey = req.headers.get("x-api-key");
  // 1. API Key 検証
  const keyRecord = await validateApiKey(apiKey);
  if (!keyRecord) return Response.json({ error: "Unauthorized" }, { status: 401 });
  // 2. Rate limit
  const { success } = await ratelimit.limit(keyRecord.id);
  if (!success) return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  // 3. Cache
  const cacheKey = `sheet:${params.projectId}:${params.slug}:${req.url}`;
  const cached = await redis.get(cacheKey);
  if (cached) return Response.json(cached, { headers: { "X-Cache": "HIT" } });
  // 4. Sheets API
  const data = await readSheet(/* ... */);
  if (keyRecord.cacheTtl > 0) await redis.setex(cacheKey, keyRecord.cacheTtl, data);
  return Response.json(data, { headers: { "X-Cache": "MISS" } });
}
```

### Day 8-10: Dashboard UI
```
┌──────────────────────────────────────────────────────────┐
│  SheetsAPI.io   Projects  Docs  Billing          [Login] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  + New Project                                           │
│                                                          │
│  ▶ Customer DB          [customers] [orders]  [Edit]    │
│    API Key: sk_live_abc...                               │
│    Usage: 4,231 / 10,000 req/day ████░░ 42%             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```
- shadcn/ui: Card / Table / Badge / Button / Input
- Endpoint 一覧・API Key 表示・Usage メーター

## Phase 2 — Webhook Engine (Week 3, ~40h)

### Webhook Poller (Cloudflare Workers Cron)
```typescript
// workers/webhook-poller.ts (Cloudflare Workers)
export default {
  async scheduled(event: ScheduledEvent, env: Env) {
    // 30秒ごとに active webhook を処理
    const webhooks = await env.DB.prepare("SELECT * FROM webhooks WHERE is_active=1").all();
    for (const webhook of webhooks.results) {
      const currentHash = await hashSheetData(webhook.endpoint_id, env);
      const lastHash = await env.KV.get(`hash:${webhook.id}`);
      if (currentHash !== lastHash) {
        await env.KV.put(`hash:${webhook.id}`, currentHash);
        await dispatchWebhook(webhook, env); // POST to target_url with retry
      }
    }
  }
};
```

### Retry Queue
- 失敗時: 1分後、5分後、30分後の3回 retry
- 3回失敗で `failure_count++` → 5回連続失敗で auto-deactivate + email 通知
- Delivery log: 直近 100件の webhook 送信履歴を Dashboard に表示

## Phase 3 — Stripe + Onboarding (Week 4, ~30h)

- Stripe Checkout: Starter / Dev / Team の3プラン
- Stripe Webhook: subscription.created → plan 反映 / canceled → downgrade
- Founding 100 クーポン: `stripe coupons create --percent-off 53 --duration forever`
- Onboarding: 接続 → endpoint 生成 → test call の3ステップ wizard

## Phase 4 — SEO + Launch (Week 5-6, ~40h)

### SEO Page
```
/blog/sheetbest-alternative          # "sheetbest alternative with webhooks"
/blog/google-sheets-rest-api-2026    # primary keyword
/blog/google-apps-script-vs-api      # Apps Script ユーザー取り込み
```
- Next.js generateMetadata → dynamic OG 画像
- Structured Data: SoftwareApplication schema

### Launch Sequence
1. PH Launch Day: GIF デモ動画 (30秒)・"webhook" を前面に
2. r/webdev 投稿: "I built a webhook-enabled Google Sheets API (SheetBest doesn't have this)"
3. X/Twitter: @IndieHackers @PieterLevels メンション
4. IH 投稿: $1K MRR 達成時に "How I built it" 記事

## 月次コスト見込み (100 paying users 時点)

| 項目 | 月額 |
|------|------|
| Supabase (Pro) | $25 |
| Upstash Redis | $10 |
| Cloudflare Workers (paid) | $5 |
| Vercel Pro | $20 |
| Resend (email) | $0〜$20 |
| **合計** | **$60〜$80/月** |

粗利率: ($19 avg × 100) - $70 = $1,830 / $1,900 = **96%**

## Gross Margin 試算

| Users | MRR | Infra | GM | GM% |
|-------|-----|-------|-----|-----|
| 50 | $950 | $60 | $890 | 94% |
| 200 | $3,800 | $100 | $3,700 | 97% |
| 500 | $9,500 | $200 | $9,300 | 98% |

## 週次 Time Budget

| フェーズ | 週 | 時間/週 |
|---------|-----|--------|
| Phase 1 (Core) | W1-2 | 40h/週 |
| Phase 2 (Webhook) | W3 | 40h/週 |
| Phase 3 (Stripe) | W4 | 30h/週 |
| Phase 4 (Launch) | W5-6 | 20h/週 + launch |

focussplit の Dev 並行想定: Phase 3〜4 は presense の maintenance モードに入ってから着手

## focussplit 流用度: 40%

- Better Auth (Google OAuth) → 流用
- Stripe Checkout / Webhook handler → 流用
- shadcn/ui コンポーネント → 流用
- Drizzle ORM + Supabase → 流用
- 独自実装: Google Sheets API proxy・Cloudflare Workers cron・Redis caching・webhook engine

## 別 session command

```
新しいセッションで着手する場合:
「64_sheets_api の実装を開始。
D2-07 Sheets→REST API、Composite v5 8.45 (global #2)。
参照: microapp/64_sheets_api/_docs/04_features.md
Phase 1 Day 1-2: Next.js 15 セットアップ + Google Sheets OAuth。
focussplit 流用度 40%、SheetBest との差別化は webhook 優先。」
```

## v5 10軸スコア

| 軸 | score | 根拠 |
|----|-------|------|
| Pain Intensity | 8 | Google Sheets を DB代替利用しているが API 化できずに詰まる毎日の痛点 |
| Existing Spend | 9 | SheetBest $18K MRR・Bannerbear $50K MRR (直接観測) |
| MVP Speed | 9 | Google Sheets API 既存・auth 流用で 5-6週間 |
| Distribution Ease | 8 | ProductHunt + r/webdev + SEO "sheetbest alternative" |
| WTP | 7 | $9〜49/mo・dev は tool にドル単位課金を抵抗なく |
| Founder Fit | 9 | Next.js dev・Google API 知識・ツール系得意 |
| Frequency | 8 | API が動いている間は毎日 requests が流れる |
| Retention | 8 | endpoint URL 変更コスト → churn 困難 (data lock-in) |
| Workflow Lock-in | 9 | 既存 project が API に依存したら変更不可 |
| Cog Load Reduction | 7 | Sheets → API の手動実装を完全に排除 |

**Composite_v5** = 8×0.15 + 9×0.15 + 9×0.15 + 8×0.10 + 7×0.10 + 9×0.10 + 8×0.10 + 8×0.08 + 9×0.04 + 7×0.03
= 1.20 + 1.35 + 1.35 + 0.80 + 0.70 + 0.90 + 0.80 + 0.64 + 0.36 + 0.21 = **8.31**

> 参照ファイルの 8.45 は D2 mining の 8軸スコアによる算出。v5 10軸では **8.31** (global TOP 3 相当)。
