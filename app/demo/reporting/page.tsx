"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonLoader } from "@/app/components/ui/skeleton-loader";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import {
  Eye,
  CheckCircle,
  TrendingUp,
  Users,
  Clock,
  MapPin,
  Shield,
  Info,
  ArrowUpRight,
  BarChart3,
  Lightbulb,
  Target,
  MessageSquare,
  Star,
  Copy,
  Download,
  Wallet,
  PlayCircle,
} from "lucide-react";

/**
 * Reporting Demo Page - Clean Rebuild
 * Frontend-only prototype with proper Tailwind spacing
 */

// Mock data - structured to be easily replaceable with real API calls
const MOCK_DATA = {
  "7d": {
    pageVisits: 1247,
    surveyResponses: 892,
    uniqueSessions: 634,
    conversionRate: 71.5,
    engagementActions: 523,
    happinessScore: 82.3,
    happyResponses: 734,
    funnel: [
      { label: "Page Visits", value: 1247, color: "bg-blue-500" },
      { label: "Survey Started", value: 1034, color: "bg-indigo-500" },
      { label: "Survey Completed", value: 892, color: "bg-green-500" },
      { label: "Coupon Code Copied", value: 456, color: "bg-purple-500" },
      { label: "Coupon Downloaded", value: 312, color: "bg-orange-500" },
      { label: "Added to Wallet", value: 189, color: "bg-yellow-500" },
    ],
    sentiment: [
      { label: "Happy", value: 734, percentage: 82.3, color: "bg-green-500" },
      { label: "Neutral", value: 112, percentage: 12.6, color: "bg-yellow-500" },
      { label: "Concerned", value: 46, percentage: 5.1, color: "bg-red-500" },
    ],
    locations: [
      { name: "Downtown Core", responses: 342, sentiment: 85.2 },
      { name: "Waterfront", responses: 289, sentiment: 78.9 },
      { name: "Financial District", responses: 156, sentiment: 81.4 },
      { name: "Entertainment District", responses: 105, sentiment: 79.2 },
    ],
    timeSeries: [
      { date: "2025-01-01", visits: 45, responses: 32 },
      { date: "2025-01-02", visits: 52, responses: 38 },
      { date: "2025-01-03", visits: 48, responses: 35 },
      { date: "2025-01-04", visits: 61, responses: 44 },
      { date: "2025-01-05", visits: 55, responses: 41 },
      { date: "2025-01-06", visits: 67, responses: 48 },
      { date: "2025-01-07", visits: 72, responses: 52 },
    ],
  },
  "30d": {
    pageVisits: 5421,
    surveyResponses: 3892,
    uniqueSessions: 2834,
    conversionRate: 71.8,
    engagementActions: 2123,
    happinessScore: 83.1,
    happyResponses: 3234,
    funnel: [
      { label: "Page Visits", value: 5421, color: "bg-blue-500" },
      { label: "Survey Started", value: 4534, color: "bg-indigo-500" },
      { label: "Survey Completed", value: 3892, color: "bg-green-500" },
      { label: "Coupon Code Copied", value: 1956, color: "bg-purple-500" },
      { label: "Coupon Downloaded", value: 1312, color: "bg-orange-500" },
      { label: "Added to Wallet", value: 789, color: "bg-yellow-500" },
    ],
    sentiment: [
      { label: "Happy", value: 3234, percentage: 83.1, color: "bg-green-500" },
      { label: "Neutral", value: 512, percentage: 13.2, color: "bg-yellow-500" },
      { label: "Concerned", value: 146, percentage: 3.7, color: "bg-red-500" },
    ],
    locations: [
      { name: "Downtown Core", responses: 1542, sentiment: 86.2 },
      { name: "Waterfront", responses: 1289, sentiment: 79.9 },
      { name: "Financial District", responses: 756, sentiment: 82.4 },
      { name: "Entertainment District", responses: 305, sentiment: 80.2 },
    ],
    timeSeries: [
      { date: "2024-12-08", visits: 145, responses: 132 },
      { date: "2024-12-15", visits: 152, responses: 138 },
      { date: "2024-12-22", visits: 148, responses: 135 },
      { date: "2024-12-29", visits: 161, responses: 144 },
      { date: "2025-01-05", visits: 155, responses: 141 },
      { date: "2025-01-12", visits: 167, responses: 148 },
      { date: "2025-01-19", visits: 172, responses: 152 },
    ],
  },
  "90d": {
    pageVisits: 16247,
    surveyResponses: 11892,
    uniqueSessions: 8634,
    conversionRate: 73.2,
    engagementActions: 6523,
    happinessScore: 84.5,
    happyResponses: 10034,
    funnel: [
      { label: "Page Visits", value: 16247, color: "bg-blue-500" },
      { label: "Survey Started", value: 14034, color: "bg-indigo-500" },
      { label: "Survey Completed", value: 11892, color: "bg-green-500" },
      { label: "Coupon Code Copied", value: 5956, color: "bg-purple-500" },
      { label: "Coupon Downloaded", value: 4312, color: "bg-orange-500" },
      { label: "Added to Wallet", value: 2789, color: "bg-yellow-500" },
    ],
    sentiment: [
      { label: "Happy", value: 10034, percentage: 84.5, color: "bg-green-500" },
      { label: "Neutral", value: 1512, percentage: 12.7, color: "bg-yellow-500" },
      { label: "Concerned", value: 346, percentage: 2.8, color: "bg-red-500" },
    ],
    locations: [
      { name: "Downtown Core", responses: 4542, sentiment: 87.2 },
      { name: "Waterfront", responses: 3289, sentiment: 81.9 },
      { name: "Financial District", responses: 2256, sentiment: 83.4 },
      { name: "Entertainment District", responses: 1805, sentiment: 81.2 },
    ],
    timeSeries: [
      { date: "2024-10-20", visits: 445, responses: 332 },
      { date: "2024-11-10", visits: 452, responses: 338 },
      { date: "2024-11-30", visits: 448, responses: 335 },
      { date: "2024-12-20", visits: 461, responses: 344 },
      { date: "2025-01-10", visits: 455, responses: 341 },
      { date: "2025-01-30", visits: 467, responses: 348 },
      { date: "2025-02-19", visits: 472, responses: 352 },
    ],
  },
};

