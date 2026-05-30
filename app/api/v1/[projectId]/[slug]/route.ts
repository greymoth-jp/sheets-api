import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { apiKeys, sheetBindings, projects, usageLogs, userSettings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyApiKey } from "@/lib/api-key";
import { getRatelimit, getRedis } from "@/lib/rate-limit";
import {
  readSheet,
  appendRow,
  updateRow,
  deleteRow,
} from "@/lib/sheets-proxy";
import { nanoid } from "nanoid";

const PLAN_LIMITS: Record<string, number> = {
  free: 1000,
  starter: 10000,
  dev: 50000,
  team: 100000,
};

function corsHeaders(origins: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origins === "*" ? "*" : origins,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  };
}

async function resolveBinding(projectId: string, slug: string) {
  const db = getDb();
  const binding = await db.query.sheetBindings.findFirst({
    where: and(
      eq(sheetBindings.projectId, projectId),
      eq(sheetBindings.slug, slug),
      eq(sheetBindings.isActive, true)
    ),
    with: { project: true },
  });
  return binding;
}

async function resolveApiKey(rawKey: string | null) {
  if (!rawKey) return null;
  const db = getDb();
  const prefix = rawKey.slice(0, 12);
  const candidates = await db.query.apiKeys.findMany({
    where: and(eq(apiKeys.keyPrefix, prefix), eq(apiKeys.isActive, true)),
  });
  for (const candidate of candidates) {
    const valid = await verifyApiKey(rawKey, candidate.keyHash);
    if (valid) return candidate;
  }
  return null;
}

async function logUsage(params: {
  apiKeyId: string | null;
  sheetBindingId: string;
  projectId: string;
  method: string;
  statusCode: number;
  cached: boolean;
  responseMs: number;
}) {
  try {
    const db = getDb();
    await db.insert(usageLogs).values({
      id: nanoid(),
      ...params,
    });
  } catch {
    // non-blocking
  }
}

type RouteContext = { params: Promise<{ projectId: string; slug: string }> };

