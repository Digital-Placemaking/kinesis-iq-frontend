/**
 * lib/query/query-client.ts
 *
 * Factory for the TanStack Query client used by the admin dashboard.
 * Separated from the React provider so tests or Storybook can create
 * their own client without mounting the full provider tree.
 */

import { QueryClient } from "@tanstack/react-query";

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /** Don't retry aggressively — server actions already log errors server-side. */
        retry: 1,

        /** Avoid surprise refetches on mount when SSR already hydrated initialData. */
        refetchOnMount: false,
      },
    },
  });
}
