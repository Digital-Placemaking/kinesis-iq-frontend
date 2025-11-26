/**
 * app/[slug]/page.tsx
 * Tenant landing page component.
 * Displays the main landing page for a specific tenant with email collection and OAuth options.
 */

import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/app/actions";
import TenantLanding from "./components/TenantLanding";
import DeactivatedMessage from "./components/DeactivatedMessage";
import { toTenantDisplay } from "@/lib/utils/tenant";

interface TenantPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function TenantPage({
  params,
  searchParams,
}: TenantPageProps) {
  const { slug } = await params;
  const { error: errorParam } = await searchParams;
  const { tenant, error } = await getTenantBySlug(slug);

  if (error || !tenant) {
    notFound();
  }

  // If tenant is inactive, show deactivated message
  if (!tenant.active) {
    return <DeactivatedMessage tenantName={tenant.name} />;
  }

  // Map error codes to user-friendly messages
  let errorMessage: string | null = null;
  if (errorParam === "email_not_verified") {
    errorMessage = "Please submit your email to access coupons and surveys.";
  } else if (errorParam === "oauth_access_denied") {
    errorMessage =
      "Google sign-in was cancelled. You can try again or use your email address instead.";
  } else if (errorParam === "oauth_failed") {
    errorMessage =
      "Google sign-in failed. Please try again or use your email address instead.";
  } else if (errorParam === "oauth_invalid_request") {
    errorMessage =
      "Invalid sign-in request. Please try again or use your email address instead.";
  } else if (errorParam === "oauth_invalid") {
    errorMessage =
      "Invalid sign-in request. Please try again or use your email address instead.";
  } else if (errorParam === "oauth_processing_failed") {
    errorMessage =
      "Sign-in processing failed. Please try again or use your email address instead.";
  }

  return (
    <TenantLanding
      tenant={toTenantDisplay(tenant)}
      initialError={errorMessage}
    />
  );
}

export async function generateMetadata({ params }: TenantPageProps) {
  const { slug } = await params;
  const { tenant } = await getTenantBySlug(slug);

  return {
    title: tenant?.name || "Tenant",
    description: `Access VIP Events & Exclusive Offers from ${tenant?.name}`,
  };
}
