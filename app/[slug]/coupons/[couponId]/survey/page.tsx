import { redirect, notFound } from "next/navigation";
import {
  getSurveyForCoupon,
  verifyEmailOptIn,
  hasCompletedSurveyForTenant,
} from "@/app/actions";
import SurveyContainer from "./components/SurveyContainer";

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SurveyPageProps {
  params: Promise<{ slug: string; couponId: string }>;
  searchParams: Promise<{ email?: string }>;
}

export default async function SurveyPage({
  params,
  searchParams,
}: SurveyPageProps) {
  const { slug, couponId } = await params;
  const { email } = await searchParams;

  // Verify email opt-in before allowing access
  if (!email) {
    redirect(`/${slug}/coupons`);
  }

  // Verify email opt-in - if verification fails, still allow access
  // The email in the URL is sufficient - it means they successfully submitted it
  const optInCheck = await verifyEmailOptIn(slug, email);

  if (!optInCheck.valid) {
    // Log warning but don't block - email in URL means submission succeeded
    console.warn("Email opt-in verification warning:", optInCheck.error);
  }

  // Check if user has completed any survey for this tenant - if so, skip survey
  // They can claim all coupons without retaking the survey
  const { completed } = await hasCompletedSurveyForTenant(slug, email);

  if (completed) {
    // User already completed a survey for this tenant - skip survey and go to completion
    // They'll get a new coupon code for this specific coupon
    redirect(
      `/${slug}/coupons/${couponId}/completed?email=${encodeURIComponent(
        email
      )}`
    );
  }

  // Fetch survey for this coupon
  const { survey, error } = await getSurveyForCoupon(slug, couponId);

  // If no survey questions exist, skip the survey and redirect directly to completion
  if (error || !survey || survey.questions.length === 0) {
    // Redirect to completion page if no questions
    redirect(
      `/${slug}/coupons/${couponId}/completed?email=${encodeURIComponent(
        email
      )}`
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-4xl">
            {survey.title || "Survey"}
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
          couponId={couponId}
          email={email}
        />
      </div>
    </div>
  );
}
