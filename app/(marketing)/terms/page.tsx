export const metadata = {
  title: "Terms of Service — SheetsAPI",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-6 max-w-3xl py-16">
      <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--ink)" }}>Terms of Service</h1>
      <p className="text-sm mb-10" style={{ color: "var(--ink-muted)" }}>Last updated: 2026-05-30</p>

      <div className="space-y-8 text-sm" style={{ color: "var(--ink-muted)" }}>
        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--ink)" }}>1. Service</h2>
          <p>SheetsAPI provides an API proxy service that converts Google Sheets into REST API endpoints. The service is provided as-is. We use Google Sheets API under Google's terms of service.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--ink)" }}>2. Acceptable use</h2>
          <p>You may not use SheetsAPI to store or process sensitive personal data (health, financial, biometric) without appropriate safeguards. You are responsible for the data in your spreadsheets.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--ink)" }}>3. Billing</h2>
          <p>Subscriptions are billed monthly or annually via Stripe. Payments are non-refundable except as required by law. Plans auto-renew unless cancelled before the renewal date.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--ink)" }}>4. Limitation of liability</h2>
          <p>SheetsAPI is not liable for data loss, service interruption, or damages arising from use of the service. Maximum liability is limited to fees paid in the prior 3 months.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--ink)" }}>5. Termination</h2>
          <p>We may terminate accounts that violate these terms. You may cancel at any time from Settings.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--ink)" }}>6. Contact</h2>
          <p>m.hirakawa07@icloud.com</p>
        </section>
      </div>
    </div>
  );
}
