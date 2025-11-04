"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Card from "@/app/components/ui/Card";
import ActionButton from "@/app/components/ui/ActionButton";
import { Mail, Lock, AlertCircle } from "lucide-react";

interface AdminLoginFormProps {
  redirectPath?: string;
  error?: string;
}

export default function AdminLoginForm({
  redirectPath,
  error: initialError,
}: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError
      ? initialError === "no_tenant"
        ? "No tenant found for this user. Please ensure your account is linked to a tenant."
        : initialError === "staff_query_failed"
        ? "Failed to verify tenant access. Please check RLS policies on the staff table."
        : initialError === "unauthorized"
        ? "You don't have access to this tenant."
        : initialError
      : null
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
        console.log("Login successful, user:", data.user.email);

        // Redirect to the redirect path or default admin
        if (redirectPath) {
          console.log("Redirecting to:", redirectPath);
          window.location.href = redirectPath;
          return;
        }

        // Find user's tenant and redirect there
        console.log("Looking up staff for user:", data.user.id);
        const { data: staff, error: staffError } = await supabase
          .from("staff")
          .select("tenant_id")
          .eq("user_id", data.user.id)
          .limit(1);

        console.log("Staff query result:", { staff, staffError });

        if (staffError) {
          console.error("Error fetching staff:", staffError);
          setError(`Failed to find tenant: ${staffError.message}`);
          setLoading(false);
          return;
        }

        if (staff && staff.length > 0) {
          console.log(
            "Found staff record, looking up tenant:",
            staff[0].tenant_id
          );
          // Note: We can't use tenant-scoped client on client side easily
          // The tenant query might fail due to RLS, but we can still redirect to /admin
          // The /admin page will handle the tenant lookup properly
          console.log("Redirecting to admin dashboard: /admin");
          window.location.href = "/admin";
          return;
        }

        // If no staff found, redirect to /admin which will handle it
        console.log("No staff found, redirecting to /admin");
        window.location.href = "/admin";
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
        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-black dark:text-zinc-50"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="business@example.com"
              required
              disabled={loading}
              className="w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-4 py-3 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-black dark:text-zinc-50"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              className="w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-4 py-3 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <ActionButton
          type="submit"
          icon={Lock}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Signing in..." : "Sign In"}
        </ActionButton>
      </form>
    </Card>
  );
}
