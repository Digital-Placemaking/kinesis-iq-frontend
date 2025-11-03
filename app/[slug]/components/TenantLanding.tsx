"use client";

import { Mail } from "lucide-react";
import { useState } from "react";
import { submitEmail, submitFeedback } from "../../actions";
import Footer from "../../components/Footer";
import type { TenantDisplay } from "@/lib/types/tenant";

interface TenantLandingProps {
  tenant: TenantDisplay;
}

export default function TenantLanding({ tenant }: TenantLandingProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await submitEmail(tenant.slug, email);

    if (result.error) {
      setError(result.error);
    } else {
      setEmailSubmitted(true);
      setEmail("");
    }
    setLoading(false);
  };

  const handleFeedbackClick = async () => {
    setLoading(true);
    setError(null);

    const result = await submitFeedback(tenant.slug);

    if (result.error) {
      setError(result.error);
    } else {
      setFeedbackSubmitted(true);
      // Redirect to feedback page or show feedback form
      // For now, just show success message
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="mx-auto max-w-md px-8 py-16">
        {/* Branding */}
        <div className="mb-12 text-center">
          {tenant.logo_url ? (
            <img
              src={tenant.logo_url}
              alt={tenant.name}
              className="mx-auto mb-4 h-24 w-24 object-contain"
            />
          ) : (
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
              <span className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">
                {tenant.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
            {tenant.name.toUpperCase()}
          </h1>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black dark:text-zinc-50">
              Access VIP Events & Exclusive Offers
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Exclusive Offers - Access Below
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-black px-4 py-3 text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span className="font-medium">Continue with Apple</span>
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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
              <span className="font-medium">Continue with Google</span>
            </button>
          </div>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-300 dark:border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gradient-to-b from-zinc-50 to-white px-2 text-zinc-500 dark:from-black dark:to-zinc-950 dark:text-zinc-400">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading || emailSubmitted}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <button
              type="submit"
              disabled={loading || emailSubmitted}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Mail className="h-5 w-5" />
              <span className="font-medium">Email for exclusive offers</span>
            </button>
          </form>

          {/* Success Message */}
          {emailSubmitted && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
              Email submitted successfully!
            </div>
          )}

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
          <div className="space-y-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
            <p className="text-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Just want to share feedback?
            </p>
            <button
              type="button"
              onClick={handleFeedbackClick}
              disabled={loading || feedbackSubmitted}
              className="w-full rounded-lg bg-orange-500 px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {feedbackSubmitted ? "Feedback Submitted!" : "Take Poll"}
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
        <div className="mt-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
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
