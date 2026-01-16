/**
 * lib/apple/oauth-direct.ts
 * Direct Sign in with Apple OAuth utilities for tenant email collection.
 * 
 * Apple OAuth Implementation Overview:
 * 1. User clicks "Continue with Apple" button
 * 2. generateAppleAuthUrl() creates authorization URL with form_post response mode
 * 3. User is redirected to Apple's consent screen
 * 4. After consent, Apple POSTs authorization code to our callback endpoint
 * 5. getEmailFromAppleCode() exchanges code for tokens using signed JWT client secret
 * 6. User's email is extracted from the ID token
 * 
 * Key Differences from Google OAuth:
 * - Apple uses form_post instead of query params (required for email/name scope)
 * - Client secret must be a JWT signed with your private key (not static)
 * - Authorization code and tokens are POSTed, not sent via query params
 */

/**
 * Generates Apple OAuth authorization URL.
 *
 * This is the URL we redirect users to when they click
 * "Continue with Apple" on the tenant landing page.
 * 
 * IMPORTANT: response_mode MUST be "form_post" when requesting email or name scope.
 * Apple will return an error if you use "query" mode with these scopes.
 * 
 * @param tenantSlug - Tenant identifier, passed via state parameter
 * @param redirectUri - Callback URL where Apple will POST the authorization code
 * @returns Full Apple authorization URL
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
    response_mode: "form_post", // required when requesting name or email scope
    scope: "name email",
    state: tenantSlug, // we'll use this in the callback to know which tenant it was for
  });

  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

/**
 * Exchanges Apple authorization code for user email.
 * 
 * Apple's OAuth flow requires creating a client_secret JWT signed with your private key.
 * After exchanging the code for tokens, we decode the id_token to get the user's email.
 * 
 * Flow:
 * 1. Import private key from environment variable
 * 2. Create and sign JWT client_secret using ES256 algorithm
 * 3. POST to Apple's token endpoint with code, client_id, and client_secret
 * 4. Receive id_token in response
 * 5. Decode id_token to extract user's email address
 * 
 * Required Environment Variables:
 * - APPLE_CLIENT_ID: Service ID from Apple Developer Console
 * - APPLE_TEAM_ID: Your Apple Developer Team ID
 * - APPLE_KEY_ID: Key ID for your Sign in with Apple key
 * - APPLE_PRIVATE_KEY: ES256 private key (with -----BEGIN/END PRIVATE KEY-----)
 * 
 * @param code - Authorization code received from Apple
 * @param redirectUri - Same redirect URI used in authorization request
 * @returns User's email address from Apple ID
 * @throws Error if token exchange fails or email is not present
 */
export async function getEmailFromAppleCode(
  code: string,
  redirectUri: string
): Promise<string> {
  const clientId = process.env.APPLE_CLIENT_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY;

  if (!clientId || !teamId || !keyId || !privateKey) {
    throw new Error(
      "Apple OAuth credentials not configured. Please set APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY environment variables."
    );
  }

  try {
    // Import jose library for JWT operations (signing and decoding)
    const { SignJWT, decodeJwt, importPKCS8 } = await import("jose");

    // Fix private key format: replace literal \n with actual newlines
    const formattedKey = privateKey.replace(/\\n/g, "\n");
    
    // Import the ES256 private key for JWT signing
    // This is required by Apple's OAuth implementation
    const privateKeyObject = await importPKCS8(formattedKey, "ES256");

    // Create client_secret JWT signed with private key
    // Apple requires this instead of a static client secret
    // JWT must include: iss (team ID), iat (issued at), exp (expiration),
    // aud (audience), sub (client/service ID)
    const clientSecret = await new SignJWT({})
      .setProtectedHeader({ alg: "ES256", kid: keyId }) // Algorithm and Key ID
      .setIssuer(teamId) // Apple Team ID
      .setIssuedAt() // Current timestamp
      .setExpirationTime("180d") // 6 months (180 days) - Apple's max is 6 months
      .setAudience("https://appleid.apple.com") // Apple's token endpoint
      .setSubject(clientId) // Service ID (APPLE_CLIENT_ID)
      .sign(privateKeyObject);
    
    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://appleid.apple.com/auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Apple token exchange failed:", errorText);
      throw new Error(`Failed to exchange Apple authorization code: ${tokenResponse.status}`);
    }

    const tokens = await tokenResponse.json();

    // Decode id_token to get user email (no verification needed for our use case)
    const idToken = tokens.id_token;
    if (!idToken) {
      throw new Error("No id_token received from Apple");
    }

    // Decode JWT (we trust Apple's signature since we're getting it directly from Apple)
    const decoded = decodeJwt(idToken);
    if (!decoded || !decoded.email) {
      throw new Error("No email found in Apple ID token");
    }

    return decoded.email as string;
  } catch (error) {
    console.error("Error exchanging Apple code for email:", error);
    throw error;
  }
}
