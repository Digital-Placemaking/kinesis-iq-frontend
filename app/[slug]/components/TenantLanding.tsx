/**
 * app/[slug]/components/TenantLanding.tsx
 * Tenant landing page component.
 * Main landing page for tenant sites that handles email submission and OAuth social login.
 *
 * UI/UX Reskin: Modern mobile-first design inspired by kinesisiq-redesign onboarding flow.
 * Uses navy/orange color palette, clean spacing, rounded cards, and smooth animations.
 */

"use client";

import { Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { getGoogleOAuthUrl } from "@/app/actions/google/oauth-url";
import { getAppleOAuthUrl } from "@/app/actions/apple/oauth-url";
import { trackPageVisit } from "@/lib/analytics/events";
import Footer from "@/app/components/Footer";
import TenantLogo from "@/app/components/ui/TenantLogo";
import Spinner from "@/app/components/ui/Spinner";
import SectionSeparator from "@/app/components/ui/SectionSeparator";
import { Separator } from "@/components/ui/separator";
import SocialLoginButton from "@/app/[slug]/components/ui/SocialLoginButton";
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

      // Full page redirect
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
  setLoading(true);
  setError(null);

  try {
    const tenantSlug = tenant.slug;
    const origin = window.location.origin;

    const result =
      provider === "google"
        ? await getGoogleOAuthUrl(tenantSlug, origin)
        : await getAppleOAuthUrl(tenantSlug, origin);

    if (result.error || !result.url) {
      const providerName = provider === "apple" ? "Apple" : "Google";
      setError(
        result.error ||
          `Failed to initiate ${providerName} login. Please try again.`
      );
      setLoading(false);
      return;
    }

    // Redirect to provider (Apple or Google)
    window.location.href = result.url;
    // no need to setLoading(false) here because we're leaving the page
  } catch (err) {
    console.error("Error initiating social OAuth:", err);
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
    <div className="mobile-theme flex min-h-screen flex-col bg-kinesisiq-gradient">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 text-center sm:mb-8">
          <div
            className="mx-auto mb-6 flex justify-center animate-fade-in sm:mb-8"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          >
            <TenantLogo tenant={tenant} size="lg" />
          </div>
          <div
            className="space-y-2 animate-fade-in"
            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {tenant.name.toUpperCase()}
            </h1>
          </div>
        </div>

        <div className="space-y-5 sm:space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Access VIP Events & Exclusive Offers
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Exclusive Offers - Access Below
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <SocialLoginButton
              provider="apple"
              onClick={() => handleSocialLogin("apple")}
              disabled={loading}
            />
            <SocialLoginButton
              provider="google"
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
            />
          </div>

          <SectionSeparator text="Or continue with email" />

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
              className="flex h-11 w-full rounded-lg border-2 border-border bg-card px-4 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-250"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-3 text-sm font-semibold shadow-lg transition-all duration-250 hover:bg-blue-700 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  <span>Email for exclusive offers</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
            <svg
              className="h-4 w-4 flex-shrink-0"
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
            <span>
              Private & Secure — We&apos;ll only send you great deals.
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="relative flex items-center gap-4">
              <Separator className="flex-1 bg-primary/30" />
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                Just want to share feedback?
              </span>
              <Separator className="flex-1 bg-primary/30" />
            </div>
            <button
              type="button"
              onClick={handleFeedbackClick}
              disabled={loading}
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold shadow-lg transition-all duration-250 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Take Poll
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Your data stays anonymous.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border-2 border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive shadow-sm">
              {error}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-xs leading-relaxed text-muted-foreground sm:mt-10 sm:text-sm">
          <p>
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="font-medium text-primary transition-colors hover:underline"
            >
              WiFi Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="font-medium text-primary transition-colors hover:underline"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
