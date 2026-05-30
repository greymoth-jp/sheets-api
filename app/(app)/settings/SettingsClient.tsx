"use client";

import { useState } from "react";
import { signOut } from "@/lib/auth-client";

interface Props {
  email: string;
  plan: string;
  hasStripeCustomer: boolean;
  hasGoogleToken: boolean;
}

const PLAN_NAMES: Record<string, string> = {
  free: "Free",
  starter: "Starter ($9/mo)",
  dev: "Dev ($19/mo)",
  team: "Team ($49/mo)",
};

const PLAN_PRICES: Record<string, { monthly: string; yearly: string }> = {
  starter: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY ?? "",
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY ?? "",
  },
  dev: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_DEV_MONTHLY ?? "",
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_DEV_YEARLY ?? "",
  },
  team: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY ?? "",
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_YEARLY ?? "",
  },
};

export function SettingsClient({ email, plan, hasStripeCustomer, hasGoogleToken }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade(targetPlan: string, billing: "monthly" | "yearly") {
    setLoading(true);
    const priceId = PLAN_PRICES[targetPlan]?.[billing];
    if (!priceId) {
      alert("Price not configured. Contact support.");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  }

  async function handlePortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  }

  async function handleSignOut() {
    await signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } });
  }

  return (
    <div className="space-y-6">
      {/* Account */}
      <Card title="Account">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm" style={{ color: "var(--ink)" }}>{email}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--ink-subtle)" }}>
              Plan: {PLAN_NAMES[plan] ?? plan}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: "var(--surface-3)", color: "var(--ink-muted)" }}
          >
            Sign out
          </button>
        </div>
      </Card>

      {/* Google connection */}
      <Card title="Google Account">
        {hasGoogleToken ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
            <span style={{ color: "var(--ink-muted)" }}>Connected — your Sheets endpoints are active</span>
          </div>
        ) : (
          <div>
            <p className="text-sm mb-3" style={{ color: "var(--ink-muted)" }}>
              Connect Google to activate your API endpoints.
            </p>
            <a
              href="/api/auth/signin/google"
              className="inline-block px-4 py-2 rounded-lg text-sm"
              style={{ background: "var(--focus-primary)", color: "#fff" }}
            >
              Connect Google Account
            </a>
          </div>
        )}
      </Card>

      {/* Billing */}
      <Card title="Billing">
        {plan === "free" ? (
          <div>
            <p className="text-sm mb-4" style={{ color: "var(--ink-muted)" }}>
              Upgrade to unlock more requests, CRUD writes, and webhooks.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(["starter", "dev"] as const).map((p) => (
                <div
                  key={p}
                  className="p-4 rounded-xl border"
                  style={{ background: "var(--surface-2)", borderColor: "var(--hairline)" }}
                >
                  <div className="font-medium text-sm mb-2" style={{ color: "var(--ink)" }}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpgrade(p, "monthly")}
                      disabled={loading}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                      style={{ background: "var(--focus-primary)", color: "#fff" }}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => handleUpgrade(p, "yearly")}
                      disabled={loading}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                      style={{ background: "var(--surface-3)", color: "var(--ink)" }}
                    >
                      Yearly −20%
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm mb-4" style={{ color: "var(--ink-muted)" }}>
              You're on the <strong style={{ color: "var(--ink)" }}>{PLAN_NAMES[plan]}</strong> plan.
            </p>
            {hasStripeCustomer && (
              <button
                onClick={handlePortal}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                style={{ background: "var(--surface-3)", color: "var(--ink-muted)" }}
              >
                Manage subscription →
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="p-5 rounded-xl border"
      style={{ background: "var(--surface-1)", borderColor: "var(--hairline)" }}
    >
      <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--ink-muted)" }}>
        {title.toUpperCase()}
      </h2>
      {children}
    </div>
  );
}
