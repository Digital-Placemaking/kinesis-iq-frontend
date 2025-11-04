"use client";

import { useState } from "react";
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

  const bound = actions.map((a) => {
    if (a.label === "Create Coupon") {
      return { label: a.label, onClick: () => setOpenCoupon(true) };
    }
    if (a.label === "Add Survey Question") {
      return { label: a.label, onClick: () => setOpenQuestion(true) };
    }
    return a;
  });

  return (
    <>
      <QuickActionsGrid actions={bound} />
      <AddCouponModal
        isOpen={openCoupon}
        onClose={() => setOpenCoupon(false)}
        tenantSlug={tenantSlug}
        onCreated={() => {
          setOpenCoupon(false);
          router.refresh();
        }}
      />
      <AddQuestionModal
        isOpen={openQuestion}
        onClose={() => setOpenQuestion(false)}
        tenantSlug={tenantSlug}
      />
    </>
  );
}
