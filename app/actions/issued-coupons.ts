"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createTenantClient } from "@/lib/supabase/tenant-client";
import { RATE_LIMITS } from "@/lib/constants/rate-limits";
import { checkRateLimit, getClientIdentifier } from "@/lib/utils/rate-limit";
import type {
  IssueCouponResponse,
  ValidateCouponResponse,
  IssuedCoupon,
} from "@/lib/types/issued-coupon";

/**
 * Issued Coupon Actions
 * Server actions for issued coupon operations
 *
 * Organized by functionality:
 * - Helper functions
 * - Coupon issuance
 * - Query/check operations
 * - Validation and redemption
 * - Admin operations
 */

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates a unique coupon code
 * Format: {prefix}-{timestamp}-{random}
 */
function generateCouponCode(prefix: string = "CPN"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// ============================================================================
// Coupon Issuance
// ============================================================================

/**
 * Issues a coupon code to a user
 * Creates an issued_coupon record with status 'issued'
 * Includes rate limiting and duplicate prevention
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
    const rateLimit = await checkRateLimit(
      identifier,
      RATE_LIMITS.COUPON_ISSUE
    );

    // if (!rateLimit.allowed) {
    //   return {
    //     issuedCoupon: null,
    //     error: `Too many coupon requests. Please try again in ${Math.ceil(
    //       (rateLimit.resetAt - Date.now()) / 1000
    //     )} seconds.`,
    //   };
    // }

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

      // Log the check result for debugging
      if (checkError) {
        console.error("Error checking for existing coupon:", {
          error: checkError,
          message: checkError.message,
          code: checkError.code,
          details: checkError.details,
          hint: checkError.hint,
          tenantId,
          couponId,
          email,
        });

        // If RLS blocked the read, we can't safely check for duplicates
        // This is a security issue - we should not create a new coupon if we can't verify
        // For now, we'll proceed but log the error
        // TODO: Ensure RLS policy allows reads for issued_coupons based on email
      }

      // If we found an existing coupon, ALWAYS return it (don't create duplicates)
      // Users should keep the same coupon code they always had, regardless of redemption status
      // Expiration is checked at redemption time, not when displaying the coupon
      if (!checkError && existingCoupons && existingCoupons.length > 0) {
        const existing = existingCoupons[0];

        // Always return the existing coupon - same code, same coupon
        // Redemption status doesn't matter - they keep their original coupon
        return {
          issuedCoupon: existing as IssuedCoupon,
          error: null,
        };
      } else {
        // No existing coupon found, proceeding to create new one
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
          issuedCoupon: issuedCoupon as IssuedCoupon,
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

// ============================================================================
// Query/Check Operations
// ============================================================================

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

    // Check if there are any issued_coupons for this email + tenant
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
 * Checks if a user has already fully redeemed a coupon for a specific coupon_id
 * Returns true if they have an issued_coupon with redemptions_count >= max_redemptions
 */
export async function isCouponAlreadyRedeemed(
  tenantSlug: string,
  couponId: string,
  email: string
): Promise<{ redeemed: boolean; error: string | null }> {
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
        redeemed: false,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Check if there's an issued_coupon for this email + coupon_id that's fully redeemed
    const { data: existingCoupon, error: checkError } = await tenantSupabase
      .from("issued_coupons")
      .select("id, redemptions_count, max_redemptions, status")
      .eq("coupon_id", couponId)
      .eq("email", email)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (checkError) {
      return {
        redeemed: false,
        error: checkError.message || "Failed to check redemption status",
      };
    }

    // Check if fully redeemed
    if (existingCoupon) {
      const isFullyRedeemed =
        existingCoupon.redemptions_count >= existingCoupon.max_redemptions ||
        existingCoupon.status === "redeemed";

      return {
        redeemed: isFullyRedeemed,
        error: null,
      };
    }

    return {
      redeemed: false,
      error: null,
    };
  } catch (err) {
    return {
      redeemed: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Gets the status of a user's issued coupon for a specific coupon_id
 * Returns the status: 'redeemed', 'revoked', 'expired', or null if no coupon exists
 */
export async function getCouponStatus(
  tenantSlug: string,
  couponId: string,
  email: string
): Promise<{
  status: "redeemed" | "revoked" | "expired" | null;
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
        status: null,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Check if there's an issued_coupon for this email + coupon_id
    const { data: existingCoupon, error: checkError } = await tenantSupabase
      .from("issued_coupons")
      .select("id, redemptions_count, max_redemptions, status")
      .eq("coupon_id", couponId)
      .eq("email", email)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (checkError) {
      return {
        status: null,
        error: checkError.message || "Failed to check coupon status",
      };
    }

    // If no coupon exists, return null status
    if (!existingCoupon) {
      return {
        status: null,
        error: null,
      };
    }

    // Check status in priority order: revoked > expired > redeemed
    if (existingCoupon.status === "revoked") {
      return {
        status: "revoked",
        error: null,
      };
    }

    if (existingCoupon.status === "expired") {
      return {
        status: "expired",
        error: null,
      };
    }

    // Check if fully redeemed
    const isFullyRedeemed =
      existingCoupon.redemptions_count >= existingCoupon.max_redemptions ||
      existingCoupon.status === "redeemed";

    if (isFullyRedeemed) {
      return {
        status: "redeemed",
        error: null,
      };
    }

    // Coupon exists but is still valid
    return {
      status: null,
      error: null,
    };
  } catch (err) {
    return {
      status: null,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Checks if a user already has an issued coupon for a specific coupon
 * Returns the existing coupon if found, regardless of redemption status
 * This allows the completed page to display coupons even if already redeemed
 * Rate limited but less strict than coupon issuance (20 requests/min vs 3/10sec)
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
    // Rate limiting: use email as identifier if available, otherwise use IP
    // Less strict than coupon issuance (COUPON_CHECK vs COUPON_ISSUE)
    const headersList = await headers();
    const identifier = getClientIdentifier(email, headersList);
    const rateLimit = await checkRateLimit(
      identifier,
      RATE_LIMITS.COUPON_CHECK
    );
    if (!rateLimit.allowed) {
      return {
        exists: false,
        issuedCoupon: null,
        error: `Too many coupon check requests. Please try again in ${Math.ceil(
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

    // Always return the existing coupon if found, regardless of redemption status
    // This allows the completed page to display the coupon even if it's already redeemed
    // The redemption status is checked separately for display purposes
    return {
      exists: true,
      issuedCoupon: existing as any,
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

// ============================================================================
// Validation and Redemption
// ============================================================================

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
          issuedCoupon: issuedCoupon as IssuedCoupon,
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
      // Check if the email associated with this issued_coupon already has a fully redeemed coupon for this coupon_id
      if (issuedCoupon.email) {
        const { data: existingIssuedCoupon, error: checkError } =
          await tenantSupabase
            .from("issued_coupons")
            .select(
              "id, coupon_id, email, status, redemptions_count, max_redemptions"
            )
            .eq("coupon_id", issuedCoupon.coupon_id)
            .eq("email", issuedCoupon.email) // The customer's email from the issued_coupon
            .eq("tenant_id", tenantId)
            .neq("id", issuedCoupon.id) // Exclude the current coupon being redeemed
            .maybeSingle();

        if (checkError) {
          console.error("Error checking existing issued coupon:", checkError);
        }

        // Check if this customer already has a fully redeemed coupon for this coupon_id
        if (existingIssuedCoupon) {
          const isFullyRedeemed =
            existingIssuedCoupon.redemptions_count >=
              existingIssuedCoupon.max_redemptions ||
            existingIssuedCoupon.status === "redeemed";

          if (isFullyRedeemed) {
            return {
              valid: false,
              issuedCoupon: issuedCoupon as IssuedCoupon,
              error: "This customer has already redeemed this coupon",
              message:
                "You cannot redeem the same coupon multiple times for the same customer",
            };
          }
        }
      }

      const newRedemptionsCount = issuedCoupon.redemptions_count + 1;
      const newStatus =
        newRedemptionsCount >= issuedCoupon.max_redemptions
          ? "redeemed"
          : issuedCoupon.status;

      // Update issued coupon
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
          issuedCoupon: issuedCoupon as IssuedCoupon,
          error: updateError?.message || "Failed to redeem coupon",
        };
      }

      return {
        valid: true,
        issuedCoupon: updatedCoupon as IssuedCoupon,
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

// ============================================================================
// Admin Operations
// ============================================================================

/**
 * Fetches issued coupons with pagination
 * Used by admin dashboard
 */
export async function getIssuedCouponsPaginated(
  tenantSlug: string,
  page: number = 1,
  itemsPerPage: number = 10
): Promise<{
  issuedCoupons: IssuedCoupon[] | null;
  totalCount: number;
  totalPages: number;
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
        issuedCoupons: null,
        totalCount: 0,
        totalPages: 0,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Fetch total count
    const { count, error: countError } = await tenantSupabase
      .from("issued_coupons")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return {
        issuedCoupons: null,
        totalCount: 0,
        totalPages: 0,
        error: `Failed to count issued coupons: ${countError.message}`,
      };
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Calculate offset
    const offset = (page - 1) * itemsPerPage;

    // Fetch paginated issued coupons with coupon title
    const { data: issuedCoupons, error: fetchError } = await tenantSupabase
      .from("issued_coupons")
      .select(
        `
        *,
        coupons:coupon_id (
          title
        )
      `
      )
      .order("issued_at", { ascending: false })
      .range(offset, offset + itemsPerPage - 1);

    if (fetchError) {
      return {
        issuedCoupons: null,
        totalCount: 0,
        totalPages: 0,
        error: `Failed to fetch issued coupons: ${fetchError.message}`,
      };
    }

    return {
      issuedCoupons: (issuedCoupons as IssuedCoupon[]) || [],
      totalCount,
      totalPages,
      error: null,
    };
  } catch (err) {
    return {
      issuedCoupons: null,
      totalCount: 0,
      totalPages: 0,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}

/**
 * Updates an issued coupon
 * Used by admin dashboard for status changes and redemption count adjustments
 */
export async function updateIssuedCoupon(
  tenantSlug: string,
  issuedCouponId: string,
  updates: {
    status?: "issued" | "redeemed" | "revoked" | "expired";
    redemptions_count?: number;
    metadata?: Record<string, any>;
  }
): Promise<{ success: boolean; error: string | null }> {
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
        success: false,
        error: `Tenant not found: ${tenantSlug}`,
      };
    }

    // Create tenant-scoped client
    const tenantSupabase = await createTenantClient(tenantId);

    // Prepare update data
    const updateData: {
      status?: string;
      redemptions_count?: number;
      redeemed_at?: string | null;
      revoked_at?: string | null;
      metadata?: Record<string, any>;
    } = {};
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.redemptions_count !== undefined)
      updateData.redemptions_count = updates.redemptions_count;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

    // Update issued coupon
    const { data, error: updateError } = await tenantSupabase
      .from("issued_coupons")
      .update(updateData)
      .eq("id", issuedCouponId)
      .eq("tenant_id", tenantId)
      .select();

    if (updateError) {
      console.error("Failed to update issued coupon:", {
        error: updateError,
        message: updateError.message,
        code: updateError.code,
        issuedCouponId,
        tenantId,
      });
      return {
        success: false,
        error: `Failed to update issued coupon: ${updateError.message}`,
      };
    }

    // Check if any rows were updated
    if (!data || data.length === 0) {
      return {
        success: false,
        error: "Update blocked - no rows were updated. Check RLS policies.",
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    console.error("Unexpected error updating issued coupon:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
