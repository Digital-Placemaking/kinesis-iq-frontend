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
    pathname.startsWith("/auth/reset-password")
  ) {
    return response;
  }

  // Only protect /admin routes, not /{slug}/admin routes
  const isAdminRoute =
    pathname.startsWith("/admin") && !pathname.match(/\/[^/]+\/admin/);

  // Handle subdomain routing (but skip for admin routes on main domain)
  const hostname = request.headers.get("host") || "";
  const subdomain = extractSubdomain(hostname);

  // If we have a subdomain, try to resolve it to a tenant
  // Skip subdomain routing for admin routes on main domain
  if (subdomain && !isAdminRoute) {
    const { tenant, error } = await getTenantBySubdomain(subdomain);

    if (!error && tenant) {
      // Rewrite the URL to use slug-based routing internally
      // This allows us to keep the existing [slug] route structure
      const url = request.nextUrl.clone();

      // If the pathname is just "/", redirect to tenant landing page
      if (url.pathname === "/") {
        url.pathname = `/${tenant.slug}`;
      } else {
        // Check if pathname already starts with the tenant slug
        // This prevents double prepending when links already include the slug
        if (url.pathname.startsWith(`/${tenant.slug}/`)) {
          // Already has slug, don't prepend again
          // Pathname is already correct (e.g., /company1/coupons)
        } else if (url.pathname === `/${tenant.slug}`) {
          // Pathname is exactly /{slug}, already correct
        } else {
          // Prepend the tenant slug to the pathname
          url.pathname = `/${tenant.slug}${url.pathname}`;
        }
      }

      // Rewrite the request to the slug-based path
      return NextResponse.rewrite(url);
    }
    // If subdomain not found, fall through to normal routing (will show 404 or main page)
  }

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
