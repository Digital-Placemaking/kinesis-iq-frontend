/**
 * Public surveys/polls hub — lists live collector surveys for a tenant.
 */

import Link from "next/link";
import Footer from "@/app/components/Footer";
import TenantLogo from "@/app/components/ui/TenantLogo";
import { getTenantPath } from "@/lib/utils/subdomain";
import type { TenantDisplay } from "@/lib/types/tenant";
import type { PublicSurveyListItem } from "@/lib/types/survey";
import PublicSurveyCard from "./PublicSurveyCard";

interface PublicSurveysListProps {
  tenant: TenantDisplay;
  surveys: PublicSurveyListItem[];
  search?: string;
}

export default function PublicSurveysList({
  tenant,
  surveys,
  search = "",
}: PublicSurveysListProps) {
  return (
    <div className="mobile-theme flex min-h-screen flex-col bg-kinesisiq-gradient">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 text-center">
          <Link
            href={getTenantPath(tenant.slug, "/")}
            className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
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
            Back to {tenant.name}
          </Link>

          <div
            className="mb-6 flex justify-center animate-fade-in"
            style={{ animationDelay: "0.15s", animationFillMode: "both" }}
          >
            <TenantLogo tenant={tenant} size="md" />
          </div>

          <div
            className="space-y-2 animate-fade-in"
            style={{ animationDelay: "0.25s", animationFillMode: "both" }}
          >
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Community Pulse
            </h1>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Share anonymous feedback with {tenant.name}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {surveys.map((survey) => (
            <PublicSurveyCard
              key={survey.id}
              survey={survey}
              tenantSlug={tenant.slug}
              search={search}
            />
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your data stays anonymous.
        </p>
      </div>

      <Footer />
    </div>
  );
}
