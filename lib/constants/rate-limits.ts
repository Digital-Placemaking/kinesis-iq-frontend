/**
 * lib/constants/rate-limits.ts
 * Rate limiting configuration constants.
 * Defines rate limit thresholds for various API endpoints and operations.
 */

export const RATE_LIMITS = {
  // Email submission rate limits
  EMAIL_SUBMIT: {
    maxRequests: 5, // Maximum 5 email submissions
    windowMs: 60 * 1000, // Per 60 seconds (1 minute)
  },

  // Survey submission rate limits
  SURVEY_SUBMIT: {
    maxRequests: 3, // Maximum 3 survey submissions
    windowMs: 60 * 1000, // Per 60 seconds (1 minute)
  },

  // Email opt-in rate limits (for social login)
  EMAIL_OPT_IN: {
    maxRequests: 5, // Maximum 5 opt-ins
    windowMs: 60 * 1000, // Per 60 seconds (1 minute)
  },

  // Coupon issuance rate limits (only for generating NEW coupon codes)
  COUPON_ISSUE: {
    maxRequests: 3, // Maximum 3 coupon issuances
    windowMs: 10 * 1000, // Per 10 seconds
  },

  // Coupon check rate limits (for checking existing coupons - less strict than issuance)
  COUPON_CHECK: {
    maxRequests: 20, // Maximum 20 coupon checks
    windowMs: 60 * 1000, // Per 60 seconds (1 minute)
  },

  // General API rate limits
  GENERAL: {
    maxRequests: 20, // Maximum 20 requests
    windowMs: 60 * 1000, // Per 60 seconds (1 minute)
  },

  // Subdomain change rate limits (once per week)
  SUBDOMAIN_CHANGE: {
    maxRequests: 1, // Maximum 1 subdomain change
    windowMs: 7 * 24 * 60 * 60 * 1000, // Per 7 days (1 week)
  },
} as const;
