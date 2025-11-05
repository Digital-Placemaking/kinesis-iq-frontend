/**
 * Admin navigation tabs component
 * Provides tabbed navigation for different admin sections
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Eye,
  FileText,
  Gift,
  Mail,
  Settings,
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
    href: "/admin/visitors",
    label: "Visitors",
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
      </div>
    </nav>
  );
}
