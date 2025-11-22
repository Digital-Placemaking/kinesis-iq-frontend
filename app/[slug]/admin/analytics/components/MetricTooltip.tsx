"use client";

import { useState } from "react";
import { Info } from "lucide-react";

interface MetricTooltipProps {
  description: string;
}

/**
 * Metric Tooltip Component
 * Displays an info icon that shows a tooltip on hover/click
 */
export default function MetricTooltip({ description }: MetricTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        aria-label="Metric information"
      >
        <Info className="h-3 w-3 sm:h-4 sm:w-4" />
      </button>
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 z-10 w-48 sm:w-64 rounded-lg border border-zinc-200 bg-white p-2 text-xs shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-700 dark:text-zinc-300">{description}</p>
          <div className="absolute left-3 top-full h-0 w-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-200 dark:border-t-zinc-800" />
        </div>
      )}
    </div>
  );
}
