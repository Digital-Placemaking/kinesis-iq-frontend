/**
 * Dashboard header component
 * Displays welcome message and tenant information with logo
 */
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import TenantLogo from "@/app/components/ui/TenantLogo";
import type { TenantDisplay } from "@/lib/types/tenant";

interface DashboardHeaderProps {
  userEmail: string;
  tenant?: TenantDisplay | null;
}

export default function DashboardHeader({
  userEmail,
  tenant,
}: DashboardHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {tenant && <TenantLogo tenant={tenant} size="sm" />}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-zinc-50 break-words">
              Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 break-words">
              Welcome back, {userEmail}
            </p>
            {tenant?.name && (
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500 break-words">
                {tenant.name}
              </p>
            )}
          </div>
        </div>
        {tenant?.slug && (
          <Link
            href={`/${tenant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-blue-500"
          >
            <span>Visit Pilot</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
