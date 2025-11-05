import { redirect, notFound } from "next/navigation";
import {
  getTenantBySlug,
  verifyEmailOptIn,
  getCouponById,
  issueCoupon,
} from "@/app/actions";
import { toTenantDisplay } from "@/lib/utils/tenant";
import CouponCompletion from "./components/CouponCompletion";

interface CompletedPageProps {
  params: Promise<{ slug: string; couponId: string }>;
  searchParams: Promise<{ email?: string }>;
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

  // If tenant is inactive, show deactivated message
  if (!tenantData.active) {
    const { default: DeactivatedMessage } = await import(
      "../../../components/DeactivatedMessage"
    );
    return <DeactivatedMessage tenantName={tenantData.name} />;
  }

  // Get coupon data
  const { coupon, error: couponError } = await getCouponById(slug, couponId);

  if (couponError || !coupon) {
    notFound();
  }

  // Issue coupon code (create issued_coupon record)
  // The issueCoupon function handles duplicate prevention internally
  // It will return the existing coupon if one already exists for this email/coupon
  const { issuedCoupon, error: issueError } = await issueCoupon(
    slug,
    couponId,
    email,
    coupon.expires_at || null
  );

  const tenant = toTenantDisplay(tenantData);

  // If issue fails, show error on page instead of redirecting (for debugging)
  if (issueError || !issuedCoupon) {
    // Log the error for debugging
    console.error("Failed to issue coupon:", {
      error: issueError,
      slug,
      couponId,
      email,
      issuedCoupon,
    });

    // Still render the page but with error message
    return (
      <CouponCompletion
        tenant={tenant}
        coupon={coupon}
        couponCode={null}
        issuedCouponId={null}
        tenantSlug={slug}
        error={issueError || "Failed to issue coupon"}
      />
    );
  }

  // Generate session ID from email if not available
  // Session ID is used for tracking anonymous users
  const sessionId = email
    ? `session_${email.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`
    : null;

  // Check if this coupon is already fully redeemed
  const isAlreadyRedeemed =
    issuedCoupon.status === "redeemed" ||
    issuedCoupon.redemptions_count >= issuedCoupon.max_redemptions;

  return (
    <CouponCompletion
      tenant={tenant}
      coupon={coupon}
      couponCode={issuedCoupon.code}
      issuedCouponId={issuedCoupon.id}
      tenantSlug={slug}
      email={email}
      sessionId={sessionId}
      isAlreadyRedeemed={isAlreadyRedeemed}
    />
  );
}
