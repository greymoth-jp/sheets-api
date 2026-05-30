/**
 * SheetsAPI — Cloudflare Workers Webhook Poller
 * Runs on a cron schedule (default: every 30s via CF Cron Triggers)
 * Calls the Next.js /api/webhooks/poll endpoint which does the actual
 * sheet-diff comparison and HTTP delivery. The Worker only orchestrates
 * scheduling — no Google API calls happen here.
 *
 * Architecture:
 *   CF Worker (cron 30s) → POST /api/webhooks/poll (Next.js, Vercel)
 *     → reads all active webhooks from Turso
 *     → for each: fetch sheet data → SHA-256 hash → compare lastRowHash
 *     → if changed: POST to targetUrl with HMAC-signed payload
 *     → update lastRowHash + lastDeliveredAt in DB
 *
 * Env vars (set in wrangler.toml or CF dashboard):
 *   APP_URL         — https://sheetsapi.dev
 *   POLL_SECRET     — shared secret to authenticate cron calls
 */

export interface Env {
  APP_URL: string;
  POLL_SECRET: string;
}

export default {
  // HTTP handler (optional — for manual trigger via curl)
  async fetch(request: Request, env: Env): Promise<Response> {
    const auth = request.headers.get('x-poll-secret');
    if (auth !== env.POLL_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }
    return triggerPoll(env);
  },

  // Cron handler — triggered by CF Cron Trigger (every 30s via two 1-min triggers)
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(triggerPoll(env).then(() => undefined));
  },
} satisfies ExportedHandler<Env>;

async function triggerPoll(env: Env): Promise<Response> {
  const url = `${env.APP_URL}/api/webhooks/poll`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-poll-secret': env.POLL_SECRET,
    },
    body: JSON.stringify({ source: 'cf-worker', ts: Date.now() }),
  });

  const body = await res.text();
  console.log(`[webhook-poller] poll ${res.status}: ${body.slice(0, 200)}`);

  return new Response(body, {
    status: res.status,
    headers: { 'content-type': 'application/json' },
  });
}
