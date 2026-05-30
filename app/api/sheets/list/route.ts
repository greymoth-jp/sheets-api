import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { listSpreadsheets, listSheets } from "@/lib/sheets-proxy";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });

  const accessToken = settings?.googleAccessToken;
  if (!accessToken) {
    return NextResponse.json(
      { error: "Google account not connected", code: "NO_GOOGLE_TOKEN" },
      { status: 400 }
    );
  }

  const spreadsheetId = req.nextUrl.searchParams.get("spreadsheetId");

  try {
    if (spreadsheetId) {
      const sheets = await listSheets(accessToken, spreadsheetId);
      return NextResponse.json({ sheets });
    } else {
      const spreadsheets = await listSpreadsheets(accessToken);
      return NextResponse.json({ spreadsheets });
    }
  } catch (err) {
    console.error("[sheets/list] error:", err);
    return NextResponse.json({ error: "Failed to fetch from Google" }, { status: 502 });
  }
}
