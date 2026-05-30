import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'プライバシーポリシー / Privacy Policy',
  description: 'Sheets API プライバシーポリシー',
  robots: { index: true, follow: true },
};

const APP_NAME = 'Sheets API';
const APP_DOMAIN = 'sheetsapi.app';
const CONTACT = `support@${APP_DOMAIN}`;
const UPDATED = '2026-05-30';

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 prose dark:prose-invert">
      <h1>プライバシーポリシー / Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">
        最終更新 / Last updated: {UPDATED}
      </p>

      <h2>1. 事業者情報 / Entity Information</h2>
      <p>運営者: greymoth-jp</p>
      <p>
        責任者氏名・住所・電話番号: 請求があれば速やかに開示します。お問い合わせは{' '}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a> まで。
      </p>

      <h2>2. 収集する個人情報 / Data We Collect</h2>
      <ul>
        <li>メールアドレス（Magic Link 認証・waitlist 登録）</li>
        <li>IP アドレス（Sentry エラートラッキング・レート制限）</li>
        <li>User-Agent（Sentry）</li>
        <li>Cookie / LocalStorage（セッション維持・設定保存）</li>
        <li>Google アカウント OAuth トークン（暗号化保管・Google Sheets API アクセスに使用）</li>
        <li>Google Sheets API スコープ: spreadsheets.readonly（読み取り専用）</li>
      </ul>

      <h2>3. 利用目的 / Purpose of Use</h2>
      <ul>
        <li>サービス提供（Google Sheets データへの API アクセス仲介）</li>
        <li>不正検知（Sentry・レート制限）</li>
        <li>製品改善（PostHog analytics）</li>
        <li>法令遵守（税務記録・苦情対応）</li>
      </ul>

      <h2>4. 第三者提供 / Third-Party Services</h2>
      <ul>
        <li>Stripe（決済処理）</li>
        <li>Resend（メール送信）</li>
        <li>Better Auth（認証基盤）</li>
        <li>Turso / libSQL（データベースホスティング）</li>
        <li>Vercel（Webホスティング）</li>
        <li>Sentry（エラートラッキング）</li>
        <li>PostHog（製品分析）</li>
        <li>Google（Sheets API・OAuth 認証基盤）</li>
      </ul>
      <p>
        Google API から取得したデータは、Google API Services User Data Policy（
        <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener">限定使用要件</a>
        ）に準拠して取り扱います。
      </p>

      <h2>5. データ保管場所・越境移転 / Data Location & Cross-Border Transfer</h2>
      <p>
        データは主に米国のサーバー（Turso・Vercel・Stripe・Resend・Sentry）に保管されます。
        日本国外への越境移転が発生します。ご登録時の利用規約・本ポリシーへの同意をもって移転に同意いただいたものとみなします。
        個情法第28条に基づく措置として、各プロバイダーは適切なデータ保護体制（SCCs 等）を整備しています。
      </p>

      <h2>6. データ保持期間 / Retention</h2>
      <p>
        アカウント有効期間中。削除リクエスト受領後 30 日以内に削除します（Google OAuth トークンを含む）。
        税法等の法定保持義務（最長 7 年）がある場合を除きます。
      </p>

      <h2>7. ユーザーの権利 / Your Rights</h2>
      <p>
        開示・訂正・削除・利用停止・第三者提供停止の請求が可能です。
        Google アカウント連携の解除は、Google アカウント設定からも行えます。
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a> までご連絡ください。
      </p>

      <h2>8. Cookie 利用 / Cookie Usage</h2>
      <ul>
        <li>セッション維持（essential・拒否不可）</li>
        <li>製品分析（PostHog・ブラウザ設定で opt-out 可能）</li>
      </ul>

      <h2>9. GDPR (EU Residents)</h2>
      <p>
        Legal basis: Legitimate Interest (analytics, fraud prevention), Contract (service delivery), Consent (Google OAuth).
        We do not appoint a DPO (small-scale personal operation, Phase 0).
        EU representative: to be appointed prior to active EU sales.
        Subject Access Requests: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>

      <h2>10. 改定・連絡先 / Changes & Contact</h2>
      <p>
        本ポリシーに変更がある場合は本ページにて通知します。
        最終更新日: {UPDATED}
      </p>
      <p>
        お問い合わせ: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
      </p>
    </main>
  );
}
