"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Share2, Download, Bell, Home } from "lucide-react";
import type { TenantDisplay } from "@/lib/types/tenant";
import Footer from "@/app/components/Footer";
import CouponCodeDisplay from "./CouponCodeDisplay";

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
  couponCode: string;
}

export default function CouponCompletion({
  tenant,
  coupon,
  couponCode,
}: CouponCompletionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
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

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-8 py-12">
        {/* Main Content Card */}
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Congratulations Header */}
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-3xl">
              Congratulations! 🎉
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
              Thanks for completing our survey
            </p>
          </div>
          {/* Logo */}
          <div className="mb-4 flex justify-center">
            {tenant.logo_url ? (
              <div className="aspect-square w-24 overflow-hidden rounded-xl border-2 border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
                <img
                  src={tenant.logo_url}
                  alt={tenant.name}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex aspect-square w-24 items-center justify-center rounded-xl border-2 border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
                <span className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">
                  {tenant.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Coupon Title */}
          <h2 className="mb-2 text-center text-lg font-bold text-blue-600 dark:text-blue-400 sm:text-xl">
            {coupon.title}
          </h2>

          {/* Coupon Description */}
          {coupon.description && (
            <p className="mb-4 text-center text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
              {coupon.description}
            </p>
          )}

          {/* Coupon Code Display */}
          <div className="mb-4">
            <CouponCodeDisplay code={couponCode} />
          </div>

          {/* Share Section */}
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="mb-1 text-center text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400">
              Share
            </p>
            <p className="text-center text-xs font-semibold text-red-700 dark:text-red-300 sm:text-sm">
              Send to family, friends and colleagues.
            </p>
          </div>

          {/* Important Information */}
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="mb-2 text-xs font-semibold text-zinc-900 dark:text-zinc-50 sm:text-sm">
              IMPORTANT:
            </p>
            <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
              <li>• Save this code! Take a screenshot or write it down.</li>
              <li>• Use before expiry date.</li>
              <li>• One-time use only.</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 space-y-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy Code"}
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            Add to Google Wallet
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Share2 className="h-4 w-4" />
            Share with Friends
          </button>
        </div>

        {/* Footer Options */}
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
            <Bell className="h-4 w-4" />
            <span>Want to hear about more offers?</span>
          </div>

          <Link
            href={`/${tenant.slug}`}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Home className="h-4 w-4" />
            Visit Our Website
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
