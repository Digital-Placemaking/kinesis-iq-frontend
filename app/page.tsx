import { createClient } from "@/lib/supabase/server";
import {
  createTenantClient,
  withTenantContext,
} from "@/lib/utils/tenant-client";

export default async function TestPage() {
  const supabase = await createClient();

  // Test 1: Basic connection check (using resolve_tenant which bypasses RLS)
  let connectionTest = {
    success: false,
    error: null as string | null,
    message: "",
  };
  try {
    const { data, error } = await supabase.rpc("resolve_tenant", {
      slug_input: "sneakydees",
    });

    if (error) {
      connectionTest = {
        success: false,
        error: error.message,
        message: "Connection failed",
      };
    } else {
      connectionTest = {
        success: true,
        error: null,
        message: "Connected to Supabase!",
      };
    }
  } catch (err) {
    connectionTest = {
      success: false,
      error: String(err),
      message: "Exception occurred",
    };
  }

  // Test 2: Resolve tenant slug to UUID
  let resolveTest = {
    success: false,
    error: null as string | null,
    tenantId: null as string | null,
  };
  try {
    const { data, error } = await supabase.rpc("resolve_tenant", {
      slug_input: "sneakydees",
    });

    if (error) {
      resolveTest = { success: false, error: error.message, tenantId: null };
    } else {
      resolveTest = { success: true, error: null, tenantId: data };
    }
  } catch (err) {
    resolveTest = { success: false, error: String(err), tenantId: null };
  }

  // Test 3: Query with tenant context set (using app.tenant_id session variable)
  let tenantContextTest = {
    success: false,
    error: null as string | null,
    message: "",
    tenantData: null as any,
  };
  if (resolveTest.tenantId) {
    try {
      // First, we need to set app.tenant_id using set_tenant_context function
      // Then query with the tenant client
      const tenantSupabase = await createTenantClient(resolveTest.tenantId);

      const { data, error } = await tenantSupabase
        .from("tenants")
        .select("id, slug, name, active")
        .eq("id", resolveTest.tenantId)
        .maybeSingle();

      if (error) {
        tenantContextTest = {
          success: false,
          error: error.message,
          message: "Query with tenant context failed",
          tenantData: null,
        };
      } else {
        tenantContextTest = {
          success: true,
          error: null,
          message:
            "Query with tenant context succeeded! RLS working correctly.",
          tenantData: data,
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      tenantContextTest = {
        success: false,
        error: errorMessage,
        message: `Exception: ${errorMessage}`,
        tenantData: null,
      };

      // If it's a tenant validation error, provide helpful context
      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("inactive")
      ) {
        tenantContextTest.message = `Tenant validation failed. Tenant ID: ${resolveTest.tenantId}. Check if tenant exists and is active in database.`;
      }
    }
  }

  // Test 4: Test querying coupons with tenant context
  let couponsTest = {
    success: false,
    error: null as string | null,
    message: "",
    coupons: null as any,
  };
  if (resolveTest.tenantId && tenantContextTest.success) {
    try {
      // Use the new get_coupons_for_tenant function which sets context and queries in one transaction
      const supabase = await createClient();

      const { data, error } = await supabase.rpc("get_coupons_for_tenant", {
        tenant_uuid: resolveTest.tenantId,
      });

      if (error) {
        // Check if it's an RLS error
        const isRLSError =
          error.message.includes("policy") ||
          error.message.includes("RLS") ||
          error.message.includes("permission") ||
          error.code === "42501"; // Insufficient privilege

        couponsTest = {
          success: false,
          error: error.message,
          message: isRLSError
            ? "RLS is blocking the query - current_tenant_id() might be returning null"
            : "Failed to query coupons via get_coupons_for_tenant function",
          coupons: null,
        };
      } else {
        couponsTest = {
          success: true,
          error: null,
          message: `Found ${
            data?.length || 0
          } coupons using get_coupons_for_tenant`,
          coupons: data,
        };
      }
    } catch (err) {
      couponsTest = {
        success: false,
        error: err instanceof Error ? err.message : String(err),
        message: "Exception occurred",
        coupons: null,
      };
    }
  }

  // Check env vars
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
          Supabase Connection Test
        </h1>

        {/* Environment Variables Check */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
            Environment Variables
          </h2>
          <div className="space-y-2 font-mono text-sm">
            <div
              className={
                hasUrl
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }
            >
              NEXT_PUBLIC_SUPABASE_URL: {hasUrl ? "✓ Set" : "✗ Missing"}
            </div>
            <div
              className={
                hasKey
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }
            >
              NEXT_PUBLIC_SUPABASE_ANON_KEY: {hasKey ? "✓ Set" : "✗ Missing"}
            </div>
          </div>
        </div>

        {/* Connection Test */}
        <div
          className={`rounded-lg border p-6 ${
            connectionTest.success
              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
              : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
          }`}
        >
          <h2 className="mb-2 text-xl font-semibold text-black dark:text-zinc-50">
            Connection Test
          </h2>
          <p
            className={
              connectionTest.success
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }
          >
            {connectionTest.message}
          </p>
          {connectionTest.error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Error: {connectionTest.error}
            </p>
          )}
        </div>

        {/* Resolve Tenant Test */}
        <div
          className={`rounded-lg border p-6 ${
            resolveTest.success
              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
              : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
          }`}
        >
          <h2 className="mb-2 text-xl font-semibold text-black dark:text-zinc-50">
            Resolve Tenant Test (sneakydees)
          </h2>
          {resolveTest.success ? (
            <div>
              <p className="text-green-800 dark:text-green-200">
                ✓ Tenant resolved! UUID: {resolveTest.tenantId}
              </p>
              {resolveTest.tenantId && (
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  Full UUID: {resolveTest.tenantId}
                </p>
              )}
            </div>
          ) : (
            <p className="text-red-800 dark:text-red-200">
              ✗ Failed to resolve tenant
            </p>
          )}
          {resolveTest.error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Error: {resolveTest.error}
            </p>
          )}
        </div>

        {/* Tenant Context Test */}
        {resolveTest.tenantId && (
          <div
            className={`rounded-lg border p-6 ${
              tenantContextTest.success
                ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
            }`}
          >
            <h2 className="mb-2 text-xl font-semibold text-black dark:text-zinc-50">
              Tenant Context Query Test
            </h2>
            <p
              className={
                tenantContextTest.success
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }
            >
              {tenantContextTest.message}
            </p>
            {tenantContextTest.error && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Error: {tenantContextTest.error}
                </p>
                <div className="rounded bg-zinc-100 p-3 dark:bg-zinc-800">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    <strong>Debug info:</strong>
                  </p>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    Tenant ID used: {resolveTest.tenantId}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    This error is coming from <code>set_tenant_context</code>{" "}
                    function.
                  </p>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    Check: 1) Does tenant with this UUID exist? 2) Is
                    tenant.active = true?
                  </p>
                </div>
              </div>
            )}
            {tenantContextTest.tenantData && (
              <div className="mt-4 rounded bg-zinc-100 p-4 dark:bg-zinc-800">
                <pre className="text-xs text-black dark:text-zinc-50">
                  {JSON.stringify(tenantContextTest.tenantData, null, 2)}
                </pre>
              </div>
            )}
            {tenantContextTest.error?.includes("set_tenant_context") && (
              <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> You need to create the{" "}
                  <code className="rounded bg-yellow-100 px-1 py-0.5 dark:bg-yellow-900">
                    set_tenant_context
                  </code>{" "}
                  PostgreSQL function in your database.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Coupons Query Test */}
        {tenantContextTest.success && (
          <div
            className={`rounded-lg border p-6 ${
              couponsTest.success
                ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
            }`}
          >
            <h2 className="mb-2 text-xl font-semibold text-black dark:text-zinc-50">
              Coupons Query Test (with RLS)
            </h2>
            <p
              className={
                couponsTest.success
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }
            >
              {couponsTest.message}
            </p>
            {couponsTest.error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                Error: {couponsTest.error}
              </p>
            )}
            {couponsTest.coupons && couponsTest.coupons.length > 0 && (
              <div className="mt-4 space-y-2">
                {couponsTest.coupons.map((coupon: any) => (
                  <div
                    key={coupon.id}
                    className="rounded bg-zinc-100 p-3 dark:bg-zinc-800"
                  >
                    <p className="font-medium text-black dark:text-zinc-50">
                      {coupon.title}
                    </p>
                    {coupon.discount && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {coupon.discount}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
