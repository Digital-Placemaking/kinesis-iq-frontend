import { notFound } from "next/navigation";
import { getCouponsForTenant, getTenantBySlug } from "@/app/actions";
import { toTenantDisplay } from "@/lib/utils/tenant";
import CouponsList from "./components/CouponsList";

interface CouponsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CouponsPage({ params }: CouponsPageProps) {
  const { slug } = await params;

  // Get tenant data for display
  const { tenant: tenantData, error: tenantError } = await getTenantBySlug(
    slug
  );

  // Get coupons for tenant
  const { coupons, error: couponsError } = await getCouponsForTenant(slug);

  if (tenantError || !tenantData) {
    notFound();
  }

  if (couponsError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
        <div className="mx-auto max-w-4xl px-8 py-16">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            <p className="font-semibold">Error loading coupons</p>
            <p className="mt-2 text-sm">{couponsError}</p>
          </div>
        </div>
      </div>
    );
  }

  const tenant = toTenantDisplay(tenantData);

  return <CouponsList tenant={tenant} coupons={coupons || []} />;
}

export async function generateMetadata({ params }: CouponsPageProps) {
  const { slug } = await params;
  const { tenant } = await getTenantBySlug(slug);

  return {
    title: `Coupons - ${tenant?.name || "Tenant"}`,
    description: `View all available coupons and exclusive offers from ${tenant?.name}`,
  };
}
