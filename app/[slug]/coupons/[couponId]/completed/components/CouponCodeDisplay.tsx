/**
 * app/[slug]/coupons/[couponId]/completed/components/CouponCodeDisplay.tsx
 * Coupon code display component.
 * Displays coupon code with copy-to-clipboard functionality and visual feedback.
 */

"use client";

import { useState } from "react";

interface CouponCodeDisplayProps {
  code: string;
}

export default function CouponCodeDisplay({ code }: CouponCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/10 p-3">
      <p className="mb-1.5 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Your Coupon Code
      </p>
      <div className="mb-2 flex items-center justify-center">
        <div className="w-full max-w-full overflow-hidden rounded-lg border-2 border-border bg-card px-3 py-2">
          <span className="block break-all text-center text-base font-bold text-primary sm:text-lg">
            {code}
          </span>
        </div>
      </div>
      <p className="text-center text-[10px] text-muted-foreground">
        Present this code at checkout
      </p>
    </div>
  );
}
