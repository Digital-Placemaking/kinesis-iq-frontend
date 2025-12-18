/**
 * app/demo/page.tsx
 * Demo page with connected flows for showcasing the mobile experience.
 * 
 * Two flows available:
 * 1. Poll Flow: Landing → Take Poll → Survey → Thanks
 * 2. Coupon Flow: Landing → Email → Coupons → Survey → Coupon Code
 */

"use client";

import { useState } from "react";
import SurveyCard from "../components/survey/SurveyCard";
import CouponsList from "../[slug]/coupons/components/CouponsList";
import CouponCompletion from "../[slug]/coupons/[couponId]/completed/components/CouponCompletion";
import SurveyCompletion from "../[slug]/survey/completed/components/SurveyCompletion";
import TenantLogo from "../components/ui/TenantLogo";
import Footer from "../components/Footer";
import type { TenantDisplay } from "@/lib/types/tenant";
import type { Survey } from "@/lib/types/survey";
import type { Coupon } from "@/lib/types/coupon";

// Mock tenant data
const mockTenant: TenantDisplay = {
  id: "demo-tenant-id",
  name: "Demo Business",
  slug: "demo",
  logo_url: null,
  website_url: "https://example.com",
  theme: {
    primary: "#f97316",
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
    image_url: "/toronto-skyline.jpg",
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

// Mock survey with multiple question types
const mockSurvey: Survey = {
  tenant_id: "demo-tenant-id",
  coupon_id: "coupon-1",
  title: "Quick Feedback Survey",
  description: "Help us improve by answering a few questions",
  questions: [
    {
      id: "q1",
      tenant_id: "demo-tenant-id",
      question: "How are you feeling about our service?",
      type: "sentiment",
      options: [],
      order_index: 1,
    },
    {
      id: "q2",
      tenant_id: "demo-tenant-id",
      question: "Would you recommend us to a friend?",
      type: "yes_no",
      options: [],
      order_index: 2,
    },
    {
      id: "q3",
      tenant_id: "demo-tenant-id",
      question: "How likely are you to recommend us?",
      type: "nps",
      options: [],
      order_index: 3,
    },
    {
      id: "q4",
      tenant_id: "demo-tenant-id",
      question: "What do you value most?",
      type: "single_choice",
      options: ["Quality", "Price", "Service", "Location"],
      order_index: 4,
    },
    {
      id: "q5",
      tenant_id: "demo-tenant-id",
      question: "Select all that apply",
      type: "multiple_choice",
      options: ["Fast service", "Clean environment", "Good value", "Easy parking"],
      order_index: 5,
    },
    {
      id: "q6",
      tenant_id: "demo-tenant-id",
      question: "Rank your preferences",
      type: "ranked_choice",
      options: ["Quality", "Price", "Service", "Location"],
      order_index: 6,
    },
    {
      id: "q7",
      tenant_id: "demo-tenant-id",
      question: "Any additional feedback?",
      type: "open_text",
      options: [],
      order_index: 7,
    },
  ],
};

type FlowStep = 
  | "landing"
  | "coupons" 
  | "survey-poll"
  | "survey-coupon"
  | "thanks"
  | "coupon-complete";

export default function DemoPage() {
  const [step, setStep] = useState<FlowStep>("landing");
  const [showDevTools, setShowDevTools] = useState(true);

  // Custom Landing for demo with working buttons
  const DemoLanding = () => (
    <div className="mobile-theme flex min-h-screen flex-col bg-kinesisiq-gradient">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-6 flex justify-center sm:mb-8">
            <TenantLogo tenant={mockTenant} size="lg" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {mockTenant.name.toUpperCase()}
            </h1>
          </div>
        </div>

        <div className="space-y-5 sm:space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Access VIP Events & Exclusive Offers
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Exclusive Offers - Access Below
            </p>
          </div>

          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={() => setStep("coupons")}
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-all duration-250 hover:border-primary/50 hover:bg-muted/50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => setStep("coupons")}
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-all duration-250 hover:border-primary/50 hover:bg-muted/50"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span>Continue with Apple</span>
            </button>
          </div>

          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-primary/30" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">Or continue with email</span>
            <div className="flex-1 h-px bg-primary/30" />
          </div>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex h-11 w-full rounded-lg border-2 border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setStep("coupons")}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-3 text-sm font-semibold shadow-lg transition-all hover:bg-blue-700"
            >
              Email for exclusive offers
            </button>
          </div>

          <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            Private & Secure — We'll only send you great deals.
          </p>

          <div className="space-y-3 pt-4">
            <div className="relative flex items-center gap-4">
              <div className="flex-1 h-px bg-primary/30" />
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">Just want to share feedback?</span>
              <div className="flex-1 h-px bg-primary/30" />
            </div>
            <button
              type="button"
              onClick={() => setStep("survey-poll")}
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold shadow-lg transition-all hover:shadow-xl"
            >
              Take Poll
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Your data stays anonymous.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            By continuing, you agree to our{" "}
            <span className="font-medium text-primary">WiFi Terms of Service</span> and{" "}
            <span className="font-medium text-primary">Privacy Policy</span>.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );

  // Survey wrapper that goes to correct completion
  const SurveyWithCompletion = ({ forCoupon }: { forCoupon: boolean }) => (
    <main className="mobile-theme flex min-h-screen flex-col items-center bg-kinesisiq-gradient p-4 pt-6 sm:pt-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6">
        Feedback Survey
      </h1>
      <SurveyCard
        survey={mockSurvey}
        tenantSlug="demo"
        couponId={forCoupon ? "coupon-1" : null}
        email="demo@example.com"
        onDemoSubmit={() => setStep(forCoupon ? "coupon-complete" : "thanks")}
      />
    </main>
  );

  // Coupons with navigation to survey
  const CouponsWithNav = () => (
    <div className="mobile-theme min-h-screen bg-kinesisiq-gradient">
      <CouponsList
        tenant={mockTenant}
        coupons={mockCoupons}
        email="demo@example.com"
      />
      {/* Demo: Go to survey */}
      <div className="fixed bottom-20 left-4 right-4 flex justify-center">
        <button
          onClick={() => setStep("survey-coupon")}
          className="rounded-lg border-2 border-dashed border-primary/50 bg-card/90 backdrop-blur px-6 py-3 text-sm font-medium text-primary shadow-lg transition-all hover:bg-primary/20"
        >
          Demo: Select Coupon → Survey
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Dev Tools Toggle */}
      {showDevTools && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 rounded-lg bg-white/95 dark:bg-zinc-900/95 backdrop-blur p-3 shadow-xl max-w-xs">
          <div className="flex items-center justify-between gap-4 mb-1">
            <span className="text-xs font-bold text-zinc-500">DEMO NAVIGATION</span>
            <button 
              onClick={() => setShowDevTools(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              Hide
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setStep("landing")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                step === "landing" ? "bg-primary text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              Landing
            </button>
            <button
              onClick={() => setStep("coupons")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                step === "coupons" ? "bg-primary text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              Coupons
            </button>
            <button
              onClick={() => setStep("survey-poll")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                step.startsWith("survey") ? "bg-primary text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              Survey
            </button>
            <button
              onClick={() => setStep("thanks")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                step === "thanks" ? "bg-primary text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              Thanks
            </button>
            <button
              onClick={() => setStep("coupon-complete")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                step === "coupon-complete" ? "bg-primary text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              Coupon
            </button>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Poll: Landing → Take Poll → Survey → Thanks<br/>
            Coupon: Landing → Email → Coupons → Survey → Code
          </div>
        </div>
      )}

      {!showDevTools && (
        <button
          onClick={() => setShowDevTools(true)}
          className="fixed bottom-4 right-4 z-50 rounded-full bg-primary text-white p-2 shadow-lg"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </button>
      )}

      {/* Flow Content */}
      {step === "landing" && <DemoLanding />}
      {step === "coupons" && <CouponsWithNav />}
      {step === "survey-poll" && <SurveyWithCompletion forCoupon={false} />}
      {step === "survey-coupon" && <SurveyWithCompletion forCoupon={true} />}
      {step === "thanks" && <SurveyCompletion tenant={mockTenant} />}
      {step === "coupon-complete" && (
        <CouponCompletion
          tenant={mockTenant}
          coupon={mockCoupons[0]}
          couponCode="DEMO-20OFF-XYZ"
          issuedCouponId="issued-1"
          tenantSlug="demo"
          email="demo@example.com"
          sessionId="session-123"
          isAlreadyRedeemed={false}
        />
      )}
    </div>
  );
}
