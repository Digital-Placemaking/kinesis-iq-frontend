/**
 * OAuth Callback Route for Tenant Email Collection
 *
 * Handles OAuth callbacks from Google and Apple for tenant email collection.
 * This route is separate from admin authentication flows.
 *
 * OAuth Flow (Different from email flow):
 * 1. User clicks "Continue with Google" on landing page
 * 2. Redirects to Google OAuth consent screen
 * 3. User authorizes → Google redirects here with authorization code
 * 4. Exchange code for access token
 * 5. Fetch user email from Google API
 * 6. Store email in email_opt_ins table IMMEDIATELY
 * 7. Track analytics event
 * 8. Redirect to tenant coupons page
 *
 * IMPORTANT: OAuth users have their email stored immediately (unlike email users).
 * This means when they click a coupon, the survey page will detect their email
 * is already in the table and skip the survey, going directly to coupon completion.
 *
 * This is intentional - OAuth users have already authenticated, so we trust
 * their email and skip the survey requirement.
 */

import { NextResponse, type NextRequest } from "next/server";
import { getEmailFromGoogleCode } from "@/lib/google/oauth-direct";
import { storeOAuthEmail } from "@/app/actions/google/oauth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // Contains tenant slug
  // Note: Google OAuth doesn't preserve query parameters, so we default to "google"
  // In the future, we could encode the provider in the state parameter
  const provider = "google"; // Default to Google for now (Apple not yet implemented)
  const error = searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error);
    const errorDescription = searchParams.get("error_description");

    // If we have tenant in state, redirect back to tenant landing page
    if (state) {
      const baseUrl = new URL(origin);
      const hostname = baseUrl.hostname;
      const isSubdomain = hostname.split(".").length >= 3;
      const redirectUrl = new URL(isSubdomain ? "/" : `/${state}`, origin);
      redirectUrl.searchParams.set("error", "oauth_failed");
      return NextResponse.redirect(redirectUrl);
    }

    // Otherwise redirect to home
    return NextResponse.redirect(new URL("/", origin));
  }

  // Must have code and state (tenant slug)
  if (!code || !state) {
    const baseUrl = new URL(origin);
    const hostname = baseUrl.hostname;
    const isSubdomain = hostname.split(".").length >= 3;
    const redirectUrl = new URL(
      isSubdomain ? "/" : `/${state || "unknown"}`,
      origin
    );
    redirectUrl.searchParams.set("error", "oauth_invalid");
    return NextResponse.redirect(redirectUrl);
  }

  const tenantSlug = state;
  const redirectUri = new URL("/auth/oauth-callback", origin).toString();

  try {
    let email: string;

    // Handle Google OAuth
    if (provider === "google") {
      // Verify environment variables are set
      if (
        !process.env.GOOGLE_OAUTH_CLIENT_ID ||
        !process.env.GOOGLE_OAUTH_CLIENT_SECRET
      ) {
        throw new Error(
          "Google OAuth credentials not configured. Please set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET environment variables."
        );
      }
      email = await getEmailFromGoogleCode(code, redirectUri);
    } else if (provider === "apple") {
      // Apple OAuth implementation will be added later
      throw new Error("Apple OAuth not yet implemented");
    } else {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    // ============================================================================
    // STORE EMAIL IN email_opt_ins TABLE
    // ============================================================================
    // OAuth users have their email stored immediately (unlike email users who
    // must complete survey first). This means they'll skip surveys on future
    // coupon claims since their email is already in the opt-in table.
    const storeResult = await storeOAuthEmail(tenantSlug, email);

    if (!storeResult.success && storeResult.error) {
      console.error("Failed to store OAuth email:", storeResult.error);
      // Continue anyway - redirect to coupons even if storage fails
      // User can still browse coupons, but may need to complete survey
    }

    // Build redirect URL to tenant's coupons page
    const baseUrl = new URL(origin);
    const hostname = baseUrl.hostname;
    const isSubdomain = hostname.split(".").length >= 3;

    let redirectPath: string;
    if (isSubdomain) {
      redirectPath = "/coupons";
    } else {
      redirectPath = `/${tenantSlug}/coupons`;
    }

    const couponsUrl = new URL(redirectPath, origin);
    if (storeResult.email) {
      couponsUrl.searchParams.set("email", storeResult.email);
    }

    return NextResponse.redirect(couponsUrl);
  } catch (err) {
    console.error("Error in OAuth callback:", err);

    // Redirect back to tenant landing page with error
    const baseUrl = new URL(origin);
    const hostname = baseUrl.hostname;
    const isSubdomain = hostname.split(".").length >= 3;
    const redirectUrl = new URL(isSubdomain ? "/" : `/${tenantSlug}`, origin);
    redirectUrl.searchParams.set(
      "error",
      err instanceof Error ? err.message : "oauth_processing_failed"
    );
    return NextResponse.redirect(redirectUrl);
  }
}
