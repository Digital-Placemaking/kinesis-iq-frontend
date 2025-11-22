/**
 * app/actions/emails.ts
 * Server actions for email operations.
 * Handles email opt-ins, verification, and mass email sending.
 */

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
 *
 * Security:
 * - Rate limited to prevent abuse
 * - Email is trimmed and validated client-side before submission
 * - RLS policies enforce tenant isolation
 * - Unique constraint prevents duplicate emails per tenant
 */
export async function submitEmail(tenantSlug: string, email: string) {
  try {
    // Input validation: trim and validate email format
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      return {
        error: "Invalid email address",
        success: false,
      };
    }

    // Rate limiting: use email as identifier
    const headersList = await headers();
    const identifier = getClientIdentifier(email, headersList);
    const rateLimit = await checkRateLimit(
      identifier,
      RATE_LIMITS.EMAIL_SUBMIT
    );

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
    // Note: Supabase handles SQL injection prevention via parameterized queries
    const { error: insertError } = await tenantSupabase
      .from("email_opt_ins")
      .insert({
        email: trimmedEmail,
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
    const rateLimit = await checkRateLimit(
      identifier,
      RATE_LIMITS.EMAIL_OPT_IN
    );

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
 * Verifies if an email exists in email_opt_ins table for a tenant
 *
 * This is the core check used by the survey page to determine user flow:
 * - If email IS in table → Returning user → Skip survey
 * - If email NOT in table → First-time user → Show survey
 *
 * Used by:
 * - Survey page: Decides whether to show survey or skip to coupon completion
 * - Coupons page: Can verify email opt-in status (currently not enforced)
 *
 * @param tenantSlug - The tenant slug
 * @param email - The email address to check
 * @returns Object with valid boolean and error message (if any)
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

    // If RLS blocks the read, we can't verify - this is a security concern
    // For non-admin users, RLS should allow reading their own email opt-in
    // If RLS blocks, it might indicate a policy issue or the email truly doesn't exist
    if (checkError) {
      // Log the error for debugging
      console.warn("Email opt-in verification error:", checkError.message);
      // Don't assume valid - require explicit verification
      // This prevents bypassing the opt-in requirement
      return {
        valid: false,
        error: checkError.message || "Failed to verify email opt-in",
      };
    }

    // Email must exist in email_opt_ins table to be valid
    return {
      valid: !!emailOptIn,
      error: emailOptIn ? null : "Email not found in opt-in list",
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
      .map((e: { email?: string | null }) => (e.email || "").trim())
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
