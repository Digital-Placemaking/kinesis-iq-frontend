/**
 * app/[slug]/admin/components/AdminNav.tsx
 * Admin navigation component for tenant-specific admin routes.
 * Provides navigation tabs and user dropdown with tenant switching capability.
 */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
}

export default function AdminNav({
  tenantSlug,
  user,
  owner,
  availableTenants = [],
}: AdminNavProps) {
  const router = useRouter();
  const pathname = usePathname();
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
   * Preserves the current route path (e.g., /analytics stays /analytics)
   */
  const handleSwitchTenant = (newSlug: string) => {
    const currentPath = pathname;
    const newPath = currentPath.replace(
      `/${tenantSlug}/admin`,
      `/${newSlug}/admin`
    );
    router.push(newPath);
    setShowUserDropdown(false);
  };

  /**
   * Checks if a navigation link is currently active
   */
  const isActive = (path: string) => pathname === path;

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
   * Navigation links configuration
   * Each link specifies which roles can access it
   */
  const navLinks = [
    {
      href: `/${tenantSlug}/admin`,
      label: "Overview",
      icon: BarChart3,
      roles: ["owner", "admin"],
    },
    {
      href: `/${tenantSlug}/admin/analytics`,
      label: "Analytics",
      icon: Eye,
      roles: ["owner", "admin"],
    },
    {
      href: `/${tenantSlug}/admin/questions`,
      label: "Questions",
      icon: FileText,
      roles: ["owner", "admin"],
    },
    {
      href: `/${tenantSlug}/admin/coupons`,
      label: "Coupons",
      icon: Gift,
      roles: ["owner", "admin", "staff"],
    },
    {
      href: `/${tenantSlug}/admin/emails`,
      label: "Emails",
      icon: Mail,
      roles: ["owner", "admin"],
    },
    {
      href: `/${tenantSlug}/admin/settings`,
      label: "Settings",
      icon: Settings,
      roles: ["owner", "admin"],
    },
  ];

  /**
   * Filter navigation links based on user role
   * Staff can only see "Coupons", owner/admin can see all links
   */
  const visibleLinks = navLinks.filter(
    (link) =>
      !link.roles ||
      link.roles.includes(owner?.role) ||
      (owner?.role === "admin" && link.roles.includes("admin"))
  );

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Navigation Tabs */}
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isLinkActive = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 sm:gap-2 rounded-t-lg px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isLinkActive
                      ? "border-b-2 border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{link.label}</span>
                  <span className="sm:hidden">{link.label.split(" ")[0]}</span>
                </Link>
              );
            })}
          </div>

          {/* User Dropdown - Shows email, tenant switcher (if multiple), and sign out */}
          <div className="ml-4 flex items-center gap-3 border-l border-zinc-200 pl-4 dark:border-zinc-800 shrink-0">
            <div className="relative z-50" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                type="button"
              >
                <User className="h-4 w-4" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {user?.email}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
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
                            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
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
                      className="w-full px-4 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
