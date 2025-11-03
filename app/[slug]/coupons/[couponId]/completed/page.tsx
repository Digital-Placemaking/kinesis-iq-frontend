import { redirect, notFound } from "next/navigation";
import {
  getTenantBySlug,
  verifyEmailOptIn,
  getCouponById,
} from "@/app/actions";
import { toTenantDisplay } from "@/lib/utils/tenant";
import CouponCompletion from "./components/CouponCompletion";

interface CompletedPageProps {
  params: Promise<{ slug: string; couponId: string }>;
  searchParams: Promise<{ email?: string }>;
}

// Helper function to generate a coupon code
function generateCouponCode(couponId: string): string {
  // Simple code generation - use last 8 chars of coupon ID + random suffix
  const idPart = couponId.replace(/-/g, "").slice(-6).toUpperCase();
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${idPart}-${randomPart}`;
}

export default async function CompletedPage({
  params,
  searchParams,
}: CompletedPageProps) {
  const { slug, couponId } = await params;
  const { email } = await searchParams;

  // Verify email opt-in before allowing access
  if (!email) {
    redirect(`/${slug}/coupons`);
  }

  // Verify email opt-in - if verification fails, still allow access
  const optInCheck = await verifyEmailOptIn(slug, email);

  if (!optInCheck.valid) {
    console.warn("Email opt-in verification warning:", optInCheck.error);
  }

  // Get tenant data
  const { tenant: tenantData, error: tenantError } = await getTenantBySlug(
    slug
  );

  if (tenantError || !tenantData) {
    notFound();
  }

  // Get coupon data
  const { coupon, error: couponError } = await getCouponById(slug, couponId);

  if (couponError || !coupon) {
    notFound();
  }

  // Generate coupon code
  // TODO: This should come from the database or be generated server-side
  const couponCode = generateCouponCode(couponId);

  const tenant = toTenantDisplay(tenantData);

  return (
    <CouponCompletion tenant={tenant} coupon={coupon} couponCode={couponCode} />
  );
}
