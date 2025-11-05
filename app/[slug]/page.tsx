import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/app/actions";
import TenantLanding from "./components/TenantLanding";
import DeactivatedMessage from "./components/DeactivatedMessage";
import { toTenantDisplay } from "@/lib/utils/tenant";

interface TenantPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { slug } = await params;
  const { tenant, error } = await getTenantBySlug(slug);

  if (error || !tenant) {
    notFound();
  }

  // If tenant is inactive, show deactivated message
  if (!tenant.active) {
    return <DeactivatedMessage tenantName={tenant.name} />;
  }

  return <TenantLanding tenant={toTenantDisplay(tenant)} />;
}

export async function generateMetadata({ params }: TenantPageProps) {
  const { slug } = await params;
  const { tenant } = await getTenantBySlug(slug);

  return {
    title: tenant?.name || "Tenant",
    description: `Access VIP Events & Exclusive Offers from ${tenant?.name}`,
  };
}
