import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "var(--canvas)", color: "var(--ink)" }}
    >
      <div className="text-center">
        <div className="font-mono text-6xl font-bold mb-4" style={{ color: "var(--hairline-strong)" }}>
          404
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>
          This page doesn't exist.
        </p>
        <Link
          href="/"
          className="text-sm underline"
          style={{ color: "var(--focus-glow)" }}
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
