import type { Tenant, TenantDisplay } from "@/lib/types/tenant";

/**
 * Converts a full Tenant record to TenantDisplay for frontend use
 */
export function toTenantDisplay(tenant: Tenant): TenantDisplay {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    logo_url: tenant.logo_url,
    website_url: tenant.website_url || null,
    theme: tenant.theme,
  };
}
