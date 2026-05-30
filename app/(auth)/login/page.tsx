"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await authClient.signIn.magicLink({ email, callbackURL: "/dashboard" });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Failed to send link");
    } else {
      setSent(true);
    }
  }

  async function handleGoogle() {
    await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="font-mono text-2xl font-bold mb-2" style={{ color: "var(--focus-glow)" }}>
          SheetsAPI
        </div>
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Google Sheets → REST API in 60 seconds
        </p>
      </div>

      <div
        className="p-6 rounded-2xl border"
        style={{ background: "var(--surface-1)", borderColor: "var(--hairline)" }}
      >
        {sent ? (
          <div className="text-center">
            <div className="text-3xl mb-3">✉️</div>
            <p className="font-medium mb-1" style={{ color: "var(--ink)" }}>
              Check your inbox
            </p>
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
              We sent a sign-in link to {email}
            </p>
          </div>
        ) : (
          <>
            {/* Google OAuth */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-sm font-medium mb-4 border transition-opacity hover:opacity-80"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--hairline)",
                color: "var(--ink)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"
                />
                <path
                  fill="#34A853"
                  d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"
                />
                <path
                  fill="#FBBC05"
                  d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"
                />
                <path
                  fill="#EA4335"
                  d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: "var(--hairline)" }} />
              <span className="text-xs" style={{ color: "var(--ink-subtle)" }}>or</span>
              <div className="flex-1 h-px" style={{ background: "var(--hairline)" }} />
            </div>

            {/* Magic link */}
            <form onSubmit={handleMagicLink}>
              {error && (
                <p className="text-xs mb-3" style={{ color: "var(--danger)" }}>{error}</p>
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 rounded-xl text-sm mb-3"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--hairline)",
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-opacity"
                style={{ background: "var(--focus-primary)", color: "#fff" }}
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="text-xs text-center mt-4" style={{ color: "var(--ink-subtle)" }}>
        By signing in you agree to our{" "}
        <a href="/terms" className="underline">Terms</a> and{" "}
        <a href="/privacy" className="underline">Privacy Policy</a>.
      </p>
    </div>
  );
}
