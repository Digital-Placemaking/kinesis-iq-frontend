/**
 * lib/google/oauth.ts
 * Google OAuth utility functions.
 * Handles tenant context preservation and redirect URL construction for OAuth flows.
 * Handles tenant context preservation and redirect URL construction.
 *
 * @module lib/google/oauth
 */

/**
 * Builds the OAuth redirect URL for tenant-specific email collection
 *
 * This URL is where Google/Apple will redirect after OAuth authorization.
 * Used for direct OAuth flow (not Supabase Auth).
 *
 * Note: Google OAuth doesn't preserve query parameters in redirect URIs.
 * The tenant slug is passed via the `state` parameter in the OAuth flow.
 *
 * @param tenantSlug - The tenant slug (e.g., "kingswayd") - passed via state parameter
 * @param origin - The origin URL (e.g., "https://yourdomain.com")
 * @returns The full redirect URL for OAuth callback
 *
 * @example
 * ```typescript
 * const redirectUrl = buildOAuthRedirectUrl("kingswayd", "https://yourdomain.com");
 * // Returns: "https://yourdomain.com/auth/oauth-callback"
 * ```
 */
export function buildOAuthRedirectUrl(
  tenantSlug: string,
  origin: string
): string {
  const callbackUrl = new URL("/auth/oauth-callback", origin);
  // Tenant slug is passed via state parameter in OAuth flow, not in the redirect URI
  return callbackUrl.toString();
}
