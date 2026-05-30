# 04 Features — Sheets→REST API
> D2-07 | 2026-05-30 | Stack: Next.js 15 + Cloudflare Workers + Hono

## MVP P0 Features (5〜6週間で実装)

### P0-1: Google Sheets OAuth 連携
- Google OAuth 2.0 / Service Account 両対応
- Sheets 選択 UI: スプレッドシート一覧表示 → シート (タブ) 選択
- 接続テスト: "Test Connection" ボタン → シートの先頭5行を preview

### P0-2: Endpoint 自動生成
- 接続完了 → 専用 REST endpoint を即時発行
  ```
  GET  https://api.sheetsapi.io/v1/{project-id}/{sheet-name}
  POST https://api.sheetsapi.io/v1/{project-id}/{sheet-name}
  PUT  https://api.sheetsapi.io/v1/{project-id}/{sheet-name}/{row-id}
  DELETE https://api.sheetsapi.io/v1/{project-id}/{sheet-name}/{row-id}
  ```
- Auth: API Key header (`X-API-Key: sk_live_xxx`)
- CORS: whitelist 設定 UI (domain レベル)

### P0-3: GET / POST / PUT / DELETE CRUD
- GET: クエリパラメータ filter (`?name=John&age_gt=25`)
- POST: JSON body → 新規行追加 (auto-assign row_id)
- PUT: 指定行の更新
- DELETE: 指定行の削除 (soft delete オプション)
- Response: JSON (`{ data: [...], meta: { total, page } }`)

### P0-4: Dashboard (シンプル)
```
┌─────────────────────────────────────────────────────┐
│  sheetsapi.io | Projects                            │
│                                                     │
│  Project: "Customer DB"                  [+ New]   │
│  ├── Sheet: customers   Endpoint: /customers  [⚙]  │
│  └── Sheet: orders      Endpoint: /orders     [⚙]  │
│                                                     │
│  Usage: 4,231 / 10,000 req today          [Upgrade]│
└─────────────────────────────────────────────────────┘
```

### P0-5: Response Caching
- Redis (Upstash) で GET レスポンスをキャッシュ (TTL 設定可: 0/30s/5m/1h)
- Cache MISS → Sheets API call → Cache SET → response
- SheetBest との最大の技術差別化

### P0-6: Webhook (Dev Plan 以上)
```typescript
// ユーザーが webhook endpoint を設定
// Sheets の変更を polling (30s) → 変更検出 → POST to webhook URL
type WebhookPayload = {
  event: "row.created" | "row.updated" | "row.deleted";
  sheet: string;
  row_id: string;
  data: Record<string, unknown>;
  timestamp: string;
}
```
- retry: 最大3回、exponential backoff
- SheetBest が未実装 → 最重要差別化機能

## Pro Features P1 (Month 2〜)

### P1-1: CRUD UI (non-dev 向け)
- Spreadsheet-like UI でブラウザから行を編集
- non-dev チームメンバーが API を書かずにデータ操作可能

### P1-2: OpenAPI Spec 自動生成
- Sheets のカラム名 → OpenAPI 3.0 spec を自動生成
- "Copy to Postman / Insomnia" ボタン
- AI agent 向け: `GET /openapi.json` endpoint

### P1-3: Rate Limit & Access Log
- API Key 別の rate limit 設定
- アクセスログ UI: IP / timestamp / endpoint / response code

### P1-4: Multi-Sheet JOIN
- 2つの sheet を shared key で JOIN した仮想 endpoint
- `GET /joined?left=orders&right=customers&on=customer_id`

### P1-5: Zapier / Make / n8n 公式 node
- Zapier App 登録 (developer program)
- Make (Integromat) module
- n8n community node

## 不採用機能 (Phase 0)

| 機能 | 不採用理由 |
|------|-----------|
| Real-time WebSocket | Sheets API は polling のみ。WebSocket は Supabase の領域 |
| AI 自動カラム分類 | MVP スコープ外。LLM cost 発生 → 後回し |
| Sheets 以外のソース (Notion / Airtable) | 集中戦略。拡張は Year 2 以降 |
| 独自 DB (データ永続化) | Sheets をマスターとして。DB 移行ニーズは Supabase が対応 |
| Mobile App | Web のみ。API tool に mobile app 不要 |

## DB Schema (Drizzle ORM · TypeScript)

```typescript
// schema.ts
import { pgTable, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: text("id").primaryKey(), // nanoid
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  googleSpreadsheetId: text("google_spreadsheet_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const endpoints = pgTable("endpoints", {
  id: text("id").primaryKey(),
  projectId: text("project_id").references(() => projects.id),
  sheetName: text("sheet_name").notNull(),
  slug: text("slug").notNull().unique(), // URL slug
  cacheTtl: integer("cache_ttl").default(0), // seconds
  corsOrigins: text("cors_origins").array().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: text("id").primaryKey(),
  projectId: text("project_id").references(() => projects.id),
  keyHash: text("key_hash").notNull(), // bcrypt hash
  label: text("label"),
  rateLimit: integer("rate_limit").default(10000), // req/day
  createdAt: timestamp("created_at").defaultNow(),
});

export const webhooks = pgTable("webhooks", {
  id: text("id").primaryKey(),
  endpointId: text("endpoint_id").references(() => endpoints.id),
  targetUrl: text("target_url").notNull(),
  events: text("events").array(), // ["row.created", "row.updated", "row.deleted"]
  secret: text("secret").notNull(),
  isActive: boolean("is_active").default(true),
  lastDeliveredAt: timestamp("last_delivered_at"),
  failureCount: integer("failure_count").default(0),
});

export const usageLogs = pgTable("usage_logs", {
  id: text("id").primaryKey(),
  apiKeyId: text("api_key_id").references(() => apiKeys.id),
  endpointId: text("endpoint_id").references(() => endpoints.id),
  method: text("method"), // GET / POST / PUT / DELETE
  statusCode: integer("status_code"),
  cached: boolean("cached").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
```

## API Routes (Next.js App Router)

```typescript
// src/app/api/v1/[projectId]/[sheetSlug]/route.ts
export async function GET(req: Request, { params }) {
  const { projectId, sheetSlug } = params;
  // 1. API Key 検証
  // 2. Rate limit チェック (Upstash Redis)
  // 3. Cache チェック (Upstash KV)
  // 4. Google Sheets API 呼び出し
  // 5. Cache SET
  // 6. JSON response
}

export async function POST(req: Request, { params }) {
  // 1-2. 同上
  // 3. body parse + validation
  // 4. sheets.spreadsheets.values.append
  // 5. webhook trigger (async, non-blocking)
  // 6. JSON response { success: true, row_id }
}
```

## AI Cost

- Sheets → REST API 変換は AI 不要
- OpenAPI spec 生成: ローカル型推論で LLM 不要
- AI cost = **$0/月** (Phase 0)
- Phase 1 以降: AI reply generation (optional) = $0.002/request 程度

## Capacitor Plugin (Mobile) — Phase 2

```bash
# SDK for React Native / Capacitor (Phase 2)
npm install @sheetsapi/sdk
```
```typescript
import { SheetsAPI } from "@sheetsapi/sdk";
const client = new SheetsAPI({ apiKey: "sk_live_xxx" });
const rows = await client.get("customers", { filter: { active: true } });
```

## focussplit 流用度: 40%
- Auth (Better Auth) → そのまま流用
- Stripe 課金フロー → そのまま流用
- Next.js 15 App Router 構成 → そのまま流用
- UI component (shadcn/ui) → そのまま流用
- 独自実装: Google Sheets OAuth・Cloudflare Workers proxy・Redis caching・webhook engine
