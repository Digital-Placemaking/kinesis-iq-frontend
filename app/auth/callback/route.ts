import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth callback route
 * Handles Supabase Auth callbacks (password reset, email confirmation, etc.)
 * Redirects to appropriate pages based on the callback type
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
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If it's a password recovery/creation flow, redirect to password reset page
      if (type === "recovery" || type === "signup") {
        const redirectUrl = new URL(
          `/auth/reset-password?type=${type}`,
          origin
        );
        return NextResponse.redirect(redirectUrl);
      }

      // Otherwise, redirect to the intended destination or admin dashboard
      const redirectedURL = new URL(next === "/" ? "/admin" : next, origin);
      return NextResponse.redirect(redirectedURL);
    }
  }

  // If there's an error or no code, redirect to home
  return NextResponse.redirect(new URL("/", origin));
}
