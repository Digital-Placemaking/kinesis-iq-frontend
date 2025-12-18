/**
 * app/[slug]/coupons/[couponId]/completed/components/CouponCompletion.tsx
 * Coupon completion component.
 * Displays coupon code and redemption options after completing a coupon survey.
 */

"use client";

import { useState } from "react";
import { Share2, Download, Bell, Info } from "lucide-react";
import type { TenantDisplay } from "@/lib/types/tenant";
import Footer from "@/app/components/Footer";
import Card from "@/app/components/ui/Card";
import InfoBox from "@/app/components/ui/InfoBox";
import ActionButton from "@/app/components/ui/ActionButton";
import VisitWebsiteButton from "@/app/components/ui/VisitWebsiteButton";
import CouponCodeDisplay from "./CouponCodeDisplay";
import { generateGoogleWalletPass } from "@/app/actions";
import { trackWalletAdd } from "@/lib/analytics/events";

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
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

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
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(couponCode);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = couponCode;
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
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
    <div className="mobile-theme flex min-h-screen flex-col bg-kinesisiq-gradient">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-6">
        {/* Main Content Card */}
        <Card className="mb-3 p-3" variant="elevated">
          {/* Congratulations Header */}
          <div className="mb-3 text-center">
            <h1 className="mb-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Congratulations! 🎉
            </h1>
            <p className="text-xs text-muted-foreground">
              Thanks for completing our survey
            </p>
          </div>
          {/* Logo */}
          <div className="mb-2 flex justify-center">
            <div className="max-w-[80px] max-h-[60px]">
              {tenant.logo_url ? (
                <img
                  src={tenant.logo_url}
                  alt={tenant.name}
                  className="max-w-full max-h-[60px] object-contain"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {tenant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Coupon Title */}
          <h2 className="mb-1 text-center text-base font-bold text-primary sm:text-lg">
            {coupon.title}
          </h2>

          {/* Coupon Description */}
          {coupon.description && (
            <p className="mb-3 text-center text-xs text-muted-foreground">
              {coupon.description}
            </p>
          )}

          <p className="mb-1.5 text-center text-[11px] text-muted-foreground">
            Your data stays anonymous.
          </p>

          {error && (
            <div className="mb-2 rounded-lg border-2 border-destructive/20 bg-destructive/10 p-2 text-xs text-destructive">
              <p className="font-semibold">Error issuing coupon:</p>
              <p className="mt-0.5">{error}</p>
            </div>
          )}

          {/* Coupon Code Display */}
          {couponCode && (
            <div className="mb-1.5">
              <CouponCodeDisplay code={couponCode} />
              {/* Show message if this is an existing redeemed coupon */}
              {isAlreadyRedeemed && (
                <div className="mt-2 flex items-start gap-2 rounded-lg border-2 border-primary/20 bg-primary/10 p-2 text-xs text-primary">
                  <Info className="h-3 w-3 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">
                      This is your existing coupon code.
                    </p>
                    <p className="mt-0.5 text-[10px]">
                      This coupon has already been redeemed. You&apos;ll keep
                      the same code every time you complete a survey.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Share & Important - compact */}
          <div className="space-y-1">
            <InfoBox title="Share" variant="success" className="py-1">
              <p className="text-center text-[11px] font-medium text-primary">
                Send to family, friends and colleagues.
              </p>
            </InfoBox>

            <InfoBox variant="info" className="py-1">
              <p className="mb-0.5 text-[11px] font-semibold text-foreground">
                IMPORTANT:
              </p>
              <ul className="space-y-0 text-[10px] text-muted-foreground">
                <li>• Save this code! Take a screenshot or write it down.</li>
                <li>• Use before expiry date.</li>
                <li>• One-time use only.</li>
              </ul>
            </InfoBox>
          </div>
        </Card>

        {/* Wallet Error Display */}
        {walletError && (
          <div className="mb-3 rounded-lg border-2 border-destructive/20 bg-destructive/10 p-2 text-xs text-destructive">
            {walletError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-3 flex flex-col gap-1.5">
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
            variant="outline"
            className="w-full py-2 text-sm border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500"
          >
            Share with Friends
          </ActionButton>
        </div>

        {/* Footer Options */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
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
