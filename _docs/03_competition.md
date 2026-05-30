# 03 Competition — Sheets→REST API
> D2-07 | 2026-05-30

## 直接競合 (5社)

### 1. SheetBest ($18K MRR · 最重要直接競合)
- **強み**: 先行者優位・既存ユーザー 1K+・API ドキュメント整備
- **弱点**: webhook 未実装 (2026年5月確認)・エラーログなし・response caching なし・pricing が dev チームには中途半端 ($19〜$49/mo、機能制限あいまい)
- **戦略**: webhook + retry queue で明確な機能差別化 → スイッチャー獲得

### 2. Glide (no-code app builder)
- **強み**: UI builder 込み・豊富な template
- **弱点**: $25/mo〜でアプリ全体に縛られる・pure API proxy 用途には過剰
- **戦略**: "Just the API" — Glide に縛られたくない dev をターゲット

### 3. Retool
- **強み**: 多機能 internal tool builder・エンタープライズ信頼
- **弱点**: $10/user/mo・Sheets 専用ではない・setup 複雑
- **戦略**: 価格と setup speed で圧倒 ($9/mo・5分 setup)

### 4. Zapier Tables / Make (Integromat)
- **強み**: 既存ワークフロー統合が容易
- **弱点**: Sheets → REST API を他システムに提供する用途には不向き・高コスト
- **戦略**: "Zapier に依存しない独立 API endpoint" を訴求

### 5. Google Apps Script (無料)
- **強み**: Google エコシステム完全統合・無料
- **弱点**: URL が予測可能 (doGet security 問題)・CORS 設定困難・Execution log 貧弱・スケール不可
- **戦略**: "Apps Script の代替" として $9/mo の価値を明確化。Apps Script の CORS 問題・セキュリティ問題を LP で解説

## 間接競合 (3社)

| 競合 | 領域 | なぜ直接ではないか |
|------|------|-----------------|
| Airtable API | Airtable DB | Sheets ユーザーは Airtable に移行したくない层が主 |
| Notion API | Notion DB | Notion ユーザーは Sheets を使わない |
| Supabase | PostgreSQL as API | コーディング必要・Sheets の手軽さが失われる |

## Competitive Moat

### 短期 Moat (T+0〜6ヶ月)
- **webhook first mover**: SheetBest が webhook を実装しない限り、ユニークな機能差
- **$9 entry barrier**: SheetBest $19 vs 本ツール $9 → 試用心理的障壁ゼロ

### 中期 Moat (T+6〜18ヶ月)
- **Integration ecosystem**: n8n / Make / Zapier に公式 node/action 登録 → built-in distribution
- **Response cache layer**: 高頻度アクセス時のコスト削減が競合に対して技術的優位

### 長期 Moat (T+18ヶ月〜)
- **Customer data lock-in**: endpoint URL の変更コスト → churn 低減
- **Multi-spreadsheet support**: Notion + Airtable + Sheets の統合 proxy へ拡張

## ASCII Positioning Map

```
             High Price
                  |
    Retool        |
    (complex)     |
                  |
    Glide         |  SheetBest
    (app-first)   |  (simple)
------------------+------------------ Low Feature ←→ High Feature
                  |        ★ Sheets→API (this product)
                  |        (webhook + low price)
                  |
    Apps Script   |
    (free/manual) |
                  |
             Low Price
```

## 5年シナリオ

### シナリオ A: SheetBest が webhook 実装 (確率 40%)
- 対応: caching layer + CRUD UI + Airtable 対応で機能拡張
- 結果: 差別化は機能深度に移行。競争は激化するが SaaS 市場が拡大中なので共存可能

### シナリオ B: Google が Sheets の API 機能を強化 (確率 20%)
- 対応: Google 公式 API の wrapper として「使いやすさ」に特化継続
- 結果: TAM は縮小するが既存ユーザーの churn は低い (endpoint 変更コスト)

### シナリオ C: no-code ブームが継続・市場拡大 (確率 60%)
- 対応: Notion / Coda / Airtable 対応に拡張→ "Any spreadsheet → API" に
- 結果: SAM が 2〜3x 拡大。Base シナリオを超える可能性大

### シナリオ D: AI agent が Sheets を直接 read (確率 30%)
- 対応: "Agent-ready API" として AI agent 向けフォーマット (OpenAPI spec 自動生成) を前面に
- 結果: 新規セグメント (AI dev) を取り込み TAM 拡大

## キーリスク

| リスク | 影響度 | 発生確率 | 対策 |
|--------|--------|---------|------|
| SheetBest が webhook 追加 | 高 | 40% | caching・CRUD UI・pricing 差で対抗 |
| Google API quota 変更 | 中 | 20% | multi-project 分散・Cloudflare cache |
| ToS violation による BAN | 高 | 5% | 商用利用可のエンドポイントのみ使用・Google Cloud project 分離 |
| コモディティ化で価格競争 | 中 | 50% | webhook ecosystem・integration が護城河 |
