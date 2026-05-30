import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { projects, sheetBindings, apiKeys, userSettings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { generateApiKey } from "@/lib/api-key";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, googleSpreadsheetId, spreadsheetTitle, sheetName, slug } = body;

  if (!name || !googleSpreadsheetId || !sheetName || !slug) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getDb();
  const projectId = nanoid(12);
  const bindingId = nanoid(12);
  const keyId = nanoid(12);

  // Check plan limits on # of projects
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });
  const plan = settings?.plan ?? "free";
  const existingCount = await db.query.projects.findMany({
    where: and(eq(projects.userId, session.user.id)),
  });
  const limits = { free: 1, starter: 1, dev: 5, team: Infinity };
  const maxProjects = limits[plan] ?? 1;
  if (existingCount.length >= maxProjects) {
    return NextResponse.json(
      { error: `Plan limit: max ${maxProjects} project(s) on ${plan} plan. Upgrade to add more.` },
      { status: 403 }
    );
  }

  const { plaintext, hash, prefix } = await generateApiKey();

  await db.insert(projects).values({
    id: projectId,
    userId: session.user.id,
    name,
    googleSpreadsheetId,
    spreadsheetTitle,
  });

  await db.insert(sheetBindings).values({
    id: bindingId,
    projectId,
    sheetName,
    slug,
    cacheTtl: 0,
    corsOrigins: "*",
  });

  await db.insert(apiKeys).values({
    id: keyId,
    projectId,
    keyHash: hash,
    keyPrefix: prefix,
    label: "Default key",
    rateLimit: { free: 1000, starter: 10000, dev: 50000, team: 100000 }[plan] ?? 1000,
  });

  // Ensure user settings row exists
  if (!settings) {
    await db.insert(userSettings).values({
      id: nanoid(),
      userId: session.user.id,
      plan: "free",
    });
  }

  return NextResponse.json(
    { projectId, bindingId, apiKey: plaintext },
    { status: 201 }
  );
}
