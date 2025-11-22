/**
 * lib/google/oauth-direct.ts
 * Direct Google OAuth implementation utilities.
 * Implements Google OAuth flow directly without Supabase Auth for email collection.
 * Only collects email addresses for email_opt_ins table.
 * No Supabase Auth users are created.
 *
 * @module lib/google/oauth-direct
 */

/**
 * Generates Google OAuth authorization URL
 *
 * Creates the URL that redirects users to Google's OAuth consent screen.
 * After authorization, Google redirects back with an authorization code.
 *
 * Note: This function must be called from a server action or API route
 * because it uses environment variables. For client-side use, create a
 * server action that calls this function.
 *
 * @param tenantSlug - The tenant slug for context
 * @param redirectUri - The callback URL where Google will redirect after authorization
 * @returns The Google OAuth authorization URL
 *
 * @example
 * ```typescript
 * const authUrl = generateGoogleAuthUrl("kingswayd", "https://yourdomain.com/auth/oauth-callback");
 * window.location.href = authUrl;
 * ```
 */
export function generateGoogleAuthUrl(
  tenantSlug: string,
  redirectUri: string
): string {
  // Client ID is accessed server-side via server actions
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_OAUTH_CLIENT_ID environment variable is not set");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state: tenantSlug, // Store tenant slug in state for callback
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchanges Google OAuth authorization code for access token
 *
 * After user authorizes, Google redirects with a code.
 * This function exchanges that code for an access token.
 *
 * @param code - The authorization code from Google
 * @param redirectUri - The redirect URI used in the authorization request
 * @returns Access token and refresh token
 */
export async function exchangeGoogleCodeForToken(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken?: string }> {
  // These must be server-side only (no NEXT_PUBLIC_ prefix)
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set"
    );
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

/**
 * Fetches user email from Google using access token
 *
 * Uses the access token to call Google's userinfo API
 * and extract the user's email address.
 *
 * @param accessToken - The OAuth access token
 * @returns User's email address
 */
export async function getGoogleUserEmail(accessToken: string): Promise<string> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch user info: ${error}`);
  }

  const data = await response.json();
  const email = data.email;

  if (!email) {
    throw new Error("No email found in Google account");
  }

  return email;
}

/**
 * Complete Google OAuth flow: exchange code and get email
 *
 * Convenience function that combines token exchange and email fetching.
 *
 * @param code - The authorization code from Google
 * @param redirectUri - The redirect URI used in the authorization request
 * @returns User's email address
 */
export async function getEmailFromGoogleCode(
  code: string,
  redirectUri: string
): Promise<string> {
  const { accessToken } = await exchangeGoogleCodeForToken(code, redirectUri);
  return getGoogleUserEmail(accessToken);
}
