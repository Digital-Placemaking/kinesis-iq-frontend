/**
 * app/[slug]/admin/components/AdminLoading.tsx
 * Loading state component for admin page
 */

"use client";

import Spinner from "@/app/components/ui/Spinner";

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" className="text-blue-600 dark:text-blue-400" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Loading admin dashboard...
        </p>
      </div>
    </div>
  );
}
