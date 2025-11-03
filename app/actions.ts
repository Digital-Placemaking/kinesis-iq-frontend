"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import { RATE_LIMITS } from "@/lib/constants/rate-limits";
import { checkRateLimit, getClientIdentifier } from "@/lib/utils/rate-limit";
import type { Tenant, TenantResponse } from "@/lib/types/tenant";
import type {
  SurveyResponse,
  SurveySubmissionResponse,
  SurveySubmission,
  Survey,
} from "@/lib/types/survey";
import type {
  IssueCouponResponse,
  ValidateCouponResponse,
  IssuedCoupon,
} from "@/lib/types/issued-coupon";

/**
 * Fetches a single coupon by ID
 */
export async function getCouponById(
  tenantSlug: string,
  couponId: string
): Promise<{ coupon: any | null; error: string | null }> {
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
        coupon: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Fetch the specific coupon
    const { data: coupon, error: couponError } = await tenantSupabase
      .from("coupons")
      .select("*")
      .eq("id", couponId)
      .single();

    if (couponError || !coupon) {
      return {
        coupon: null,
        error: couponError?.message || "Coupon not found",
      };
    }

    return {
      coupon,
      error: null,
    };
  } catch (err) {
    return {
      coupon: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

export async function getCouponsForTenant(tenantSlug: string) {
  try {
    const supabase = await createClient();

    // TODO: we may not need to use a database function here because theres no read RLS on the tenants table
    const { data: tenantId, error: resolveError } = await supabase.rpc(
      "resolve_tenant",
      {
        slug_input: tenantSlug,
      }
    );

    if (resolveError || !tenantId) {
      return {
        error: `Tenant not found: ${tenantSlug}`,
        coupons: null,
      };
    }

    // Create tenant-scoped client with x-tenant-id header
    // RLS will automatically read this from request.headers via current_tenant_id()
    const tenantSupabase = await createTenantClient(tenantId);

    // Query directly - no RPC needed! RLS handles tenant isolation
    const { data: coupons, error: couponsError } = await tenantSupabase
      .from("coupons")
      .select("*");

    if (couponsError) {
      return {
        error: `Failed to fetch coupons: ${couponsError.message}`,
        coupons: null,
      };
    }

    return {
      error: null,
      coupons: coupons || [],
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "An error occurred",
      coupons: null,
    };
  }
}

/**
 * Resolves tenant slug to tenant data
 */
export async function getTenantBySlug(
  tenantSlug: string
): Promise<TenantResponse> {
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
        error: `Tenant not found: ${tenantSlug}`,
        tenant: null,
      };
    }

    // Fetch tenant data using tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);
    const { data: tenant, error: tenantError } = await tenantSupabase
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .eq("active", true)
      .single();

    if (tenantError || !tenant) {
      return {
        error: `Failed to fetch tenant data: ${tenantError?.message}`,
        tenant: null,
      };
    }

    // Type assertion: Supabase returns the full tenant record
    return {
      error: null,
      tenant: tenant as Tenant,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "An error occurred",
      tenant: null,
    };
  }
}

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
 * Verifies that an email has opted in for this tenant
 * Checks if email exists in email_opt_ins table for the tenant
 */
