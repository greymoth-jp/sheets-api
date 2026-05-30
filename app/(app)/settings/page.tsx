import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SettingsClient } from "./SettingsClient";

export const metadata = {
  title: "Settings — SheetsAPI",
  robots: { index: false },
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const db = getDb();
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--ink)" }}>
        Settings
      </h1>
      <SettingsClient
        email={session.user.email}
        plan={settings?.plan ?? "free"}
        hasStripeCustomer={!!settings?.stripeCustomerId}
        hasGoogleToken={!!settings?.googleAccessToken}
      />
    </div>
  );
}
