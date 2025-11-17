import { redirect, notFound } from "next/navigation";
import {
  getTenantBySlug,
  verifyEmailOptIn,
  getCouponById,
  issueCoupon,
  checkExistingCoupon,
} from "@/app/actions";
import { toTenantDisplay } from "@/lib/utils/tenant";
import CouponCompletion from "./components/CouponCompletion";

interface CompletedPageProps {
  params: Promise<{ slug: string; couponId: string }>;
  searchParams: Promise<{ email?: string }>;
}

/**
 * Coupon Completion Page
 *
 * Displays the coupon code and allows user to download/add to wallet.
 *
 * Users can reach this page via two paths:
 * 1. After completing survey → Email was just stored in email_opt_ins
 * 2. Returning user → Email already in email_opt_ins, skipped survey
 * 3. OAuth user → Email stored on OAuth, skipped survey
 *
 * This page issues a new coupon code if one doesn't exist, or reuses
 * an existing coupon code if the user already has one for this coupon.
 */
export default async function CompletedPage({
  params,
  searchParams,
}: CompletedPageProps) {
  const { slug, couponId } = await params;
  const { email } = await searchParams;

  // Require email parameter
  if (!email) {
    redirect(`/${slug}/coupons`);
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

  const tenant = toTenantDisplay(tenantData);

  // First, check if user already has an issued coupon for this coupon
  // This avoids unnecessary API calls when the coupon is already redeemed
  // Rate limited but less strict than coupon issuance
  const {
    exists,
    issuedCoupon: existingCoupon,
    error: checkError,
  } = await checkExistingCoupon(slug, couponId, email);

  let issuedCoupon;
  let issueError: string | null = null;

  if (exists && existingCoupon) {
    // User already has an issued coupon - use it directly
    // This skips the issueCoupon call entirely, saving an API request
    issuedCoupon = existingCoupon;
  } else if (checkError) {
    // Rate limit error or other check error - log but try to issue anyway
    console.warn("Error checking existing coupon:", checkError);
    // Continue to issueCoupon below
  } else {
    // No existing coupon found - issue a new one
    // This only happens for first-time coupon claims
    const issueResult = await issueCoupon(
      slug,
      couponId,
      email,
      coupon.expires_at || null
    );

    issuedCoupon = issueResult.issuedCoupon;
    issueError = issueResult.error;
  }

  // If issue fails, show error on page instead of redirecting (for debugging)
  if (issueError || !issuedCoupon) {
    // Log the error for debugging
    console.error("Failed to get or issue coupon:", {
      error: issueError,
      checkError,
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
        error={issueError || checkError || "Failed to get or issue coupon"}
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
