/**
 * lib/utils/rate-limit.ts
 * Rate limiting utility using Upstash Redis.
 * Provides distributed rate limiting across all server instances.
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

/**
 * Coupon-Specific Rate Limiting
 * Rate limits coupon issuance per IP address and coupon ID
 */

/**
 * Checks rate limit for coupon issuance WITHOUT incrementing (IP-based, coupon-specific)
 * Prevents spam by limiting how many times an IP can get coupons for a specific coupon
 * This is a read-only check - use incrementCouponRateLimit after successful generation
 *
 * @param headers - Request headers to extract IP address
 * @param couponId - The coupon ID to make rate limiting coupon-specific
 * @param config - Rate limit configuration
 * @returns Rate limit result (checks without incrementing)
 */
export async function checkCouponRateLimit(
  headers: Headers | Record<string, string | string[] | undefined>,
  couponId: string,
  config: RateLimitConfig
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  // Always use IP address for coupon rate limiting (prevents spam with fake emails)
  const ipIdentifier = getClientIdentifier(null, headers);

  // Make rate limit coupon-specific: rate_limit:ip:{ip}:coupon:{couponId}
  const identifier = `${ipIdentifier}:coupon:${couponId}`;
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const resetAt = now + config.windowMs;
  const windowSeconds = Math.ceil(config.windowMs / 1000);

  // If Redis is not configured, allow all requests (fail open)
  if (!redis) {
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }

  try {
    // Get current count from Redis (read-only check)
    const currentCount = await redis.get<number>(key);

    // If no entry exists, allow (counter will be incremented after successful generation)
    if (currentCount === null) {
      return {
        allowed: true,
        remaining: config.maxRequests,
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

    // Within limit - allow (counter will be incremented after successful generation)
    return {
      allowed: true,
      remaining: config.maxRequests - currentCount,
      resetAt,
    };
  } catch (error) {
    // If Redis is unavailable, allow the request (fail open)
    console.error("Coupon rate limit check failed, allowing request:", error);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }
}

/**
 * Increments the rate limit counter for coupon issuance AFTER successful generation
 * This ensures only successful coupon generations count against the rate limit
 *
 * @param headers - Request headers to extract IP address
 * @param couponId - The coupon ID to make rate limiting coupon-specific
 * @param config - Rate limit configuration
 */
export async function incrementCouponRateLimit(
  headers: Headers | Record<string, string | string[] | undefined>,
  couponId: string,
  config: RateLimitConfig
): Promise<void> {
  // Always use IP address for coupon rate limiting (prevents spam with fake emails)
  const ipIdentifier = getClientIdentifier(null, headers);

  // Make rate limit coupon-specific: rate_limit:ip:{ip}:coupon:{couponId}
  const identifier = `${ipIdentifier}:coupon:${couponId}`;
  const key = `rate_limit:${identifier}`;
  const windowSeconds = Math.ceil(config.windowMs / 1000);

  if (!redis) {
    // If Redis is not configured, silently skip (fail open)
    return;
  }

  try {
    // Increment the counter (this will create the key if it doesn't exist)
    await redis.incr(key);
    // Set/refresh expiration
    await redis.expire(key, windowSeconds);
  } catch (error) {
    // Log error but don't fail coupon issuance
    console.error("Failed to increment coupon rate limit:", error);
  }
}

/**
 * Survey Completion Tracking
 * Uses Redis to track completed surveys and prevent re-submission
 */

/**
 * Marks a survey as completed in Redis
 * Prevents users from accessing the survey page again after completion
 *
 * @param tenantSlug - The tenant slug
 * @param email - User's email (or null for anonymous surveys)
 * @param couponId - Optional coupon ID if survey is for a specific coupon
 * @param expirationDays - How many days to keep the completion record (default: 30)
 */
export async function markSurveyCompleted(
  tenantSlug: string,
  email: string | null,
  couponId: string | null = null,
  expirationDays: number = 30
): Promise<void> {
  if (!redis) {
    console.warn("Redis not configured - survey completion tracking disabled");
    return;
  }

  try {
    // Create unique key based on tenant, email, and coupon
    // For anonymous surveys (no email), use a session-based identifier
    let key: string;
    if (email) {
      key = couponId
        ? `survey_completed:${tenantSlug}:${email}:${couponId}`
        : `survey_completed:${tenantSlug}:${email}`;
    } else {
      // For anonymous surveys, we can't reliably track, so skip
      // They can complete multiple times (by design for anonymous surveys)
      return;
    }

    // Set completion flag with expiration (30 days default)
    const expirationSeconds = expirationDays * 24 * 60 * 60;
    await redis.set(key, "1", { ex: expirationSeconds });
  } catch (error) {
    // Log error but don't fail survey submission
    console.error("Failed to mark survey as completed in Redis:", error);
  }
}

/**
 * Checks if a survey has been completed
 * Returns true if the user has already completed this survey
 *
 * @param tenantSlug - The tenant slug
 * @param email - User's email (or null for anonymous surveys)
 * @param couponId - Optional coupon ID if survey is for a specific coupon
 * @returns true if survey is completed, false otherwise
 */
export async function isSurveyCompleted(
  tenantSlug: string,
  email: string | null,
  couponId: string | null = null
): Promise<boolean> {
  if (!redis) {
    // If Redis is not configured, return false (allow access)
    // This ensures the feature degrades gracefully
    return false;
  }

  try {
    // Create the same key format as markSurveyCompleted
    let key: string;
    if (email) {
      key = couponId
        ? `survey_completed:${tenantSlug}:${email}:${couponId}`
        : `survey_completed:${tenantSlug}:${email}`;
    } else {
      // Anonymous surveys can't be tracked reliably
      return false;
    }

    const completed = await redis.get<string>(key);
    return completed === "1";
  } catch (error) {
    // If Redis check fails, allow access (fail open)
    console.error("Failed to check survey completion status:", error);
    return false;
  }
}
