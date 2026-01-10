/**
 * app/auth/oauth-callback/route.ts
 * OAuth callback route handler for tenant email collection.
 * Handles OAuth callbacks from Google and Apple for tenant email collection.
 * This route is separate from admin authentication flows.
 *
 * OAuth Flow (Same as email sign-in flow):
 * 1. User clicks "Continue with Google" on landing page
 * 2. Redirects to Google OAuth consent screen
 * 3. User authorizes → Google redirects here with authorization code
 * 4. Exchange code for access token
 * 5. Fetch user email from Google API
 * 6. Check if email is in email_opt_ins:
 *    - If YES (returning user) → redirect to coupons page
 *    - If NO (new user) → redirect to survey page with returnTo=coupons
 * 7. After survey completion → email is stored, redirect to coupons
 *
 * Note: OAuth users go through the same flow as email sign-in users.
 * They must complete survey before seeing coupons (unless already in opt-in list).
 */

import { NextResponse, type NextRequest } from "next/server";
import { getEmailFromGoogleCode } from "@/lib/google/oauth-direct";
import { verifyEmailOptIn, submitEmail } from "@/app/actions/emails";

export async function GET(request: NextRequest) {
  // Get the correct origin from request headers (handles localhost, production, etc.)
  const host =
    request.headers.get("host") ||
    request.headers.get("x-forwarded-host") ||
    "localhost:3000";
  const protocol =
    request.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  const { searchParams } = new URL(request.url);
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

    // Map OAuth error codes to user-friendly error messages
    let errorCode = "oauth_failed";
    if (error === "access_denied") {
      errorCode = "oauth_access_denied";
    } else if (error === "invalid_request") {
      errorCode = "oauth_invalid_request";
    }

    // If we have tenant in state, redirect back to tenant landing page
    if (state) {
      // Always use path-based routing with tenant slug
      const redirectUrl = new URL(`/${state}`, origin);
      redirectUrl.searchParams.set("error", errorCode);
      return NextResponse.redirect(redirectUrl);
    }

    // Otherwise redirect to home (shouldn't happen if state is properly set)
    const redirectUrl = new URL("/", origin);
    redirectUrl.searchParams.set("error", errorCode);
    return NextResponse.redirect(redirectUrl);
  }

  // Must have code and state (tenant slug)
  if (!code || !state) {
    // Always use path-based routing with tenant slug
    const redirectUrl = new URL(`/${state || "unknown"}`, origin);
    redirectUrl.searchParams.set("error", "oauth_invalid");
    return NextResponse.redirect(redirectUrl);
  }

  // Parse state parameter - can be "tenantSlug" or "tenantSlug|returnTo"
  const [tenantSlug, returnTo] = state.split("|");
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
    // CHECK IF EMAIL IS IN email_opt_ins TABLE
    // ============================================================================
    // OAuth users go through the same flow as email sign-in users.
    // Check if already in opt-in list to determine redirect destination.
    const optInCheck = await verifyEmailOptIn(tenantSlug, email);

    // Build redirect URL based on opt-in status and returnTo
    let redirectPath: string;
    if (returnTo?.includes("survey/completed")) {
      // Coming from survey completion page - user was subscribing to mailing list
      // Store email in opt-in list NOW since they're subscribing
      await submitEmail(tenantSlug, email).catch((err) => {
        console.warn("Failed to store OAuth email from survey completion:", err);
      });
      // Redirect back to survey completed page
      redirectPath = `/${tenantSlug}${returnTo}`;
    } else if (optInCheck.valid) {
      // Returning user - already in opt-in list, go directly to coupons
      redirectPath = `/${tenantSlug}/coupons`;
    } else {
      // New user - not in opt-in list, go to survey first
      redirectPath = `/${tenantSlug}/survey`;
    }
    
    const targetUrl = new URL(redirectPath, origin);
    targetUrl.searchParams.set("email", email);
    
    // Add returnTo=coupons for new users going to survey
    if (!optInCheck.valid && !returnTo?.includes("survey/completed")) {
      targetUrl.searchParams.set("returnTo", "coupons");
    }
    
    // Mark as subscribed if coming from survey completion
    if (returnTo?.includes("survey/completed")) {
      targetUrl.searchParams.set("subscribed", "true");
    }

    return NextResponse.redirect(targetUrl);
  } catch (err) {
    console.error("Error in OAuth callback:", err);

    // Redirect back to tenant landing page with error
    // Always use path-based routing with tenant slug
    const redirectUrl = new URL(`/${tenantSlug}`, origin);
    redirectUrl.searchParams.set(
      "error",
      err instanceof Error ? err.message : "oauth_processing_failed"
    );
    return NextResponse.redirect(redirectUrl);
  }
}
