// VisitWebsiteButton
// Reusable button component that links to tenant's website URL or falls back to tenant landing page.
// Used in: app/[slug]/coupons/[couponId]/completed/components/CouponCompletion.tsx

"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import type { TenantDisplay } from "@/lib/types/tenant";

interface VisitWebsiteButtonProps {
  tenant: TenantDisplay;
  className?: string;
}

export default function VisitWebsiteButton({
  tenant,
  className = "",
}: VisitWebsiteButtonProps) {
  // Get website URL from tenant, fallback to tenant landing page
  const websiteUrl = tenant.website_url || `/${tenant.slug}`;

  return (
    <Link
      href={websiteUrl}
      target={websiteUrl.startsWith("http") ? "_blank" : "_self"}
      rel={websiteUrl.startsWith("http") ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 ${className}`}
    >
      <Home className="h-4 w-4" />
      Visit Our Website
    </Link>
  );
}
