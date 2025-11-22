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
  const next = searchParams.get("next") ?? "/";
  const type = searchParams.get("type"); // recovery, signup, etc.

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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
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

  // If there's an error or no code, redirect to home
  return NextResponse.redirect(new URL("/", origin));
}
