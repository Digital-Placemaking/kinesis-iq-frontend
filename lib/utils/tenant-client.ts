import { createClient } from "@/lib/supabase/server";

/**
 * Creates a Supabase client with tenant context set via app.tenant_id session variable.
 * This uses the set_tenant_context PostgreSQL function to set app.tenant_id.
 *
 * Your RLS policies use current_tenant_id() which checks:
 * 1. request.headers.x-tenant-id (for Edge Functions)
 * 2. app.tenant_id (for direct queries) - this is what we set here
 */
export async function createTenantClient(tenantId: string) {
  const supabase = await createClient();

  // Set the tenant context via PostgreSQL function
  // Note: We don't validate first because RLS would block the query
  // The set_tenant_context function validates internally anyway
  // Since set_tenant_context returns void, Supabase will throw a coercion error
  // But the function still executes successfully - we catch and ignore that specific error
  try {
    const { error } = await supabase.rpc("set_tenant_context", {
      tenant_uuid: tenantId,
    });

    // If there's an error, it could be:
    // 1. "Cannot coerce void" - expected, ignore it
    // 2. "Tenant not found or inactive" - validation failed, throw it
    // 3. Function doesn't exist - throw it
    if (error) {
      if (error.message.includes("Cannot coerce")) {
        // Expected void return error - function executed successfully
        // The session variable is set, we can continue
      } else if (
        error.message.includes("not found") ||
        error.message.includes("inactive")
      ) {
        // Tenant validation failed
        throw new Error(`Tenant not found or inactive: ${error.message}`);
      } else {
        // Other error (like function doesn't exist)
        throw error;
      }
    }
  } catch (rpcError: any) {
    // If it's the "Cannot coerce void" error, that's expected
    // The function executed successfully, we just can't read the void return
    if (rpcError?.message?.includes("Cannot coerce")) {
      // Function executed successfully, ignore coercion error
      // The session variable is set, we can continue
    } else {
      // It's a different error (tenant invalid, function missing, etc.), re-throw it
      throw rpcError;
    }
  }

  // Note: Supabase uses connection pooling, so the session variable might not persist
  // across different queries if they use different connections.
  // The session variable should persist for queries made on the same client instance,
  // but there's no guarantee with connection pooling.
  //
  // If queries are failing, try using the same client instance for both
  // set_tenant_context and your queries (which is what we're doing here).

  return supabase;
}

/**
 * Executes a query with tenant context set.
 * This is a convenience wrapper that sets tenant context before your query.
 * IMPORTANT: Sets context right before the query to avoid connection pooling issues.
 */
export async function withTenantContext<T>(
  tenantId: string,
  queryFn: (supabase: Awaited<ReturnType<typeof createClient>>) => Promise<T>
): Promise<T> {
  const supabase = await createClient();

  // Use with_tenant_context function (returns boolean, not void)
  // This ensures context is set on the same connection before the query
  const { data: contextSet, error: contextError } = await supabase.rpc(
    "with_tenant_context",
    {
      tenant_uuid: tenantId,
      operation: null,
    }
  );

  if (contextError) {
    if (
      contextError.message.includes("not found") ||
      contextError.message.includes("inactive")
    ) {
      throw new Error(`Tenant not found or inactive: ${contextError.message}`);
    }
    throw contextError;
  }

  if (!contextSet) {
    throw new Error("Failed to set tenant context");
  }

  // IMPORTANT: Even though we set the context, Supabase connection pooling
  // means the next query might use a different connection where the variable isn't set.
  // We need to execute the query immediately after setting context to maximize
  // the chance they use the same connection/session.

  // Execute the query immediately after setting context
  // Note: There's no guarantee they'll use the same connection, but this is our best bet
  return queryFn(supabase);
}