// KPI Card Component
function KPICard({
  icon: Icon,
  label,
  value,
  subtitle,
  color = "text-blue-500",
  isLoading = false,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  subtitle?: string;
  color?: string;
  isLoading?: boolean;
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`h-5 w-5 ${color} shrink-0`} />
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{label}</p>
            </div>
            {isLoading ? (
              <SkeletonLoader height={32} width="60%" className="mb-2" />
            ) : (
              <p className="text-3xl font-bold text-white mb-1">
                {value.toLocaleString()}
              </p>
            )}
            {subtitle && (
              <p className="text-xs text-zinc-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Funnel Chart Component - Professional horizontal bar chart using Recharts
function FunnelChart({ data, isLoading = false }: { data: typeof MOCK_DATA["7d"]["funnel"]; isLoading?: boolean }) {
  // Map funnel data to chart format with icons and colors
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

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-blue-400" />
          User Engagement Funnel
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          User journey through the experience
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <SkeletonLoader height={200} width="100%" />
          </div>
        ) : (
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis 
                    type="number" 
                    domain={[0, maxValue]}
                    tick={{ fill: "#a1a1aa", fontSize: 12 }}
                    axisLine={{ stroke: "#3f3f46" }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={75}
                    tick={{ fill: "#a1a1aa", fontSize: 12 }}
                    axisLine={{ stroke: "#3f3f46" }}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const Icon = data.icon;
                        const percentage = maxValue > 0 ? ((data.value / maxValue) * 100).toFixed(1) : 0;
                        return (
                          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-xl">
                            <div className="flex items-center gap-3 mb-2">
                              <Icon className="h-4 w-4" style={{ color: data.color }} />
                              <p className="font-semibold text-white">{data.name}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-zinc-300">
                                <span className="font-medium">{data.value.toLocaleString()}</span> users
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
                    animationBegin={0}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            {/* Legend with icons and conversion rates */}
            <div className="space-y-2 pt-4 border-t border-zinc-800">
              {chartData.map((item, index) => {
                const Icon = item.icon;
                const previousValue = index > 0 ? chartData[index - 1].value : maxValue;
                const conversionRate = previousValue > 0 ? ((item.value / previousValue) * 100).toFixed(1) : "0";
                const isDropOff = item.value < previousValue;
                
                return (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: item.color }} />
                      <span className="text-white font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-400">{item.value.toLocaleString()}</span>
                      {index > 0 && (
                        <span className={`text-xs font-medium ${isDropOff ? "text-red-400" : "text-green-400"}`}>
                          {isDropOff ? `-${(100 - parseFloat(conversionRate)).toFixed(1)}%` : `${conversionRate}%`}
                        </span>
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
  );
}

// Sentiment Distribution Component
function SentimentDistribution({
  data,
  isLoading = false,
}: {
  data: typeof MOCK_DATA["7d"]["sentiment"];
  isLoading?: boolean;
}) {
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
    percentage: item.percentage,
    color: item.color.replace("bg-", ""),
  }));

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

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-green-400" />
          Sentiment Distribution
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          How people are feeling - Visual breakdown
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <SkeletonLoader height={200} width={200} variant="circular" />
          </div>
        ) : (
          <div className="space-y-5">
            <ChartContainer config={chartConfig} className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.color as keyof typeof COLORS] || entry.color}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-xl">
                            <p className="font-semibold text-white mb-3">{data.name}</p>
                            <p className="text-sm text-zinc-300 flex items-center gap-2">
                              <span>{data.value} responses</span>
                              <span className="text-zinc-500">•</span>
                              <span>{data.percentage}%</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="space-y-3 pt-2">
              {data.map((item, index) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${item.color} shrink-0`}
                    />
                    <span className="text-white font-medium">{item.label}</span>
                  </div>
                  <span className="text-zinc-400">
                    {item.percentage}% ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Location Summary Component
function LocationSummary({
  data,
  isLoading = false,
}: {
  data: typeof MOCK_DATA["7d"]["locations"];
  isLoading?: boolean;
}) {
  const chartData = data.map((loc) => ({
    name: loc.name,
    responses: loc.responses,
    sentiment: loc.sentiment,
  }));

  const chartConfig = {
    responses: { label: "Responses", color: "#8b5cf6" },
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
          <MapPin className="h-6 w-6 text-purple-400" />
          Location Performance
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          Responses and sentiment by location
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <SkeletonLoader height={200} width="100%" />
          </div>
        ) : (
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={55}
                    tick={{ fill: "#a1a1aa", fontSize: 12 }}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-xl">
                            <p className="font-semibold text-white mb-3">{data.name}</p>
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
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              {data.map((location, index) => (
                <div
                  key={location.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span className="text-white font-medium">{location.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      {location.responses}
                    </span>
                    <span className="text-green-400 font-semibold flex items-center gap-2">
                      <Star className="h-3.5 w-3.5 shrink-0" />
                      {location.sentiment}%
                    </span>
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

// Time Series Chart Component
function TimeSeriesChart({
  data,
  isLoading = false,
}: {
  data: typeof MOCK_DATA["7d"]["timeSeries"];
  isLoading?: boolean;
}) {
  const chartData = data.map((day) => {
    const date = new Date(day.date);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      visits: day.visits,
      responses: day.responses,
    };
  });

  const chartConfig = {
    visits: { label: "Page Visits", color: "#3b82f6" },
    responses: { label: "Survey Responses", color: "#22c55e" },
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
          <Clock className="h-6 w-6 text-orange-400" />
          {data.length}-Day Trend
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          Page visits and survey responses over time
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <SkeletonLoader height={200} width="100%" />
          </div>
        ) : (
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
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
                            <p className="text-xs font-medium text-zinc-400 mb-3">{payload[0].payload.date}</p>
                            <div className="space-y-2">
                              {payload.map((entry, index) => (
                                <div key={index} className="flex items-center gap-3">
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
                    strokeWidth={2.5}
                    fill="url(#colorVisits)"
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="responses"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    fill="url(#colorResponses)"
                    animationBegin={300}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex items-center justify-center gap-8 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-blue-500 shrink-0" />
                <span className="text-xs text-zinc-400">Page Visits</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-green-500 shrink-0" />
                <span className="text-xs text-zinc-400">Survey Responses</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReportingDemoPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentData = MOCK_DATA[selectedTimeRange];

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Handle time range transitions
  const handleTimeRangeChange = (range: "7d" | "30d" | "90d") => {
    if (range === selectedTimeRange) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedTimeRange(range);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Data Acquisition & Reporting
            </h1>
            <p className="text-xl text-zinc-300 leading-relaxed">
              See how KinesisIQ transforms real-world interactions into actionable insights
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
              <Shield className="h-4 w-4" />
              <span>All data is anonymized and consent-aware</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Overview Header + KPI Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Section Header */}
            <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">Overview</h2>
                <p className="text-sm text-zinc-400">Real-time metrics and analytics</p>
              </div>
              <div className="flex gap-2">
                {(["7d", "30d", "90d"] as const).map((range) => (
                  <Button
                    key={range}
                    variant={selectedTimeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeRangeChange(range)}
                    disabled={isTransitioning}
                    className={
                      selectedTimeRange === range
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    }
                  >
                    {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
                  </Button>
                ))}
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                icon={Eye}
                label="Page Visits"
                value={currentData.pageVisits}
                subtitle={`${currentData.uniqueSessions.toLocaleString()} unique sessions`}
                color="text-blue-500"
                isLoading={isLoading || isTransitioning}
              />
              <KPICard
                icon={CheckCircle}
                label="Survey Responses"
                value={currentData.surveyResponses}
                subtitle={`${currentData.conversionRate}% conversion rate`}
                color="text-green-500"
                isLoading={isLoading || isTransitioning}
              />
              <KPICard
                icon={TrendingUp}
                label="Happiness Score"
                value={currentData.happinessScore}
                subtitle={`${currentData.happyResponses.toLocaleString()} happy responses`}
                color="text-yellow-500"
                isLoading={isLoading || isTransitioning}
              />
              <KPICard
                icon={Users}
                label="Engagement Actions"
                value={currentData.engagementActions}
                subtitle="Copy, download, wallet"
                color="text-purple-500"
                isLoading={isLoading || isTransitioning}
              />
            </div>
        </div>
      </section>

      {/* Section 2: Charts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="space-y-8">
            {/* Row 1: Funnel and Sentiment */}
            <div className="grid gap-12 lg:grid-cols-2">
              <FunnelChart 
                data={currentData.funnel} 
                isLoading={isLoading || isTransitioning} 
              />
              <SentimentDistribution
                data={currentData.sentiment}
                isLoading={isLoading || isTransitioning}
              />
            </div>
            
            {/* Row 2: Time Series and Location */}
            <div className="grid gap-12 lg:grid-cols-2">
              <TimeSeriesChart 
                data={currentData.timeSeries} 
                isLoading={isLoading || isTransitioning} 
              />
              <LocationSummary 
                data={currentData.locations} 
                isLoading={isLoading || isTransitioning} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: User Feedback */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-3 flex items-center gap-3">
                <MessageSquare className="h-7 w-7 text-blue-400" />
                Recent User Feedback
              </h2>
              <p className="text-sm text-zinc-400">Sample responses and comments from community members</p>
            </div>
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { text: "I feel good about the community here", sentiment: "Happy", date: "2 days ago" },
                    { text: "Toronto has a great music scene", sentiment: "Happy", date: "3 days ago" },
                    { text: "It's beautiful and welcoming", sentiment: "Happy", date: "4 days ago" },
                    { text: "Could use more public spaces", sentiment: "Neutral", date: "5 days ago" },
                    { text: "Love the diversity and culture", sentiment: "Happy", date: "6 days ago" },
                    { text: "Traffic can be challenging", sentiment: "Neutral", date: "1 week ago" },
                  ].map((feedback, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          feedback.sentiment === "Happy" 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {feedback.sentiment}
                        </div>
                        <span className="text-xs text-zinc-500">{feedback.date}</span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed">{feedback.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>
      </section>

      {/* Section 4: Key Insights */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">Key Insights & Recommendations</h2>
              <p className="text-sm text-zinc-400">Actionable insights based on your data</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    <CardTitle className="text-white text-lg">Engagement Opportunity</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-300">
                    Your conversion rate of <strong className="text-white">{currentData.conversionRate}%</strong> is strong. 
                    Consider A/B testing survey questions to further optimize completion rates.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-green-400" />
                    <CardTitle className="text-white text-lg">Sentiment Trend</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-300">
                    <strong className="text-white">{currentData.happinessScore}%</strong> positive sentiment indicates 
                    high satisfaction. Maintain this by continuing to address concerns proactively.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    <CardTitle className="text-white text-lg">Growth Potential</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-300">
                    Engagement actions show room for growth. Consider incentivizing coupon downloads 
                    to increase wallet additions by <strong className="text-white">15-20%</strong>.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
        </div>
      </section>

      {/* Section 5: Data Transparency */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <Info className="h-7 w-7 text-blue-400" />
                  <CardTitle className="text-2xl font-bold text-white">Data Transparency</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-zinc-300">
                  <p>
                    <strong className="text-white">What data is collected:</strong> KinesisIQ
                    collects anonymized interaction data including survey responses, engagement
                    actions, and location-based signals. All data is aggregated and cannot be
                    traced back to individual users.
                  </p>
                  <p>
                    <strong className="text-white">How insights are generated:</strong> Our
                    platform uses probabilistic modeling and machine learning to identify
                    patterns, predict trends, and generate actionable insights from aggregated
                    data streams.
                  </p>
                  <p>
                    <strong className="text-white">Consent & Privacy:</strong> All data
                    collection is consent-aware. Users are informed about data usage and can opt
                    out at any time. We comply with privacy regulations including GDPR and CCPA.
                  </p>
                </div>
              </CardContent>
            </Card>
        </div>
      </section>

      {/* Section 6: CTA */}
      <section className="py-20 bg-zinc-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to see this in action?
            </h2>
            <p className="text-lg text-zinc-400">
              Connect with our team to learn how KinesisIQ can transform your community
              engagement
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button
                asChild
                className="bg-blue-600 text-white hover:bg-blue-700"
                size="lg"
              >
                <a href="/contact">
                  Get Started
                  <ArrowUpRight className="ml-2 h-4 w-4 inline" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <a href="/#what-is-kinesisiq">Learn More</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
