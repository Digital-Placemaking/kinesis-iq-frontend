// CouponCompletion
// Completion page component displayed after completing a coupon survey, showing coupon code and redemption options.
// Used in: app/[slug]/coupons/[couponId]/completed/page.tsx

"use client";

import { useState } from "react";
import { Copy, Share2, Download, Bell, Info } from "lucide-react";
import type { TenantDisplay } from "@/lib/types/tenant";
import Footer from "@/app/components/Footer";
import TenantLogo from "@/app/components/ui/TenantLogo";
import Card from "@/app/components/ui/Card";
import InfoBox from "@/app/components/ui/InfoBox";
import ActionButton from "@/app/components/ui/ActionButton";
import VisitWebsiteButton from "@/app/components/ui/VisitWebsiteButton";
import CouponCodeDisplay from "./CouponCodeDisplay";
import { generateGoogleWalletPass } from "@/app/actions";
import {
  trackCodeCopy,
  trackCouponDownload,
  trackWalletAdd,
} from "@/lib/analytics/events";

interface Coupon {
  id: string;
  title: string;
  description?: string | null;
  discount?: string | null;
  expires_at?: string | null;
}

interface CouponCompletionProps {
  tenant: TenantDisplay;
  coupon: Coupon;
  couponCode: string | null;
  issuedCouponId: string | null;
  tenantSlug: string;
  email?: string | null;
  sessionId?: string | null;
  error?: string | null;
  isAlreadyRedeemed?: boolean;
}

export default function CouponCompletion({
  tenant,
  coupon,
  couponCode,
  issuedCouponId,
  tenantSlug,
  email,
  sessionId,
  error,
  isAlreadyRedeemed = false,
}: CouponCompletionProps) {
  const [copied, setCopied] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const handleCopyCode = async () => {
    if (!couponCode) return;
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Track code copy event
      trackCodeCopy(tenantSlug, {
        sessionId,
        email: email || null,
        couponId: coupon.id,
        issuedCouponId: issuedCouponId || undefined,
      });
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    if (!couponCode) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Coupon: ${coupon.title}`,
          text: `Check out this coupon: ${couponCode}`,
        });
      } catch (err) {
        console.error("Failed to share:", err);
      }
    } else {
      // Fallback: copy to clipboard
      handleCopyCode();
    }
  };

  /**
   * Handles coupon download
   * Currently only tracks analytics event
   * Future: Could generate PDF or image download
   */
  const handleDownload = () => {
    // Track coupon download event
    trackCouponDownload(tenantSlug, {
      sessionId,
      email: email || null,
      couponId: coupon.id,
      issuedCouponId: issuedCouponId || undefined,
    });

    // Note: Actual download functionality not yet implemented
    // Could generate PDF/image in future iterations
  };

  const handleAddToWallet = async () => {
    if (!issuedCouponId) {
      setWalletError("Coupon not available for wallet");
      return;
    }

    setWalletLoading(true);
    setWalletError(null);

    try {
      const result = await generateGoogleWalletPass(tenantSlug, issuedCouponId);

      if (result.error || !result.saveUrl) {
        setWalletError(result.error || "Failed to generate wallet pass");
        setWalletLoading(false);
        return;
      }

      // Open the Google Wallet save URL in a new window
      window.open(result.saveUrl, "_blank");

      // Track wallet add event
      trackWalletAdd(tenantSlug, {
        sessionId,
        email: email || null,
        couponId: coupon.id,
        issuedCouponId: issuedCouponId || undefined,
      });

      setWalletLoading(false);
    } catch (err) {
      console.error("Failed to add to wallet:", err);
      setWalletError(
        err instanceof Error ? err.message : "Failed to add to wallet"
      );
      setWalletLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-6">
        {/* Main Content Card */}
        <Card className="mb-4 p-4" variant="elevated">
          {/* Congratulations Header */}
          <div className="mb-3 text-center">
            <h1 className="mb-1 text-xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-2xl">
              Congratulations! 🎉
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Thanks for completing our survey
            </p>
          </div>
          {/* Logo */}
          <div className="mb-3 flex justify-center">
            <div className="w-40">
              {tenant.logo_url ? (
                <img
                  src={tenant.logo_url}
                  alt={tenant.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center">
                  <span className="text-4xl font-bold text-zinc-600 dark:text-zinc-400">
                    {tenant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Coupon Title */}
          <h2 className="mb-1 text-center text-base font-bold text-blue-600 dark:text-blue-400 sm:text-lg">
            {coupon.title}
          </h2>

          {/* Coupon Description */}
          {coupon.description && (
            <p className="mb-3 text-center text-xs text-zinc-600 dark:text-zinc-400">
              {coupon.description}
            </p>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              <p className="font-semibold">Error issuing coupon:</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {/* Coupon Code Display */}
          {couponCode && (
            <div className="mb-3">
              <CouponCodeDisplay code={couponCode} />
              {/* Show message if this is an existing redeemed coupon */}
              {isAlreadyRedeemed && (
                <div className="mt-2 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  <Info className="h-3 w-3 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">
                      This is your existing coupon code.
                    </p>
                    <p className="mt-0.5 text-[10px]">
                      This coupon has already been redeemed. You'll keep the
                      same code every time you complete a survey.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Share Section */}
          <InfoBox title="Share" variant="success" className="mb-3 py-2">
            <p className="text-center text-xs font-semibold text-green-700 dark:text-green-300">
              Send to family, friends and colleagues.
            </p>
          </InfoBox>

          {/* Important Information */}
          <InfoBox variant="info" className="mb-0 py-2">
            <p className="mb-1 text-xs font-semibold text-zinc-900 dark:text-zinc-50">
              IMPORTANT:
            </p>
            <ul className="space-y-0.5 text-[11px] text-zinc-700 dark:text-zinc-300">
              <li>• Save this code! Take a screenshot or write it down.</li>
              <li>• Use before expiry date.</li>
              <li>• One-time use only.</li>
            </ul>
          </InfoBox>
        </Card>

        {/* Wallet Error Display */}
        {walletError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {walletError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-4 flex flex-col gap-1.5">
          <ActionButton
            icon={Copy}
            onClick={handleCopyCode}
            className="w-full py-2 text-sm"
          >
            {copied ? "Copied!" : "Copy Code"}
          </ActionButton>
          <ActionButton
            icon={Download}
            onClick={handleAddToWallet}
            disabled={!issuedCouponId || walletLoading}
            className="w-full py-2 text-sm"
          >
            {walletLoading ? "Generating..." : "Add to Google Wallet"}
          </ActionButton>
          <ActionButton
            icon={Share2}
            onClick={handleShare}
            className="w-full py-2 text-sm"
          >
            Share with Friends
          </ActionButton>
        </div>

        {/* Footer Options */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <Bell className="h-3 w-3" />
            <span>Want to hear about more offers?</span>
          </div>

          <VisitWebsiteButton tenant={tenant} />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
