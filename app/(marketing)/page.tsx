import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (session) redirect("/dashboard");

  return (
    <div>
      {/* Hero */}
      <section className="container mx-auto px-6 max-w-4xl pt-24 pb-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-6 border"
          style={{ borderColor: "var(--focus-primary)", color: "var(--focus-glow)", background: "var(--focus-deep)" }}
        >
          ★ Webhook support — SheetBest doesn't have this
        </div>

        <h1
          className="text-5xl font-bold leading-tight mb-6"
          style={{ color: "var(--ink)" }}
        >
          Your Google Sheet,{" "}
          <span style={{ color: "var(--focus-glow)" }}>now a REST API</span>
        </h1>

        <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: "var(--ink-muted)" }}>
          Turn any spreadsheet into a production-ready JSON API in 60 seconds.
          GET, POST, PUT, DELETE. Webhooks. Response caching. CORS. No servers.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-xl text-base font-semibold transition-opacity hover:opacity-90"
            style={{ background: "var(--focus-primary)", color: "#fff" }}
          >
            Start free — no credit card
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-3.5 rounded-xl text-base font-medium border"
            style={{ borderColor: "var(--hairline)", color: "var(--ink-muted)" }}
          >
            See pricing →
          </Link>
        </div>

        {/* Code preview */}
        <div
          className="rounded-2xl border p-6 text-left max-w-2xl mx-auto"
          style={{ background: "var(--surface-1)", borderColor: "var(--hairline)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ background: "var(--danger)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "var(--warning)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "var(--success)" }} />
          </div>
          <pre className="text-sm font-mono overflow-x-auto" style={{ color: "var(--ink-muted)" }}>
{`# Connect your sheet → get an instant endpoint
curl -H "X-API-Key: sk_live_xxx" \\
  https://sheetsapi.io/api/v1/{project-id}/customers

# Response
{
  "data": [
    { "_row_id": "2", "name": "John", "email": "john@example.com" },
    { "_row_id": "3", "name": "Sarah", "email": "sarah@example.com" }
  ],
  "meta": { "total": 2, "cached": false }
}`}
          </pre>
        </div>
      </section>

      {/* Features */}
      <section className="border-t py-20" style={{ borderColor: "var(--hairline)" }}>
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: "var(--ink)" }}>
            Everything SheetBest is missing
          </h2>
          <p className="text-center mb-12" style={{ color: "var(--ink-muted)" }}>
            SheetBest has $18K MRR. We have webhooks.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "Webhooks + retry queue",
                desc: "Get notified on row.created / row.updated / row.deleted. SheetBest doesn't have this. Retry logic with exponential backoff.",
              },
              {
                icon: "🗃️",
                title: "Response caching",
                desc: "Cache GET responses in Redis for 30s–1h. Reduce Google API quota usage by 90%. Configurable TTL per endpoint.",
              },
              {
                icon: "🔐",
                title: "Secure API keys",
                desc: "API keys hashed with argon2id — never stored in plaintext. CORS whitelist per endpoint. X-API-Key header auth.",
              },
              {
                icon: "🔍",
                title: "Filter & paginate",
                desc: "?name=John&age_gt=25&page=2&limit=50. Operator support: _gt, _lt, _gte, _lte, _ne. No code needed.",
              },
              {
                icon: "✏️",
                title: "Full CRUD (Dev+)",
                desc: "POST to append rows. PUT to update. DELETE to remove. Soft delete option. Dev plan and above.",
              },
              {
                icon: "📊",
                title: "Usage dashboard",
                desc: "See requests per day per project. Cached vs live ratio. Rate limit status. No surprises.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-5 rounded-xl border"
                style={{ background: "var(--surface-1)", borderColor: "var(--hairline)" }}
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-2" style={{ color: "var(--ink)" }}>
                  {f.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 border-t" style={{ borderColor: "var(--hairline)" }}>
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--ink)" }}>
            Start free. Scale when you need to.
          </h2>
          <div className="grid grid-cols-3 gap-4 mt-10 text-left">
            {[
              { name: "Free", price: "$0", req: "1K req/day", features: "1 sheet · read-only" },
              { name: "Starter", price: "$9/mo", req: "10K req/day", features: "1 sheet · read-only" },
              { name: "Dev", price: "$19/mo", req: "50K req/day", features: "5 sheets · CRUD · webhooks ★", highlight: true },
            ].map((p) => (
              <div
                key={p.name}
                className="p-5 rounded-xl border"
                style={{
                  background: p.highlight ? "var(--focus-deep)" : "var(--surface-1)",
                  borderColor: p.highlight ? "var(--focus-primary)" : "var(--hairline)",
                }}
              >
                <div className="text-xs mb-1" style={{ color: p.highlight ? "var(--focus-glow)" : "var(--ink-muted)" }}>
                  {p.name}
                </div>
                <div className="text-2xl font-bold mb-3" style={{ color: "var(--ink)" }}>
                  {p.price}
                </div>
                <div className="text-xs mb-1" style={{ color: "var(--ink-muted)" }}>{p.req}</div>
                <div className="text-xs" style={{ color: "var(--ink-subtle)" }}>{p.features}</div>
              </div>
            ))}
          </div>
          <Link
            href="/pricing"
            className="inline-block mt-8 text-sm underline"
            style={{ color: "var(--focus-glow)" }}
          >
            See full pricing →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t text-center" style={{ borderColor: "var(--hairline)" }}>
        <div className="container mx-auto px-6 max-w-xl">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--ink)" }}>
            Ready to ship your Sheet as an API?
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>
            No credit card required. Free tier is genuinely useful.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3.5 rounded-xl text-base font-semibold"
            style={{ background: "var(--focus-primary)", color: "#fff" }}
          >
            Get started free
          </Link>
        </div>
      </section>
    </div>
  );
}
