import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { handlePostOAuth } from "@/app/actions/google/oauth";

/**
 * Auth callback route
 *
 * Handles Supabase Auth callbacks for OAuth flows (Google, Apple, etc.)
 * and other authentication flows (password reset, email confirmation, etc.)
 *
 * Flow for tenant OAuth:
 * 1. User authenticates with Google → Google redirects here with code
 * 2. Exchange code for session (Supabase handles this)
 * 3. Extract tenant slug from query params
 * 4. Run post-auth actions (email opt-in, analytics tracking)
 * 5. Redirect to tenant's coupons page
 *
 * Flow for admin/auth flows:
 * 1. Exchange code for session
 * 2. Redirect based on type (recovery/signup → password reset, else → admin)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const type = searchParams.get("type"); // recovery, signup, etc.
  const tenantSlug = searchParams.get("tenant"); // Tenant slug from OAuth flow

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
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session) {
      // Handle tenant OAuth flow
      if (tenantSlug) {
        try {
          // Run post-authentication tasks:
          // - Auto opt-in user's email for the tenant
          // - Track authenticated page visit for analytics
          const postAuthResult = await handlePostOAuth(tenantSlug);

          // Build redirect URL to tenant's coupons page
          // Use subdomain-aware path construction
          const baseUrl = new URL(origin);
          const hostname = baseUrl.hostname;

          // Check if we're on a subdomain or regular domain
          const isSubdomain = hostname.split(".").length >= 3;
          let redirectPath: string;

          if (isSubdomain) {
            // On subdomain: use relative path
            redirectPath = "/coupons";
          } else {
            // On regular domain: include tenant slug in path
            redirectPath = `/${tenantSlug}/coupons`;
          }

          // Add email to query params if available
          const redirectUrl = new URL(redirectPath, origin);
          if (postAuthResult.email) {
            redirectUrl.searchParams.set("email", postAuthResult.email);
          }

          return NextResponse.redirect(redirectUrl);
        } catch (err) {
          console.error("Error in tenant OAuth post-auth:", err);
          // Fall through to redirect to tenant landing page with error
          const baseUrl = new URL(origin);
          const hostname = baseUrl.hostname;
          const isSubdomainError = hostname.split(".").length >= 3;
          const redirectUrl = new URL(
            isSubdomainError ? "/" : `/${tenantSlug}`,
            origin
          );
          redirectUrl.searchParams.set("error", "auth_processing_failed");
          return NextResponse.redirect(redirectUrl);
        }
      }

      // Handle password recovery/creation flows
      if (type === "recovery" || type === "signup") {
        const redirectUrl = new URL(
          `/auth/reset-password?type=${type}`,
          origin
        );
        return NextResponse.redirect(redirectUrl);
      }

      // Default: redirect to the intended destination or admin dashboard
      const redirectedURL = new URL(next === "/" ? "/admin" : next, origin);
      return NextResponse.redirect(redirectedURL);
    }
  }

  // If there's an error or no code, redirect appropriately
  if (tenantSlug) {
    // Redirect back to tenant landing page with error
    const baseUrl = new URL(origin);
    const hostname = baseUrl.hostname;
    const isSubdomain = hostname.split(".").length >= 3;
    const redirectUrl = new URL(isSubdomain ? "/" : `/${tenantSlug}`, origin);
    redirectUrl.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(redirectUrl);
  }

  // Default: redirect to home
  return NextResponse.redirect(new URL("/", origin));
}
