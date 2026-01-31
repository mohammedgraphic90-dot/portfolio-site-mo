import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function memoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, limit, remaining: Math.max(0, limit - 1), reset: now + windowMs };
  }

  if (b.count >= limit) {
    return { ok: false, limit, remaining: 0, reset: b.resetAt };
  }

  b.count += 1;
  return { ok: true, limit, remaining: Math.max(0, limit - b.count), reset: b.resetAt };
}

let redisClient: Redis | null = null;
const limiterCache = new Map<string, Ratelimit>();

function getRedis(): Redis | null {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  redisClient = new Redis({ url, token });
  return redisClient;
}

function getLimiter(limit: number, windowMs: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const seconds = Math.max(1, Math.ceil(windowMs / 1000));
  const key = `${limit}:${seconds}`;

  const cached = limiterCache.get(key);
  if (cached) return cached;

  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${seconds} s`),
    analytics: true,
    prefix: "ratelimit",
  });

  limiterCache.set(key, rl);
  return rl;
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const limiter = getLimiter(limit, windowMs);

  if (!limiter) {
    return memoryRateLimit(key, limit, windowMs);
  }

  const res = await limiter.limit(key);

  const reset =
    typeof (res as any).reset === "number"
      ? (res as any).reset
      : (res as any).reset instanceof Date
      ? (res as any).reset.getTime()
      : Date.now() + windowMs;

  return {
    ok: Boolean(res.success),
    limit: Number(res.limit ?? limit),
    remaining: Number(res.remaining ?? 0),
    reset,
  };
}
