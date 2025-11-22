/**
 * app/[slug]/coupons/[couponId]/survey/page.tsx
 * Survey page for a specific coupon.
 * Displays survey questions that must be completed before accessing the coupon.
 */

import { redirect, notFound } from "next/navigation";
import {
  getSurveyForCoupon,
  verifyEmailOptIn,
  getTenantBySlug,
} from "@/app/actions";
import SurveyContainer from "@/app/components/survey/SurveyContainer";
import DeactivatedMessage from "../../../components/DeactivatedMessage";

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SurveyPageProps {
  params: Promise<{ slug: string; couponId: string }>;
  searchParams: Promise<{ email?: string }>;
}

/**
 * Survey Page for Coupon
 *
 * This is the critical decision point in the user flow.
 *
 * Flow Logic:
 * 1. User arrives here after clicking a coupon from the coupons list
 * 2. Check if email exists in email_opt_ins table:
 *    - If email IS in table → User is a returning user
 *      → Skip survey, redirect to coupon completion page
 *    - If email NOT in table → User is a first-time user
 *      → Show survey questions
 * 3. After survey completion → Email is stored in email_opt_ins table
 *    (see submitSurveyAnswers in app/actions/surveys.ts)
 *
 * Why this flow?
 * - First-time users: Must complete survey before getting coupon
 * - Returning users: Skip survey (already provided feedback before)
 * - OAuth users: Email stored immediately on OAuth, so they skip survey
 */
export default async function SurveyPage({
  params,
  searchParams,
}: SurveyPageProps) {
  const { slug, couponId } = await params;
  const { email } = await searchParams;

  // Require email parameter
  if (!email) {
    redirect(`/${slug}/coupons`);
  }

  // Validate tenant exists and is active
  const { tenant: tenantData, error: tenantError } = await getTenantBySlug(
    slug
  );

  if (tenantError || !tenantData) {
    notFound();
  }

  if (!tenantData.active) {
    return <DeactivatedMessage tenantName={tenantData.name} />;
  }

  // ============================================================================
  // CORE FLOW LOGIC: Check if email is in email_opt_ins table
  // ============================================================================
  const optInCheck = await verifyEmailOptIn(slug, email);

  // CASE 1: Email IS in email_opt_ins table → Returning user
  // Skip survey and go directly to coupon completion
  // This happens for:
  // - Users who completed a survey before
  // - OAuth users (email stored immediately on OAuth callback)
  if (optInCheck.valid) {
    redirect(
      `/${slug}/coupons/${couponId}/completed?email=${encodeURIComponent(
        email
      )}`
    );
  }

  // CASE 2: Email NOT in email_opt_ins table → First-time user
  // Show survey questions
  // After survey completion, email will be stored in email_opt_ins
  // (see submitSurveyAnswers function in app/actions/surveys.ts)

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
