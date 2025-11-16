/**
 * Google OAuth Server Actions
 *
 * Server-side actions for handling Google OAuth authentication flow.
 * These actions handle post-authentication tasks like email opt-in
 * and analytics tracking.
 *
 * @module app/actions/google/oauth
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { submitEmailOptIn } from "@/app/actions/emails";
import { trackPageVisit } from "@/lib/analytics/events";

/**
 * Response type for OAuth post-authentication operations
 */
export interface OAuthPostAuthResponse {
  success: boolean;
  error: string | null;
  email?: string | null;
}

/**
 * Handles post-authentication tasks after Google OAuth completes
 *
 * This function is called after a user successfully authenticates with Google.
 * It performs the following tasks:
 * 1. Gets the authenticated user's email from Supabase
 * 2. Automatically opts in their email for the tenant (if not already opted in)
 * 3. Tracks an authenticated page visit for analytics
 * 4. Returns the user's email for redirect purposes
 *
 * @param tenantSlug - The tenant slug (e.g., "kingswayd")
 * @returns Response with success status, error (if any), and user email
 *
 * @example
 * ```typescript
 * const result = await handlePostOAuth("kingswayd");
 * if (result.success && result.email) {
 *   // Redirect to coupons page with email
 * }
 * ```
 */
export async function handlePostOAuth(
  tenantSlug: string
): Promise<OAuthPostAuthResponse> {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated. Please try logging in again.",
        email: null,
      };
    }

    // Get user email (required for opt-in)
    const email = user.email;
    if (!email) {
      return {
        success: false,
        error:
          "No email found in Google account. Please use email login instead.",
        email: null,
      };
    }

    // Automatically opt in the user's email for this tenant
    // This ensures they can access coupons even if they haven't manually submitted email
    const optInResult = await submitEmailOptIn(tenantSlug, email);

    if (!optInResult.success && optInResult.error) {
      // Log error but don't fail the flow - user is still authenticated
      console.error("Failed to opt in email after OAuth:", optInResult.error);
      // Continue anyway - the user is authenticated and can still access coupons
    }

    // Track authenticated page visit for analytics
    // This helps track conversion from OAuth login to coupon access
    trackPageVisit(tenantSlug, {
      sessionId: `oauth_${user.id}_${Date.now()}`,
      email: email,
    }).catch((err) => {
      // Don't fail the flow if analytics tracking fails
      console.error("Failed to track OAuth page visit:", err);
    });

    return {
      success: true,
      error: null,
      email: email,
    };
  } catch (err) {
    console.error("Error in handlePostOAuth:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "An unexpected error occurred",
      email: null,
    };
  }
}

/**
 * Verifies that a tenant slug is valid
 *
 * Before initiating OAuth, we should verify that the tenant exists.
 * This prevents OAuth redirects to invalid tenants.
 *
 * @param tenantSlug - The tenant slug to verify
 * @returns True if tenant exists, false otherwise
 */
export async function verifyTenantExists(tenantSlug: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data: tenantId, error } = await supabase.rpc("resolve_tenant", {
      slug_input: tenantSlug,
    });

    return !error && !!tenantId;
  } catch {
    return false;
  }
}
