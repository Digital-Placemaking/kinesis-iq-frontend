/**
 * app/components/AuthCallbackHandler.tsx
 * Auth callback handler component.
 * Handles Supabase Auth OAuth callbacks for admin authentication flows.
 * This includes password reset, email confirmation, and other admin auth flows.
 *
 * Note: Tenant OAuth (for email collection) is handled by /auth/oauth-callback route
 *
 * Flow:
 * 1. Detects OAuth callback (hash fragments or code parameter)
 * 2. For code parameter: redirects to /auth/callback route for server-side processing
 * 3. For hash fragments: establishes session client-side
 * 4. Redirects based on auth type:
 *    - invite/recovery/signup → password reset page
 *    - Default → admin dashboard
 *
 * Used in: app/page.tsx (homepage) to handle admin OAuth redirects
 *
 * @component
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackHandler() {
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      return;
    }

    // Check for code parameter (PKCE flow) - redirect to callback route
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      // PKCE flow: redirect to server-side callback route for admin auth
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("code", code);
      // Preserve any other query params (like type, next, etc.)
      urlParams.forEach((value, key) => {
        if (key !== "code") {
          callbackUrl.searchParams.set(key, value);
        }
      });
      router.replace(callbackUrl.toString());
      return;
    }

    // Check for hash fragments (OAuth implicit flow)
    if (window.location.hash) {
      const hash = window.location.hash.substring(1); // Remove #
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type"); // invite, recovery, signup, etc.
      const error = params.get("error");
      const errorDescription = params.get("error_description");

      // Handle authentication errors
      if (error) {
        console.error("Auth error:", error, errorDescription);
        // Map error codes to user-friendly messages
        let errorCode = error;
        if (error === "access_denied") {
          errorCode = "oauth_access_denied";
        }
        router.push(`/?error=${encodeURIComponent(errorCode)}`);
        return;
      }

      // If we have tokens, establish session with Supabase
      if (accessToken && refreshToken) {
        const supabase = createClient();

        supabase.auth
          .setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          .then(async ({ error: sessionError }) => {
            if (sessionError) {
              console.error("Failed to set session:", sessionError);
              router.push(`/?error=session_failed`);
              return;
            }

            // Clear hash from URL (clean up the URL for better UX)
            window.history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search
            );

            // Redirect based on authentication type
            if (type === "invite" || type === "recovery" || type === "signup") {
              // New users or password reset flows → password reset page
              router.push(`/auth/reset-password?type=${type}`);
            } else {
              // Default redirect to admin login (tenant selection)
              router.push("/admin/login");
            }
          })
          .catch((err) => {
            console.error("Failed to set session:", err);
            router.push(`/?error=auth_failed`);
          });
      }
    }
  }, [router]);

  // This component doesn't render anything - it only handles side effects
  return null;
}
