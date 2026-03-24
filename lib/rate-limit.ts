import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Upstash Redis bağlantısı yoksa (geliştirme ortamı) in-memory fallback kullan
function createRatelimiter(limit: number, windowSeconds: number) {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: "mesopro:rl",
    });
  }
  return null;
}

// In-memory fallback (development only)
type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

interface RateLimitOptions {
  limit: number;
  window: number; // ms
}

export async function rateLimit(
  key: string,
  { limit, window }: RateLimitOptions
): Promise<{ ok: boolean; remaining: number }> {
  const windowSeconds = Math.ceil(window / 1000);
  const limiter = createRatelimiter(limit, windowSeconds);

  if (limiter) {
    const { success, remaining } = await limiter.limit(key);
    return { ok: success, remaining };
  }

  // Fallback: in-memory (dev only)
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + window });
    return { ok: true, remaining: limit - 1 };
  }

  entry.count += 1;
  if (entry.count > limit) return { ok: false, remaining: 0 };
  return { ok: true, remaining: limit - entry.count };
}
