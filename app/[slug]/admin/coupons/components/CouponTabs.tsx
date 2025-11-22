/**
 * CouponTabs Component
 *
 * Tab-based interface for managing coupons and issued coupons.
 * Provides SPA-like behavior without route changes.
 *
 * Features:
 * - Switch between "Coupons" (manage) and "Issued Coupons" (track) tabs
 * - QR code scanner for redeeming coupons
 * - Role-based access (staff can only see issued coupons)
 *
 * @component
 */

"use client";

import { useState, useCallback } from "react";
import { Ticket, Gift, Scan } from "lucide-react";
import CouponsList from "./CouponsList";
import IssuedCouponsList from "./IssuedCouponsList";
import RedeemCouponModal from "./RedeemCouponModal";
import ActionButton from "@/app/components/ui/ActionButton";

type TabType = "coupons" | "issued";

interface CouponTabsProps {
  coupons: any[];
  tenantSlug: string;
  canEditCoupons?: boolean;
}

export default function CouponTabs({
  coupons,
  tenantSlug,
  canEditCoupons = true,
}: CouponTabsProps) {
  // Staff users should default to "issued" tab, owner/admin can see both
  const [activeTab, setActiveTab] = useState<TabType>(
    canEditCoupons ? "coupons" : "issued"
  );
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleRedeemModalOpen = useCallback(
    () => setIsRedeemModalOpen(true),
    []
  );
  const handleRedeemModalClose = useCallback(
    () => setIsRedeemModalOpen(false),
    []
  );
  const handleRedeemed = useCallback(() => {
    // Refresh the page to show updated coupon status
    window.location.reload();
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Redeem Coupon Button - Always visible */}
      <div className="mb-6 flex justify-end">
        <ActionButton
          icon={Scan}
          onClick={handleRedeemModalOpen}
          variant="primary"
          className="w-auto sm:w-auto"
        >
          Redeem Coupon
        </ActionButton>
      </div>

      {/* Redeem Coupon Modal */}
      <RedeemCouponModal
        isOpen={isRedeemModalOpen}
        onClose={handleRedeemModalClose}
        tenantSlug={tenantSlug}
        onRedeemed={handleRedeemed}
      />
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
