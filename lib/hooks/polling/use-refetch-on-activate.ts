/**
 * lib/hooks/polling/use-refetch-on-activate.ts
 *
 * Triggers an immediate refetch when a polling surface becomes active again
 * (enabled: false → true). Skips initial mount so SSR data is not double-fetched.
 */

"use client";

import { useEffect, useRef } from "react";

export function useRefetchOnActivate(
  active: boolean,
  refetch: () => Promise<unknown>
) {
  const prevActiveRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (prevActiveRef.current === false && active) {
      void refetch();
    }
    prevActiveRef.current = active;
  }, [active, refetch]);
}
