/**
 * app/[slug]/components/TenantLanding.tsx
 * Tenant landing page component.
 * Main landing page for tenant sites that handles email submission and OAuth social login.
 */

"use client";

import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { submitEmail } from "@/app/actions";
import { getGoogleOAuthUrl } from "@/app/actions/google/oauth-url";
import { trackPageVisit } from "@/lib/analytics/events";
import Footer from "@/app/components/Footer";
import TenantLogo from "@/app/components/ui/TenantLogo";
import Spinner from "@/app/components/ui/Spinner";
import SocialLoginButton from "./ui/SocialLoginButton";
import SectionSeparator from "@/app/components/ui/SectionSeparator";
import { getTenantPath } from "@/lib/utils/subdomain";
import type { TenantDisplay } from "@/lib/types/tenant";

interface TenantLandingProps {
  tenant: TenantDisplay;
  initialError?: string | null;
}

export default function TenantLanding({
  tenant,
  initialError,
}: TenantLandingProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);

  // Track page visit on mount
  useEffect(() => {
    // Generate a session ID for anonymous tracking
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;

    // Track page visit
    trackPageVisit(tenant.slug, {
      sessionId,
      email: null, // Will be set when user submits email
    });
  }, [tenant.slug]);

  /**
   * Handles email form submission
   *
   * Flow:
   * 1. User enters email and submits
   * 2. Email is validated (format check)
   * 3. Email is passed as query parameter to coupons page (NOT stored yet)
   * 4. When user clicks a coupon, survey page checks if email exists in email_opt_ins
   * 5. If email NOT in table → show survey (first-time user)
   * 6. If email IS in table → skip survey, go to coupon (returning user)
   * 7. After survey completion → email is stored in email_opt_ins
   *
   * Note: Email is NOT stored here to ensure first-time users see the survey.
   * Only after completing the survey will their email be added to email_opt_ins.
   */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    if (!email || !email.trim()) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const trimmedEmail = email.trim();

      // Basic email format validation
      if (!trimmedEmail.includes("@")) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // Redirect to coupons page with email as query parameter
      // IMPORTANT: Email is NOT stored in email_opt_ins at this point
      // It will be stored after survey completion (see submitSurveyAnswers)
      const couponsPath = getTenantPath(tenant.slug, "/coupons");
      const redirectUrl = `${couponsPath}?email=${encodeURIComponent(
        trimmedEmail
      )}`;

      // Force full page redirect to ensure clean navigation
      if (typeof window !== "undefined") {
        window.location.replace(redirectUrl);
      }
      return; // Don't set loading to false since we're redirecting
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  /**
   * Handles social login (Google/Apple OAuth)
   *
   * OAuth Flow (Different from email flow):
   * 1. User clicks "Continue with Google/Apple"
   * 2. Redirects to OAuth provider consent screen
   * 3. User authorizes → Provider redirects to /auth/oauth-callback with code
   * 4. Callback route exchanges code for email
   * 5. Email is stored in email_opt_ins table IMMEDIATELY (OAuth users skip survey)
   * 6. User redirected to tenant coupons page
   *
   * Note: OAuth users have their email stored immediately because they've already
   * authenticated with the provider. When they click a coupon, they'll skip the
   * survey and go directly to coupon completion (since email is already in table).
   *
   * @param provider - The OAuth provider ("google" or "apple")
   */
  const handleSocialLogin = async (provider: "apple" | "google") => {
    // Only Google is currently implemented
    if (provider !== "google") {
      setError("Apple login is not yet available. Please use Google or email.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tenantSlug = tenant.slug;

      // Generate Google OAuth authorization URL via server action
      // This ensures environment variables are accessed server-side
      const result = await getGoogleOAuthUrl(
        tenantSlug,
        window.location.origin
      );

      if (result.error || !result.url) {
        setError(
          result.error || "Failed to initiate Google login. Please try again."
        );
        setLoading(false);
        return;
      }

      // Redirect to Google OAuth
      window.location.href = result.url;
      // No need to set loading to false - user is being redirected
    } catch (err) {
      console.error("Error initiating Google OAuth:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
      setLoading(false);
    }
  };

  const handleFeedbackClick = () => {
    // Navigate to anonymous survey page
    if (typeof window !== "undefined") {
      window.location.href = getTenantPath(tenant.slug, "/survey");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-8 py-12">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <TenantLogo tenant={tenant} size="lg" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-3xl">
            {tenant.name.toUpperCase()}
          </h1>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-black dark:text-zinc-50 sm:text-2xl">
              Access VIP Events & Exclusive Offers
            </h2>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
              Exclusive Offers - Access Below
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Apple login - Coming soon */}
            <SocialLoginButton
              provider="apple"
              onClick={() => handleSocialLogin("apple")}
              disabled
            />
            {/* Google OAuth - Active */}
            <SocialLoginButton
              provider="google"
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
            />
          </div>

          {/* Separator */}
          <SectionSeparator text="Or continue with email" />

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Email for exclusive offers</span>
                </>
              )}
            </button>
          </form>

          {/* Privacy Statement */}
          <div className="flex items-center gap-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Private & Secure — We'll only send you great deals.</span>
          </div>

          {/* Feedback Section */}
          <div className="space-y-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <p className="text-center text-xs font-medium text-zinc-700 dark:text-zinc-300 sm:text-sm">
              Just want to share feedback?
            </p>
            <button
              type="button"
              onClick={handleFeedbackClick}
              disabled={loading}
              className="w-full cursor-pointer rounded-lg bg-orange-500 px-3 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Take Poll
            </button>
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              Your data stays anonymous.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Legal Footer */}
        <div className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
          <p>
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              WiFi Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      {/* Theme Toggle Footer */}
      <Footer />
    </div>
  );
}
