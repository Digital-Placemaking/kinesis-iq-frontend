"use client";

import { Clock, Eye, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SkeletonLoader } from "@/app/components/ui/skeleton-loader";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { TimeSeriesData, TimeRange } from "../types";

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  timeRange: TimeRange;
  isLoading?: boolean;
}

const rangeLabels = {
  "7d": "Daily patterns",
  "30d": "Weekly patterns",
  "90d": "Monthly patterns",
};

const chartConfig = {
  visits: { label: "Page Visits", color: "#3b82f6" },
  responses: { label: "Survey Responses", color: "#22c55e" },
};

export function TimeSeriesChart({
  data,
  timeRange,
  isLoading = false,
}: TimeSeriesChartProps) {
  const chartData = data.map((day) => {
    const date = new Date(day.date);
    let dateLabel: string;

    if (timeRange === "7d") {
      dateLabel = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (timeRange === "30d") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      dateLabel = `Week of ${weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    } else {
      dateLabel = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }

    return {
      date: dateLabel,
      visits: day.visits,
      responses: day.responses,
    };
  });

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
          <Clock className="h-6 w-6 text-orange-400" />
          Emerging Patterns Over Time
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          {rangeLabels[timeRange]} • Page visits and survey responses
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 pb-2 flex flex-col flex-1 min-h-0">
        {isLoading ? (
          <div className="h-48 sm:h-56 lg:h-64 flex items-center justify-center">
            <SkeletonLoader height={200} width="100%" />
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <ChartContainer
              config={chartConfig}
              className="flex-1 min-h-[200px] sm:min-h-[240px] lg:min-h-0"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="colorVisits"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorResponses"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#22c55e"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#a1a1aa", fontSize: 12 }}
                    axisLine={{ stroke: "#3f3f46" }}
                  />
                  <YAxis
                    tick={{ fill: "#a1a1aa", fontSize: 12 }}
                    axisLine={{ stroke: "#3f3f46" }}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-xl">
                            <p className="text-xs font-medium text-zinc-400 mb-3">
                              {payload[0].payload.date}
                            </p>
                            <div className="space-y-2">
                              {payload.map((entry, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3"
                                >
                                  <div
                                    className="h-3 w-3 rounded-full shrink-0"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-sm font-medium text-white flex items-center gap-2">
                                    {entry.name === "visits" ? (
                                      <>
                                        <Eye className="h-3.5 w-3.5" />
                                        <span>{entry.value} visits</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        <span>{entry.value} responses</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#colorVisits)"
                    animationBegin={0}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    isAnimationActive={!isLoading}
                  />
                  <Area
                    type="monotone"
                    dataKey="responses"
                    stroke="#22c55e"
                    strokeWidth={3}
                    fill="url(#colorResponses)"
                    animationBegin={200}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    isAnimationActive={!isLoading}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex items-center justify-center gap-16 pt-2 pb-1 border-t border-zinc-800 mt-auto flex-shrink-0">
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors">
                <div className="h-4 w-4 rounded-full bg-blue-500 shrink-0 ring-2 ring-blue-500/20" />
                <span className="text-sm text-zinc-200 font-semibold">
                  Page Visits
                </span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors">
                <div className="h-4 w-4 rounded-full bg-green-500 shrink-0 ring-2 ring-green-500/20" />
                <span className="text-sm text-zinc-200 font-semibold">
                  Survey Responses
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



