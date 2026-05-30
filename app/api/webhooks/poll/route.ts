/**
 * POST /api/webhooks/poll
 * Called by the CF Worker cron every ~30s.
 * Polls all active webhooks, diffs sheet data, fires HTTP callbacks on change.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { webhooks, sheetBindings, projects, userSettings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { readSheet } from '@/lib/sheets-proxy';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const POLL_SECRET = process.env.POLL_SECRET ?? '';
const MAX_CONCURRENT = 5;
const MAX_FAILURE_COUNT = 5;
const DELIVERY_TIMEOUT_MS = 8_000;

/** SHA-256 hash of a string, returned as hex */
async function sha256(data: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(data)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** HMAC-SHA256 signature for webhook delivery */
async function hmacSign(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return 'sha256=' + Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface WebhookRow {
  id: string;
  targetUrl: string;
  events: string;
  secret: string;
  isActive: boolean;
  lastRowHash: string | null;
  failureCount: number;
  sheetBindingId: string;
  sheetBinding?: {
    id: string;
    sheetName: string;
    isActive: boolean;
    project?: {
      id: string;
      googleSpreadsheetId: string;
      userId: string;
    };
  };
}

async function processWebhook(webhook: WebhookRow): Promise<'ok' | 'unchanged' | 'error'> {
  const db = getDb();

  const binding = webhook.sheetBinding;
  if (!binding || !binding.isActive || !binding.project) return 'error';

  // Get Google access token
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, binding.project.userId),
  });
  const accessToken = settings?.googleAccessToken;
  if (!accessToken) return 'error';

  let sheetData: { data: Record<string, string>[]; meta: { total: number; cached: boolean } };
  try {
    sheetData = await readSheet(accessToken, binding.project.googleSpreadsheetId, binding.sheetName);
  } catch {
    // Increment failure count
    await db
      .update(webhooks)
      .set({ failureCount: webhook.failureCount + 1 })
      .where(eq(webhooks.id, webhook.id));
    return 'error';
  }

  const currentHash = await sha256(JSON.stringify(sheetData.data));

  if (currentHash === webhook.lastRowHash) {
    return 'unchanged';
  }

  // Data changed — fire webhook
  const payload = JSON.stringify({
    event: 'sheet.changed',
    webhook_id: webhook.id,
    sheet_binding_id: binding.id,
    spreadsheet_id: binding.project.googleSpreadsheetId,
    sheet_name: binding.sheetName,
    timestamp: new Date().toISOString(),
    data: sheetData.data,
  });

  const signature = await hmacSign(webhook.secret, payload);

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);
    const res = await fetch(webhook.targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SheetsAPI-Signature': signature,
        'X-SheetsAPI-Webhook-Id': webhook.id,
      },
      body: payload,
      signal: controller.signal,
    });
    clearTimeout(tid);

    const success = res.ok;

    await db
      .update(webhooks)
      .set({
        lastRowHash: currentHash,
        lastDeliveredAt: new Date(),
        failureCount: success ? 0 : webhook.failureCount + 1,
        // Auto-disable after MAX_FAILURE_COUNT consecutive failures
        isActive: success ? true : webhook.failureCount + 1 < MAX_FAILURE_COUNT,
      })
      .where(eq(webhooks.id, webhook.id));

    return success ? 'ok' : 'error';
  } catch {
    await db
      .update(webhooks)
      .set({
        failureCount: webhook.failureCount + 1,
        isActive: webhook.failureCount + 1 < MAX_FAILURE_COUNT,
      })
      .where(eq(webhooks.id, webhook.id));
    return 'error';
  }
}

export async function POST(req: NextRequest) {
  // Auth: check shared secret from CF Worker
  const secret = req.headers.get('x-poll-secret');
  if (!POLL_SECRET || secret !== POLL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();

  // Load all active webhooks with their bindings + projects
  const activeWebhooks = await db.query.webhooks.findMany({
    where: and(eq(webhooks.isActive, true)),
    with: {
      sheetBinding: {
        with: {
          project: true,
        },
      },
    },
    limit: 100,
  });

  if (activeWebhooks.length === 0) {
    return NextResponse.json({ processed: 0, changed: 0, errors: 0 });
  }

  // Process in concurrent batches of MAX_CONCURRENT
  let changed = 0;
  let errors = 0;
  let processed = 0;

  for (let i = 0; i < activeWebhooks.length; i += MAX_CONCURRENT) {
    const batch = activeWebhooks.slice(i, i + MAX_CONCURRENT);
    const results = await Promise.allSettled(
      batch.map((w) => processWebhook(w as unknown as WebhookRow))
    );
    for (const r of results) {
      processed++;
      if (r.status === 'fulfilled') {
        if (r.value === 'ok') changed++;
        if (r.value === 'error') errors++;
      } else {
        errors++;
      }
    }
  }

  return NextResponse.json({
    processed,
    changed,
    errors,
    ts: new Date().toISOString(),
  });
}
