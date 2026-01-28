/**
 * app/[slug]/survey/page.tsx
 * Survey page for a tenant.
 * Displays survey questions for visitors to complete.
 * Supports both anonymous polls and sign-in flow (with email & returnTo params).
 */

import { redirect } from "next/navigation";
import { getSurveyForTenant, getTenantBySlug, verifyEmailOptIn } from "@/app/actions";
import { toTenantDisplay } from "@/lib/utils/tenant";
import { isSurveyCompleted } from "@/lib/utils/rate-limit";
import SurveyCard from "@/app/components/survey/SurveyCard";
import NoSurveyMessage from "./components/NoSurveyMessage";

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SurveyPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ email?: string; returnTo?: string; fromOAuth?: string }>;
}

/**
 * Survey Page
 *
 * Two entry points:
 * 1. Anonymous poll - User clicks "Take Poll" from landing page (no email)
 * 2. Sign-in flow - User signed in but not in opt-in list (has email & returnTo=coupons)
 *
 * Flow:
 * - Anonymous: Complete survey → survey completion page (optional email signup)
 * - Sign-in: Complete survey → store email in opt-ins → redirect to coupons
 */
export default async function SurveyPage({
  params,
  searchParams,
}: SurveyPageProps) {
  const { slug } = await params;
  const { email, returnTo, fromOAuth } = await searchParams;

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

  // If user has email and returnTo=coupons, check if already in opt-in list
  // (They might have been added via another method while on this page)
  // Skip this check if fromOAuth=true (OAuth users need to complete survey first)
  if (email && returnTo === "coupons" && fromOAuth !== "true") {
    const optInCheck = await verifyEmailOptIn(slug, email);
    if (optInCheck.valid) {
      // Already in opt-in list, skip survey and go to coupons
      redirect(`/${slug}/coupons?email=${encodeURIComponent(email)}`);
    }
  }

  // SECURITY: Check if user has already completed this survey
  // If they have, redirect to appropriate page to prevent re-access
  if (email) {
    const completed = await isSurveyCompleted(slug, email, null);
    if (completed) {
      if (returnTo === "coupons") {
        redirect(`/${slug}/coupons?email=${encodeURIComponent(email)}`);
      } else {
        redirect(`/${slug}/survey/completed`);
      }
    }
  }

  // Fetch survey for this tenant
  const { survey, error } = await getSurveyForTenant(slug);

  const tenant = toTenantDisplay(tenantData);

  // If no survey questions exist, handle based on flow
  if (error || !survey || survey.questions.length === 0) {
    if (email && returnTo === "coupons") {
      // Sign-in flow with no survey - just go to coupons
      // Note: Email will be stored when they claim a coupon
      redirect(`/${slug}/coupons?email=${encodeURIComponent(email)}`);
    }
    // Anonymous flow - show "coming soon" message
    return <NoSurveyMessage tenant={tenant} />;
  }

  return (
    <main className="mobile-theme flex min-h-screen flex-col items-center bg-kinesisiq-gradient p-4 pt-6 sm:pt-10">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center sm:mb-6">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {survey.title || "Feedback Survey"}
          </h1>
          {survey.description && (
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              {survey.description}
            </p>
          )}
        </div>
        <SurveyCard
          survey={survey}
          tenantSlug={slug}
          couponId={null}
          email={email || null}
          returnTo={returnTo || null}
        />
      </div>
    </main>
  );
}
