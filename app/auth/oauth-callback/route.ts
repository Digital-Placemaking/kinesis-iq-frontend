/**
 * app/auth/oauth-callback/route.ts
 * OAuth callback route handler for tenant email collection.
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
import { getEmailFromAppleCode } from "@/lib/apple/oauth-direct";
import { storeOAuthEmail } from "@/app/actions/google/oauth";

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
  const provider = "google";
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
      // Verify Apple environment variables are set
      if (
        !process.env.APPLE_CLIENT_ID ||
        !process.env.APPLE_TEAM_ID ||
        !process.env.APPLE_KEY_ID ||
        !process.env.APPLE_PRIVATE_KEY
      ) {
        throw new Error(
          "Apple OAuth credentials not configured. Please set APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY environment variables."
        );
      }
      email = await getEmailFromAppleCode(code, redirectUri);
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

    // Build redirect URL to tenant's survey page
    // Always use path-based routing with tenant slug to ensure consistency
    // The subdomain routing is handled by the proxy/middleware layer
    const redirectPath = `/${tenantSlug}/survey`;
    const surveyUrl = new URL(redirectPath, origin);

    if (storeResult.email) {
      surveyUrl.searchParams.set("email", storeResult.email);
    }

    return NextResponse.redirect(surveyUrl);
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

/**
 * POST handler for Apple OAuth callback.
 * Apple uses form_post response_mode, so it POSTs the authorization code to this endpoint.
 * 
 * Flow:
 * 1. Apple POSTs form data with code and state to this endpoint
 * 2. We extract the authorization code from the POST body
 * 3. Exchange code for access token and id_token
 * 4. Decode id_token to get user's email
 * 5. Store email in database
 * 6. Redirect to tenant coupons page
 */
export async function POST(request: NextRequest) {
  // Get the correct origin from request headers
  const host =
    request.headers.get("host") ||
    request.headers.get("x-forwarded-host") ||
    "localhost:3000";
  const protocol =
    request.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  // Store tenant slug early for error handling
  let tenantSlug = "unknown";

  try {
    // Parse form data from Apple's POST request
    const formData = await request.formData();
    const code = formData.get("code") as string | null;
    const state = formData.get("state") as string | null; // Contains tenant slug
    const error = formData.get("error") as string | null;

    if (state) {
      tenantSlug = state;
    }

    // Handle OAuth errors
    if (error) {
      console.error("Apple OAuth error:", error);

      let errorCode = "oauth_failed";
      if (error === "access_denied") {
        errorCode = "oauth_access_denied";
      } else if (error === "invalid_request") {
        errorCode = "oauth_invalid_request";
      }

      const redirectUrl = new URL(`/${tenantSlug}`, origin);
      redirectUrl.searchParams.set("error", errorCode);
      return NextResponse.redirect(redirectUrl);
    }

    // Must have code and state (tenant slug)
    if (!code || !state) {
      const redirectUrl = new URL(`/${tenantSlug}`, origin);
      redirectUrl.searchParams.set("error", "oauth_invalid");
      return NextResponse.redirect(redirectUrl);
    }

    const redirectUri = new URL("/auth/oauth-callback", origin).toString();

    // Verify Apple environment variables
    if (
      !process.env.APPLE_CLIENT_ID ||
      !process.env.APPLE_TEAM_ID ||
      !process.env.APPLE_KEY_ID ||
      !process.env.APPLE_PRIVATE_KEY
    ) {
      throw new Error(
        "Apple OAuth credentials not configured. Please set APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY environment variables."
      );
    }

    // Exchange Apple authorization code for email
    // This creates a signed JWT client_secret and exchanges it for tokens
    const email = await getEmailFromAppleCode(code, redirectUri);

    // Store email in email_opt_ins table (same as Google OAuth)
    const storeResult = await storeOAuthEmail(tenantSlug, email);

    if (!storeResult.success && storeResult.error) {
      console.error("Failed to store Apple OAuth email:", storeResult.error);
      // Continue anyway - redirect to survey even if storage fails
    }

    // Redirect to tenant's survey page
    const redirectPath = `/${tenantSlug}/survey`;
    const surveyUrl = new URL(redirectPath, origin);

    if (storeResult.email) {
      surveyUrl.searchParams.set("email", storeResult.email);
    }

    return NextResponse.redirect(surveyUrl);
  } catch (err) {
    console.error("Error in Apple OAuth callback:", err);

    // Use the tenantSlug we stored earlier
    const redirectUrl = new URL(`/${tenantSlug}`, origin);
    redirectUrl.searchParams.set(
      "error",
      err instanceof Error ? err.message : "oauth_processing_failed"
    );
    return NextResponse.redirect(redirectUrl);
  }
}
