/**
 * Admin login form component
 * Handles authentication for tenant administrators
 * Redirects to /admin dashboard after successful login
 */
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Card from "@/app/components/ui/Card";
import ActionButton from "@/app/components/ui/ActionButton";
import Spinner from "@/app/components/ui/Spinner";
import { Mail, Lock } from "lucide-react";
import FormField from "@/app/[slug]/admin/components/FormField";
import ErrorMessage from "@/app/[slug]/admin/components/ErrorMessage";

interface AdminLoginFormProps {
  redirectPath?: string;
  error?: string;
}

/**
 * Maps error codes to user-friendly messages
 */
function getErrorMessage(errorCode?: string): string | null {
  if (!errorCode) return null;

  const errorMap: Record<string, string> = {
    no_tenant:
      "No tenant found for this user. Please ensure your account is linked to a tenant.",
    staff_query_failed:
      "Failed to verify tenant access. Please check RLS policies on the staff table.",
    unauthorized: "You don't have access to this tenant.",
  };

  return errorMap[errorCode] || errorCode;
}

export default function AdminLoginForm({
  redirectPath,
  error: initialError,
}: AdminLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    getErrorMessage(initialError)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (authError) {
        setError(authError.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      if (data.user) {
        // Always redirect to tenant selection page after login
        // This allows users to choose which tenant to access
        window.location.href = redirectPath
          ? `/admin/login?redirect=${encodeURIComponent(redirectPath)}`
          : "/admin/login";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <Card className="p-8" variant="elevated">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-3xl">
          Admin Login
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to access your tenant dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          placeholder="business@example.com"
          required
          disabled={loading}
          icon={Mail}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          placeholder="Enter your password"
          required
          disabled={loading}
          icon={Lock}
        />

        {error && <ErrorMessage message={error} />}

        <ActionButton
          type="submit"
          icon={Lock}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </ActionButton>
      </form>
    </Card>
  );
}
