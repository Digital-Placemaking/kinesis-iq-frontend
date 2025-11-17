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

  return (
    <TenantLanding
      tenant={toTenantDisplay(tenant)}
      initialError={
        errorParam === "email_not_verified"
          ? "Please submit your email to access coupons and surveys."
          : null
      }
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
