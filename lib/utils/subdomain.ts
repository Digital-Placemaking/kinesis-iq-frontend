/**
 * Subdomain utility functions
 * Helpers for detecting subdomain context and generating correct paths
 */

/**
 * Checks if the current request is on a subdomain (client-side)
 * @returns true if on a subdomain, false otherwise
 */
export function isSubdomain(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const hostname = window.location.hostname;

  // Handle localhost subdomain testing
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

  // Check if there are at least 3 parts (subdomain.domain.tld)
  const parts = hostname.split(".");
  return parts.length >= 3;
}

/**
 * Generates the correct path for a tenant route
 * On subdomain: returns relative path (e.g., "/coupons")
 * On regular domain: returns path with slug (e.g., "/company1/coupons")
 *
 * @param tenantSlug - The tenant slug
 * @param path - The path (e.g., "/coupons", "/survey")
 * @returns The correct path based on context
 */
export function getTenantPath(tenantSlug: string, path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // On subdomain, return relative path (middleware will prepend slug)
  if (isSubdomain()) {
    return normalizedPath;
  }

  // On regular domain, return path with slug
  return `/${tenantSlug}${normalizedPath}`;
}
