// TenantLogo
// Displays tenant logo image or fallback initial letter if no logo is available.
// Used in: app/[slug]/components/TenantLanding.tsx, various admin components.

import type { TenantDisplay } from "@/lib/types/tenant";

interface TenantLogoProps {
  tenant: TenantDisplay;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function TenantLogo({
  tenant,
  size = "md",
  className = "",
}: TenantLogoProps) {
  // Size mapping for container and text
  const containerSizeClasses = {
    sm: "w-16",
    md: "w-24",
    lg: "w-32",
  };

  const textSizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const paddingClasses = {
    sm: "p-2",
    md: "p-2",
    lg: "p-3",
  };

  const containerSize = containerSizeClasses[size];
  const textSize = textSizeClasses[size];
  const paddingClass = paddingClasses[size];

  if (tenant.logo_url) {
    return (
      <div
        className={`aspect-square overflow-hidden rounded-xl border-2 border-zinc-200 bg-white ${containerSize} ${paddingClass} dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
      >
        <img
          src={tenant.logo_url}
          alt={tenant.name}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-xl border-2 border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 ${containerSize} ${className}`}
    >
      <span
        className={`font-bold text-zinc-600 dark:text-zinc-400 ${textSize}`}
      >
        {tenant.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
