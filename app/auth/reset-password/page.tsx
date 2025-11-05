import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResetPasswordForm from "./components/ResetPasswordForm";

interface ResetPasswordPageProps {
  searchParams: Promise<{ type?: string; error?: string }>;
}

/**
 * Reset/Create Password Page
 * Shown when user clicks "set your password" link from email
 */
export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const type = params.type || "recovery";
  const error = params.error;

  // Verify user is authenticated (they should be after clicking the email link)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // If not authenticated, redirect to home with error
    redirect("/?error=auth_required");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-4 py-12 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
              {type === "signup"
                ? "Create Your Password"
                : "Reset Your Password"}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {type === "signup"
                ? "Please set a password to complete your account setup."
                : "Please enter your new password below."}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error === "auth_required"
                ? "Please use the link from your email to access this page."
                : "An error occurred. Please try again."}
            </div>
          )}

          <ResetPasswordForm userEmail={user.email || ""} />
        </div>
      </div>
    </div>
  );
}
