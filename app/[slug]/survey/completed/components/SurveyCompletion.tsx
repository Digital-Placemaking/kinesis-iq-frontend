/**
 * app/[slug]/survey/completed/components/SurveyCompletion.tsx
 * Survey completion component.
 * Displays thank you message and email opt-in form after completing an anonymous survey.
 */

"use client";

import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { TenantDisplay } from "@/lib/types/tenant";
import Footer from "@/app/components/Footer";
import TenantLogo from "@/app/components/ui/TenantLogo";
import Card from "@/app/components/ui/Card";
import ActionButton from "@/app/components/ui/ActionButton";
import Spinner from "@/app/components/ui/Spinner";
import VisitWebsiteButton from "@/app/components/ui/VisitWebsiteButton";
import SocialLoginButton from "@/app/[slug]/components/ui/SocialLoginButton";
import SectionSeparator from "@/app/components/ui/SectionSeparator";
import { submitEmail } from "@/app/actions";
import { getGoogleOAuthUrl } from "@/app/actions/google/oauth-url";

interface SurveyCompletionProps {
  tenant: TenantDisplay;
}

export default function SurveyCompletion({ tenant }: SurveyCompletionProps) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user just completed OAuth subscription
  useEffect(() => {
    const subscribed = searchParams.get("subscribed");
    if (subscribed === "true") {
      setSubmitted(true);
    }
  }, [searchParams]);

  /**
   * Handles social login (Google/Apple OAuth)
   * Similar to TenantLanding but redirects back to survey completion
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
      // Generate Google OAuth authorization URL with returnTo parameter
      const result = await getGoogleOAuthUrl(
        tenant.slug,
        window.location.origin,
        "/survey/completed" // Return to survey completion page after OAuth
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.trim()) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await submitEmail(tenant.slug, email.trim());

      if (result && typeof result.success === "boolean") {
        if (result.success === true) {
          setSubmitted(true);
          setEmail("");
        } else if (result.error) {
          setError(result.error);
        } else {
          setError("Failed to submit email. Please try again.");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-theme flex min-h-screen flex-col bg-kinesisiq-gradient">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 sm:px-8 sm:py-12">
        {/* Main Content Card */}
        <Card className="mb-4 w-full p-4 sm:mb-6 sm:p-6" variant="elevated">
          {/* Congratulations Header */}
          <div className="mb-4 text-center sm:mb-6">
            <h1 className="mb-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
              Congratulations! 🎉
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Thanks for completing our survey
            </p>
          </div>

          {/* Logo */}
          <div className="mb-4 flex justify-center sm:mb-6">
            <TenantLogo tenant={tenant} size="md" />
          </div>

          {/* Thank You Message */}
          <p className="mb-4 text-center text-xs text-muted-foreground sm:mb-6 sm:text-sm">
            Thank you — your insight helps shape decisions people can trust.
          </p>
          <p className="mb-4 text-center text-xs font-bold text-muted-foreground sm:mb-6 sm:text-sm">
            Your data stays anonymous.
          </p>

          {/* Email Opt-in Section */}
          {!submitted ? (
            <div className="space-y-3">
              <p className="text-center text-xs font-medium text-zinc-700 dark:text-zinc-300 sm:text-sm">
                Want to stay updated with exclusive offers?
              </p>

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
              <form onSubmit={handleEmailSubmit} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border-2 border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-all duration-250"
                />
                <div className="flex justify-center">
                  <ActionButton
                    icon={Mail}
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Spinner size="sm" />
                        Submitting...
                      </span>
                    ) : (
                      "Get Updates"
                    )}
                  </ActionButton>
                </div>
              </form>
              {error && (
                <div className="rounded-lg border-2 border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-primary/20 bg-primary/10 p-3 text-center sm:p-4">
              <p className="text-xs font-semibold text-primary sm:text-sm">
                Thank you! You've been added to our mailing list.
              </p>
            </div>
          )}
        </Card>

        {/* Footer Options */}
        <div className="space-y-3 text-center">
          <div className="flex justify-center">
            <VisitWebsiteButton tenant={tenant} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
