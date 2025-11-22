/**
 * app/actions/google/oauth.ts
 * Server-side actions for handling direct Google OAuth email collection.
 * These actions handle storing emails in email_opt_ins without creating
 * Supabase Auth users.
 *
 * @module app/actions/google/oauth
 */

"use server";

import { submitEmailOptIn } from "@/app/actions/emails";
import { trackPageVisit } from "@/lib/analytics/events";

/**
 * Response type for OAuth email collection operations
 */
export interface OAuthEmailResponse {
  success: boolean;
  error: string | null;
  email?: string | null;
}

/**
 * Handles storing email from OAuth flow
 *
 * This function stores the email address collected from OAuth
 * into the email_opt_ins table for the tenant.
 *
 * Flow:
 * 1. Stores the email in email_opt_ins table for the tenant
 * 2. Tracks analytics event
 * 3. Returns the email for redirect purposes
 *
 * @param tenantSlug - The tenant slug (e.g., "kingswayd")
 * @param email - The email address from OAuth provider
 * @returns Response with success status, error (if any), and user email
 *
 * @example
 * ```typescript
 * const result = await storeOAuthEmail("kingswayd", "user@example.com");
 * if (result.success && result.email) {
 *   // Redirect to coupons page with email
 * }
 * ```
 */
export async function storeOAuthEmail(
  tenantSlug: string,
  email: string
): Promise<OAuthEmailResponse> {
  try {
    if (!email || !email.trim()) {
      return {
        success: false,
        error: "No email provided",
        email: null,
      };
    }

    // Store the email in email_opt_ins table for this tenant
    const optInResult = await submitEmailOptIn(tenantSlug, email.trim());

    if (!optInResult.success && optInResult.error) {
      // Log error but continue - email might already be registered
      console.error("Failed to opt in email after OAuth:", optInResult.error);
      // If it's a duplicate, that's okay - return success
      if (
        optInResult.error.includes("already") ||
        optInResult.error.includes("unique")
      ) {
        return {
          success: true,
          error: null,
          email: email.trim(),
        };
      }
      return {
        success: false,
        error: optInResult.error,
        email: null,
      };
    }

    // Track page visit for analytics
    trackPageVisit(tenantSlug, {
      sessionId: `oauth_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`,
      email: email.trim(),
    }).catch((err) => {
      // Don't fail the flow if analytics tracking fails
      console.error("Failed to track OAuth page visit:", err);
    });

    return {
      success: true,
      error: null,
      email: email.trim(),
    };
  } catch (err) {
    console.error("Error in storeOAuthEmail:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "An unexpected error occurred",
      email: null,
    };
  }
}
