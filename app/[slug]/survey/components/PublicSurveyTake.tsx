/**
 * Public take-survey layout — navy/orange mobile skin around SurveyCard.
 */

import Link from "next/link";
import Footer from "@/app/components/Footer";
import TenantLogo from "@/app/components/ui/TenantLogo";
import SurveyCard from "@/app/components/survey/SurveyCard";
import { getTenantPath } from "@/lib/utils/subdomain";
import type { TenantDisplay } from "@/lib/types/tenant";
import type { Survey } from "@/lib/types/survey";

interface PublicSurveyTakeProps {
  tenant: TenantDisplay;
  survey: Survey;
  email: string | null;
  returnTo: string | null;
}

export default function PublicSurveyTake({
  tenant,
  survey,
  email,
  returnTo,
}: PublicSurveyTakeProps) {
  const isPoll = survey.kind === "poll";
  const heading = survey.title || (isPoll ? "Community Poll" : "Feedback Survey");

  return (
    <main className="mobile-theme flex min-h-screen flex-col bg-kinesisiq-gradient">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-6 sm:py-10">
        <Link
          href={getTenantPath(tenant.slug, "/survey")}
          className="mb-4 inline-flex items-center gap-2 self-start text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          All surveys
        </Link>

        <div className="mb-5 flex justify-center">
          <TenantLogo tenant={tenant} size="sm" />
        </div>

        <div className="mb-5 w-full text-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {isPoll ? "Poll" : "Survey"}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {heading}
          </h1>
          {survey.description && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {survey.description}
            </p>
          )}
        </div>

        <SurveyCard
          survey={survey}
          tenantSlug={tenant.slug}
          couponId={null}
          email={email}
          returnTo={returnTo}
          showHeader={survey.questions.length > 1}
        />

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Your data stays anonymous.
        </p>
      </div>

      <Footer />
    </main>
  );
}
