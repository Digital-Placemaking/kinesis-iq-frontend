"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Eye,
  PlayCircle,
  CheckCircle,
  Copy,
  Download,
  Wallet,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import type { FunnelStep } from "../types";

interface FunnelChartProps {
  data: FunnelStep[];
  isLoading?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  "Page Visits": Eye,
  "Survey Started": PlayCircle,
  "Survey Completed": CheckCircle,
  "Coupon Code Copied": Copy,
  "Coupon Downloaded": Download,
  "Added to Wallet": Wallet,
};

const colorMap: Record<string, string> = {
  "Page Visits": "#3b82f6",
  "Survey Started": "#6366f1",
  "Survey Completed": "#22c55e",
  "Coupon Code Copied": "#a855f7",
  "Coupon Downloaded": "#f97316",
  "Added to Wallet": "#eab308",
};

export function FunnelChart({ data, isLoading = false }: FunnelChartProps) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  const chartData = data.map((step) => ({
    name: step.label,
    value: step.value,
    color: colorMap[step.label] || "#3b82f6",
    icon: iconMap[step.label] || BarChart3,
  }));

  const chartConfig = {
    value: { label: "Users", color: "#3b82f6" },
  };

  const maxValue = Math.max(...data.map((step) => step.value));

  const getConversionColor = (rate: number) => {
    if (rate >= 80) return "text-green-400";
    if (rate >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getConversionBg = (rate: number) => {
    if (rate >= 80) return "bg-green-500/10 border-green-500/20";
    if (rate >= 50) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            User Engagement Funnel
          </CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            User journey through the experience • Conversion rates shown
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <div className="h-64 lg:h-96 flex items-center justify-center">
              <SkeletonLoader height={200} width="100%" />
            </div>
          ) : (
            <div className="space-y-4">
              <ChartContainer config={chartConfig} className="h-64 sm:h-80 lg:h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    barCategoryGap="10%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis
                      type="number"
                      domain={[0, maxValue]}
                      tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      axisLine={{ stroke: "#3f3f46" }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const Icon = data.icon;
                          const percentage =
                            maxValue > 0
                              ? ((data.value / maxValue) * 100).toFixed(1)
                              : 0;
                          return (
                            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-xl">
                              <div className="flex items-center gap-3 mb-2">
                                <Icon
                                  className="h-4 w-4"
                                  style={{ color: data.color }}
                                />
                                <p className="font-semibold text-white">
                                  {data.name}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-zinc-300">
                                  <span className="font-medium">
                                    {data.value.toLocaleString()}
                                  </span>{" "}
                                  users
                                </p>
                                <p className="text-xs text-zinc-400">
                                  {percentage}% of initial visits
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 4, 4, 0]}
                      animationBegin={isInView ? 400 : 0}
                      animationDuration={1000}
                      animationEasing="ease-out"
                      isAnimationActive={isInView && !isLoading}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              <div className="space-y-1.5 pt-4 border-t border-zinc-800">
                {chartData.map((item, index) => {
                  const Icon = item.icon;
                  const previousValue =
                    index > 0 ? chartData[index - 1].value : maxValue;
                  const conversionRate =
                    previousValue > 0
                      ? ((item.value / previousValue) * 100).toFixed(1)
                      : "0";

                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <Icon
                          className="h-4 w-4 shrink-0"
                          style={{ color: item.color }}
                        />
                        <span className="text-white font-medium text-sm truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <span className="text-zinc-300 font-semibold text-sm min-w-[50px] sm:min-w-[60px] text-right">
                          {item.value.toLocaleString()}
                        </span>
                        {index > 0 && (
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${getConversionBg(
                              parseFloat(conversionRate)
                            )}`}
                          >
                            {parseFloat(conversionRate) >= 80 ? (
                              <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                            ) : parseFloat(conversionRate) >= 50 ? (
                              <TrendingUp className="h-3.5 w-3.5 text-yellow-400" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                            )}
                            <span
                              className={`text-xs font-semibold ${getConversionColor(
                                parseFloat(conversionRate)
                              )}`}
                            >
                              {conversionRate}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}



