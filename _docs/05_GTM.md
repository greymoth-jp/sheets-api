# 05 GTM — Sheets→REST API
> D2-07 | 2026-05-30 | Target: global dev + no-code maker

## ICP (Ideal Customer Profile) × 3

### ICP-1: Solo Dev / Indie Maker
- 技術レベル: 中〜上級 (REST API を日常使用)
- 使いどころ: ランディングページ → Sheets → 別サービスへのデータ流し込み
- WTP: $9〜19/mo、年払いで2割引なら即決
- 発見場所: r/webdev / r/SideProject / ProductHunt / Hacker News

### ICP-2: No-Code Startup (Bubble / Webflow + Sheets)
- 技術レベル: no-code (Zapier は使える、API は書けない)
- 使いどころ: Bubble アプリのデータソースとして Sheets を継続利用したい
- WTP: $19/mo (Bubble の月額の 1/5 以下なら試す)
- 発見場所: Bubble Forum / Webflow Community / NoCode HQ

### ICP-3: SMB 社内 IT 担当 / JP ユーザー
- 技術レベル: 低〜中 (Google Apps Script を使ったことがある)
- 使いどころ: 既存業務 Sheets を社内ダッシュボードへ接続
- WTP: ¥1,000〜3,000/mo (Google Workspace 費用感)
- 発見場所: Qiita / Zenn / X Tech / IT 系 Slack community

## Channel 7

| チャネル | 期待 CAC | T+0 優先度 | アクション |
|---------|---------|-----------|-----------|
| 1. ProductHunt Launch | $0 (organic) | HIGH | Day 1 公開日に PH launch。"SheetBest with webhooks" として差別化訴求 |
| 2. r/webdev / r/nocode / r/SideProject | $0 | HIGH | "I built a Sheets→API tool with webhooks (SheetBest doesn't have this)" — デモ GIF 添付 |
| 3. Hacker News Show HN | $0 | MED | "Show HN: Turn any Google Sheet into a REST API with webhook support" |
| 4. Twitter/X (dev community) | $0 | HIGH | @IndieHackers タグ・週1でデモ Tweet。webhook デモ動画 (30秒) を定期投稿 |
| 5. SEO (英語) | $0 (時間コスト) | MED | "sheetbest alternative" / "google sheets rest api" で上位狙い。月 2 記事 |
| 6. YouTube Dev Tutorial | $0〜$50/動画 | LOW | "Build a no-code backend with Google Sheets" — 間接流入 |
| 7. IndieHackers MRR milestones | $0 | MED | $1K MRR / $5K MRR 到達時に IH 投稿 → 開発者コミュニティへの認知 |

## Pricing

### Free Tier
- 1 sheet、1K req/day、API Key 1つ
- webhook なし
- 「作ってみた」層の試用 → Dev Plan 転換狙い

### Monthly
| Plan | 価格 | 機能 |
|------|------|------|
| Starter | $9/mo | 1 sheet・10K req/day・no webhook |
| Dev | $19/mo | 5 sheets・50K req/day・**webhook** ★|
| Team | $49/mo | unlimited・100K req/day・CRUD UI・SLA |

### Annual (20% OFF)
| Plan | 年額 |
|------|------|
| Starter Annual | $86.4/年 ($7.2/mo 相当) |
| Dev Annual | $182.4/年 ($15.2/mo 相当) |
| Team Annual | $470.4/年 ($39.2/mo 相当) |

### Founding 100
- 最初の 100 users: Dev Plan 機能を $9/mo で永久固定
- 告知: ProductHunt + Twitter "Founding 100" キャンペーン
- 目的: 早期ユーザー確保 + 口コミ起点

## KPI T+0〜T+365

| 時点 | KPI | 目標値 |
|------|-----|--------|
| T+0 (Day 1) | PH Upvotes | 100+ |
| T+7 | Free Signups | 200 |
| T+7 | Paying users | 20 (10% 転換) |
| T+30 | MRR | $500 |
| T+90 | MRR | $3,000 |
| T+180 | MRR | $9,500 (Base シナリオ) |
| T+180 | Paying users | 500 |
| T+365 | MRR | $20K〜$30K |
| T+365 | Churn rate | < 5%/月 |
| T+365 | LTV avg | $200+ |

## Pivot 5 (条件付き)

| トリガー | Pivot |
|---------|-------|
| T+90 で MRR < $500 (PH 不発) | Notion API proxy に機能拡張・ターゲットを no-code first に変更 |
| SheetBest が webhook 実装 | CRUD UI + OpenAPI spec + Airtable 対応を前倒し実装 |
| ICP-3 (JP SMB) のみ転換率高い場合 | JP 特化版 (日本語 UI・Stripe JP) に軸足移動 |
| API チーム課金が主流になった場合 | Team Plan を $99/mo に値上げ・enterprise SLA 追加 |
| webhook トラフィックがコスト圧迫 | webhook を $29/mo 以上に移動・Starter から削除 |

## Kill 3

| 条件 | アクション |
|------|-----------|
| T+180 で MRR < $1,000 かつ Paying < 50人 | サービス終了・既存 user にエクスポート機能提供 |
| Google が Sheets API を商用利用禁止にした場合 | Airtable / Notion のみに即時切り替え |
| 月次 infra コストが MRR の 30%超 | pricing 値上げ or 機能制限で黒字化 |

## Bundle 候補

- **focussplit × Sheets→API**: focussplit のタスクデータを Sheets → API で外部連携。相互クロスプロモーション可能
- **D2-04 Churn Flow Builder**: SaaS dev 向けバンドル "$29/mo で Sheets API + cancel flow"
- **G4-04 CLAUDE.md Manager**: dev tool suite として "greymoth dev tools" バンドル化
