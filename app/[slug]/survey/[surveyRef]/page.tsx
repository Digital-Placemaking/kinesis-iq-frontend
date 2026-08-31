/**
 * Public take page for a specific survey or poll (by slug or id).
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getPublicSurvey, getTenantBySlug, verifyEmailOptIn } from "@/app/actions";
import { toTenantDisplay } from "@/lib/utils/tenant";
import { allowsAnonymous } from "@/lib/survey/public-survey";
import { isSurveyCompleted } from "@/lib/utils/rate-limit";
import PublicSurveyTake from "../components/PublicSurveyTake";
import SurveyEmailGate from "../components/SurveyEmailGate";
import SurveyUnavailableMessage from "../components/SurveyUnavailableMessage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PublicSurveyPageProps {
  params: Promise<{ slug: string; surveyRef: string }>;
  searchParams: Promise<{
    email?: string;
    returnTo?: string;
    fromOAuth?: string;
  }>;
}

export default async function PublicSurveyPage({
  params,
  searchParams,
}: PublicSurveyPageProps) {
  const { slug, surveyRef } = await params;
  const { email, returnTo, fromOAuth } = await searchParams;

  const { tenant: tenantData, error: tenantError } = await getTenantBySlug(
    slug
  );

  if (tenantError || !tenantData) {
    redirect(`/${slug}`);
  }

  if (!tenantData.active) {
    const { default: DeactivatedMessage } = await import(
      "../../components/DeactivatedMessage"
    );
    return <DeactivatedMessage tenantName={tenantData.name} />;
  }

  if (email && returnTo === "coupons" && fromOAuth !== "true") {
    const optInCheck = await verifyEmailOptIn(slug, email);
    if (optInCheck.valid) {
      redirect(`/${slug}/coupons?email=${encodeURIComponent(email)}`);
    }
  }

  const { survey, reason, error } = await getPublicSurvey(slug, surveyRef);
  const tenant = toTenantDisplay(tenantData);

  if (error || reason === "not_found" || !survey) {
    return (
      <SurveyUnavailableMessage
        tenant={tenant}
        reason={reason && reason !== "email_required" ? reason : "not_found"}
      />
    );
  }

  if (reason) {
    return (
      <SurveyUnavailableMessage
        tenant={tenant}
        reason={reason}
        title={survey.title}
      />
    );
  }

  if (!allowsAnonymous(survey.settings) && !email) {
    return (
      <Suspense fallback={null}>
        <SurveyEmailGate
          tenant={tenant}
          surveyTitle={survey.title || "Feedback"}
          kind={survey.kind}
        />
      </Suspense>
    );
  }

  if (email && survey.id) {
    const completed = await isSurveyCompleted(slug, email, null, survey.id);
    if (completed) {
      if (returnTo === "coupons") {
        redirect(`/${slug}/coupons?email=${encodeURIComponent(email)}`);
      }
      redirect(`/${slug}/survey/completed`);
    }
  }

  return (
    <PublicSurveyTake
      tenant={tenant}
      survey={survey}
      email={email || null}
      returnTo={returnTo || null}
    />
  );
}

export async function generateMetadata({ params }: PublicSurveyPageProps) {
  const { slug } = await params;
  const { tenant } = await getTenantBySlug(slug);

  return {
    title: tenant?.name ? `Survey — ${tenant.name}` : "Survey",
    description: `Share feedback with ${tenant?.name || "this community"}`,
  };
}
