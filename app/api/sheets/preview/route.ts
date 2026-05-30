import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { previewSheet } from "@/lib/sheets-proxy";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const spreadsheetId = req.nextUrl.searchParams.get("spreadsheetId");
  const sheet = req.nextUrl.searchParams.get("sheet");

  if (!spreadsheetId || !sheet) {
    return NextResponse.json({ error: "spreadsheetId and sheet required" }, { status: 400 });
  }

  const db = getDb();
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });

  const accessToken = settings?.googleAccessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "Google account not connected" }, { status: 400 });
  }

  try {
    const rows = await previewSheet(accessToken, spreadsheetId, sheet);
    return NextResponse.json({ rows });
  } catch (err) {
    console.error("[sheets/preview] error:", err);
    return NextResponse.json({ error: "Failed to preview sheet" }, { status: 502 });
  }
}
