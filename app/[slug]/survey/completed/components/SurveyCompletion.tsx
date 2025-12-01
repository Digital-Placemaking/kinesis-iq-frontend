/**
 * app/[slug]/survey/completed/components/SurveyCompletion.tsx
 * Survey completion component.
 * Displays thank you message and email opt-in form after completing an anonymous survey.
 */

"use client";

import { useState } from "react";
import { Mail, Bell } from "lucide-react";
import type { TenantDisplay } from "@/lib/types/tenant";
import Footer from "@/app/components/Footer";
import TenantLogo from "@/app/components/ui/TenantLogo";
import Card from "@/app/components/ui/Card";
import ActionButton from "@/app/components/ui/ActionButton";
import Spinner from "@/app/components/ui/Spinner";
import VisitWebsiteButton from "@/app/components/ui/VisitWebsiteButton";
import { submitEmail } from "@/app/actions";

interface SurveyCompletionProps {
  tenant: TenantDisplay;
}

export default function SurveyCompletion({ tenant }: SurveyCompletionProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 sm:px-8 sm:py-12">
        {/* Main Content Card */}
        <Card className="mb-4 w-full p-4 sm:mb-6 sm:p-6" variant="elevated">
          {/* Congratulations Header */}
          <div className="mb-4 text-center sm:mb-6">
            <h1 className="mb-2 text-xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-2xl md:text-3xl">
              Congratulations! 🎉
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
              Thanks for completing our survey
            </p>
          </div>

          {/* Logo */}
          <div className="mb-4 flex justify-center sm:mb-6">
            <TenantLogo tenant={tenant} size="md" />
          </div>

          {/* Thank You Message */}
          <p className="mb-4 text-center text-xs text-zinc-600 dark:text-zinc-400 sm:mb-6 sm:text-sm">
            Your feedback helps us improve our services. We appreciate your time
            and input!
          </p>
          <p className="mb-4 text-center text-xs font-bold text-zinc-600 dark:text-zinc-400 sm:mb-6 sm:text-sm">
            Your data stays anonymous.
          </p>

          {/* Email Opt-in Section */}
          {!submitted ? (
            <div className="space-y-3">
              <p className="text-center text-xs font-medium text-zinc-700 dark:text-zinc-300 sm:text-sm">
                Want to stay updated with exclusive offers?
              </p>
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
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center dark:border-green-800 dark:bg-green-900/20 sm:p-4">
              <p className="text-xs font-semibold text-green-800 dark:text-green-200 sm:text-sm">
                Thank you! You've been added to our mailing list.
              </p>
            </div>
          )}
        </Card>

        {/* Footer Options */}
        <div className="space-y-3 text-center">
          <div className="flex flex-col items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 sm:flex-row sm:text-sm">
            <Bell className="h-4 w-4 shrink-0" />
            <span>Want to hear about more offers?</span>
          </div>

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
