/**
 * Google OAuth Utilities
 *
 * Helper functions for Google OAuth authentication flow.
 * Handles tenant context preservation and redirect URL construction.
 *
 * @module lib/google/oauth
 */

/**
 * Builds the OAuth redirect URL for tenant-specific authentication
 *
 * This URL is used as the `redirectTo` parameter in Supabase's signInWithOAuth.
 * Supabase will redirect here AFTER it processes the OAuth callback from Google.
 *
 * Important: Google redirects to Supabase's callback URL first (configured in
 * Google Cloud Console), then Supabase redirects to this URL.
 *
 * @param tenantSlug - The tenant slug (e.g., "kingswayd")
 * @param origin - The origin URL (e.g., "https://yourdomain.com")
 * @returns The full redirect URL for post-OAuth processing
 *
 * @example
 * ```typescript
 * const redirectUrl = buildOAuthRedirectUrl("kingswayd", "https://yourdomain.com");
 * // Returns: "https://yourdomain.com/auth/callback?tenant=kingswayd"
 * ```
 */
export function buildOAuthRedirectUrl(
  tenantSlug: string,
  origin: string
): string {
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("tenant", tenantSlug);
  return callbackUrl.toString();
}

/**
 * Extracts tenant slug from OAuth callback URL
 *
 * When Google redirects back after OAuth, we need to extract
 * the tenant slug from the query parameters to know which
 * tenant's coupons page to redirect to.
 *
 * @param url - The callback URL (can be a string or URL object)
 * @returns The tenant slug if found, null otherwise
 *
 * @example
 * ```typescript
 * const tenantSlug = extractTenantFromCallbackUrl("https://yourdomain.com/auth/callback?tenant=kingswayd&code=...");
 * // Returns: "kingswayd"
 * ```
 */
export function extractTenantFromCallbackUrl(url: string | URL): string | null {
  try {
    const urlObj = typeof url === "string" ? new URL(url) : url;
    return urlObj.searchParams.get("tenant");
  } catch {
    return null;
  }
}

/**
 * Builds the tenant-specific coupons page URL
 *
 * After successful OAuth, users are redirected to their tenant's
 * coupons page. This function constructs the correct URL based on
 * the tenant slug.
 *
 * @param tenantSlug - The tenant slug
 * @param origin - The origin URL
 * @param email - Optional email to include in query params for tracking
 * @returns The full URL to the tenant's coupons page
 *
 * @example
 * ```typescript
 * const couponsUrl = buildTenantCouponsUrl("kingswayd", "https://yourdomain.com", "user@example.com");
 * // Returns: "https://kingswayd.yourdomain.com/coupons?email=user@example.com"
 * ```
 */
export function buildTenantCouponsUrl(
  tenantSlug: string,
  origin: string,
  email?: string
): string {
  // Extract the base domain from origin (e.g., "yourdomain.com")
  const baseDomain = new URL(origin).hostname.replace(/^[^.]+\./, "");
  const tenantOrigin = `https://${tenantSlug}.${baseDomain}`;

  const couponsUrl = new URL("/coupons", tenantOrigin);
  if (email) {
    couponsUrl.searchParams.set("email", email);
  }
  return couponsUrl.toString();
}
