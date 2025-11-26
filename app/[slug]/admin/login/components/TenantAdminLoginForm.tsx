/**
 * app/[slug]/admin/login/components/TenantAdminLoginForm.tsx
 * Tenant-specific admin login form component.
 * Handles authentication for a specific tenant's admin area.
 * Verifies user has access to the specified tenant after authentication.
 */
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Card from "@/app/components/ui/Card";
import ActionButton from "@/app/components/ui/ActionButton";
import Spinner from "@/app/components/ui/Spinner";
import { Mail, Lock } from "lucide-react";
import FormField from "../../components/FormField";
import ErrorMessage from "../../components/ErrorMessage";

interface TenantAdminLoginFormProps {
  /** The slug of the tenant to authenticate for */
  tenantSlug: string;
  /** The display name of the tenant */
  tenantName: string;
  /** The logo URL of the tenant (optional) */
  tenantLogo: string | null;
  /** Optional error code to display (e.g., "unauthorized", "tenant_not_found") */
  error?: string;
}

/**
 * Maps error codes to user-friendly messages
 */
function getErrorMessage(errorCode?: string): string | null {
  if (!errorCode) return null;

  const errorMap: Record<string, string> = {
    unauthorized:
      "You don't have access to this pilot. Please contact the pilot owner or administrator to grant you access.",
    tenant_not_found: "Pilot not found.",
    no_access:
      "You don't have access to this pilot. Please contact the pilot owner or administrator.",
  };

  return errorMap[errorCode] || errorCode;
}

export default function TenantAdminLoginForm({
  tenantSlug,
  tenantName,
  tenantLogo,
  error: initialError,
}: TenantAdminLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    getErrorMessage(initialError)
  );

  /**
   * Handles form submission for tenant-specific admin login
   * 1. Authenticates user with email/password
   * 2. Resolves tenant slug to tenant ID
   * 3. Verifies user has staff access to this tenant
   * 4. Redirects to tenant admin dashboard on success
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Step 1: Authenticate user
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
        // Step 2: Resolve tenant slug to UUID
        const { data: tenantId } = await supabase.rpc("resolve_tenant", {
          slug_input: tenantSlug,
        });

        if (!tenantId) {
          setError("Tenant not found");
          setLoading(false);
          return;
        }

        // Step 3: Verify user has staff access to this tenant
        const { data: staff, error: staffError } = await supabase
          .from("staff")
          .select("tenant_id, role")
          .eq("user_id", data.user.id)
          .eq("tenant_id", tenantId)
          .maybeSingle();

        if (staffError || !staff) {
          setError(
            "You don't have access to this pilot. Please contact the pilot owner or administrator to grant you access."
          );
          setLoading(false);
          // Don't sign out - let them try again or contact admin
          // Signing out would be frustrating for users who just need to be added
          return;
        }

        // Step 4: User has access - redirect to tenant admin dashboard
        window.location.href = `/${tenantSlug}/admin`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 sm:p-10" variant="elevated">
      {/* Logo and Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        {tenantLogo ? (
          <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <img
              src={tenantLogo}
              alt={tenantName}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl border-2 border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
            <span className="text-3xl font-bold text-zinc-600 dark:text-zinc-400">
              {tenantName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-3xl">
          Admin Login
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to access admin dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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

        <div className="pt-2">
          <ActionButton
            type="submit"
            icon={Lock}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </ActionButton>
        </div>
      </form>
    </Card>
  );
}
