/**
 * Tenant theme configuration
 */
export interface TenantTheme {
  primary: string;
  secondary: string;
}

/**
 * Full tenant record from database
 */
export interface Tenant {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  theme: TenantTheme | null;
  active: boolean;
  created_at: string;
}

/**
 * Tenant data used in the frontend
 * A subset of the full Tenant record
 */
export interface TenantDisplay {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url?: string | null;
  theme?: TenantTheme | null;
}

/**
 * Response type for tenant lookup operations
 */
export interface TenantResponse {
  error: string | null;
  tenant: Tenant | null;
}
