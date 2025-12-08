/**
 * app/[slug]/coupons/components/CouponsList.tsx
 * Coupons list component for displaying available coupons.
 * Shows tenant header, logo, and a list of coupon cards with "no coupons" fallback.
 */

import Link from "next/link";
import Footer from "@/app/components/Footer";
import TenantLogo from "@/app/components/ui/TenantLogo";
import Card from "@/app/components/ui/Card";
import { getTenantPath } from "@/lib/utils/subdomain";
import type { TenantDisplay } from "@/lib/types/tenant";
import CouponCard from "./CouponCard";
import { Gift } from "lucide-react";

interface Coupon {
  id: string;
  title: string;
  discount?: string | null;
  description?: string | null;
  expires_at?: string | null;
  active?: boolean;
  created_at?: string;
  image_url?: string | null;
}

interface CouponsListProps {
  tenant: TenantDisplay;
  coupons: Coupon[];
  email: string;
}

export default function CouponsList({
  tenant,
  coupons,
  email,
}: CouponsListProps) {
  return (
    <div className="mobile-theme flex min-h-screen flex-col bg-kinesisiq-gradient">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 text-center">
          <Link
            href={getTenantPath(tenant.slug, "/")}
            className="mb-6 inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to {tenant.name}
          </Link>

          <div className="mb-6 flex justify-center">
            <TenantLogo tenant={tenant} size="md" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Available Coupons
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Exclusive offers from {tenant.name}
          </p>
        </div>

        {coupons.length === 0 ? (
          <Card
            className="mb-4 w-full rounded-xl border-2 border-border bg-card p-4 text-center sm:mb-6 sm:p-6"
            variant="elevated"
          >
            <div className="mb-4 flex justify-center sm:mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 sm:h-20 sm:w-20">
                <Gift className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
              </div>
            </div>

            <h2 className="mb-2 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              No Coupons Available
            </h2>

            <p className="mb-4 text-xs text-muted-foreground sm:mb-6 sm:text-sm">
              We're currently setting up our exclusive offers. Please check back
              soon!
            </p>

            <div className="rounded-lg border-2 border-border bg-muted/30 p-3 sm:p-4">
              <p className="text-xs text-muted-foreground sm:text-sm">
                Thank you for your interest. We'll have exciting offers
                available shortly.
              </p>
            </div>
          </Card>
        ) : (
          <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="w-full max-w-lg">
                <CouponCard
                  coupon={coupon}
                  tenantSlug={tenant.slug}
                  email={email}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
