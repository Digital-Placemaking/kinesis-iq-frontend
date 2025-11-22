/**
 * lib/constants/subdomains.ts
 * Reserved subdomains configuration.
 * Defines subdomains that cannot be used for tenant routing (reserved for system use).
 */

export const RESERVED_SUBDOMAINS: readonly string[] = [
  "www",
  "admin",
  "api",
  "app",
  "mail",
  "ftp",
  "localhost",
  "test",
  "dev",
  "staging",
  "prod",
  "www1",
  "www2",
] as const;

/**
 * Checks if a subdomain is reserved
 */
export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase());
}
