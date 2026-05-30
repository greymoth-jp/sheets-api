import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { projects, sheetBindings, usageLogs, userSettings } from "@/lib/db/schema";
import { eq, count, and, gte } from "drizzle-orm";

export const metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const db = getDb();
  const userProjects = await db.query.projects.findMany({
    where: eq(projects.userId, session.user.id),
    with: { sheetBindings: true },
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });

  // Usage today across all projects
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayUsage = await db
    .select({ count: count() })
    .from(usageLogs)
    .where(
      and(
        eq(usageLogs.projectId, session.user.id),
        gte(usageLogs.createdAt, todayStart)
      )
    );

  const plan = settings?.plan ?? "free";
  const dailyLimit = { free: 1000, starter: 10000, dev: 50000, team: 100000 }[plan] ?? 1000;
  const usedToday = todayUsage[0]?.count ?? 0;

  const hasGoogleToken = !!settings?.googleAccessToken;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>
            Projects
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
            {usedToday.toLocaleString()} / {dailyLimit.toLocaleString()} requests today
          </p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: "var(--focus-primary)", color: "#fff" }}
        >
          + New Project
        </Link>
      </div>

      {/* Google not connected warning */}
      {!hasGoogleToken && (
        <div
          className="mb-6 p-4 rounded-lg border text-sm"
          style={{
            background: "color-mix(in srgb, var(--warning) 10%, transparent)",
            borderColor: "var(--warning)",
            color: "var(--warning)",
          }}
        >
          Google account not connected. <Link href="/settings" className="underline">Connect in Settings</Link> to activate your endpoints.
        </div>
      )}

      {/* Usage bar */}
      <div
        className="mb-8 p-4 rounded-lg border"
        style={{ background: "var(--surface-1)", borderColor: "var(--hairline)" }}
      >
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: "var(--ink-muted)" }}>Daily usage</span>
          <span style={{ color: "var(--ink)" }}>
            <span className="font-mono">{usedToday.toLocaleString()}</span> / {dailyLimit.toLocaleString()} req
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min((usedToday / dailyLimit) * 100, 100)}%`,
              background: usedToday / dailyLimit > 0.8 ? "var(--warning)" : "var(--focus-primary)",
            }}
          />
        </div>
        {plan === "free" && (
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs" style={{ color: "var(--ink-subtle)" }}>
              Free plan · 1K req/day · read-only
            </span>
            <Link
              href="/pricing"
              className="text-xs px-2 py-1 rounded"
              style={{ background: "var(--focus-deep)", color: "var(--focus-glow)" }}
            >
              Upgrade →
            </Link>
          </div>
        )}
      </div>

      {/* Projects list */}
      {userProjects.length === 0 ? (
        <div
          className="text-center py-20 rounded-xl border border-dashed"
          style={{ borderColor: "var(--hairline)" }}
        >
          <p className="text-lg font-medium mb-2" style={{ color: "var(--ink-muted)" }}>
            No projects yet
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--ink-subtle)" }}>
            Connect your first Google Sheet to get a REST API endpoint.
          </p>
          <Link
            href="/projects/new"
            className="inline-flex px-5 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: "var(--focus-primary)", color: "#fff" }}
          >
            Connect a Sheet
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {userProjects.map((project) => (
            <div
              key={project.id}
              className="p-5 rounded-xl border"
              style={{ background: "var(--surface-1)", borderColor: "var(--hairline)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-semibold" style={{ color: "var(--ink)" }}>
                    {project.name}
                  </h2>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--ink-subtle)" }}>
                    {project.spreadsheetTitle ?? project.googleSpreadsheetId}
                  </p>
                </div>
                <Link
                  href={`/projects/${project.id}`}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: "var(--surface-3)", color: "var(--ink-muted)" }}
                >
                  Manage →
                </Link>
              </div>
              {project.sheetBindings.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--ink-subtle)" }}>
                  No endpoints configured.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {project.sheetBindings.map((b) => (
                    <span
                      key={b.id}
                      className="text-xs px-2 py-1 rounded font-mono"
                      style={{ background: "var(--surface-3)", color: "var(--ink-muted)" }}
                    >
                      GET /{b.slug}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
