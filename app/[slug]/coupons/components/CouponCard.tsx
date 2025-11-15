// CouponCard
// Displays a single coupon card with title, description, expiration, and claim button/status badge.
// Used in: app/[slug]/coupons/components/CouponsList.tsx

"use client";

import { Gift, CheckCircle, XCircle, Clock } from "lucide-react";
import { getTenantPath } from "@/lib/utils/subdomain";

interface Coupon {
  id: string;
  title: string;
  discount?: string | null;
  description?: string | null;
  expires_at?: string | null;
  active?: boolean;
  created_at?: string;
  couponStatus?: "redeemed" | "revoked" | "expired" | null;
}

interface CouponCardProps {
  coupon: Coupon;
  tenantSlug: string;
  email: string;
}

export default function CouponCard({
  coupon,
  tenantSlug,
  email,
}: CouponCardProps) {
  const handleClaimClick = () => {
    if (!email) {
      console.error("No email provided");
      return;
    }

    // Navigate to survey page for this coupon
    // Use getTenantPath to handle subdomain routing correctly
    const surveyPath = getTenantPath(
      tenantSlug,
      `/coupons/${coupon.id}/survey`
    );
    const surveyUrl = `${surveyPath}?email=${encodeURIComponent(email)}`;
    console.log("Navigating to survey:", surveyUrl);

    // Use window.location for a hard redirect to ensure it works
    window.location.href = surveyUrl;
  };
  const getExpirationText = () => {
    if (!coupon.expires_at) return null;

    const expiresDate = new Date(coupon.expires_at);
    const now = new Date();
    const diffTime = expiresDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Expired";
    } else if (diffDays === 0) {
      return "Expires today";
    } else if (diffDays === 1) {
      return "Expires tomorrow";
    } else if (diffDays < 7) {
      return `Expires in ${diffDays} days`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Expires in ${weeks} ${weeks === 1 ? "week" : "weeks"}`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `Expires in ${months} ${months === 1 ? "month" : "months"}`;
    }
  };

  return (
    <div className="group flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 sm:items-center">
      {/* Icon */}
      <div className="flex-shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
          <Gift className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* Title */}
        <h3 className="break-words text-base font-semibold text-black dark:text-zinc-50">
          {coupon.title}
        </h3>

        {/* Description */}
        {coupon.description && (
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {coupon.description}
          </p>
        )}

        {/* Expiration */}
        {coupon.expires_at && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {getExpirationText()}
          </p>
        )}

        {/* Discount Amount */}
        {coupon.discount && (
          <p className="mt-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
            {coupon.discount}
          </p>
        )}
      </div>

      {/* Claim Button / Status Badge */}
      <div className="shrink-0">
        {coupon.couponStatus === "redeemed" ? (
          <div className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            Redeemed
          </div>
        ) : coupon.couponStatus === "revoked" ? (
          <div className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <XCircle className="h-4 w-4" />
            Revoked
          </div>
        ) : coupon.couponStatus === "expired" ? (
          <div className="flex items-center gap-2 rounded-lg bg-orange-100 px-4 py-2 text-sm font-medium text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
            <Clock className="h-4 w-4" />
            Expired
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClaimClick}
            disabled={coupon.active === false || !email}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-black"
          >
            Claim Now
          </button>
        )}
      </div>
    </div>
  );
}
