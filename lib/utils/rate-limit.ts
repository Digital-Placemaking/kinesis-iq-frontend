/**
 * Rate limiting utility
 * Uses Upstash Redis for distributed rate limiting across all server instances
 *
 * Benefits over database solutions:
 * - Much faster lookups (in-memory Redis vs database queries)
 * - Better performance at scale (handles high concurrent load)
 * - Automatic key expiration (no cleanup needed)
 * - Shared across all server instances/containers
 * - Works correctly in serverless environments (Vercel, AWS Lambda)
 * - Users cannot bypass rate limits by hitting different instances
 *
 * Uses fixed-window rate limiting algorithm:
 * - Each rate limit window is a fixed duration (e.g., 60 seconds)
 * - Count resets at the end of each window
 * - Simple and efficient for Redis
 */

import { Redis } from "@upstash/redis";

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

// Initialize Redis client (uses REST API, works in serverless)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Checks if a request should be rate limited using Upstash Redis
 * Uses fixed-window rate limiting algorithm
 *
 * @param identifier - Unique identifier (IP address, email, etc.)
 * @param config - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  const now = Date.now();
  const resetAt = now + config.windowMs;
  const key = `rate_limit:${identifier}`;
  const windowSeconds = Math.ceil(config.windowMs / 1000);

  // If Redis is not configured, allow all requests (fail open)
  if (!redis) {
    console.warn(
      "Redis not configured for rate limiting - allowing all requests. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables."
    );
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }

  try {
    // Get current count from Redis
    const currentCount = await redis.get<number>(key);

    // If no entry exists, create new entry with count 1
    if (currentCount === null) {
      await redis.set(key, 1, { ex: windowSeconds });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt,
      };
    }

    // Entry exists - check if limit exceeded
    if (currentCount >= config.maxRequests) {
      // Get TTL to calculate reset time
      const ttl = await redis.ttl(key);
      const calculatedResetAt = now + (ttl > 0 ? ttl * 1000 : config.windowMs);

      return {
        allowed: false,
        remaining: 0,
        resetAt: calculatedResetAt,
      };
    }

    // Increment count atomically
    const newCount = await redis.incr(key);

    // Refresh expiration (Redis keeps TTL on increment, but refresh to be safe)
    await redis.expire(key, windowSeconds);

    return {
      allowed: true,
      remaining: config.maxRequests - newCount,
      resetAt,
    };
  } catch (error) {
    // If Redis is unavailable, allow the request (fail open)
    // Log error but don't block legitimate users
    console.error("Rate limit check failed, allowing request:", error);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }
}

/**
 * Gets the client identifier for rate limiting
 * Uses email as identifier for email-related endpoints, otherwise uses IP
 */
export function getClientIdentifier(
  email?: string | null,
  headers?: Headers | Record<string, string | string[] | undefined>
): string {
  // For email-related endpoints, use email as identifier (more accurate)
  if (email) {
    return `email:${email}`;
  }

  // For other endpoints, try to get IP from headers
  if (headers) {
    let forwarded: string | string[] | undefined;
    let realIp: string | string[] | undefined;

    // Handle Headers object (Web API)
    if (headers instanceof Headers) {
      forwarded = headers.get("x-forwarded-for") || undefined;
      realIp = headers.get("x-real-ip") || undefined;
    } else {
      // Handle Record type
      forwarded = headers["x-forwarded-for"];
      realIp = headers["x-real-ip"];
    }

    const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const realIpStr = Array.isArray(realIp) ? realIp[0] : realIp;

    if (forwardedStr) {
      return `ip:${forwardedStr.split(",")[0].trim()}`;
    }
    if (realIpStr) {
      return `ip:${realIpStr}`;
    }
  }

  // Fallback: use a default identifier
  return "unknown";
}