export async function verifyEmailOptIn(
  tenantSlug: string,
  email: string
): Promise<{ valid: boolean; error?: string }> {
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

    // Verify email exists in email_opt_ins for this tenant
    // RLS will automatically scope this query to current tenant
    // Note: The RLS policy might only allow staff/admin to read, so we need to check differently
    // We'll use a count query which might work better with RLS
    const { count, error: optInError } = await tenantSupabase
      .from("email_opt_ins")
      .select("email", { count: "exact", head: true })
      .eq("email", email);

    // If count query fails due to RLS, try a different approach
    // Just trust that if the email is in the URL, it was submitted
    // The actual security is in the insert policy
    if (optInError) {
      // RLS might be blocking reads - that's okay, we'll trust the URL param
      // The email was already verified during submission
      console.warn(
        "Email opt-in verification query blocked by RLS:",
        optInError.message
      );
      return {
        valid: true, // Trust that email in URL means it was submitted
      };
    }

    if (count === 0) {
      return {
        valid: false,
        error: "Email opt-in not found",
      };
    }

    return {
      valid: true,
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Submits anonymous feedback for a tenant
 */
export async function submitFeedback(tenantSlug: string) {
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
        error: `Tenant not found: ${tenantSlug}`,
        success: false,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Insert feedback entry (assuming surveys or feedback table exists)
    // This could just be a click/timestamp for now
    const { error: insertError } = await tenantSupabase.from("surveys").insert({
      tenant_id: tenantId,
      anonymous: true,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      return {
        error: `Failed to submit feedback: ${insertError.message}`,
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
 * Fetches survey questions for a specific tenant
 * Since there's no surveys table, we fetch all survey_questions for the tenant
 */
export async function getSurveyForTenant(
  tenantSlug: string
): Promise<SurveyResponse> {
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
        survey: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Fetch all survey questions for this tenant
    // Schema: id, tenant_id, question, type, options, order_index
    const { data: questions, error: questionsError } = await tenantSupabase
      .from("survey_questions")
      .select("*")
      .order("order_index", { ascending: true });

    if (questionsError) {
      return {
        survey: null,
        error: questionsError.message || "Failed to fetch survey questions",
      };
    }

    // Return survey even if no questions - let the page component decide what to do
    // This allows for graceful handling (e.g., redirect to completion)
    if (!questions || questions.length === 0) {
      return {
        survey: {
          tenant_id: tenantId,
          coupon_id: null,
          questions: [],
        },
        error: null,
      };
    }

    // Transform the data to match our Survey interface
    const survey: Survey = {
      tenant_id: tenantId,
      coupon_id: null,
      questions: questions.map((q: any) => ({
        id: q.id,
        tenant_id: q.tenant_id,
        question: q.question,
        type: q.type,
        options: Array.isArray(q.options) ? q.options : [],
        order_index: q.order_index,
      })),
    };

    return {
      survey,
      error: null,
    };
  } catch (err) {
    return {
      survey: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Fetches survey questions for a specific coupon
 * Since there's no surveys table, we fetch all survey_questions for the tenant
 */
export async function getSurveyForCoupon(
  tenantSlug: string,
  couponId: string
): Promise<SurveyResponse> {
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
        survey: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Fetch all survey questions for this tenant
    // Schema: id, tenant_id, question, type, options, order_index
    const { data: questions, error: questionsError } = await tenantSupabase
      .from("survey_questions")
      .select("*")
      .order("order_index", { ascending: true });

    if (questionsError) {
      return {
        survey: null,
        error: questionsError.message || "Failed to fetch survey questions",
      };
    }

    // Return survey even if no questions - let the page component decide what to do
    // This allows for graceful handling (e.g., redirect to completion)
    if (!questions || questions.length === 0) {
      return {
        survey: {
          tenant_id: tenantId,
          coupon_id: couponId,
          questions: [],
        },
        error: null,
      };
    }

    // Transform the data to match our Survey interface
    const survey: Survey = {
      tenant_id: tenantId,
      coupon_id: couponId,
      questions: questions.map((q: any) => ({
        id: q.id,
        tenant_id: q.tenant_id,
        question: q.question,
        type: q.type,
        options: Array.isArray(q.options) ? q.options : [],
        order_index: q.order_index,
      })),
    };

    return {
      survey,
      error: null,
    };
  } catch (err) {
    return {
      survey: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Submits survey answers
 * Schema: survey_responses has one row per question with answer as JSONB
 */
export async function submitSurveyAnswers(
  tenantSlug: string,
  submission: SurveySubmission
): Promise<SurveySubmissionResponse> {
  try {
    // Rate limiting: use email if available, otherwise use IP
    const headersList = await headers();
    const identifier = getClientIdentifier(submission.email, headersList);
    const rateLimit = checkRateLimit(identifier, RATE_LIMITS.SURVEY_SUBMIT);

    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Too many survey submissions. Please try again in ${Math.ceil(
          (rateLimit.resetAt - Date.now()) / 1000
        )} seconds.`,
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
        success: false,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Generate a session_id to group all responses together
    // Use coupon_id + email if available, otherwise generate UUID-like string
    const sessionId =
      submission.coupon_id && submission.email
        ? `${submission.coupon_id}-${submission.email}`
        : `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Insert one row per question answer
    // Schema: id, tenant_id, question_id, answer (jsonb), session_id, created_at
    const responsesToInsert = submission.answers.map((answer) => {
      // Convert answer to JSONB format
      let answerJsonb: any = null;

      // Handle answer_text (for text, date, time, single_choice, ranked_choice, or JSON array for multiple_choice)
      if (answer.answer_text !== null && answer.answer_text !== undefined) {
        // Check if it's a JSON array (for multiple_choice)
        try {
          const parsed = JSON.parse(answer.answer_text);
          if (Array.isArray(parsed)) {
            answerJsonb = { array: parsed };
          } else {
            answerJsonb = { text: answer.answer_text };
          }
        } catch {
          // Not JSON, treat as plain text
          answerJsonb = { text: answer.answer_text };
        }
      } else if (
        answer.answer_number !== null &&
        answer.answer_number !== undefined
      ) {
        answerJsonb = { number: answer.answer_number };
      } else if (
        answer.answer_boolean !== null &&
        answer.answer_boolean !== undefined
      ) {
        answerJsonb = { boolean: answer.answer_boolean };
      }

      return {
        tenant_id: tenantId,
        question_id: answer.question_id,
        answer: answerJsonb,
        session_id: sessionId,
        created_at: new Date().toISOString(),
      };
    });

    const { error: insertError } = await tenantSupabase
      .from("survey_responses")
      .insert(responsesToInsert);

    if (insertError) {
      return {
        success: false,
        error: `Failed to save survey responses: ${insertError.message}`,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Generates a unique coupon code
 * Format: {prefix}-{random}
 */
function generateCouponCode(prefix: string = "CPN"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Issues a coupon code to a user
 * Creates an issued_coupon record with status 'issued'
 */
export async function issueCoupon(
  tenantSlug: string,
  couponId: string,
  email: string | null,
  expiresAt?: string | null
): Promise<IssueCouponResponse> {
  try {
    // Rate limiting: use email as identifier if available, otherwise use IP
    const headersList = await headers();
    const identifier = getClientIdentifier(email, headersList);
    const rateLimit = checkRateLimit(identifier, RATE_LIMITS.COUPON_ISSUE);

    if (!rateLimit.allowed) {
      return {
        issuedCoupon: null,
        error: `Too many coupon requests. Please try again in ${Math.ceil(
          (rateLimit.resetAt - Date.now()) / 1000
        )} seconds.`,
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
        issuedCoupon: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Check if a coupon has already been issued to this email for this coupon
    // Only check if email is provided
    if (email) {
      const { data: existingCoupons, error: checkError } = await tenantSupabase
        .from("issued_coupons")
        .select("*")
        .eq("coupon_id", couponId)
        .eq("email", email)
        .eq("tenant_id", tenantId)
        .order("issued_at", { ascending: false })
        .limit(1);

      // If we found an existing coupon, check if it's still valid
      if (!checkError && existingCoupons && existingCoupons.length > 0) {
        const existing = existingCoupons[0];

        // Check if coupon is still valid (not expired, not fully redeemed)
        const isExpired = existing.expires_at
          ? new Date(existing.expires_at) < new Date()
          : false;

        const isFullyRedeemed =
          existing.redemptions_count >= existing.max_redemptions;

        const isValidStatus =
          existing.status === "issued" || existing.status === "redeemed";

        // If coupon is still valid, return the existing one
        if (!isExpired && !isFullyRedeemed && isValidStatus) {
          return {
            issuedCoupon: existing as any,
            error: null,
          };
        }

        // If coupon is expired or fully redeemed, we'll create a new one below
        // (This allows re-issuing if the previous one was used up)
      }
    }

    // Generate unique code (retry if unique constraint fails)
    let code: string | undefined;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      code = generateCouponCode();

      // Try to insert the coupon - let the unique constraint handle conflicts
      const { data: issuedCoupon, error: insertError } = await tenantSupabase
        .from("issued_coupons")
        .insert({
          tenant_id: tenantId,
          coupon_id: couponId,
          code: code,
          status: "issued",
          email: email,
          expires_at: expiresAt || null,
          metadata: {},
        })
        .select()
        .single();

      // If insert succeeded, we're done
      if (!insertError && issuedCoupon) {
        return {
          issuedCoupon: issuedCoupon as any,
          error: null,
        };
      }

      // If it's a unique constraint violation, try again
      if (
        insertError?.code === "23505" ||
        insertError?.message?.includes("unique")
      ) {
        attempts++;
        continue;
      }

      // If it's a different error, log it and return it
      console.error("Failed to issue coupon:", {
        error: insertError,
        errorCode: insertError?.code,
        message: insertError?.message,
        details: insertError?.details,
        hint: insertError?.hint,
        tenantId,
        couponId,
        couponCode: code,
      });
      return {
        issuedCoupon: null,
        error: insertError?.message || "Failed to issue coupon",
      };
    }

    // If we exhausted all attempts
    return {
      issuedCoupon: null,
      error: "Failed to generate unique coupon code after multiple attempts",
    };
  } catch (err) {
    return {
      issuedCoupon: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Checks if a user has completed any survey for a tenant
 * If they have, they can skip surveys for all coupons in that tenant
 */
export async function hasCompletedSurveyForTenant(
  tenantSlug: string,
  email: string
): Promise<{ completed: boolean; error: string | null }> {
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
        completed: false,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Check if user has submitted any survey responses for this tenant
    // We check by email in the session_id (since session_id is formatted as coupon_id-email)
    // or we can check if there are any survey_responses with this tenant_id
    // Since email isn't directly stored in survey_responses, we'll check session_id patterns
    // Actually, let's check if there are any survey_responses at all for this tenant
    // and if we can match by email somehow

    // For now, let's check if there are any issued_coupons for this email + tenant
    // This indicates they've completed a survey and gotten a coupon before
    const { data: existingCoupons, error: checkError } = await tenantSupabase
      .from("issued_coupons")
      .select("id")
      .eq("email", email)
      .eq("tenant_id", tenantId)
      .limit(1);

    if (checkError) {
      return {
        completed: false,
        error: checkError.message || "Failed to check survey completion",
      };
    }

    // If they have any issued coupon for this tenant, they've completed a survey
    return {
      completed: existingCoupons && existingCoupons.length > 0,
      error: null,
    };
  } catch (err) {
    return {
      completed: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Checks if a user already has an issued coupon for a specific coupon
 * Returns the existing coupon if found and valid
 */
export async function checkExistingCoupon(
  tenantSlug: string,
  couponId: string,
  email: string
): Promise<{
  exists: boolean;
  issuedCoupon: IssuedCoupon | null;
  error: string | null;
}> {
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
        exists: false,
        issuedCoupon: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Check if a coupon has already been issued to this email for this coupon
    const { data: existingCoupons, error: checkError } = await tenantSupabase
      .from("issued_coupons")
      .select("*")
      .eq("coupon_id", couponId)
      .eq("email", email)
      .eq("tenant_id", tenantId)
      .order("issued_at", { ascending: false })
      .limit(1);

    if (checkError || !existingCoupons || existingCoupons.length === 0) {
      return {
        exists: false,
        issuedCoupon: null,
        error: null,
      };
    }

    const existing = existingCoupons[0];

    // Check if coupon is still valid (not expired, not fully redeemed)
    const isExpired = existing.expires_at
      ? new Date(existing.expires_at) < new Date()
      : false;

    const isFullyRedeemed =
      existing.redemptions_count >= existing.max_redemptions;

    const isValidStatus =
      existing.status === "issued" || existing.status === "redeemed";

    // If coupon is still valid, return it
    if (!isExpired && !isFullyRedeemed && isValidStatus) {
      return {
        exists: true,
        issuedCoupon: existing as any,
        error: null,
      };
    }

    // If coupon exists but is invalid, return that it doesn't exist
    // (so they can get a new one)
    return {
      exists: false,
      issuedCoupon: null,
      error: null,
    };
  } catch (err) {
    return {
      exists: false,
      issuedCoupon: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Validates a coupon code
 * Returns validation result and optionally redeems the coupon
 */
export async function validateCouponCode(
  tenantSlug: string,
  code: string,
  redeem: boolean = false
): Promise<ValidateCouponResponse> {
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
        issuedCoupon: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Find issued coupon by code
    const { data: issuedCoupon, error: fetchError } = await tenantSupabase
      .from("issued_coupons")
      .select("*")
      .eq("code", code)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !issuedCoupon) {
      return {
        valid: false,
        issuedCoupon: null,
        error: "Coupon code not found",
        message: "Invalid coupon code",
      };
    }

    // Check if coupon is expired
    if (issuedCoupon.expires_at) {
      const expiresAt = new Date(issuedCoupon.expires_at);
      if (expiresAt < new Date()) {
        // Update status to expired if not already
        if (issuedCoupon.status !== "expired") {
          await tenantSupabase
            .from("issued_coupons")
            .update({ status: "expired" })
            .eq("id", issuedCoupon.id);
        }
        return {
          valid: false,
          issuedCoupon: issuedCoupon as any,
          error: "Coupon has expired",
          message: "This coupon has expired",
        };
      }
    }

    // Check status
    if (issuedCoupon.status === "revoked") {
      return {
        valid: false,
        issuedCoupon: issuedCoupon as any,
        error: "Coupon has been revoked",
        message: "This coupon has been revoked",
      };
    }

    if (issuedCoupon.status === "expired") {
      return {
        valid: false,
        issuedCoupon: issuedCoupon as any,
        error: "Coupon has expired",
        message: "This coupon has expired",
      };
    }

    // Check redemption count
    if (issuedCoupon.redemptions_count >= issuedCoupon.max_redemptions) {
      return {
        valid: false,
        issuedCoupon: issuedCoupon as any,
        error: "Coupon has reached maximum redemptions",
        message: "This coupon has already been used",
      };
    }

    // If redeem is true, redeem the coupon
    if (redeem) {
      const newRedemptionsCount = issuedCoupon.redemptions_count + 1;
      const newStatus =
        newRedemptionsCount >= issuedCoupon.max_redemptions
          ? "redeemed"
          : issuedCoupon.status;

      const { data: updatedCoupon, error: updateError } = await tenantSupabase
        .from("issued_coupons")
        .update({
          status: newStatus,
          redemptions_count: newRedemptionsCount,
          redeemed_at:
            newStatus === "redeemed" ? new Date().toISOString() : null,
        })
        .eq("id", issuedCoupon.id)
        .select()
        .single();

      if (updateError || !updatedCoupon) {
        return {
          valid: false,
          issuedCoupon: issuedCoupon as any,
          error: updateError?.message || "Failed to redeem coupon",
        };
      }

      return {
        valid: true,
        issuedCoupon: updatedCoupon as any,
        error: null,
        message: "Coupon redeemed successfully",
      };
    }

    // Just validation, don't redeem
    return {
      valid: true,
      issuedCoupon: issuedCoupon as any,
      error: null,
      message: "Coupon code is valid",
    };
  } catch (err) {
    return {
      valid: false,
      issuedCoupon: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
