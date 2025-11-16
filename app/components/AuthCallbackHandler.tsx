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
 * 4. Redirects based on auth type:
 *    - invite/recovery/signup → password reset page
 *    - Tenant OAuth (has tenant param) → tenant coupons page
 *    - Default → admin dashboard
 *
 * Used in: app/page.tsx (homepage) to handle OAuth redirects
 *
 * @component
 */

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getTenantPath } from "@/lib/utils/subdomain";

export default function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

      // Extract tenant slug from URL query params (set during OAuth initiation)
      const tenantSlug = searchParams.get("tenant");

      // Handle authentication errors
      if (error) {
        console.error("Auth error:", error, errorDescription);
        // If we have a tenant, redirect back to tenant landing page with error
        if (tenantSlug) {
          router.push(
            `${getTenantPath(tenantSlug, "/")}?error=${encodeURIComponent(
              error
            )}`
          );
        } else {
          // Otherwise redirect to home
          router.push(`/?error=${encodeURIComponent(error)}`);
        }
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
          .then(async ({ data, error: sessionError }) => {
            if (sessionError) {
              console.error("Failed to set session:", sessionError);
              if (tenantSlug) {
                router.push(
                  `${getTenantPath(tenantSlug, "/")}?error=session_failed`
                );
              } else {
                router.push(`/?error=session_failed`);
              }
              return;
            }

            // Clear hash from URL (clean up the URL for better UX)
            window.history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search
            );

            // Get user email for redirect
            const userEmail = data?.user?.email;

            // Redirect based on authentication type and context
            if (type === "invite" || type === "recovery" || type === "signup") {
              // New users or password reset flows → password reset page
              router.push(`/auth/reset-password?type=${type}`);
            } else if (tenantSlug) {
              // Tenant OAuth flow → redirect to tenant coupons page
              // Post-auth actions (email opt-in, analytics) will happen server-side
              // via the callback route
              const couponsPath = getTenantPath(tenantSlug, "/coupons");
              const redirectUrl = userEmail
                ? `${couponsPath}?email=${encodeURIComponent(userEmail)}`
                : couponsPath;
              router.push(redirectUrl);
            } else {
              // Default redirect to admin dashboard
              router.push("/admin");
            }
          })
          .catch((err) => {
            console.error("Failed to set session:", err);
            if (tenantSlug) {
              router.push(
                `${getTenantPath(tenantSlug, "/")}?error=auth_failed`
              );
            } else {
              router.push(`/?error=auth_failed`);
            }
          });
      }
    }
  }, [router, searchParams]);

  // This component doesn't render anything - it only handles side effects
  return null;
}
