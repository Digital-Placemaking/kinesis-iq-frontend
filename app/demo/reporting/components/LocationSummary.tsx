"use client";

import { MapPin, Users, Star } from "lucide-react";
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
} from "recharts";
import type { Location } from "../types";

interface LocationSummaryProps {
  data: Location[];
  isLoading?: boolean;
}

const chartConfig = {
  responses: { label: "Responses", color: "#8b5cf6" },
};

export function LocationSummary({
  data,
  isLoading = false,
}: LocationSummaryProps) {
  const chartData = data.map((loc) => ({
    name: loc.name,
    responses: loc.responses,
    sentiment: loc.sentiment,
  }));

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
          <MapPin className="h-6 w-6 text-purple-400" />
          Location Performance
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          Responses and sentiment by location • Top performing areas
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex flex-col flex-1 min-h-0">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <SkeletonLoader height={200} width="100%" />
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 space-y-2.5">
            <div className="h-40">
              <ChartContainer config={chartConfig} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 45, bottom: 5 }}
                    barCategoryGap="12%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={45}
                      tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      tickMargin={3}
                      interval={0}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-xl">
                              <p className="font-semibold text-white mb-3">
                                {data.name}
                              </p>
                              <div className="space-y-2">
                                <p className="text-sm text-zinc-300 flex items-center gap-2">
                                  <Users className="h-3.5 w-3.5 text-zinc-400" />
                                  <span>{data.responses} responses</span>
                                </p>
                                <p className="text-sm text-green-400 flex items-center gap-2">
                                  <Star className="h-3.5 w-3.5" />
                                  <span>{data.sentiment}% sentiment</span>
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="responses"
                      fill="#8b5cf6"
                      radius={[0, 4, 4, 0]}
                      animationBegin={0}
                      animationDuration={1200}
                      animationEasing="ease-out"
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="space-y-2 pt-2.5 border-t border-zinc-800 flex-shrink-0">
              {data.map((location) => (
                <div
                  key={location.name}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <MapPin className="h-4 w-4 text-purple-400 shrink-0" />
                    <span className="text-white font-semibold text-sm truncate">
                      {location.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-3">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="text-zinc-300 font-medium text-sm whitespace-nowrap">
                        {location.responses.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-green-400 shrink-0" />
                      <span className="text-green-400 font-bold text-sm whitespace-nowrap">
                        {location.sentiment}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



