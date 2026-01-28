/**
 * app/[slug]/coupons/[couponId]/completed/components/CouponCompletion.tsx
 * Coupon completion component.
 * Displays coupon code and redemption options after completing a coupon survey.
 */

"use client";

import { useState } from "react";
import { Share2, Download, Bell, Info } from "lucide-react";
import {
  FaWhatsapp,
  FaFacebook,
  FaEnvelope,
  FaTwitter,
  FaLinkedin,
  FaSms,
  FaLink,
} from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import SocialLoginButton from "@/app/[slug]/components/ui/SocialLoginButton";
import SectionSeparator from "@/app/components/ui/SectionSeparator";
import type { TenantDisplay } from "@/lib/types/tenant";
import Footer from "@/app/components/Footer";
import Card from "@/app/components/ui/Card";
import InfoBox from "@/app/components/ui/InfoBox";
import ActionButton from "@/app/components/ui/ActionButton";
import VisitWebsiteButton from "@/app/components/ui/VisitWebsiteButton";
import CouponCodeDisplay from "./CouponCodeDisplay";
import { generateGoogleWalletPass, submitEmail } from "@/app/actions";
import { getGoogleOAuthUrl } from "@/app/actions/google/oauth-url";
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
  const [showShareQR, setShowShareQR] = useState(false);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [emailOptIn, setEmailOptIn] = useState("");
  const [loadingOptIn, setLoadingOptIn] = useState(false);
  const [submittedOptIn, setSubmittedOptIn] = useState(false);
  const [optInError, setOptInError] = useState<string | null>(null);
  const [showOptInForm, setShowOptInForm] = useState(false);

  /**
   * Handles social login (Google/Apple OAuth)
   * Similar to SurveyCompletion but redirects back to coupon completion
   */
  const handleSocialLogin = async (provider: "apple" | "google") => {
    // Only Google is currently implemented
    if (provider !== "google") {
      setOptInError("Apple login is not yet available. Please use Google or email.");
      return;
    }

    setLoadingOptIn(true);
    setOptInError(null);

    try {
      // Generate Google OAuth authorization URL with returnTo parameter
      const result = await getGoogleOAuthUrl(
        tenantSlug,
        typeof window !== "undefined" ? window.location.origin : "",
        `/coupons/${coupon.id}/completed` // Return to coupon completion page after OAuth
      );

      if (result.error || !result.url) {
        setOptInError(
          result.error || "Failed to initiate Google login. Please try again."
        );
        setLoadingOptIn(false);
        return;
      }

      // Redirect to Google OAuth
      window.location.href = result.url;
      // No need to set loading to false - user is being redirected
    } catch (err) {
      console.error("Error initiating Google OAuth:", err);
      setOptInError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
      setLoadingOptIn(false);
    }
  };

  /**
   * Handles email opt-in form submission
   */
  const handleEmailOptInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailOptIn || !emailOptIn.trim()) {
      setOptInError("Please enter a valid email address");
      return;
    }

    setLoadingOptIn(true);
    setOptInError(null);

    try {
      const result = await submitEmail(tenantSlug, emailOptIn.trim());

      if (result && typeof result.success === "boolean") {
        if (result.success === true) {
          setSubmittedOptIn(true);
          setEmailOptIn("");
        } else if (result.error) {
          setOptInError(result.error);
        } else {
          setOptInError("Failed to submit email. Please try again.");
        }
      } else {
        setOptInError("An unexpected error occurred");
      }
    } catch (err) {
      setOptInError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingOptIn(false);
    }
  };

  // Social share handlers
  const baseShareUrl = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";
  const shareText = `Check out this coupon: ${couponCode || ""}`;

  /**
   * Generate a unique share ID for tracking viral reach
   * Format: timestamp_randomString_source
   * This allows admin to see unique shares and their sources
   */
  const generateUniqueShareId = (source: string) => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${randomStr}_${source}`;
  };

  /**
   * Create a unique share URL with tracking parameters
   * Each share action gets a unique ID for tracking viral reach
   */
  const createShareUrl = (source: string) => {
    const shareId = generateUniqueShareId(source);
    const url = new URL(baseShareUrl || window.location.href);
    url.searchParams.set("src", source);
    url.searchParams.set("share_id", shareId);
    if (email) url.searchParams.set("shared_by", btoa(email)); // Base64 encode sharer email
    return url.toString();
  };

  const handleWhatsAppShare = () => {
    const uniqueShareUrl = createShareUrl("whatsapp");
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText + " " + uniqueShareUrl)}`,
      "_blank"
    );
    setShowShareQR(true);
    setQrValue(uniqueShareUrl);
  };

  const handleFacebookShare = () => {
    const uniqueShareUrl = createShareUrl("facebook");
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(uniqueShareUrl)}`,
      "_blank"
    );
    setShowShareQR(true);
    setQrValue(uniqueShareUrl);
  };

  const handleGmailShare = () => {
    const uniqueShareUrl = createShareUrl("gmail");
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=&su=Coupon&body=${encodeURIComponent(shareText + " " + uniqueShareUrl)}`,
      "_blank"
    );
    setShowShareQR(true);
    setQrValue(uniqueShareUrl);
  };

  const handleTwitterShare = () => {
    const uniqueShareUrl = createShareUrl("twitter");
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(uniqueShareUrl)}`,
      "_blank"
    );
    setShowShareQR(true);
    setQrValue(uniqueShareUrl);
  };

  const handleLinkedInShare = () => {
    const uniqueShareUrl = createShareUrl("linkedin");
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(uniqueShareUrl)}`,
      "_blank"
    );
    setShowShareQR(true);
    setQrValue(uniqueShareUrl);
  };

  const handleSmsShare = () => {
    const uniqueShareUrl = createShareUrl("sms");
    // SMS link format works on both iOS and Android
    window.open(
      `sms:?body=${encodeURIComponent(shareText + " " + uniqueShareUrl)}`,
      "_blank"
    );
    setShowShareQR(true);
    setQrValue(uniqueShareUrl);
  };

  const handleCopyShareLink = async () => {
    const uniqueShareUrl = createShareUrl("link");
    try {
      await navigator.clipboard.writeText(uniqueShareUrl);
      setShowShareQR(true);
      setQrValue(uniqueShareUrl);
      // Show brief feedback
      setShareError("Link copied to clipboard!");
      setTimeout(() => setShareError(null), 2000);
    } catch (err) {
      setShareError("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (!couponCode) return;
    const uniqueShareUrl = createShareUrl("native_share");
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Coupon: ${coupon.title}`,
          text: `Check out this coupon: ${couponCode}`,
          url: uniqueShareUrl,
        });
        // Show QR code after sharing
        setShowShareQR(true);
        setQrValue(uniqueShareUrl);
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== "AbortError") {
          console.error("Failed to share:", err);
        }
      }
    } else {
      // Fallback: copy to clipboard with unique link
      await handleCopyShareLink();
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

          <div className="space-y-2">
            <InfoBox title="Share" variant="success" className="py-2">
              <p className="text-center text-xs font-semibold text-green-700 dark:text-green-300">
                Send to family, friends and colleagues.
              </p>
              {/* Primary sharing options - first row */}
              <div className="flex justify-center gap-3 mt-2">
                <button
                  title="WhatsApp"
                  onClick={handleWhatsAppShare}
                  className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <FaWhatsapp size={22} className="text-green-600" />
                </button>
                <button
                  title="Facebook"
                  onClick={handleFacebookShare}
                  className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <FaFacebook size={22} className="text-blue-600" />
                </button>
                <button
                  title="Email"
                  onClick={handleGmailShare}
                  className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <FaEnvelope size={22} className="text-red-500" />
                </button>
                <button
                  title="Twitter/X"
                  onClick={handleTwitterShare}
                  className="p-2 rounded-full hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors"
                >
                  <FaTwitter size={22} className="text-sky-500" />
                </button>
              </div>
              {/* Secondary sharing options - second row */}
              <div className="flex justify-center gap-3 mt-1">
                <button
                  title="LinkedIn"
                  onClick={handleLinkedInShare}
                  className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <FaLinkedin size={22} className="text-blue-700" />
                </button>
                <button
                  title="SMS/Text"
                  onClick={handleSmsShare}
                  className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <FaSms size={22} className="text-green-600" />
                </button>
                <button
                  title="Copy Link"
                  onClick={handleCopyShareLink}
                  className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <FaLink size={22} className="text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>
              {/* QR Code - unique per share action */}
              {showShareQR && qrValue && (
                <div className="flex flex-col items-center mt-3 p-3 bg-white dark:bg-zinc-800 rounded-lg">
                  <span className="text-xs mb-2 text-zinc-600 dark:text-zinc-400">
                    Unique QR code for this share:
                  </span>
                  <QRCodeSVG value={qrValue} size={120} />
                  <span className="text-[10px] mt-2 text-zinc-500 dark:text-zinc-500 text-center max-w-[200px] break-all">
                    {qrValue.length > 60 ? qrValue.substring(0, 60) + "..." : qrValue}
                  </span>
                </div>
              )}
              {shareError && (
                <div
                  className={`text-xs mt-2 text-center ${shareError.includes("copied") ? "text-green-600" : "text-red-600"}`}
                >
                  {shareError}
                </div>
              )}
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

        {/* Footer Options - Email/Social Opt-in */}
        <div className="space-y-2 text-center">
          {!showOptInForm && !submittedOptIn && (
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <Bell className="h-3 w-3" />
              <span>
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    setShowOptInForm(true);
                  }}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Want to hear about more offers?
                </a>
              </span>
            </div>
          )}
          {/* Opt-in UI (similar to SurveyCompletion) */}
          {showOptInForm && !submittedOptIn && (
            <div className="space-y-3">
              <p className="text-center text-xs font-medium text-zinc-700 dark:text-zinc-300 sm:text-sm">
                Want to stay updated with exclusive offers?
              </p>
              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {/* Apple login - Coming soon */}
                <SocialLoginButton
                  provider="apple"
                  onClick={() => handleSocialLogin("apple")}
                  disabled
                />
                {/* Google OAuth - Active */}
                <SocialLoginButton
                  provider="google"
                  onClick={() => handleSocialLogin("google")}
                  disabled={loadingOptIn}
                />
              </div>
              <SectionSeparator text="Or continue with email" />
              <form onSubmit={handleEmailOptInSubmit} className="space-y-2">
                <input
                  type="email"
                  value={emailOptIn}
                  onChange={e => setEmailOptIn(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loadingOptIn}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
                <button
                  type="submit"
                  disabled={loadingOptIn}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingOptIn ? "Submitting..." : "Get Updates"}
                </button>
              </form>
              {optInError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                  {optInError}
                </div>
              )}
            </div>
          )}
          {submittedOptIn && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center dark:border-green-800 dark:bg-green-900/20 sm:p-4">
              <p className="text-xs font-semibold text-green-800 dark:text-green-200 sm:text-sm">
                Thank you! You've been added to our mailing list.
              </p>
            </div>
          )}
          <VisitWebsiteButton tenant={tenant} />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
