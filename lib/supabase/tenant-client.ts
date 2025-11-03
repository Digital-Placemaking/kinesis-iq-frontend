import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client with x-tenant-id header set.
 * This allows RLS to read tenant context from request.headers automatically.
 * No RPC functions needed - just pass the header!
 */
export async function createTenantClient(tenantId: string) {
  const cookieStore = await cookies();

  // Custom fetch that adds x-tenant-id header to all requests
  // Supabase sends this header to PostgreSQL, and RLS reads it via current_tenant_id()
  const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    headers.set("x-tenant-id", tenantId);

    return fetch(input, {
      ...init,
      headers,
    });
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore - setAll called from Server Component
          }
        },
      },
      global: {
        fetch: customFetch,
      },
    }
  );
}
