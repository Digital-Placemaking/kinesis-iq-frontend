/**
 * app/[slug]/survey/page.tsx
 * Survey page for a tenant.
 * Displays survey questions for visitors to complete, or shows "coming soon" message if no questions exist.
 */

import { redirect } from "next/navigation";
import { getSurveyForTenant, getTenantBySlug } from "@/app/actions";
import { toTenantDisplay } from "@/lib/utils/tenant";
import { isSurveyCompleted } from "@/lib/utils/rate-limit";
import SurveyContainer from "@/app/components/survey/SurveyContainer";
import NoSurveyMessage from "./components/NoSurveyMessage";

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SurveyPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ email?: string }>;
}

export default async function SurveyPage({
  params,
  searchParams,
}: SurveyPageProps) {
  const { slug } = await params;
  const { email } = await searchParams;

  // Get tenant data
  const { tenant: tenantData, error: tenantError } = await getTenantBySlug(
    slug
  );

  if (tenantError || !tenantData) {
    redirect(`/${slug}`);
  }

  // If tenant is inactive, show deactivated message
  if (!tenantData.active) {
    const { default: DeactivatedMessage } = await import(
      "../components/DeactivatedMessage"
    );
    return <DeactivatedMessage tenantName={tenantData.name} />;
  }

  // SECURITY: Check if user has already completed this survey
  // If they have, redirect to completion page to prevent re-access
  if (email) {
    const completed = await isSurveyCompleted(slug, email, null);
    if (completed) {
      redirect(`/${slug}/survey/completed`);
    }
  }

  // Fetch survey for this tenant
  const { survey, error } = await getSurveyForTenant(slug);

  const tenant = toTenantDisplay(tenantData);

  // If no survey questions exist, show "coming soon" message instead of redirecting
  if (error || !survey || survey.questions.length === 0) {
    return <NoSurveyMessage tenant={tenant} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-4xl">
            {survey.title || "Feedback Survey"}
          </h1>
          {survey.description && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {survey.description}
            </p>
          )}
        </div>

        {/* Survey Container */}
        <SurveyContainer
          survey={survey}
          tenantSlug={slug}
          couponId={null}
          email={null}
        />
      </div>
    </div>
  );
}
