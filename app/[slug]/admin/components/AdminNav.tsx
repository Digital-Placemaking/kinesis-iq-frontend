/**
 * app/[slug]/admin/components/AdminNav.tsx
 * Admin navigation component for tenant-specific admin routes.
 * Provides navigation tabs and user dropdown with tenant switching capability.
 */
"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  Settings,
  BarChart3,
  Gift,
  FileText,
  Eye,
  Mail,
  ChevronDown,
  Building2,
  User,
} from "lucide-react";

interface AdminNavProps {
  tenantSlug: string;
  user: any;
  owner: any;
  /** List of tenants user has access to (only shown if multiple tenants) */
  availableTenants?: Array<{ slug: string; name: string | null }>;
  /** Active tab state */
  activeTab: AdminTab;
  /** Callback to change active tab */
  onTabChange: (tab: AdminTab) => void;
}

import type { AdminTab } from "./AdminContent";

export default function AdminNav({
  tenantSlug,
  user,
  owner,
  availableTenants = [],
  activeTab,
  onTabChange,
}: AdminNavProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Handles user sign out and redirects to tenant login page
   * Uses window.location.href to force a hard refresh and clear server-side session cache
   */
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Use window.location.href instead of router.push to force hard refresh
    // This ensures the server re-renders with cleared session data
    window.location.href = `/${tenantSlug}/admin/login`;
  };

  /**
   * Switches to a different tenant's admin area
   * Resets to overview tab
   */
  const handleSwitchTenant = (newSlug: string) => {
    router.push(`/${newSlug}/admin`);
    setShowUserDropdown(false);
  };

  /**
   * Closes the user dropdown when clicking outside of it
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDropdown]);

  /**
   * Navigation tabs configuration
   * Each tab specifies which roles can access it
   */
  const navTabs: Array<{
    tab: AdminTab;
    label: string;
    icon: any;
    roles: ("owner" | "admin" | "staff")[];
  }> = [
    {
      tab: "overview",
      label: "Overview",
      icon: BarChart3,
      roles: ["owner", "admin"],
    },
    {
      tab: "analytics",
      label: "Analytics",
      icon: Eye,
      roles: ["owner", "admin"],
    },
    {
      tab: "questions",
      label: "Questions",
      icon: FileText,
      roles: ["owner", "admin"],
    },
    {
      tab: "coupons",
      label: "Coupons",
      icon: Gift,
      roles: ["owner", "admin", "staff"],
    },
    {
      tab: "emails",
      label: "Emails",
      icon: Mail,
      roles: ["owner", "admin"],
    },
    {
      tab: "settings",
      label: "Settings",
      icon: Settings,
      roles: ["owner", "admin"],
    },
  ];

  /**
   * Filter navigation tabs based on user role
   * Staff can only see "Coupons", owner/admin can see all tabs
   */
  const visibleTabs = navTabs.filter(
    (tab) =>
      !tab.roles ||
      tab.roles.includes(owner?.role) ||
      (owner?.role === "admin" && tab.roles.includes("admin"))
  );

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2">
          {/* Navigation Tabs */}
          <div className="flex flex-1 space-x-1 overflow-x-auto scrollbar-hide -mb-px min-w-0">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isTabActive = activeTab === tab.tab;
              return (
                <button
                  key={tab.tab}
                  onClick={() => onTabChange(tab.tab)}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-t-lg px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 min-h-[48px] min-w-[48px] touch-manipulation cursor-pointer ${
                    isTabActive
                      ? "border-b-2 border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                  type="button"
                >
                  <Icon className="h-4 w-4 sm:h-4 sm:w-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-[10px] font-semibold">
                    {tab.label.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* User Dropdown - Shows email, tenant switcher (if multiple), and sign out */}
          <div className="flex items-center gap-2 border-l border-zinc-200 pl-3 sm:pl-4 dark:border-zinc-800 shrink-0">
            <div className="relative z-50" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 min-h-[48px] min-w-[48px] touch-manipulation justify-center sm:justify-start cursor-pointer"
                type="button"
              >
                <User className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 truncate max-w-[150px]">
                  {user?.email}
                </span>
                <ChevronDown
                  className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform shrink-0 ${
                    showUserDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-zinc-200 bg-white shadow-lg z-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="py-1">
                    {/* Tenant Switcher - Only shown if user has access to multiple tenants */}
                    {availableTenants.length > 0 && (
                      <>
                        <div className="px-4 py-2 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                          Switch Tenant
                        </div>
                        {availableTenants.map((tenant) => (
                          <button
                            key={tenant.slug}
                            onClick={() => handleSwitchTenant(tenant.slug)}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                              tenant.slug === tenantSlug
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            }`}
                            type="button"
                          >
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <div>
                                <div className="font-medium">
                                  {tenant.name || tenant.slug.toUpperCase()}
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {tenant.slug}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                        <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
                      </>
                    )}
                    {/* Sign Out Option */}
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                      type="button"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
