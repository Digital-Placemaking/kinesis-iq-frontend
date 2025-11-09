/**
 * Rate limiting utility
 * Simple in-memory rate limiter for server actions
 *
 * NOTE: This in-memory implementation has limitations:
 * - Rate limits are NOT shared across server instances/containers
 * - Rate limits are lost on server restarts
 * - In serverless environments (Vercel, AWS Lambda), each invocation may have a separate Map
 * - Users can bypass rate limits by hitting different instances
 *
 * For production/multi-instance deployments, upgrade to Redis or a database-backed solution:
 * - Redis (Upstash, Vercel KV, or self-hosted)
 * - Supabase Postgres (use your existing database)
 * - This ensures rate limits work correctly across all instances and persist across restarts
 */

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

// In-memory store: Map<identifier, { count: number, resetAt: number }>
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Checks if a request should be rate limited
 * @param identifier - Unique identifier (IP address, email, etc.)
 * @param config - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No entry exists or window has expired
  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }

  // Entry exists and is within window
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count += 1;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
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
