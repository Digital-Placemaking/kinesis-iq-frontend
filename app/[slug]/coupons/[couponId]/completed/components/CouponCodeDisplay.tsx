/**
 * app/[slug]/coupons/[couponId]/completed/components/CouponCodeDisplay.tsx
 * Coupon code display component.
 * Displays coupon code with copy-to-clipboard functionality and visual feedback.
 */

"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

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
      <button
        onClick={handleCopy}
        className="mb-1.5 w-full group"
      >
        <div className="flex flex-col items-center gap-1.5 rounded-lg border-2 border-border bg-card px-3 py-2 transition-all hover:border-primary/50 hover:bg-card/80 active:scale-[0.98]">
          <span className="break-all text-center text-base font-bold text-primary sm:text-lg">
            {code}
          </span>
          <div className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${copied ? 'bg-green-500/20 text-green-500' : 'bg-muted/30 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'}`}>
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied!" : "Tap to copy"}</span>
          </div>
        </div>
      </button>
      <p className="text-center text-[10px] text-muted-foreground">
        Present this code at checkout
      </p>
    </div>
  );
}
