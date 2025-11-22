/**
 * app/components/ui/VisitWebsiteButton.tsx
 * Visit website button component.
 * Links to tenant's website URL or falls back to tenant landing page.
 */

"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TenantDisplay } from "@/lib/types/tenant";
import { cn } from "@/lib/utils";

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
    <Button
      variant="outline"
      asChild
      className={cn("w-full sm:w-auto", className)}
    >
      <Link
        href={websiteUrl}
        target={websiteUrl.startsWith("http") ? "_blank" : "_self"}
        rel={websiteUrl.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        <Home className="h-4 w-4" />
        Visit Our Website
      </Link>
    </Button>
  );
}
