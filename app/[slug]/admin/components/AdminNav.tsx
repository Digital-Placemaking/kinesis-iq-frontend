"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
  BarChart3,
  Gift,
  FileText,
  Users,
} from "lucide-react";
import ActionButton from "@/app/components/ui/ActionButton";

interface AdminNavProps {
  tenantSlug: string;
  user: any;
  owner: any;
}

export default function AdminNav({ tenantSlug, user, owner }: AdminNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center">
            <Link
              href={`/${tenantSlug}/admin`}
              className="text-xl font-bold text-black dark:text-zinc-50"
            >
              {tenantSlug.toUpperCase()} Admin
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              href={`/${tenantSlug}/admin`}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(`/${tenantSlug}/admin`)
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Link>

            <Link
              href={`/${tenantSlug}/admin/coupons`}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(`/${tenantSlug}/admin/coupons`)
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <Gift className="h-4 w-4" />
              Coupons
            </Link>

            <Link
              href={`/${tenantSlug}/admin/surveys`}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(`/${tenantSlug}/admin/surveys`)
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <FileText className="h-4 w-4" />
              Surveys
            </Link>

            {owner?.role === "owner" || owner?.role === "admin" ? (
              <Link
                href={`/${tenantSlug}/admin/team`}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(`/${tenantSlug}/admin/team`)
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <Users className="h-4 w-4" />
                Team
              </Link>
            ) : null}

            <Link
              href={`/${tenantSlug}/admin/settings`}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(`/${tenantSlug}/admin/settings`)
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>

            {/* User Info & Sign Out */}
            <div className="ml-4 flex items-center gap-4 border-l border-zinc-200 pl-4 dark:border-zinc-800">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
