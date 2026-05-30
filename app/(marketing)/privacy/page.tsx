export const metadata = {
  title: "Privacy Policy — SheetsAPI",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-6 max-w-3xl py-16">
      <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--ink)" }}>Privacy Policy</h1>
      <p className="text-sm mb-10" style={{ color: "var(--ink-muted)" }}>Last updated: 2026-05-30</p>

      <div className="prose-sm space-y-8" style={{ color: "var(--ink-muted)" }}>
        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--ink)" }}>Data we collect</h2>
          <p>Email address (for authentication). Google account OAuth tokens (to access your spreadsheets on your behalf). Usage logs (request count, status code, timestamp) — no row data is stored.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--ink)" }}>Your Google Sheets data</h2>
          <p>We access your spreadsheet data in real-time to serve API responses. We do not store your spreadsheet content permanently. Cached responses (if you enable caching) are stored in Redis with your configured TTL and automatically deleted after that period. We request only the minimum OAuth scopes: <code className="font-mono text-xs" style={{ color: "var(--focus-glow)" }}>spreadsheets</code> and <code className="font-mono text-xs" style={{ color: "var(--focus-glow)" }}>drive.metadata.readonly</code>.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--ink)" }}>Third-party services</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Stripe — payment processing</li>
            <li>Turso — database (authentication data, project metadata)</li>
            <li>Upstash Redis — rate limiting and response caching</li>
            <li>Resend — transactional email</li>
            <li>Sentry — error monitoring</li>
            <li>PostHog — product analytics (anonymous event data)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--ink)" }}>GDPR</h2>
          <p>EU users may request deletion of their data by emailing m.hirakawa07@icloud.com. We will respond within 30 days. Legal basis: contract performance and legitimate interest.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--ink)" }}>Contact</h2>
          <p>m.hirakawa07@icloud.com</p>
        </section>
      </div>
    </div>
  );
}
