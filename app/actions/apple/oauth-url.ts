/**
 * app/actions/apple/oauth-url.ts
 * Server action for generating Apple OAuth authorization URLs.
 */

"use server";

import { generateAppleAuthUrl } from "@/lib/apple/oauth-direct";
import { buildOAuthRedirectUrl } from "@/lib/google/oauth";

/**
 * Generates Apple OAuth authorization URL for tenant email collection.
 *
 * @param tenantSlug - The tenant slug
 * @param origin - The origin URL (e.g., "https://yourdomain.com")
 */
export async function getAppleOAuthUrl(
  tenantSlug: string,
  origin: string
): Promise<{ url: string; error: string | null }> {
  try {
    // Same callback URL builder used for Google; provider is encoded in Apple’s params, not here.
    const redirectUrl = buildOAuthRedirectUrl(tenantSlug, origin);
    const authUrl = generateAppleAuthUrl(tenantSlug, redirectUrl);
    return { url: authUrl, error: null };
  } catch (err) {
    return {
      url: "",
      error:
        err instanceof Error
          ? err.message
          : "Failed to generate Apple OAuth URL",
    };
  }
}