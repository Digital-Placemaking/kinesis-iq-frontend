"use client";

import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SkeletonLoader } from "@/app/components/ui/skeleton-loader";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { SentimentItem } from "../types";

interface SentimentDistributionProps {
  data: SentimentItem[];
  isLoading?: boolean;
}

const COLORS = {
  "green-500": "#22c55e",
  "yellow-500": "#eab308",
  "red-500": "#ef4444",
};

const chartConfig = {
  Happy: { color: "#22c55e" },
  Neutral: { color: "#eab308" },
  Concerned: { color: "#ef4444" },
};

export function SentimentDistribution({
  data,
  isLoading = false,
}: SentimentDistributionProps) {
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
    percentage: item.percentage,
    color: item.color.replace("bg-", ""),
  }));

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm h-full flex flex-col w-full max-w-full">
        <CardHeader className="pb-2 lg:pb-4 flex-shrink-0 px-2.5 lg:px-6">
        <CardTitle className="text-lg lg:text-xl font-bold text-white flex items-center gap-2 lg:gap-3">
          <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-green-400 shrink-0" />
          <span className="truncate">Sentiment Distribution</span>
        </CardTitle>
        <CardDescription className="text-zinc-400 text-xs lg:text-sm">
          How people are feeling • Visual breakdown by sentiment
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex flex-col flex-1 min-h-0 px-2.5 lg:px-6">
        {isLoading ? (
          <div className="h-48 sm:h-56 lg:h-64 flex items-center justify-center">
            <SkeletonLoader height={200} width={200} variant="circular" />
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 space-y-2 lg:space-y-4">
            <div className="relative flex-1 min-h-0 flex items-center justify-center w-full max-w-full overflow-hidden">
              <ChartContainer
                config={chartConfig}
                className="w-full h-full min-h-[200px] sm:min-h-[280px] lg:min-h-[360px] max-w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={3}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            COLORS[entry.color as keyof typeof COLORS] ||
                            entry.color
                          }
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-zinc-800 bg-zinc-900/95 backdrop-blur-sm p-3 shadow-xl z-50">
                              <div className="flex items-center gap-2 mb-2">
                                <div
                                  className="h-3 w-3 rounded-full shrink-0"
                                  style={{
                                    backgroundColor:
                                      COLORS[
                                        data.color as keyof typeof COLORS
                                      ] || data.color,
                                  }}
                                />
                                <p className="font-semibold text-white text-sm">
                                  {data.name}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-white">
                                  {data.value.toLocaleString()} responses
                                </p>
                                <p className="text-xs text-zinc-400">
                                  {data.percentage}% of total
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                      cursor={{ fill: "transparent" }}
                      allowEscapeViewBox={{ x: true, y: true }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {data
                      .reduce((sum, item) => sum + item.value, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">Total Responses</p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 lg:space-y-2.5 pt-2 flex-shrink-0">
              {data.map((item) => {
                const ringColorMap: Record<string, string> = {
                  "bg-green-500": "ring-green-500/20",
                  "bg-yellow-500": "ring-yellow-500/20",
                  "bg-red-500": "ring-red-500/20",
                };
                const ringColor =
                  ringColorMap[item.color] || "ring-zinc-500/20";

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-2 lg:py-3.5 px-2 lg:px-3 rounded-lg bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 lg:gap-3 min-w-0 flex-1">
                      <div
                        className={`h-3 w-3 lg:h-4 lg:w-4 rounded-full ${item.color} shrink-0 ring-2 ${ringColor}`}
                      />
                      <span className="text-white font-semibold text-xs lg:text-sm truncate">
                        {item.label}
                      </span>
                      <span className="text-zinc-400 font-medium text-xs lg:text-sm">
                        {item.percentage}%
                      </span>
                    </div>
                    <span className="text-lg lg:text-2xl font-bold text-zinc-500/60 shrink-0 ml-2">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



