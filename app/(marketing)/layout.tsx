import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--canvas)" }}>
      <header
        className="border-b"
        style={{ borderColor: "var(--hairline)", background: "var(--surface-1)" }}
      >
        <div className="container mx-auto px-6 h-14 flex items-center justify-between max-w-5xl">
          <Link href="/" className="font-mono font-bold text-lg" style={{ color: "var(--focus-glow)" }}>
            SheetsAPI
          </Link>
          <nav className="flex items-center gap-6 text-sm" style={{ color: "var(--ink-muted)" }}>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            {session ? (
              <Link
                href="/dashboard"
                className="px-4 py-1.5 rounded-lg text-sm font-medium"
                style={{ background: "var(--focus-primary)", color: "#fff" }}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-lg text-sm font-medium"
                style={{ background: "var(--focus-primary)", color: "#fff" }}
              >
                Get started free
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer
        className="border-t py-10"
        style={{ borderColor: "var(--hairline)", background: "var(--surface-1)" }}
      >
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between gap-6 text-sm" style={{ color: "var(--ink-muted)" }}>
            <div>
              <div className="font-mono font-bold mb-2" style={{ color: "var(--ink)" }}>SheetsAPI</div>
              <p className="text-xs" style={{ color: "var(--ink-subtle)" }}>
                Google Sheets → REST API. Built by{" "}
                <a href="https://github.com/greymoth-jp" className="underline">greymoth-jp</a>.
              </p>
            </div>
            <div className="flex gap-8">
              <div>
                <div className="font-medium mb-2" style={{ color: "var(--ink)" }}>Product</div>
                <div className="flex flex-col gap-1 text-xs">
                  <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                  <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
                </div>
              </div>
              <div>
                <div className="font-medium mb-2" style={{ color: "var(--ink)" }}>Legal</div>
                <div className="flex flex-col gap-1 text-xs">
                  <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                  <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                  <Link href="/tokushoho" className="hover:text-white transition-colors">特定商取引法</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
