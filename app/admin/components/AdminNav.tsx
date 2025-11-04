/**
 * Admin navigation tabs component
 * Provides tabbed navigation for different admin sections
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Eye, FileText, Gift, Mail } from "lucide-react";

interface NavTab {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navTabs: NavTab[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/visitors", label: "Visitors", icon: Eye },
  { href: "/admin/questions", label: "Questions", icon: FileText },
  { href: "/admin/coupons", label: "Coupons", icon: Gift },
  { href: "/admin/emails", label: "Emails", icon: Mail },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-b-2 border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
