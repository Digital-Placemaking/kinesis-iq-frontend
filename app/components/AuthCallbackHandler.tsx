// AuthCallbackHandler
// Handles Supabase Auth callbacks from hash fragments, establishes session, and redirects users.
// Used in: app/auth/callback/route.ts

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackHandler() {
  const router = useRouter();

  useEffect(() => {
    // Check for hash fragments (implicit flow)
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.substring(1); // Remove #
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type"); // invite, recovery, signup, etc.
      const error = params.get("error");
      const errorDescription = params.get("error_description");

      // Handle errors
      if (error) {
        console.error("Auth error:", error, errorDescription);
        // Redirect to home with error (or show error page)
        router.push(`/?error=${encodeURIComponent(error)}`);
        return;
      }

      // If we have tokens, establish session
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

            // Clear hash from URL (clean up the URL)
            window.history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search
            );

            // Redirect based on type
            if (type === "invite" || type === "recovery" || type === "signup") {
              // Redirect to password reset page
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

  return null; // This component doesn't render anything
}
