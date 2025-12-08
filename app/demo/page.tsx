/**
 * app/demo/page.tsx
 * Demo/Preview page for UI development
 * Shows the COMPLETE mobile onboarding/survey flow with mock data - no Supabase needed!
 *
 * This includes:
 * 1. Landing Page (email collection)
 * 2. Coupons List
 * 3. Survey (with all question types)
 * 4. Coupon Completion
 * 5. Survey Completion
 */

"use client";

import { useState } from "react";
import TenantLanding from "../[slug]/components/TenantLanding";
import SurveyCard from "../components/survey/SurveyCard";
import CouponsList from "../[slug]/coupons/components/CouponsList";
import CouponCompletion from "../[slug]/coupons/[couponId]/completed/components/CouponCompletion";
import SurveyCompletion from "../[slug]/survey/completed/components/SurveyCompletion";
import type { TenantDisplay } from "@/lib/types/tenant";
import type { Survey } from "@/lib/types/survey";
import type { Coupon } from "@/lib/types/coupon";

// Mock tenant data
const mockTenant: TenantDisplay = {
  id: "demo-tenant-id",
  name: "Demo Business",
  slug: "demo",
  logo_url: null,
  website_url: null,
  theme: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
  },
};

// Mock coupon data
const mockCoupons: (Coupon & { couponStatus: string | null })[] = [
  {
    id: "coupon-1",
    tenant_id: "demo-tenant-id",
    title: "20% Off Your Next Visit",
    description: "Get 20% off on your next purchase",
    discount: "20%",
    image_url: null,
    expires_at: "2025-12-31T23:59:59Z",
    active: true,
    created_at: "2025-01-01T00:00:00Z",
    couponStatus: null,
  },
  {
    id: "coupon-2",
    tenant_id: "demo-tenant-id",
    title: "Free Coffee",
    description: "Enjoy a free coffee on us",
    discount: "100%",
    image_url: null,
    expires_at: "2025-12-31T23:59:59Z",
    active: true,
    created_at: "2025-01-01T00:00:00Z",
    couponStatus: null,
  },
];

// Mock survey data with ALL question types used in mobile flow
const mockSurvey: Survey = {
  tenant_id: "demo-tenant-id",
  coupon_id: "coupon-1",
  title: "Quick Feedback Survey",
  description: "Help us improve by answering a few questions",
  questions: [
    {
      id: "q1",
      tenant_id: "demo-tenant-id",
      question: "How are you feeling today?",
      type: "sentiment",
      options: [],
      order_index: 1,
    },
    {
      id: "q2",
      tenant_id: "demo-tenant-id",
      question: "Rank your preferences (most to least important)",
      type: "ranked_choice",
      options: ["Quality", "Price", "Service", "Location"],
      order_index: 2,
    },
    {
      id: "q3",
      tenant_id: "demo-tenant-id",
      question: "Tell us your thoughts",
      type: "open_text",
      options: [],
      order_index: 3,
    },
    {
      id: "q4",
      tenant_id: "demo-tenant-id",
      question: "Select your favorite option",
      type: "single_choice",
      options: ["Option 1", "Option 2", "Option 3"],
      order_index: 4,
    },
    {
      id: "q5",
      tenant_id: "demo-tenant-id",
      question: "Select all that apply",
      type: "multiple_choice",
      options: ["Feature A", "Feature B", "Feature C", "Feature D"],
      order_index: 5,
    },
  ],
};

type ViewMode =
  | "landing"
  | "coupons"
  | "survey"
  | "coupon-completion"
  | "survey-completion";

export default function DemoPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("landing");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* View Switcher - Shows all mobile flow screens */}
      <div className="fixed top-4 right-4 z-50 flex flex-wrap gap-2 rounded-lg bg-white p-2 shadow-lg dark:bg-zinc-900 max-w-md">
        <button
          onClick={() => setViewMode("landing")}
          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
            viewMode === "landing"
              ? "bg-blue-600 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          1. Landing
        </button>
        <button
          onClick={() => setViewMode("coupons")}
          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
            viewMode === "coupons"
              ? "bg-blue-600 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          2. Coupons
        </button>
        <button
          onClick={() => setViewMode("survey")}
          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
            viewMode === "survey"
              ? "bg-blue-600 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          3. Survey
        </button>
        <button
          onClick={() => setViewMode("coupon-completion")}
          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
            viewMode === "coupon-completion"
              ? "bg-blue-600 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          4. Complete
        </button>
        <button
          onClick={() => setViewMode("survey-completion")}
          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
            viewMode === "survey-completion"
              ? "bg-blue-600 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          5. Thanks
        </button>
      </div>

      {/* Content - All mobile flow screens */}
      {viewMode === "landing" && <TenantLanding tenant={mockTenant} />}

      {viewMode === "coupons" && (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
          <CouponsList
            tenant={mockTenant}
            coupons={mockCoupons}
            email="demo@example.com"
          />
        </div>
      )}

      {viewMode === "survey" && (
        <main className="mobile-theme flex min-h-screen items-center justify-center bg-kinesisiq-gradient p-4">
          <SurveyCard
            survey={mockSurvey}
            tenantSlug="demo"
            couponId="coupon-1"
            email="demo@example.com"
          />
        </main>
      )}

      {viewMode === "coupon-completion" && (
        <CouponCompletion
          tenant={mockTenant}
          coupon={mockCoupons[0]}
          couponCode="DEMO-CODE-123"
          issuedCouponId="issued-1"
          tenantSlug="demo"
          email="demo@example.com"
          sessionId="session-123"
          isAlreadyRedeemed={false}
        />
      )}

      {viewMode === "survey-completion" && (
        <SurveyCompletion tenant={mockTenant} />
      )}
    </div>
  );
}
