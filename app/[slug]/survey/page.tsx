/**
 * Public surveys/polls hub for a tenant.
 * Lists active collector surveys. Coupon-gated visitors with one live survey
 * go straight into that survey.
 */

import { redirect } from "next/navigation";
import {
  getTenantBySlug,
  listPublicSurveys,
  verifyEmailOptIn,
} from "@/app/actions";
import { toTenantDisplay } from "@/lib/utils/tenant";
import { isSurveyCompleted } from "@/lib/utils/rate-limit";
import { getPublicSurveyRef } from "@/lib/survey/public-survey";
import NoSurveyMessage from "./components/NoSurveyMessage";
import PublicSurveysList from "./components/PublicSurveysList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SurveyPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    email?: string;
    returnTo?: string;
    fromOAuth?: string;
  }>;
}

function buildSearch(params: {
  email?: string;
  returnTo?: string;
  fromOAuth?: string;
}): string {
  const search = new URLSearchParams();
  if (params.email) search.set("email", params.email);
  if (params.returnTo) search.set("returnTo", params.returnTo);
  if (params.fromOAuth) search.set("fromOAuth", params.fromOAuth);
  const value = search.toString();
  return value ? `?${value}` : "";
}

export default async function SurveyPage({
  params,
  searchParams,
}: SurveyPageProps) {
  const { slug } = await params;
  const { email, returnTo, fromOAuth } = await searchParams;

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

  // Fetch active public surveys for this tenant (collector model)
  const { surveys, error } = await listPublicSurveys(slug);

  const tenant = toTenantDisplay(tenantData);
  const search = buildSearch({ email, returnTo, fromOAuth });

  if (error || surveys.length === 0) {
    if (email && returnTo === "coupons") {
      redirect(`/${slug}/coupons?email=${encodeURIComponent(email)}`);
    }
    return <NoSurveyMessage tenant={tenant} />;
  }

  if (surveys.length === 1 && returnTo === "coupons") {
    redirect(`/${slug}/survey/${getPublicSurveyRef(surveys[0])}${search}`);
  }

  return (
    <PublicSurveysList tenant={tenant} surveys={surveys} search={search} />
  );
}

export async function generateMetadata({ params }: SurveyPageProps) {
  const { slug } = await params;
  const { tenant } = await getTenantBySlug(slug);

  return {
    title: tenant?.name
      ? `Surveys & Polls — ${tenant.name}`
      : "Surveys & Polls",
    description: `Share feedback with ${tenant?.name || "this community"}`,
  };
}
