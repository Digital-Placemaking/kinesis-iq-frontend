"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { updatePassword } from "@/app/actions/auth";
import Spinner from "@/app/components/ui/Spinner";

interface ResetPasswordFormProps {
  userEmail: string;
}

/**
 * Form component for resetting/creating password
 */
export default function ResetPasswordForm({
  userEmail,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await updatePassword(password);

      if (result.success) {
        setSuccess(true);
        // Redirect to admin login (tenant selection) after 2 seconds
        setTimeout(() => {
          router.push("/admin/login");
        }, 2000);
      } else {
        setError(
          result.error || "Failed to update password. Please try again."
        );
        setLoading(false);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-black dark:text-zinc-50">
          Password Updated Successfully!
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email display (read-only) */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
        </label>
        <input
          type="email"
          value={userEmail}
          disabled
          className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
        />
      </div>

      {/* New Password */}
      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          New Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter your new password"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 pr-10 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Must be at least 8 characters with uppercase, lowercase, and number
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="Confirm your new password"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 pr-10 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500"
      >
        {loading ? (
          <>
            <Spinner size="sm" className="text-white" />
            <span>Updating Password...</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            <span>Update Password</span>
          </>
        )}
      </button>
    </form>
  );
}
