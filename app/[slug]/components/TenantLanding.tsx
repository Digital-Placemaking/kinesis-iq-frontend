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
import { trackPageVisit } from "@/lib/analytics/events";
import Footer from "@/app/components/Footer";
import TenantLogo from "@/app/components/ui/TenantLogo";
import Spinner from "@/app/components/ui/Spinner";
import SectionSeparator from "@/app/components/ui/SectionSeparator";
import { Separator } from "@/components/ui/separator";
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

          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-all duration-250 hover:border-primary/50 hover:bg-muted/50 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("apple")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-all duration-250 hover:border-primary/50 hover:bg-muted/50 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span>Continue with Apple</span>
            </button>
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