export async function OPTIONS(req: NextRequest, ctx: RouteContext) {
  const { projectId, slug } = await ctx.params;
  const binding = await resolveBinding(projectId, slug);
  const origins = binding?.corsOrigins ?? "*";
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origins),
  });
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const start = Date.now();
  const { projectId, slug } = await ctx.params;

  const rawKey = req.headers.get("x-api-key");
  const keyRecord = await resolveApiKey(rawKey);
  if (!keyRecord) {
    return NextResponse.json(
      { error: "Unauthorized", code: "INVALID_API_KEY" },
      { status: 401 }
    );
  }

  const binding = await resolveBinding(projectId, slug);
  if (!binding) {
    return NextResponse.json(
      { error: "Not found", code: "BINDING_NOT_FOUND" },
      { status: 404 }
    );
  }

  // Rate limit based on plan
  const db = getDb();
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, binding.project.userId),
  });
  const plan = settings?.plan ?? "free";
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const rl = getRatelimit(limit);
  const { success } = await rl.limit(keyRecord.id);
  if (!success) {
    await logUsage({
      apiKeyId: keyRecord.id,
      sheetBindingId: binding.id,
      projectId,
      method: "GET",
      statusCode: 429,
      cached: false,
      responseMs: Date.now() - start,
    });
    return NextResponse.json(
      { error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" },
      { status: 429, headers: corsHeaders(binding.corsOrigins) }
    );
  }

  // Cache check
  const redis = getRedis();
  const cacheKey = `sheet:${projectId}:${slug}:${req.nextUrl.search}`;
  if (redis && binding.cacheTtl > 0) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      await logUsage({
        apiKeyId: keyRecord.id,
        sheetBindingId: binding.id,
        projectId,
        method: "GET",
        statusCode: 200,
        cached: true,
        responseMs: Date.now() - start,
      });
      return NextResponse.json(cached, {
        headers: { ...corsHeaders(binding.corsOrigins), "X-Cache": "HIT" },
      });
    }
  }

  // Fetch Google access token
  const ownerSettings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, binding.project.userId),
  });
  const accessToken = ownerSettings?.googleAccessToken;
  if (!accessToken) {
    return NextResponse.json(
      { error: "Google account not connected", code: "NO_GOOGLE_TOKEN" },
      { status: 503, headers: corsHeaders(binding.corsOrigins) }
    );
  }

  // Query params
  const query = Object.fromEntries(req.nextUrl.searchParams.entries());

  try {
    const result = await readSheet(
      accessToken,
      binding.project.googleSpreadsheetId,
      binding.sheetName,
      query
    );

    if (redis && binding.cacheTtl > 0) {
      await redis.setex(cacheKey, binding.cacheTtl, result);
    }

    await logUsage({
      apiKeyId: keyRecord.id,
      sheetBindingId: binding.id,
      projectId,
      method: "GET",
      statusCode: 200,
      cached: false,
      responseMs: Date.now() - start,
    });

    return NextResponse.json(result, {
      headers: { ...corsHeaders(binding.corsOrigins), "X-Cache": "MISS" },
    });
  } catch (err) {
    console.error("[api/v1] GET error:", err);
    return NextResponse.json(
      { error: "Failed to read sheet", code: "SHEETS_ERROR" },
      { status: 502, headers: corsHeaders(binding.corsOrigins) }
    );
  }
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const start = Date.now();
  const { projectId, slug } = await ctx.params;

  const rawKey = req.headers.get("x-api-key");
  const keyRecord = await resolveApiKey(rawKey);
  if (!keyRecord) {
    return NextResponse.json(
      { error: "Unauthorized", code: "INVALID_API_KEY" },
      { status: 401 }
    );
  }

  const binding = await resolveBinding(projectId, slug);
  if (!binding) {
    return NextResponse.json(
      { error: "Not found", code: "BINDING_NOT_FOUND" },
      { status: 404 }
    );
  }

  const db = getDb();
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, binding.project.userId),
  });

  // POST/PUT/DELETE require Dev plan or above
  const plan = settings?.plan ?? "free";
  if (plan === "free" || plan === "starter") {
    return NextResponse.json(
      { error: "CRUD writes require Dev plan or above", code: "PLAN_REQUIRED" },
      { status: 403, headers: corsHeaders(binding.corsOrigins) }
    );
  }

  const ownerSettings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, binding.project.userId),
  });
  const accessToken = ownerSettings?.googleAccessToken;
  if (!accessToken) {
    return NextResponse.json(
      { error: "Google account not connected", code: "NO_GOOGLE_TOKEN" },
      { status: 503, headers: corsHeaders(binding.corsOrigins) }
    );
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", code: "INVALID_BODY" },
      { status: 400, headers: corsHeaders(binding.corsOrigins) }
    );
  }

  try {
    const result = await appendRow(
      accessToken,
      binding.project.googleSpreadsheetId,
      binding.sheetName,
      body
    );

    await logUsage({
      apiKeyId: keyRecord.id,
      sheetBindingId: binding.id,
      projectId,
      method: "POST",
      statusCode: 201,
      cached: false,
      responseMs: Date.now() - start,
    });

    return NextResponse.json(
      { success: true, row_id: result.rowIndex },
      { status: 201, headers: corsHeaders(binding.corsOrigins) }
    );
  } catch (err) {
    console.error("[api/v1] POST error:", err);
    return NextResponse.json(
      { error: "Failed to append row", code: "SHEETS_ERROR" },
      { status: 502, headers: corsHeaders(binding.corsOrigins) }
    );
  }
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const start = Date.now();
  const { projectId, slug } = await ctx.params;

  const rawKey = req.headers.get("x-api-key");
  const keyRecord = await resolveApiKey(rawKey);
  if (!keyRecord) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const binding = await resolveBinding(projectId, slug);
  if (!binding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const db = getDb();
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, binding.project.userId),
  });
  const plan = settings?.plan ?? "free";
  if (plan === "free" || plan === "starter") {
    return NextResponse.json(
      { error: "CRUD writes require Dev plan or above", code: "PLAN_REQUIRED" },
      { status: 403, headers: corsHeaders(binding.corsOrigins) }
    );
  }

  const rowId = parseInt(req.nextUrl.searchParams.get("row_id") ?? "", 10);
  if (isNaN(rowId) || rowId < 2) {
    return NextResponse.json({ error: "Missing or invalid row_id" }, { status: 400 });
  }

  const ownerSettings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, binding.project.userId),
  });
  const accessToken = ownerSettings?.googleAccessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "Google account not connected" }, { status: 503 });
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await updateRow(
      accessToken,
      binding.project.googleSpreadsheetId,
      binding.sheetName,
      rowId,
      body
    );

    await logUsage({
      apiKeyId: keyRecord.id,
      sheetBindingId: binding.id,
      projectId,
      method: "PUT",
      statusCode: 200,
      cached: false,
      responseMs: Date.now() - start,
    });

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders(binding.corsOrigins) }
    );
  } catch (err) {
    console.error("[api/v1] PUT error:", err);
    return NextResponse.json({ error: "Failed to update row" }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const start = Date.now();
  const { projectId, slug } = await ctx.params;

  const rawKey = req.headers.get("x-api-key");
  const keyRecord = await resolveApiKey(rawKey);
  if (!keyRecord) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const binding = await resolveBinding(projectId, slug);
  if (!binding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const db = getDb();
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, binding.project.userId),
  });
  const plan = settings?.plan ?? "free";
  if (plan === "free" || plan === "starter") {
    return NextResponse.json(
      { error: "CRUD writes require Dev plan or above" },
      { status: 403, headers: corsHeaders(binding.corsOrigins) }
    );
  }

  const rowId = parseInt(req.nextUrl.searchParams.get("row_id") ?? "", 10);
  if (isNaN(rowId) || rowId < 2) {
    return NextResponse.json({ error: "Missing or invalid row_id" }, { status: 400 });
  }

  const soft = req.nextUrl.searchParams.get("soft") === "true";

  const ownerSettings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, binding.project.userId),
  });
  const accessToken = ownerSettings?.googleAccessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "Google account not connected" }, { status: 503 });
  }

  try {
    await deleteRow(
      accessToken,
      binding.project.googleSpreadsheetId,
      binding.sheetName,
      rowId,
      soft
    );

    await logUsage({
      apiKeyId: keyRecord.id,
      sheetBindingId: binding.id,
      projectId,
      method: "DELETE",
      statusCode: 200,
      cached: false,
      responseMs: Date.now() - start,
    });

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders(binding.corsOrigins) }
    );
  } catch (err) {
    console.error("[api/v1] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete row" }, { status: 502 });
  }
}
