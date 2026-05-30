import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

let _ratelimit: Ratelimit | null = null;

export function getRatelimit(requestsPerDay: number): Ratelimit {
  if (_ratelimit) return _ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("[rate-limit] Upstash not configured — rate limiting disabled");
    // Return a permissive mock
    return {
      limit: async () => ({ success: true, limit: requestsPerDay, remaining: requestsPerDay, reset: 0, pending: Promise.resolve() }),
    } as unknown as Ratelimit;
  }

  const redis = new Redis({ url, token });
  _ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requestsPerDay, "1 d"),
    prefix: "sheetsapi:rl",
  });
  return _ratelimit;
}

let _redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (_redis) return _redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}
