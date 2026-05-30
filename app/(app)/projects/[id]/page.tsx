import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { projects, apiKeys, usageLogs, sheetBindings } from "@/lib/db/schema";
import { eq, and, count, desc, gte } from "drizzle-orm";

export const metadata = { robots: { index: false } };

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const db = getDb();
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.userId, session.user.id)),
    with: { sheetBindings: true, apiKeys: true },
  });

  if (!project) notFound();

  // Usage last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentUsage = await db
    .select({ count: count() })
    .from(usageLogs)
    .where(and(eq(usageLogs.projectId, id), gte(usageLogs.createdAt, sevenDaysAgo)));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sheetsapi.io";

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Projects
        </Link>
        <span className="mx-2">/</span>
        <span style={{ color: "var(--ink)" }}>{project.name}</span>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--ink)" }}>
        {project.name}
      </h1>
      <p className="text-sm mb-8 font-mono" style={{ color: "var(--ink-subtle)" }}>
        {project.spreadsheetTitle ?? project.googleSpreadsheetId}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div
          className="p-4 rounded-xl border"
          style={{ background: "var(--surface-1)", borderColor: "var(--hairline)" }}
        >
          <div className="text-2xl font-bold font-mono" style={{ color: "var(--ink)" }}>
            {recentUsage[0]?.count.toLocaleString() ?? 0}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>
            Requests (7 days)
          </div>
        </div>
        <div
          className="p-4 rounded-xl border"
          style={{ background: "var(--surface-1)", borderColor: "var(--hairline)" }}
        >
          <div className="text-2xl font-bold font-mono" style={{ color: "var(--ink)" }}>
            {project.sheetBindings.length}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>
            Endpoints
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--ink-muted)" }}>
          ENDPOINTS
        </h2>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--hairline)" }}>
          {project.sheetBindings.map((binding) => (
            <div
              key={binding.id}
              className="p-4 border-b last:border-b-0"
              style={{ background: "var(--surface-1)", borderColor: "var(--hairline)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-mono font-bold"
                  style={{ background: "var(--focus-deep)", color: "var(--focus-glow)" }}
                >
                  GET
                </span>
                <code className="text-sm font-mono" style={{ color: "var(--ink)" }}>
                  {appUrl}/api/v1/{project.id}/{binding.slug}
                </code>
              </div>
              <div className="flex gap-3 text-xs" style={{ color: "var(--ink-subtle)" }}>
                <span>Sheet: {binding.sheetName}</span>
                <span>Cache: {binding.cacheTtl === 0 ? "off" : `${binding.cacheTtl}s`}</span>
                <span>CORS: {binding.corsOrigins}</span>
              </div>
              {/* cURL example */}
              <details className="mt-3">
                <summary className="text-xs cursor-pointer" style={{ color: "var(--ink-muted)" }}>
                  cURL example
                </summary>
                <pre
                  className="mt-2 p-3 rounded text-xs overflow-x-auto"
                  style={{ background: "var(--surface-3)", color: "var(--ink-muted)" }}
                >
{`curl -H "X-API-Key: sk_live_••••••••" \\
  "${appUrl}/api/v1/${project.id}/${binding.slug}"`}
                </pre>
              </details>
            </div>
          ))}
        </div>
      </section>

      {/* API Keys */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--ink-muted)" }}>
          API KEYS
        </h2>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--hairline)" }}>
          {project.apiKeys.map((key) => (
            <div
              key={key.id}
              className="p-4 border-b last:border-b-0 flex items-center justify-between"
              style={{ background: "var(--surface-1)", borderColor: "var(--hairline)" }}
            >
              <div>
                <div className="font-mono text-sm" style={{ color: "var(--ink)" }}>
                  {key.keyPrefix}••••••••••••••••
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--ink-subtle)" }}>
                  {key.label ?? "API Key"} · {key.rateLimit.toLocaleString()} req/day limit
                </div>
              </div>
              {key.lastUsedAt && (
                <div className="text-xs" style={{ color: "var(--ink-subtle)" }}>
                  Last used {new Date(key.lastUsedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: "var(--ink-subtle)" }}>
          API keys are shown in full only when created. To rotate, delete and create a new one.
        </p>
      </section>

      {/* Docs link */}
      <div
        className="p-4 rounded-xl border"
        style={{ background: "var(--surface-1)", borderColor: "var(--hairline)" }}
      >
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Read the{" "}
          <Link href="/docs" className="underline" style={{ color: "var(--focus-glow)" }}>
            API documentation
          </Link>{" "}
          for filtering, pagination, and CRUD examples.
        </p>
      </div>
    </div>
  );
}
