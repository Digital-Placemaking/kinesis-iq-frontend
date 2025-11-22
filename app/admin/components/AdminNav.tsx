/**
 * app/admin/components/AdminNav.tsx
 * Admin navigation component.
 * Navigation tabs for admin dashboard with role-based access control and active route highlighting.
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Eye,
  FileText,
  Gift,
  Mail,
  Settings,
  LogOut,
} from "lucide-react";

interface NavTab {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ("owner" | "admin" | "staff")[]; // Which roles can see this tab
}

const allNavTabs: NavTab[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["owner", "admin"],
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: Eye,
    roles: ["owner", "admin"],
  },
  {
    href: "/admin/questions",
    label: "Questions",
    icon: FileText,
    roles: ["owner", "admin"],
  },
  {
    href: "/admin/coupons",
    label: "Coupons",
    icon: Gift,
    roles: ["owner", "admin", "staff"],
  },
  {
    href: "/admin/emails",
    label: "Emails",
    icon: Mail,
    roles: ["owner", "admin"],
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    roles: ["owner", "admin"],
  },
];

interface AdminNavProps {
  userRole?: "owner" | "admin" | "staff" | null;
}

export default function AdminNav({ userRole }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Fetch user email
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || null);
    });
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // Filter tabs based on user role
  // Staff can only see "Coupons", owner/admin can see all
  const navTabs =
    userRole === "staff"
      ? allNavTabs.filter((tab) => tab.roles?.includes("staff"))
      : allNavTabs.filter(
          (tab) =>
            !tab.roles ||
            tab.roles.includes("owner") ||
            tab.roles.includes("admin")
        );

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-1.5 sm:gap-2 rounded-t-lg px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? "border-b-2 border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                </Link>
              );
            })}
          </div>
          {/* User Info & Sign Out */}
          <div className="ml-4 flex items-center gap-3 border-l border-zinc-200 pl-4 dark:border-zinc-800 shrink-0">
            {userEmail && (
              <span className="hidden sm:inline text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
