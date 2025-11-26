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
 * Gets all unique emails for a tenant from both opt-ins and survey responses.
 *
 * Returns emails from:
 * 1. email_opt_ins table (all opt-in emails)
 * 2. analytics_events table with SURVEY_COMPLETION events (emails that submitted surveys)
 *
 * @param tenantSlug - The tenant slug
 * @returns Promise resolving to an array of unique email addresses with metadata
 */
export async function getTenantEmails(tenantSlug: string): Promise<{
  emails: Array<{
    email: string;
    source: "opt_in" | "survey_response";
    created_at: string;
    has_survey_response: boolean;
  }>;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    // Resolve tenant slug to UUID
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      { slug_input: tenantSlug }
    );

    let resolvedTenantId = tenantId;

    if (resolveError || !resolvedTenantId) {
      // Try direct lookup for inactive tenants
      const { data: tenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenantSlug)
        .maybeSingle();

      if (!tenant || !tenant.id) {
        return {
          emails: [],
          error: `Tenant not found: ${tenantSlug}`,
        };
      }
      resolvedTenantId = tenant.id;
    }

    const tenantSupabase = await createTenantClient(tenantId);

    // Fetch emails from both sources in parallel
    const [optInsResult, surveyCompletionsResult] = await Promise.all([
      // Get emails from email_opt_ins
      tenantSupabase
        .from("email_opt_ins")
        .select("email, created_at")
        .not("email", "is", null),

      // Get emails from analytics_events where event_type is SURVEY_COMPLETION
      tenantSupabase
        .from("analytics_events")
        .select("email, created_at")
        .eq("event_type", "survey_completion")
        .not("email", "is", null),
    ]);

    // Combine and deduplicate emails
    const emailMap = new Map<
      string,
      {
        email: string;
        source: "opt_in" | "survey_response";
        created_at: string;
        has_survey_response: boolean;
      }
    >();

    // Add opt-in emails
    optInsResult.data?.forEach((optIn) => {
      if (optIn.email) {
        emailMap.set(optIn.email.toLowerCase(), {
          email: optIn.email,
          source: "opt_in",
          created_at: optIn.created_at || new Date().toISOString(),
          has_survey_response: false,
        });
      }
    });

    // Add survey completion emails and mark opt-ins as having survey responses
    surveyCompletionsResult.data?.forEach((event) => {
      if (event.email) {
        const emailLower = event.email.toLowerCase();
        const existing = emailMap.get(emailLower);

        if (existing) {
          // Update existing to show they have survey response
          existing.has_survey_response = true;
        } else {
          // Add new email from survey completion
          emailMap.set(emailLower, {
            email: event.email,
            source: "survey_response",
            created_at: event.created_at || new Date().toISOString(),
            has_survey_response: true,
          });
        }
      }
    });

    // Convert map to array and sort by created_at (newest first)
    const emails = Array.from(emailMap.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return {
      emails,
      error: null,
    };
  } catch (err) {
    return {
      emails: [],
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Sends a mass email to all tenant emails using Resend.
 *
 * Sends to all unique emails from both opt-ins and survey responses.
 * Requires RESEND_API_KEY environment variable to be configured.
 *
 * @param tenantSlug - The tenant slug
 * @param subject - Email subject line
 * @param body - Email body (HTML supported)
 * @param fromEmail - Optional sender email (defaults to onboarding@resend.dev)
 * @returns Promise resolving to result with number of emails sent
 */
export async function sendMassEmail(
  tenantSlug: string,
  subject: string,
  body: string,
  fromEmail?: string
): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  error: string | null;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        sent: 0,
        failed: 0,
        error:
          "RESEND_API_KEY is not configured. Please configure Resend API key.",
      };
    }

    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, sent: 0, failed: 0, error: "Not authenticated" };
    }

    // Staff access check
    const { getBusinessOwnerForTenantSlug } = await import("@/lib/auth/server");
    const owner = await getBusinessOwnerForTenantSlug(tenantSlug);
    if (!owner || owner.role === "staff") {
      return {
        success: false,
        sent: 0,
        failed: 0,
        error: "Unauthorized access",
      };
    }

    // Get all tenant emails
    const { emails, error: emailsError } = await getTenantEmails(tenantSlug);
    if (emailsError || emails.length === 0) {
      return {
        success: false,
        sent: 0,
        failed: 0,
        error: emailsError || "No emails found for this tenant",
      };
    }

    // Initialize Resend
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Extract unique email addresses
    const recipients = emails
      .map((e) => e.email.trim())
      .filter((e) => e.length > 0 && e.includes("@"));

    if (recipients.length === 0) {
      return {
        success: false,
        sent: 0,
        failed: 0,
        error: "No valid email addresses found",
      };
    }

    // Send emails in batches
    // TEMPORARY: Limited to 50 per batch for testing purposes
    const BATCH_SIZE = 50;
    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      try {
        const { data, error } = await resend.emails.send({
          from: fromEmail || "Digital Placemaking <onboarding@resend.dev>",
          to: batch,
          subject: subject,
          html: body,
        });

        if (error) {
          failedCount += batch.length;
          errors.push(
            `Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`
          );
        } else {
          sentCount += batch.length;
        }
      } catch (err) {
        failedCount += batch.length;
        errors.push(
          `Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      }
    }

    return {
      success: sentCount > 0,
      sent: sentCount,
      failed: failedCount,
      error:
        errors.length > 0 ? `Some emails failed: ${errors.join("; ")}` : null,
    };
  } catch (err) {
    return {
      success: false,
      sent: 0,
      failed: 0,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
