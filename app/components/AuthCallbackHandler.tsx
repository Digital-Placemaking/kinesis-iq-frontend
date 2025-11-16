/**
 * AuthCallbackHandler Component
 *
 * Handles Supabase Auth OAuth callbacks from URL hash fragments.
 * Processes authentication tokens, establishes user sessions, and redirects appropriately.
 *
 * Flow:
 * 1. Extracts tokens from URL hash (#access_token=...&refresh_token=...)
 * 2. Establishes Supabase session with tokens
 * 3. Cleans up URL by removing hash
 * 4. Redirects based on auth type (invite/recovery/signup → password reset, else → admin)
 *
 * Used in: app/page.tsx (homepage) to handle OAuth redirects
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
    // Check for hash fragments (OAuth implicit flow)
    if (typeof window !== "undefined" && window.location.hash) {
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
        // Redirect to home with error parameter
        router.push(`/?error=${encodeURIComponent(error)}`);
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
          .then(({ error: sessionError }) => {
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
              // Default redirect to admin dashboard
              router.push("/admin");
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
