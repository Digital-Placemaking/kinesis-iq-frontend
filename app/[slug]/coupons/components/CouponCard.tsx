/**
 * app/[slug]/coupons/components/CouponCard.tsx
 * Coupon card component for displaying individual coupons.
 * Shows coupon details, image, expiration, and claim button with status badges.
 */

"use client";

import { useState } from "react";
import { Gift, CheckCircle, XCircle, Clock, X } from "lucide-react";
import { getTenantPath } from "@/lib/utils/subdomain";

interface Coupon {
  id: string;
  title: string;
  discount?: string | null;
  description?: string | null;
  expires_at?: string | null;
  active?: boolean;
  created_at?: string;
  image_url?: string | null;
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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  /**
   * Handles coupon claim button click
   * Navigates to the survey page for the selected coupon
   */
  const handleClaimClick = () => {
    if (!email) {
      return;
    }

    // Navigate to survey page for this coupon
    // Use getTenantPath to handle subdomain routing correctly
    const surveyPath = getTenantPath(
      tenantSlug,
      `/coupons/${coupon.id}/survey`
    );
    const surveyUrl = `${surveyPath}?email=${encodeURIComponent(email)}`;

    // Use window.location for a hard redirect to ensure it works
    window.location.href = surveyUrl;
  };
  /**
   * Calculates and returns human-readable expiration text
   * @returns {string | null} Formatted expiration text or null if no expiration
   */
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
    <>
      <div className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        {/* Image at the top (if present) */}
        {coupon.image_url && (
          <div className="relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => setIsImageModalOpen(true)}
              className="relative flex w-full items-center justify-center transition-transform hover:scale-[1.01]"
            >
              <img
                src={coupon.image_url}
                alt={coupon.title}
                className="h-48 w-full object-contain sm:h-64"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </div>
        )}

        {/* Content section */}
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          {/* Header: Icon/Title/Button */}
          <div className="flex items-start gap-4">
            {/* Icon (only shown if no image) */}
            {!coupon.image_url && (
              <div className="shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-sm">
                  <Gift className="h-6 w-6 text-white" />
                </div>
              </div>
            )}

            {/* Title and Discount */}
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 wrap-break-word text-lg font-bold leading-tight text-black dark:text-zinc-50 sm:text-xl">
                {coupon.title}
              </h3>
              {coupon.discount && (
                <div className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {coupon.discount}
                </div>
              )}
            </div>

            {/* Claim Button / Status Badge */}
            <div className="shrink-0">
              {coupon.couponStatus === "redeemed" ? (
                <div className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400 sm:px-4 sm:text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Redeemed</span>
                </div>
              ) : coupon.couponStatus === "revoked" ? (
                <div className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-400 sm:px-4 sm:text-sm">
                  <XCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Revoked</span>
                </div>
              ) : coupon.couponStatus === "expired" ? (
                <div className="flex items-center gap-2 rounded-lg bg-orange-100 px-3 py-2 text-xs font-medium text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 sm:px-4 sm:text-sm">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Expired</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleClaimClick}
                  disabled={coupon.active === false || !email}
                  className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-black dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 sm:px-6"
                >
                  Claim Now
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {coupon.description && (
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {coupon.description}
            </p>
          )}

          {/* Expiration */}
          {coupon.expires_at && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{getExpirationText()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && coupon.image_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-h-full max-w-full">
            <button
              type="button"
              onClick={() => setIsImageModalOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-black transition-colors hover:bg-white"
              aria-label="Close image"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={coupon.image_url}
              alt={coupon.title}
              className="max-h-[90vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
