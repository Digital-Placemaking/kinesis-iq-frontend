// TenantLanding
// Main landing page component for tenant sites that handles email submission and social login.
// Used in: app/[slug]/page.tsx

"use client";

import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { submitEmail, submitEmailOptIn } from "@/app/actions";
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
}

export default function TenantLanding({ tenant }: TenantLandingProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email before submission
    if (!email || !email.trim()) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await submitEmail(tenant.slug, email.trim());

      // Check if result has success property
      if (result && typeof result.success === "boolean") {
        if (result.success === true) {
          // Redirect to coupons page with email as query parameter
          // Use getTenantPath to handle subdomain routing correctly
          const couponsPath = getTenantPath(tenant.slug, "/coupons");
          const redirectUrl = `${couponsPath}?email=${encodeURIComponent(
            email.trim()
          )}`;

          // Force immediate redirect - use multiple methods to ensure it works
          // This ensures React doesn't interfere with navigation
          if (typeof window !== "undefined") {
            window.location.replace(redirectUrl);
          }
          return; // Don't set loading to false since we're redirecting
        } else if (result.error) {
          setError(result.error);
          setLoading(false);
        } else {
          setError("Failed to submit email. Please try again.");
          setLoading(false);
        }
      } else {
        // Result doesn't have expected structure
        setError("An unexpected error occurred");
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "apple" | "google") => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual social login with Supabase Auth
      // For now, we'll need the email from the auth response
      // Once authenticated, call submitEmailOptIn with the email

      // Example flow (to be implemented):
      // 1. Authenticate with provider via Supabase Auth
      // 2. Get user email from auth response
      // 3. Call submitEmailOptIn(tenant.slug, email)
      // 4. Then redirect to coupons

      // For now, redirect to coupons page
      // In production, this will be:
      // const { data: { user } } = await supabase.auth.signInWithOAuth({ provider })
      // if (user?.email) {
      //   await submitEmailOptIn(tenant.slug, user.email);
      // }
      router.push(getTenantPath(tenant.slug, "/coupons"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
            {/* TODO: Implement Apple/Google OAuth with Supabase Auth and re-enable these buttons */}
            <SocialLoginButton provider="apple" onClick={() => {}} disabled />
            <SocialLoginButton provider="google" onClick={() => {}} disabled />
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
