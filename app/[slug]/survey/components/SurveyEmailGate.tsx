/**
 * Email gate for surveys that do not allow anonymous responses.
 */

"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import Footer from "@/app/components/Footer";
import TenantLogo from "@/app/components/ui/TenantLogo";
import Card from "@/app/components/ui/Card";
import Spinner from "@/app/components/ui/Spinner";
import type { TenantDisplay } from "@/lib/types/tenant";

interface SurveyEmailGateProps {
  tenant: TenantDisplay;
  surveyTitle: string;
  kind?: "survey" | "poll";
}

export default function SurveyEmailGate({
  tenant,
  surveyTitle,
  kind = "survey",
}: SurveyEmailGateProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("email", trimmed);
    window.location.assign(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mobile-theme flex min-h-screen flex-col bg-kinesisiq-gradient">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
        <Card className="w-full p-4 sm:p-6" variant="elevated">
          <div className="mb-6 flex justify-center">
            <TenantLogo tenant={tenant} size="md" />
          </div>

          <div className="mb-6 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
              {kind === "poll" ? "Poll" : "Survey"}
            </p>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {surveyTitle}
            </h1>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              Enter your email to continue. We only use it to prevent duplicate
              responses.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
              className="flex h-11 w-full rounded-lg border-2 border-border bg-card px-4 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-250 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="text-primary-foreground" />
                  <span>Continuing...</span>
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  <span>Continue</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-3 rounded-lg border-2 border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}
        </Card>
      </div>
      <Footer />
    </div>
  );
}
