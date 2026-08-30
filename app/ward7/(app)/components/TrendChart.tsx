"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { SampleBadge } from "../../components/SampleBadge";

export interface TrendTab {
  key: string;
  label: string;
  sample: boolean;
  /** oldest → newest */
  points: { week: string; value: number }[];
}

const chartConfig: ChartConfig = {
  value: { label: "Signal", color: "var(--chart-1)" },
};

export function TrendChart({ tabs }: { tabs: TrendTab[] }) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              i === active
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {t.label}
          </button>
        ))}
        {tab.sample ? <SampleBadge className="ml-auto" /> : null}
      </div>

      <ChartContainer config={chartConfig} className="aspect-[16/6] w-full">
        <AreaChart data={tab.points} margin={{ left: 4, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="week"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis tickLine={false} axisLine={false} width={36} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="value"
            type="monotone"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#trendFill)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
