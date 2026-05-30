import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--canvas)" }}>
      <AppNav email={session.user.email} />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>
    </div>
  );
}

function AppNav({ email }: { email: string }) {
  return (
    <nav
      className="border-b flex items-center justify-between px-6 h-14"
      style={{ borderColor: "var(--hairline)", background: "var(--surface-1)" }}
    >
      <a href="/dashboard" className="font-mono text-sm font-bold" style={{ color: "var(--focus-glow)" }}>
        SheetsAPI
      </a>
      <div className="flex items-center gap-4 text-sm" style={{ color: "var(--ink-muted)" }}>
        <a href="/dashboard" className="hover:text-white transition-colors">Projects</a>
        <a href="/settings" className="hover:text-white transition-colors">Settings</a>
        <span className="text-xs px-2 py-1 rounded" style={{ background: "var(--surface-3)", color: "var(--ink-subtle)" }}>
          {email}
        </span>
      </div>
    </nav>
  );
}
