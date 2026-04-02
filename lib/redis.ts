import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export type RateLimitResult = { success: boolean; retryAfter: number };

/**
 * Fixed-window rate limiter using GET + SET only.
 * Falls back to allowing requests if Redis is unavailable.
 */
async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const window = Math.floor(now / windowSeconds);
    const windowKey = `rl:${key}:${window}`;
    const ttl = (window + 1) * windowSeconds - now;

    const current = (await redis.get<number>(windowKey)) ?? 0;
    const newCount = current + 1;
    await redis.set(windowKey, newCount, { ex: ttl });

    return {
      success: newCount <= limit,
      retryAfter: newCount > limit ? ttl : 0,
    };
  } catch {
    // Redis unavailable — fail open to avoid blocking legitimate requests
    return { success: true, retryAfter: 0 };
  }
}

/** Public intake form: 5 submissions per 60 s per IP */
export async function formRateLimit(identifier: string): Promise<RateLimitResult> {
  return rateLimit(`form:${identifier}`, 5, 60);
}

/** Webhook endpoint: 20 requests per 60 s per IP */
export async function webhookRateLimit(identifier: string): Promise<RateLimitResult> {
  return rateLimit(`webhook:${identifier}`, 20, 60);
}

