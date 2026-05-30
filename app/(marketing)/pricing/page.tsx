import Link from "next/link";

export const metadata = {
  title: "Pricing — SheetsAPI",
  description: "Free to start. $9/mo Starter. $19/mo Dev with webhooks. $49/mo Team.",
};

export default function PricingPage() {
  return (
    <div className="container mx-auto px-6 max-w-5xl py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--ink)" }}>
          Transparent pricing
        </h1>
        <p style={{ color: "var(--ink-muted)" }}>
          No hidden fees. Rate limits shown upfront. Cancel anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-5 mb-16">
        {[
          {
            name: "Free",
            price: "$0",
            period: "forever",
            projects: 1,
            sheets: 1,
            reqDay: "1,000",
            crud: false,
            webhook: false,
            cache: false,
          },
          {
            name: "Starter",
            price: "$9",
            period: "/mo",
            yearlyNote: "($7.20/mo billed yearly)",
            projects: 1,
            sheets: 1,
            reqDay: "10,000",
            crud: false,
            webhook: false,
            cache: true,
          },
          {
            name: "Dev",
            price: "$19",
            period: "/mo",
            yearlyNote: "($15.20/mo billed yearly)",
            projects: 5,
            sheets: 5,
            reqDay: "50,000",
            crud: true,
            webhook: true,
            cache: true,
            highlight: true,
          },
          {
            name: "Team",
            price: "$49",
            period: "/mo",
            yearlyNote: "($39.20/mo billed yearly)",
            projects: Infinity,
            sheets: Infinity,
            reqDay: "100,000",
            crud: true,
            webhook: true,
            cache: true,
          },
        ].map((plan) => (
          <div
            key={plan.name}
            className="p-6 rounded-2xl border flex flex-col"
            style={{
              background: plan.highlight ? "var(--focus-deep)" : "var(--surface-1)",
              borderColor: plan.highlight ? "var(--focus-primary)" : "var(--hairline)",
            }}
          >
            {plan.highlight && (
              <div
                className="text-xs font-medium px-2 py-0.5 rounded mb-3 self-start"
                style={{ background: "var(--focus-primary)", color: "#fff" }}
              >
                Most popular
              </div>
            )}
            <div className="text-sm font-medium mb-1" style={{ color: plan.highlight ? "var(--focus-glow)" : "var(--ink-muted)" }}>
              {plan.name}
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold" style={{ color: "var(--ink)" }}>{plan.price}</span>
              <span className="text-sm" style={{ color: "var(--ink-muted)" }}>{plan.period}</span>
            </div>
            {plan.yearlyNote && (
              <div className="text-xs mb-4" style={{ color: "var(--ink-subtle)" }}>{plan.yearlyNote}</div>
            )}

            <div className="flex-1 mt-4 space-y-2 text-sm" style={{ color: "var(--ink-muted)" }}>
              <div>{plan.reqDay} req/day</div>
              <div>{plan.sheets === Infinity ? "Unlimited" : plan.sheets} sheet{plan.sheets !== 1 ? "s" : ""}</div>
              <div className={plan.crud ? "" : "opacity-40"}>✓ POST / PUT / DELETE</div>
              <div className={plan.webhook ? "" : "opacity-40"}>✓ Webhooks + retry</div>
              <div className={plan.cache ? "" : "opacity-40"}>✓ Response caching</div>
            </div>

            <Link
              href="/login"
              className="mt-6 block text-center py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: plan.highlight ? "var(--focus-primary)" : "var(--surface-3)",
                color: plan.highlight ? "#fff" : "var(--ink)",
              }}
            >
              {plan.name === "Free" ? "Start free" : "Get started"}
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto mb-20">
        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "var(--ink)" }}>
          FAQ
        </h2>
        {[
          {
            q: "What happens when I hit the daily request limit?",
            a: "Requests return HTTP 429. The counter resets at midnight UTC. Free tier: 1,000/day. Upgrade anytime.",
          },
          {
            q: "Are my Google Sheets data stored on your servers?",
            a: "No. Data passes through in real-time. Cached responses (if enabled) are stored in Redis with your configured TTL and then deleted. We never persist your sheet data permanently.",
          },
          {
            q: "Can I use this for commercial projects?",
            a: "Yes. Google Sheets API allows commercial use. Your subscription covers our API proxy service.",
          },
          {
            q: "Can I cancel anytime?",
            a: "Yes. Cancel anytime from Settings. Your plan stays active until the end of the billing period.",
          },
          {
            q: "What is a webhook?",
            a: "When your sheet changes, SheetsAPI sends a POST request to your URL with the row data. Includes retry logic (3 attempts with backoff). Dev plan and above.",
          },
        ].map((item) => (
          <details
            key={item.q}
            className="border-b py-4"
            style={{ borderColor: "var(--hairline)" }}
          >
            <summary
              className="cursor-pointer font-medium text-sm"
              style={{ color: "var(--ink)" }}
            >
              {item.q}
            </summary>
            <p className="mt-3 text-sm" style={{ color: "var(--ink-muted)" }}>
              {item.a}
            </p>
          </details>
        ))}
      </div>

      {/* 特定商取引法 6項目 summary */}
      <div
        className="p-6 rounded-xl border text-sm"
        style={{ background: "var(--surface-1)", borderColor: "var(--hairline)" }}
      >
        <h3 className="font-semibold mb-4" style={{ color: "var(--ink)" }}>
          特定商取引法に基づく表記
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs" style={{ color: "var(--ink-muted)" }}>
          <div><span style={{ color: "var(--ink-subtle)" }}>販売事業者:</span> 個人事業主 平川遥斗 (greymoth-jp)</div>
          <div><span style={{ color: "var(--ink-subtle)" }}>所在地:</span> 請求時に開示</div>
          <div><span style={{ color: "var(--ink-subtle)" }}>連絡先:</span> m.hirakawa07@icloud.com</div>
          <div><span style={{ color: "var(--ink-subtle)" }}>販売価格:</span> 各プランに記載の通り (税込)</div>
          <div><span style={{ color: "var(--ink-subtle)" }}>支払方法:</span> クレジットカード (Stripe)</div>
          <div><span style={{ color: "var(--ink-subtle)" }}>キャンセル:</span> いつでも可。翌請求は発生しません</div>
        </div>
        <Link href="/tokushoho" className="text-xs mt-3 block underline" style={{ color: "var(--focus-glow)" }}>
          特定商取引法全文を見る →
        </Link>
      </div>
    </div>
  );
}
