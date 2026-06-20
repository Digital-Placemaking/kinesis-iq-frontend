/**
 * app/components/providers/QueryProvider.tsx
 *
 * TanStack Query provider for the admin dashboard.
 *
 * Wraps client components that use polling hooks (useDashboardMetrics, etc.).
 * Must be a client component because QueryClientProvider uses React context.
 *
 * Usage: wrap admin UI in app/[slug]/admin/layout.tsx
 */

"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createAppQueryClient } from "@/lib/query/query-client";

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  // Create the client once per browser session (not on every render).
  const [queryClient] = useState(() => createAppQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
