import { redirect } from "next/navigation";
import { getSurveyForTenant, getTenantBySlug } from "@/app/actions";
import { toTenantDisplay } from "@/lib/utils/tenant";
import SurveyContainer from "./components/SurveyContainer";

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SurveyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const { slug } = await params;

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

  // Fetch survey for this tenant
  const { survey, error } = await getSurveyForTenant(slug);

  // If no survey questions exist, skip the survey and redirect directly to completion
  if (error || !survey || survey.questions.length === 0) {
    // Redirect to completion page if no questions
    redirect(`/${slug}/survey/completed`);
  }

  const tenant = toTenantDisplay(tenantData);

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
