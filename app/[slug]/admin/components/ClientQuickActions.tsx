/**
 * app/admin/components/ClientQuickActions.tsx
 * Client-side quick actions component.
 * Client-side wrapper for quick action buttons with modal management for creating coupons and questions.
 *
 * @component
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import QuickActionsGrid from "./QuickActions";
import AddCouponModal from "../coupons/components/AddCouponModal";
import AddQuestionModal from "../questions/components/AddQuestionModal";

interface ClientQuickActionsProps {
  tenantSlug: string;
  actions: { label: string; href?: string }[];
}

export default function ClientQuickActions({
  tenantSlug,
  actions,
}: ClientQuickActionsProps) {
  const router = useRouter();
  const [openCoupon, setOpenCoupon] = useState(false);
  const [openQuestion, setOpenQuestion] = useState(false);

  // Memoize bound actions to prevent unnecessary re-renders
  const bound = useMemo(
    () =>
      actions.map((a) => {
        if (a.label === "Create Coupon") {
          return { label: a.label, onClick: () => setOpenCoupon(true) };
        }
        if (a.label === "Add Survey Question") {
          return { label: a.label, onClick: () => setOpenQuestion(true) };
        }
        return a;
      }),
    [actions]
  );

  // Memoize callbacks to prevent unnecessary re-renders of child components
  const handleCouponClose = useCallback(() => setOpenCoupon(false), []);
  const handleQuestionClose = useCallback(() => setOpenQuestion(false), []);
  const handleCouponCreated = useCallback(() => {
    setOpenCoupon(false);
    router.refresh();
  }, [router]);

  return (
    <>
      <QuickActionsGrid actions={bound} />
      <AddCouponModal
        isOpen={openCoupon}
        onClose={handleCouponClose}
        tenantSlug={tenantSlug}
        onCreated={handleCouponCreated}
      />
      <AddQuestionModal
        isOpen={openQuestion}
        onClose={handleQuestionClose}
        tenantSlug={tenantSlug}
      />
    </>
  );
}
