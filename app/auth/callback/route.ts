/**
 * app/auth/callback/route.ts
 * Auth callback route handler for Supabase Auth callbacks (admin authentication flows).
 * Handles password reset, email confirmation, and other admin auth flows.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth callback route
 *
 * Handles Supabase Auth callbacks for admin authentication flows only.
 * This includes password reset, email confirmation, and other admin auth flows.
 *
 * Note: Tenant OAuth (for email collection) is handled by /auth/oauth-callback
 *
 * Flow:
 * 1. Exchange code for session (Supabase handles this)
 * 2. Redirect based on type (recovery/signup → password reset, else → admin)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error"); // OAuth error from provider
  const next = searchParams.get("next") ?? "/";
  const type = searchParams.get("type"); // recovery, signup, etc.

  // Handle OAuth errors (e.g., user denied access)
  if (error) {
    console.error("OAuth error in callback:", error);
    const errorDescription = searchParams.get("error_description");

    // Map OAuth error codes to user-friendly error messages
    let errorCode = "oauth_failed";
    if (error === "access_denied") {
      errorCode = "oauth_access_denied";
    } else if (error === "invalid_request") {
      errorCode = "oauth_invalid_request";
    }

    // Redirect to admin login with error message
    const redirectUrl = new URL("/admin/login", origin);
    redirectUrl.searchParams.set("error", errorCode);
    if (next && next !== "/") {
      redirectUrl.searchParams.set("redirect", next);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    // Exchange code for session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach((cookie) => {
              request.cookies.set(cookie.name, cookie.value);
            });
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (!exchangeError) {
      // Handle password recovery/creation flows
      if (type === "recovery" || type === "signup") {
        const redirectUrl = new URL(
          `/auth/reset-password?type=${type}`,
          origin
        );
        return NextResponse.redirect(redirectUrl);
      }

      // Default: redirect to admin login (tenant selection page)
      // This will show tenant selection if user has access, or helpful message if they don't
      const redirectedURL = new URL("/admin/login", origin);
      // Preserve the next parameter if it was provided
      if (next && next !== "/") {
        redirectedURL.searchParams.set("redirect", next);
      }
      return NextResponse.redirect(redirectedURL);
    } else {
      // Error exchanging code for session
      console.error("Error exchanging code for session:", exchangeError);
      const redirectUrl = new URL("/admin/login", origin);
      redirectUrl.searchParams.set("error", "auth_failed");
      if (next && next !== "/") {
        redirectUrl.searchParams.set("redirect", next);
      }
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If there's no code and no error, redirect to admin login
  const redirectUrl = new URL("/admin/login", origin);
  redirectUrl.searchParams.set("error", "invalid_request");
  return NextResponse.redirect(redirectUrl);
}
