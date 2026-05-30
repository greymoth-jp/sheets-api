export const metadata = {
  title: "API Docs — SheetsAPI",
  description: "SheetsAPI REST API documentation. Authentication, endpoints, filtering, CRUD, webhooks.",
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sheetsapi.io";

export default function DocsPage() {
  return (
    <div className="container mx-auto px-6 max-w-4xl py-16">
      <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--ink)" }}>
        API Documentation
      </h1>
      <p className="mb-10 text-sm" style={{ color: "var(--ink-muted)" }}>
        Base URL: <code className="font-mono" style={{ color: "var(--focus-glow)" }}>{appUrl}/api/v1</code>
      </p>

      <Section title="Authentication">
        <p className="text-sm mb-3" style={{ color: "var(--ink-muted)" }}>
          Include your API key in the <code className="font-mono text-xs px-1 py-0.5 rounded" style={{ background: "var(--surface-3)", color: "var(--focus-glow)" }}>X-API-Key</code> header for all requests.
        </p>
        <Code>{`curl -H "X-API-Key: sk_live_YOUR_KEY" \\
  ${appUrl}/api/v1/{project-id}/{slug}`}</Code>
      </Section>

      <Section title="GET — Read rows">
        <Code>{`GET /api/v1/{project-id}/{slug}

# Filter by exact match
GET /api/v1/{project-id}/{slug}?status=active

# Comparison operators
GET /api/v1/{project-id}/{slug}?age_gt=25&age_lte=65

# Pagination
GET /api/v1/{project-id}/{slug}?page=2&limit=50

# Response
{
  "data": [{ "_row_id": "2", "name": "John", "status": "active" }],
  "meta": { "total": 1, "cached": false }
}`}</Code>
        <p className="text-xs mt-3" style={{ color: "var(--ink-subtle)" }}>
          Operators: <code className="font-mono">_gt</code>, <code className="font-mono">_lt</code>, <code className="font-mono">_gte</code>, <code className="font-mono">_lte</code>, <code className="font-mono">_ne</code>
        </p>
      </Section>

      <Section title="POST — Append row (Dev+)">
        <Code>{`POST /api/v1/{project-id}/{slug}
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com",
  "status": "active"
}

# Response 201
{ "success": true, "row_id": 5 }`}</Code>
      </Section>

      <Section title="PUT — Update row (Dev+)">
        <Code>{`PUT /api/v1/{project-id}/{slug}?row_id=5
Content-Type: application/json

{ "status": "inactive" }

# Response 200
{ "success": true }`}</Code>
      </Section>

      <Section title="DELETE — Remove row (Dev+)">
        <Code>{`# Hard delete
DELETE /api/v1/{project-id}/{slug}?row_id=5

# Soft delete (sets _deleted=true column)
DELETE /api/v1/{project-id}/{slug}?row_id=5&soft=true

# Response 200
{ "success": true }`}</Code>
      </Section>

      <Section title="Response headers">
        <table className="text-sm w-full">
          <thead>
            <tr>
              <th className="text-left pb-2 font-mono text-xs pr-8" style={{ color: "var(--ink-muted)" }}>Header</th>
              <th className="text-left pb-2 text-xs" style={{ color: "var(--ink-muted)" }}>Value</th>
            </tr>
          </thead>
          <tbody className="text-xs" style={{ color: "var(--ink-subtle)" }}>
            <tr><td className="font-mono pr-8 py-1">X-Cache</td><td>HIT or MISS</td></tr>
            <tr><td className="font-mono pr-8 py-1">Access-Control-Allow-Origin</td><td>Configured CORS origins (default: *)</td></tr>
          </tbody>
        </table>
      </Section>

      <Section title="Error codes">
        <table className="text-sm w-full">
          <thead>
            <tr>
              <th className="text-left pb-2 text-xs pr-6" style={{ color: "var(--ink-muted)" }}>HTTP</th>
              <th className="text-left pb-2 font-mono text-xs pr-8" style={{ color: "var(--ink-muted)" }}>code</th>
              <th className="text-left pb-2 text-xs" style={{ color: "var(--ink-muted)" }}>Meaning</th>
            </tr>
          </thead>
          <tbody className="text-xs" style={{ color: "var(--ink-subtle)" }}>
            <tr><td className="pr-6 py-1">401</td><td className="font-mono pr-8">INVALID_API_KEY</td><td>Missing or incorrect API key</td></tr>
            <tr><td className="pr-6 py-1">404</td><td className="font-mono pr-8">BINDING_NOT_FOUND</td><td>Project or slug not found</td></tr>
            <tr><td className="pr-6 py-1">429</td><td className="font-mono pr-8">RATE_LIMIT_EXCEEDED</td><td>Daily limit reached</td></tr>
            <tr><td className="pr-6 py-1">403</td><td className="font-mono pr-8">PLAN_REQUIRED</td><td>Feature requires Dev plan</td></tr>
            <tr><td className="pr-6 py-1">502</td><td className="font-mono pr-8">SHEETS_ERROR</td><td>Google Sheets API error</td></tr>
          </tbody>
        </table>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--ink)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre
      className="p-4 rounded-xl text-xs overflow-x-auto"
      style={{ background: "var(--surface-1)", border: "1px solid var(--hairline)", color: "var(--ink-muted)" }}
    >
      {children}
    </pre>
  );
}
