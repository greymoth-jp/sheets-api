"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "var(--canvas)", color: "var(--ink)" }}
    >
      <div className="text-center">
        <div className="font-mono text-5xl font-bold mb-4" style={{ color: "var(--danger)" }}>
          Error
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>
          Something went wrong.
        </p>
        <button
          onClick={reset}
          className="text-sm px-4 py-2 rounded-lg"
          style={{ background: "var(--surface-1)", color: "var(--ink)", border: "1px solid var(--hairline)" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
