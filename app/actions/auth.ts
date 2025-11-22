/**
 * app/actions/auth.ts
 * Server actions for authentication-related operations.
 * Handles password updates and user authentication.
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Auth Actions
 * Server actions for authentication-related operations
 */

/**
 * Updates the user's password
 * Requires the user to be authenticated (e.g., after clicking email link)
 */
export async function updatePassword(
  newPassword: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "You must be authenticated to update your password.",
      };
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters long",
      };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error("Failed to update password:", {
        error: updateError,
        message: updateError.message,
      });
      return {
        success: false,
        error: updateError.message || "Failed to update password",
      };
    }

    // Revalidate relevant paths
    revalidatePath("/admin");
    revalidatePath("/auth/reset-password");

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    console.error("Unexpected error updating password:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An error occurred",
    };
  }
}
