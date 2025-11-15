// CouponsList
// Displays a list of available coupons for a tenant with header, logo, and coupon cards.
// Used in: app/[slug]/coupons/page.tsx

import Link from "next/link";
import Footer from "@/app/components/Footer";
import TenantLogo from "@/app/components/ui/TenantLogo";
import Card from "@/app/components/ui/Card";
import type { TenantDisplay } from "@/lib/types/tenant";
import CouponCard from "./CouponCard";

interface Coupon {
  id: string;
  title: string;
  discount?: string | null;
  description?: string | null;
  expires_at?: string | null;
  active?: boolean;
  created_at?: string;
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-8 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            href={`/${tenant.slug}`}
            className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
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

          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-4xl">
            Available Coupons
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Exclusive offers from {tenant.name}
          </p>
        </div>

        {/* Coupons List */}
        {coupons.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <Card className="w-full p-8 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                No coupons available at this time. Check back soon!
              </p>
            </Card>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-3">
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
