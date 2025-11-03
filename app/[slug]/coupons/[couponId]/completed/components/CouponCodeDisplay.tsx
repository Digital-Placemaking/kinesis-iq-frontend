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
    <div className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
      <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
        Your Coupon Code
      </p>
      <div className="mb-3 flex items-center justify-center gap-2">
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400 sm:text-2xl">
            {code}
          </span>
        </div>
      </div>
      <p className="text-center text-xs text-zinc-600 dark:text-zinc-400">
        Present this code at checkout
      </p>
    </div>
  );
}
