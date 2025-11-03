/**
 * Rate limiting configuration
 * Controls request frequency per IP address or identifier
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

  // General API rate limits
  GENERAL: {
    maxRequests: 20, // Maximum 20 requests
    windowMs: 60 * 1000, // Per 60 seconds (1 minute)
  },
} as const;
