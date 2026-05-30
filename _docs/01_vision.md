# 01 Vision — Sheets→REST API (SheetBest Competitor)
> D2-07 | Composite v5 8.45 | v5 Global #2 | 2026-05-30

## One-liner
Google Sheets を 1-click で REST API に変換し、webhook / CRUD / CORS設定までを $9/月で提供する dev + no-code 向け SheetBest 代替ツール。

## Why Now

SheetBest は $18K MRR を達成しているが、webhook 未対応・エラーハンドリング貧弱・pricing が dev チームには高い。Bannerbear ($50K MRR) は「既存ワークフローをAPI化する」パターンが solo dev でも大規模に機能することを証明した。no-code 運動 (40%+ の 2024年 micro-SaaS が no-code) と相まって、2026年に Sheets を lightweight DB として使う 1000万人以上の需要層が存在する。Google Sheets API v4 は安定化しており、OAuth + Service Account の組み合わせで個人開発者でも3〜4週間で信頼できる API proxy を実装可能。

## 3 Persona

### Persona A — Solo Dev / Indie Maker (グローバル)
- Jake、28歳・フリーランス開発者・US
- ランディングページのフォーム送信データを Sheets に蓄積し、別サービスから API で読み取りたい
- Retool は高すぎ、自前 API は時間がかかる → $9/月 なら即試す
- 購買トリガー: Reddit r/webdev / ProductHunt

### Persona B — No-Code Maker / Startup (グローバル)
- Maria、34歳・小規模 SaaS CEO・UK
- Bubble + Sheets でプロトタイプを構築。本番環境でも Sheets をマスターデータとして残したい
- Zapier では処理できない複雑なクエリ・フィルタが必要
- 購買トリガー: Bubble community、Zapier alternative 検索

### Persona C — SMB 社内担当 / 日本語ユーザー
- 田中、38歳・中小企業 IT担当・東京
- 既存の Sheets 業務データを社内ダッシュボードに流し込みたい。DB移行予算なし
- Google Apps Script は不安定、Glide は高い → $9 なら即購入
- 購買トリガー: Qiita 記事、X/Twitter Tech アカウント

## Brand Voice

- **Honest dev tool**: 「5分で試せる」「制限を隠さない」pricing
- **Transparent**: webhook 制限・レート制限を料金ページに明記
- **Focused**: Sheets → API "だけ" 。機能肥大化しない
- 言語: English primary (global dev)、JP doc あり

## Competitor 差別化 (5社)

| 競合 | 弱点 | 本ツール優位 |
|------|------|------------|
| SheetBest ($18K MRR) | webhook 未対応・エラーログなし | webhook + retry queue + エラーログ |
| Glide | App Builder 側に寄りすぎ・$25/mo〜 | 純粋 API proxy・$9 entry |
| Retool | $10/user/mo、エンタープライズ向け | flat $9/mo、setup 5分 |
| Zapier Tables | Zapier エコシステム依存 | 完全独立・任意の client から呼べる |
| AppScript (無料) | 不安定・CORS地獄・URL 推測可能 | 安定 endpoint + auth header + CORS設定 |

## 5年 Vision

- **Year 1**: SheetBest の no-webhook gap を突いて 500 paying users / $9K MRR
- **Year 2**: Notion / Airtable → API 変換まで拡張。MRR $30K
- **Year 3**: "API-ify any spreadsheet" ポジションを確立。webhook marketplace (n8n / Make パートナー)
- **Year 4**: Enterprise tier $199/mo — SLA 99.9%・dedicated endpoint
- **Year 5**: Acquire.com にて $500K〜$1M でのエグジット候補 (SaaS 3-4x ARR multiple、Acquire.com 2026 median 3.9x)

## Legal / Compliance

- Google API ToS: Sheets API は商用利用可 (制限は quota のみ)
- データプライバシー: user の Sheets データはキャッシュのみ (オプション)、永続保存なし
- GDPR: EU ユーザーデータ処理方針を Privacy Policy に明記
- 景表法: 「SheetBest より安い」比較広告は事実ベースで記載
