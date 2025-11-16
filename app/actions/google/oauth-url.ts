/**
 * OAuth URL Server Actions
 *
 * Server actions for generating OAuth authorization URLs.
 * These must be server actions because they use environment variables.
 *
 * @module app/actions/google/oauth-url
 */

"use server";

import { generateGoogleAuthUrl } from "@/lib/google/oauth-direct";
import { buildOAuthRedirectUrl } from "@/lib/google/oauth";

/**
 * Generates Google OAuth authorization URL for tenant email collection
 *
 * This is a server action that generates the OAuth URL using environment variables.
 * The client ID is safe to expose (it's public in OAuth flows).
 *
 * @param tenantSlug - The tenant slug
 * @param origin - The origin URL (e.g., "https://yourdomain.com")
 * @returns The Google OAuth authorization URL
 */
export async function getGoogleOAuthUrl(
  tenantSlug: string,
  origin: string
): Promise<{ url: string; error: string | null }> {
  try {
    const redirectUrl = buildOAuthRedirectUrl(tenantSlug, origin);
    const authUrl = generateGoogleAuthUrl(tenantSlug, redirectUrl);
    return { url: authUrl, error: null };
  } catch (err) {
    return {
      url: "",
      error:
        err instanceof Error ? err.message : "Failed to generate OAuth URL",
    };
  }
}
