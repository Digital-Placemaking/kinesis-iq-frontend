import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getTenantBySubdomain } from "@/app/actions/tenant";
import { isReservedSubdomain } from "@/lib/constants/subdomains";

/**
 * Extracts subdomain from hostname
 * Returns null if no subdomain or if it's a reserved subdomain
 */
function extractSubdomain(hostname: string): string | null {
  // Remove port number if present (e.g., "localhost:3000" -> "localhost")
  const hostnameWithoutPort = hostname.split(":")[0];

  // Handle localhost with subdomain (for local testing)
  // e.g., "mysubdomain.localhost:3000" or "mysubdomain.localhost"
  if (
    hostnameWithoutPort.includes("localhost") &&
    hostnameWithoutPort !== "localhost"
  ) {
    const parts = hostnameWithoutPort.split(".");
    // If we have subdomain.localhost format
    if (parts.length >= 2 && parts[parts.length - 1] === "localhost") {
      const subdomain = parts[0].toLowerCase();
      // Check if it's a reserved subdomain
      if (isReservedSubdomain(subdomain)) {
        return null;
      }
      return subdomain;
    }
  }

  // Handle regular localhost and IP addresses (skip subdomain routing)
  if (
    hostnameWithoutPort === "localhost" ||
    hostnameWithoutPort.startsWith("127.0.0.1") ||
    hostnameWithoutPort.startsWith("192.168.") ||
    hostnameWithoutPort.startsWith("10.") ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostnameWithoutPort)
  ) {
    return null;
  }

  const parts = hostnameWithoutPort.split(".");

  // If there are less than 3 parts (e.g., "example.com"), no subdomain
  if (parts.length < 3) {
    return null;
  }

  const subdomain = parts[0].toLowerCase();

  // "www" is not a tenant subdomain - it's the main domain
  // On www.domain.com, routes must include slug: /{slug}/coupons
  if (subdomain === "www") {
    return null;
  }

  // Check if it's a reserved subdomain
  if (isReservedSubdomain(subdomain)) {
    return null;
  }

  return subdomain;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired
  await supabase.auth.getUser();

  // Protect admin routes
  const pathname = request.nextUrl.pathname;

  // Allow login and auth pages before any subdomain routing
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/reset-password") ||
    pathname.startsWith("/auth/oauth-callback")
  ) {
    return response;
  }

  // Only protect /admin routes, not /{slug}/admin routes
  const isAdminRoute =
    pathname.startsWith("/admin") && !pathname.match(/\/[^/]+\/admin/);

  // ============================================================================
  // SUBDOMAIN ROUTING
  // ============================================================================
  // Extract subdomain from hostname and rewrite URLs to slug-based routes
  // This allows subdomain.domain.com/coupons to work with [slug]/coupons route
  const hostname = request.headers.get("host") || "";
  const subdomain = extractSubdomain(hostname);

  // If we have a valid subdomain (not www, not main domain), resolve to tenant
  // Skip subdomain routing for admin routes on main domain
  if (subdomain && !isAdminRoute) {
    const { tenant, error } = await getTenantBySubdomain(subdomain);

    if (!error && tenant) {
      // Rewrite the URL to use slug-based routing internally
      // This allows us to keep the existing [slug] route structure
      const url = request.nextUrl.clone();

      // Rewrite logic:
      // - subdomain.domain.com/ → /{slug}/
      // - subdomain.domain.com/coupons → /{slug}/coupons
      // - subdomain.domain.com/survey → /{slug}/survey
      // - subdomain.domain.com/coupons?email=... → /{slug}/coupons?email=...
      if (url.pathname === "/") {
        // Root path on subdomain → rewrite to tenant landing page
        url.pathname = `/${tenant.slug}`;
      } else if (!url.pathname.startsWith(`/${tenant.slug}`)) {
        // Path doesn't start with slug → prepend it
        // Preserve query parameters (e.g., ?email=user@example.com)
        url.pathname = `/${tenant.slug}${url.pathname}`;
      }
      // If pathname already starts with slug, leave it as-is (already correct)

      // Rewrite the request to the slug-based path
      // This is an internal rewrite - the URL in the browser stays the same
      return NextResponse.rewrite(url);
    }
    // If subdomain not found, fall through to normal routing (will show 404)
  }

  // ============================================================================
  // MAIN DOMAIN ROUTING (no subdomain)
  // ============================================================================
  // On main domain (domain.com or www.domain.com), routes must include slug:
  // - domain.com/{slug}/coupons → Works (served by [slug]/coupons route)
  // - domain.com/coupons → 404 (no route exists, slug is required)
  // This is expected behavior - users must use subdomain or include slug in path

  // Redirect any {slug}/admin routes to /admin
  if (pathname.match(/\/[^/]+\/admin/)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (isAdminRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to login if not authenticated
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
