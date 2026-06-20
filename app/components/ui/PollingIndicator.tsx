/**
 * app/components/ui/PollingIndicator.tsx
 *
 * Shows polling status for TanStack Query surfaces.
 * - Idle: track bar with a light that sweeps left → right → left
 * - Fetching: light pulses in the center of the track
 * - Relative "last updated" text (e.g. "10 seconds ago")
 */

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PollingIndicatorProps {
  /** True while TanStack Query is fetching in the background. */
  isFetching: boolean;
  /** Timestamp (ms) of the last successful fetch — from query.dataUpdatedAt. */
  dataUpdatedAt: number;
  className?: string;
}

function formatLastUpdated(timestamp: number): string {
  if (!timestamp) return "Loading…";

  const secondsAgo = Math.floor((Date.now() - timestamp) / 1000);

  if (secondsAgo < 5) return "just now";
  if (secondsAgo === 1) return "1 second ago";
  if (secondsAgo < 60) return `${secondsAgo} seconds ago`;

  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo === 1) return "1 minute ago";
  if (minutesAgo < 60) return `${minutesAgo} minutes ago`;

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo === 1) return "1 hour ago";
  return `${hoursAgo} hours ago`;
}

export default function PollingIndicator({
  isFetching,
  dataUpdatedAt,
  className = "",
}: PollingIndicatorProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!dataUpdatedAt) return;

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  const lastUpdatedLabel = formatLastUpdated(dataUpdatedAt);

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400",
        className
      )}
      aria-live="polite"
      aria-busy={isFetching}
    >
      <div
        className="relative h-1 w-20 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
        aria-hidden
      >
        {isFetching ? (
          <div className="absolute inset-y-0 w-2/5 rounded-full bg-gradient-to-r from-transparent via-blue-400/95 to-transparent dark:via-blue-300/90 animate-polling-bar-pulse" />
        ) : (
          <div className="absolute inset-y-0 w-2/5 rounded-full bg-gradient-to-r from-transparent via-blue-400/90 to-transparent dark:via-blue-300/80 animate-polling-bar-sweep" />
        )}
      </div>

      <span>
        Last updated{" "}
        <span className="font-medium text-zinc-600 dark:text-zinc-300">
          {lastUpdatedLabel}
        </span>
      </span>
    </div>
  );
}
