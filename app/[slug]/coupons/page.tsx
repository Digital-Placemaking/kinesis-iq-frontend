import { redirect, notFound } from "next/navigation";
import {
  getCouponsForTenant,
  getTenantBySlug,
  verifyEmailOptIn,
  getCouponStatus,
} from "@/app/actions";
import { toTenantDisplay } from "@/lib/utils/tenant";
import CouponsList from "./components/CouponsList";

interface CouponsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ email?: string }>;
}

/**
 * Coupons List Page
 *
 * Displays all available coupons for a tenant.
 *
 * Flow:
 * 1. User arrives here from landing page with email in query parameter
 * 2. Email is validated (must be present)
 * 3. Coupons are displayed
 * 4. When user clicks a coupon → goes to survey page
 * 5. Survey page checks if email is in email_opt_ins table:
 *    - If NOT → show survey (first-time user)
 *    - If IS → skip survey, go to coupon completion (returning user)
 *
 * Note: Email is NOT required to be in email_opt_ins table to view this page.
 * The survey page will handle the opt-in check when user clicks a coupon.
 */
export default async function CouponsPage({
  params,
  searchParams,
}: CouponsPageProps) {
  const { slug } = await params;
  const { email } = await searchParams;

  // Require email parameter - redirect to landing if missing
  if (!email) {
    redirect(`/${slug}`);
  }

  // Get tenant data for display
  const { tenant: tenantData, error: tenantError } = await getTenantBySlug(
    slug
  );

  if (tenantError || !tenantData) {
    notFound();
  }

  // If tenant is inactive, show deactivated message
  if (!tenantData.active) {
    const { default: DeactivatedMessage } = await import(
      "../components/DeactivatedMessage"
    );
    return <DeactivatedMessage tenantName={tenantData.name} />;
  }

  // Get coupons for tenant
  const { coupons, error: couponsError } = await getCouponsForTenant(slug);

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

  // Check status for each coupon (redeemed, revoked, expired)
  const couponsWithStatus = await Promise.all(
    (coupons || []).map(async (coupon) => {
      const { status } = await getCouponStatus(slug, coupon.id, email);
      return {
        ...coupon,
        couponStatus: status, // 'redeemed' | 'revoked' | 'expired' | null
      };
    })
  );

  return (
    <CouponsList tenant={tenant} coupons={couponsWithStatus} email={email} />
  );
}

export async function generateMetadata({ params }: CouponsPageProps) {
  const { slug } = await params;
  const { tenant } = await getTenantBySlug(slug);

  return {
    title: `Coupons - ${tenant?.name || "Tenant"}`,
    description: `View all available coupons and exclusive offers from ${tenant?.name}`,
  };
}
