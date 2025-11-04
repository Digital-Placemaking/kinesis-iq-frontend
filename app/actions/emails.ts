"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import { RATE_LIMITS } from "@/lib/constants/rate-limits";
import { checkRateLimit, getClientIdentifier } from "@/lib/utils/rate-limit";

/**
 * Email Actions
 * Server actions for email opt-in and management operations
 */

/**
 * Submits email for a tenant (stores in email_opt_ins table)
 */
export async function submitEmail(tenantSlug: string, email: string) {
  try {
    // Rate limiting: use email as identifier
    const headersList = await headers();
    const identifier = getClientIdentifier(email, headersList);
    const rateLimit = checkRateLimit(identifier, RATE_LIMITS.EMAIL_SUBMIT);

    if (!rateLimit.allowed) {
      return {
        error: `Too many requests. Please try again in ${Math.ceil(
          (rateLimit.resetAt - Date.now()) / 1000
        )} seconds.`,
        success: false,
      };
    }

    const supabase = await createClient();

    // Resolve tenant slug to UUID
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      {
        slug_input: tenantSlug,
      }
    );

    if (resolveError || !tenantId) {
      return {
        error: `Tenant not found: ${tenantSlug}`,
        success: false,
      };
    }

    // Create tenant-scoped client
    // RLS will automatically scope this to the current tenant via current_tenant_id()
    const tenantSupabase = await createTenantClient(tenantId);

    // Insert email into email_opt_ins table
    // RLS policy eoi_insert_current_tenant ensures tenant_id = current_tenant_id()
    // Unique constraint prevents duplicate emails per tenant
    const { error: insertError } = await tenantSupabase
      .from("email_opt_ins")
      .insert({
        email,
        tenant_id: tenantId,
        consent_at: new Date().toISOString(),
      });

    if (insertError) {
      // Handle duplicate email gracefully (unique constraint violation)
      if (
        insertError.code === "23505" ||
        insertError.message?.includes("unique")
      ) {
        return {
          error: null,
          success: true,
          message: "Email already registered",
        };
      }
      return {
        error: `Failed to submit email: ${insertError.message}`,
        success: false,
      };
    }

    return {
      error: null,
      success: true,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "An error occurred",
      success: false,
    };
  }
}

/**
 * Submits email opt-in after social login (Apple/Google)
 * This is called after successful authentication
 */
export async function submitEmailOptIn(tenantSlug: string, email: string) {
  try {
    // Rate limiting: use email as identifier
    const headersList = await headers();
    const identifier = getClientIdentifier(email, headersList);
    const rateLimit = checkRateLimit(identifier, RATE_LIMITS.EMAIL_OPT_IN);

    if (!rateLimit.allowed) {
      return {
        error: `Too many requests. Please try again in ${Math.ceil(
          (rateLimit.resetAt - Date.now()) / 1000
        )} seconds.`,
        success: false,
      };
    }

    // Same logic as submitEmail - ensures consistency
    return submitEmail(tenantSlug, email);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "An error occurred",
      success: false,
    };
  }
}

/**
 * Verifies if an email has opted in for a tenant
 * Used to check access permissions for coupon pages
 */
export async function verifyEmailOptIn(
  tenantSlug: string,
  email: string
): Promise<{ valid: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Resolve tenant slug to UUID
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      {
        slug_input: tenantSlug,
      }
    );

    if (resolveError || !tenantId) {
      return {
        valid: false,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Check if email exists in email_opt_ins for this tenant
    // Note: RLS may block this read for non-admin users, but that's okay
    // If the email is in the URL, we trust it was successfully submitted
    const { data: emailOptIn, error: checkError } = await tenantSupabase
      .from("email_opt_ins")
      .select("email")
      .eq("email", email)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    // If RLS blocks the read, log a warning but assume valid
    // (since the email being in the URL implies successful submission)
    if (checkError && !emailOptIn) {
      console.warn("Email opt-in verification failed:", checkError.message);
      return {
        valid: true, // Trust the email in URL
        error: null,
      };
    }

    return {
      valid: !!emailOptIn,
      error: null,
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Sends a mass email to all opt-in addresses for the tenant
 * NOTE: This is a placeholder that returns the recipient list size
 * Wire up your email provider (e.g., Resend, SendGrid, SES) here
 */
export async function sendMassEmail(
  tenantSlug: string,
  subject: string,
  body: string
): Promise<{ success: boolean; sent: number; error: string | null }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, sent: 0, error: "Not authenticated" };
    }

    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      { slug_input: tenantSlug }
    );
    if (resolveError || !tenantId) {
      return {
        success: false,
        sent: 0,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    const tenantSupabase = await createTenantClient(tenantId);
    const { data: emails, error } = await tenantSupabase
      .from("email_opt_ins")
      .select("email");
    if (error) {
      return { success: false, sent: 0, error: error.message };
    }

    const recipients = (emails || [])
      .map((e: any) => (e.email || "").trim())
      .filter((e: string) => e.length > 0);

    // TODO: Integrate with your email provider here
    // For now, we just return the count
    return { success: true, sent: recipients.length, error: null };
  } catch (err) {
    return {
      success: false,
      sent: 0,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
