"use client";

import { useState } from "react";
import { Ticket, Gift } from "lucide-react";
import CouponsList from "./CouponsList";
import IssuedCouponsList from "./IssuedCouponsList";

type TabType = "coupons" | "issued";

interface CouponTabsProps {
  coupons: any[];
  tenantSlug: string;
  canEditCoupons?: boolean;
}

/**
 * Tab component for switching between Coupons and Issued Coupons
 * SPA-like behavior - no route changes
 */
export default function CouponTabs({
  coupons,
  tenantSlug,
  canEditCoupons = true,
}: CouponTabsProps) {
  // Staff users should default to "issued" tab, owner/admin can see both
  const [activeTab, setActiveTab] = useState<TabType>(
    canEditCoupons ? "coupons" : "issued"
  );

  return (
    <div className="mx-auto max-w-7xl">
      {/* Tab Navigation - Hide "Coupons" tab for staff */}
      {canEditCoupons && (
        <div className="mb-6 border-b border-zinc-200 dark:border-zinc-800">
          <nav
            className="-mb-px flex gap-4 sm:gap-8 overflow-x-auto"
            aria-label="Tabs"
          >
            <button
              onClick={() => setActiveTab("coupons")}
              className={`flex items-center gap-2 border-b-2 px-2 sm:px-1 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "coupons"
                  ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              }`}
            >
              <Ticket className="h-4 w-4 shrink-0" />
              Coupons
            </button>
            <button
              onClick={() => setActiveTab("issued")}
              className={`flex items-center gap-2 border-b-2 px-2 sm:px-1 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "issued"
                  ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              }`}
            >
              <Gift className="h-4 w-4 shrink-0" />
              Issued Coupons
            </button>
          </nav>
        </div>
      )}

      {/* Tab Content */}
      <div>
        {canEditCoupons && activeTab === "coupons" && (
          <CouponsList
            coupons={coupons}
            tenantSlug={tenantSlug}
            canEditCoupons={canEditCoupons}
          />
        )}
        {(!canEditCoupons || activeTab === "issued") && (
          <IssuedCouponsList
            tenantSlug={tenantSlug}
            canEditCoupons={canEditCoupons}
          />
        )}
      </div>
    </div>
  );
}
