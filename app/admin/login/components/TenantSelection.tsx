/**
 * Tenant selection component
 * Allows users to select which tenant they want to access after login
 */
"use client";

import { useRouter } from "next/navigation";
import Card from "@/app/components/ui/Card";
import TenantLogo from "@/app/components/ui/TenantLogo";
import { Building2, ChevronRight } from "lucide-react";

interface Tenant {
  id: string;
  slug: string;
  name: string | null;
  logo_url: string | null;
  role: string;
  staffEmail?: string | null;
}

interface TenantSelectionProps {
  tenants: Tenant[];
  redirectPath?: string;
}

export default function TenantSelection({
  tenants,
  redirectPath,
}: TenantSelectionProps) {
  const router = useRouter();

  const handleSelectTenant = (slug: string) => {
    // If redirectPath exists and matches the selected tenant, use it
    // Otherwise, use the default path for the selected tenant
    let targetPath = `/${slug}/admin`;

    if (redirectPath) {
      // Extract tenant slug from redirectPath (e.g., "/acme/admin" -> "acme")
      const redirectMatch = redirectPath.match(/^\/([^/]+)\/admin/);
      if (redirectMatch && redirectMatch[1] === slug) {
        // Redirect path matches the selected tenant, use it
        targetPath = redirectPath;
      }
      // If redirectPath doesn't match, use the selected tenant's path
    }

    window.location.href = targetPath;
  };

  return (
    <Card className="p-8" variant="elevated">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-3xl">
          Select Pilot
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Choose which admin dashboard you want to access.
        </p>
      </div>

      <div className="space-y-3">
        {tenants.map((tenant) => (
          <button
            key={tenant.id}
            onClick={() => handleSelectTenant(tenant.slug)}
            className="w-full rounded-lg border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {tenant.logo_url ? (
                  <TenantLogo
                    tenant={{
                      id: tenant.id,
                      slug: tenant.slug,
                      name: tenant.name,
                      logo_url: tenant.logo_url,
                    }}
                    size="sm"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <Building2 className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-black dark:text-zinc-50">
                    {tenant.name || tenant.slug}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    {tenant.role === "owner"
                      ? "Owner"
                      : tenant.role === "admin"
                      ? "Administrator"
                      : "Staff"}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-400" />
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
