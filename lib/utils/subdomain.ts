/**
 * lib/utils/subdomain.ts
 * Subdomain utility functions.
 * Helpers for detecting subdomain context and generating correct tenant paths.
 */

/**
 * Checks if the current request is on a subdomain (client-side)
 *
 * Subdomain detection logic:
 * - subdomain.domain.com → true (3+ parts)
 * - www.domain.com → false (www is not treated as a subdomain for routing)
 * - domain.com → false (main domain)
 * - localhost → false (development)
 *
 * @returns true if on a subdomain, false otherwise
 */
export function isSubdomain(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const hostname = window.location.hostname;

  // Handle localhost subdomain testing (e.g., mysubdomain.localhost)
  if (hostname.includes("localhost") && hostname !== "localhost") {
    const parts = hostname.split(".");
    return parts.length >= 2 && parts[parts.length - 1] === "localhost";
  }

  // Skip localhost and IP addresses
  if (
    hostname === "localhost" ||
    hostname.startsWith("127.0.0.1") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
  ) {
    return false;
  }

  const parts = hostname.split(".");

  // Need at least 3 parts for a subdomain (subdomain.domain.tld)
  // www.domain.com has 3 parts but www is not a tenant subdomain
  if (parts.length < 3) {
    return false;
  }

  // Check if first part is "www" - not a tenant subdomain
  if (parts[0].toLowerCase() === "www") {
    return false;
  }

  return true;
}

/**
 * Generates the correct path for a tenant route
 *
 * Path generation logic:
 * - On subdomain (e.g., company1.domain.com): Returns "/coupons"
 *   → Middleware rewrites to /{slug}/coupons internally
 * - On main domain (e.g., domain.com or www.domain.com): Returns "/{slug}/coupons"
 *   → Direct route, no middleware rewrite needed
 *
 * @param tenantSlug - The tenant slug (e.g., "company1")
 * @param path - The path (e.g., "/coupons", "/survey")
 * @returns The correct path based on subdomain context
 *
 * @example
 * // On subdomain: company1.domain.com
 * getTenantPath("company1", "/coupons") → "/coupons"
 *
 * // On main domain: domain.com
 * getTenantPath("company1", "/coupons") → "/company1/coupons"
 */
export function getTenantPath(tenantSlug: string, path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // On subdomain: return relative path (middleware will rewrite to /{slug}/path)
  // On main domain: return path with slug (direct route)
  if (isSubdomain()) {
    return normalizedPath;
  }

  // Main domain: must include slug in path
  return `/${tenantSlug}${normalizedPath}`;
}
