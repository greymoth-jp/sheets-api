# 02 TAM — Sheets→REST API
> D2-07 | 2026-05-30 | Sources: D2 demand file, flowjam.com, bannerbear.com

## 市場規模の根拠

### 需要検証 (paid demand 直接観測)

| 証拠 | 数値 | 出典 |
|------|------|------|
| SheetBest MRR | $18,000/月 | flowjam.com/blog/27-micro-saas-examples (2025) |
| Bannerbear MRR | $50,000+/月・2024年収益 $991K | bannerbear.com (2025) — 同パターン "API-ify template" |
| Gumroad dev tools 収益 | $65.8M tracked、avg $60,814/product | accio.com (2025) — dev tooling 最高収益カテゴリ |
| Google Sheets ユーザー | 1B+ | Google 公式 (2023) |
| Sheets を DB 代替利用 | 推定 10M+ チーム | saasranger.com (2025) — no-code survey |
| no-code SaaS 比率 | 40%+ (2024 新規 micro-SaaS) | saasranger.com (2025) |

### ユーザー母数

| セグメント | 推定人数 | 根拠 |
|-----------|---------|------|
| Sheets を lightweight DB として使う dev / no-code maker | 10M (global) | no-code market survey 2025 |
| Paying Sheets → API 変換サービス利用者 (現 SheetBest 等) | 推定 30K〜50K | SheetBest $18K / avg $19 = 約 950人。市場全体は 5-10x と推定 |
| B2B SMB 社内 Sheets 連携ニーズ | 100M+ Workspace users の 0.01% | Google Workspace 3G users 2024 |

## TAM / SAM / SOM

| 層 | 規模 | 単価 | 金額 |
|----|------|------|------|
| TAM (Sheets を DB 代替利用するグローバル dev + no-code) | 10M users | $19/mo avg | **$190M/月 ($2.28B/年)** |
| SAM (API proxy に課金意欲のある active maker) | 500K | $15/mo avg | **$7.5M/月** |
| SOM Y1 (ProductHunt + r/webdev + SEO 初年度) | 500 paying | $19/mo avg | **$9,500/月 ($114K/年)** |
| SOM Y2 (webhook 差別化 + word-of-mouth) | 2,000 paying | $25/mo avg | **$50K/月** |

## Competitor Benchmark MRR

| 競合 | MRR | 設立 | チーム | 備考 |
|------|-----|------|--------|------|
| SheetBest | $18K | 2020 | 1-2名 | webhook なし・scaling 上限 |
| Bannerbear (類似パターン) | $50K+ | 2019 | 1名 solo | API-ify 系の最大成功例 |
| Retool (enterprise) | N/A (VC調達) | 2017 | 200+ | 参入領域は違う |
| Glide | VC調達 | 2018 | 50+ | App builder 側、競合ではない |

## Bear / Base / Bull MRR 予測

| シナリオ | T+6 | T+12 | T+24 | T+36 |
|---------|-----|------|------|------|
| **Bear** (ProductHunt 不発・SEO 遅い) | $1K | $3K | $6K | $8K |
| **Base** (PH 中程度・webhook 差別化効く) | $4K | $9.5K | $22K | $35K |
| **Bull** (PH #1・dev community viral) | $8K | $20K | $50K | $80K |

Bear 条件: API proxy はコモディティ化しており差別化訴求が弱い場合
Base 条件: webhook 機能で SheetBest から 500〜1000 件のスイッチャー獲得
Bull 条件: n8n / Make との公式 integration → built-in distribution 発動

## 収益構造

### 課金モデル
- **$9/mo Starter**: 1 sheet, 1K req/day, no webhook
- **$19/mo Dev**: 5 sheets, 10K req/day, webhook (差別化コア)
- **$49/mo Team**: unlimited sheets, 100K req/day, CRUD UI, SLA
- **Annual 割引**: 20% off (retention 向上)
- **Founding 100**: 最初の 100 ユーザーは $9/mo で Team 機能フルアクセス (lock-in)

### 単位経済
- サーバーコスト: Cloudflare Workers + KV = $5/月〜 (100K req まで実質無料)
- Google Sheets API quota: 60 req/min/project → multi-project で分散
- 粗利率: 推定 **92〜95%** (infra コスト極小)

## 市場成長性

- no-code/low-code 市場 CAGR 28.1% (2024-2030, MarketsAndMarkets)
- AI agent 台頭 → Google Sheets を agent のデータストアとして使うニーズ急増
- Google Workspace の SMB 普及 → Sheets が ERP 代替として機能する企業増加
- SheetBest が webhook を実装しない限り差別化持続 (2026年5月現在 未実装確認)
