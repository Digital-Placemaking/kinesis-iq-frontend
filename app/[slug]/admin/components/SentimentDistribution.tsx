/**
 * app/[slug]/admin/components/SentimentDistribution.tsx
 * Sentiment Distribution Donut Chart Component
 * Displays sentiment distribution as a donut chart
 */

"use client";

import { useMemo } from "react";

interface SentimentDistributionProps {
  happy: number;
  neutral: number;
  concerned: number;
}

export default function SentimentDistribution({
  happy,
  neutral,
  concerned,
}: SentimentDistributionProps) {
  const total = happy + neutral + concerned;

  const segments = useMemo(() => {
    if (total === 0) {
      return [];
    }

    const result: Array<{
      label: string;
      value: number;
      percent: number;
      color: string;
      offset: number;
    }> = [];
    let currentOffset = 0;

    const push = (
      label: string,
      value: number,
      color: string
    ) => {
      if (value <= 0) return;
      const percent = (value / total) * 100;
      result.push({
        label,
        value,
        percent,
        color,
        offset: currentOffset,
      });
      currentOffset += percent;
    };

    push("Happy", happy, "rgb(34, 197, 94)"); // green-500
    push("Neutral", neutral, "rgb(59, 130, 246)"); // blue-500
    push("Concerned", concerned, "rgb(239, 68, 68)"); // red-500

    return result;
  }, [happy, neutral, concerned, total]);

  const size = 280;
  const strokeWidth = 40;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgb(229, 231, 235)" // gray-200
            strokeWidth={strokeWidth}
            className="dark:stroke-zinc-800"
          />
          {/* Segments — butt caps so adjacent arcs don't overlap */}
          {segments.map((segment) => {
            const segmentLength = (segment.percent / 100) * circumference;
            const gap = circumference - segmentLength;
            const dashOffset = -((segment.offset / 100) * circumference);

            return (
              <circle
                key={segment.label}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segmentLength} ${gap}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-black dark:text-zinc-50">
            {total}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Responses
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {total === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No sentiment responses yet. Add a Sentiment, NPS, Likert, or Rating
            question to start tracking.
          </p>
        ) : (
          segments.map((segment) => (
            <div key={segment.label} className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm font-medium text-black dark:text-zinc-50">
                {segment.label}: {segment.value}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
