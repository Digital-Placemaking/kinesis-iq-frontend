/**
 * lib/apple/oauth-direct.ts
 * Direct Sign in with Apple OAuth utilities for tenant email collection.
 */

/**
 * Generates Apple OAuth authorization URL.
 *
 * This is the URL we redirect users to when they click
 * "Continue with Apple" on the tenant landing page.
 */
export function generateAppleAuthUrl(
  tenantSlug: string,
  redirectUri: string
): string {
  const clientId = process.env.APPLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("APPLE_CLIENT_ID environment variable is not set");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    response_mode: "query", // so Apple redirects back with ?code=... in the URL
    scope: "name email",
    state: tenantSlug, // we’ll use this in the callback to know which tenant it was for
  });

  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}