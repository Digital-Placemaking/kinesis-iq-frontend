"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonLoader } from "@/app/components/ui/skeleton-loader";
import { LiveNumber } from "@/app/components/ui/live-number";
import type { TrendDirection } from "../types";

interface KPICardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  subtitle?: string;
  color?: string;
  isLoading?: boolean;
  trend?: TrendDirection;
  trendValue?: number;
}

export function KPICard({
  icon: Icon,
  label,
  value,
  subtitle,
  color = "text-blue-500",
  isLoading = false,
  trend,
  trendValue,
}: KPICardProps) {
  const isDecimal = label === "Happiness Score" || label === "Conversion Rate";

  const bgColorMap: Record<string, string> = {
    "text-blue-500": "bg-blue-500/10",
    "text-green-500": "bg-green-500/10",
    "text-yellow-500": "bg-yellow-500/10",
    "text-purple-500": "bg-purple-500/10",
    "text-orange-500": "bg-orange-500/10",
    "text-red-500": "bg-red-500/10",
  };

  const bgColor = bgColorMap[color] || "bg-blue-500/10";

  const getBoxShadow = () => {
    if (color === "text-blue-500")
      return "0 10px 40px -10px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.1)";
    if (color === "text-green-500")
      return "0 10px 40px -10px rgba(34, 197, 94, 0.2), 0 0 0 1px rgba(34, 197, 94, 0.1)";
    if (color === "text-yellow-500")
      return "0 10px 40px -10px rgba(234, 179, 8, 0.2), 0 0 0 1px rgba(234, 179, 8, 0.1)";
    if (color === "text-purple-500")
      return "0 10px 40px -10px rgba(168, 85, 247, 0.2), 0 0 0 1px rgba(168, 85, 247, 0.1)";
    return "0 10px 40px -10px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.1)";
  };

  const getShimmerGradient = () => {
    if (color === "text-blue-500")
      return "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.12) 50%, transparent 100%)";
    if (color === "text-green-500")
      return "linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.12) 50%, transparent 100%)";
    if (color === "text-yellow-500")
      return "linear-gradient(90deg, transparent 0%, rgba(234, 179, 8, 0.12) 50%, transparent 100%)";
    if (color === "text-purple-500")
      return "linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.12) 50%, transparent 100%)";
    return "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.12) 50%, transparent 100%)";
  };

  const getGlowGradient = () => {
    if (color === "text-blue-500")
      return "radial-gradient(circle at center, rgba(59, 130, 246, 0.05), transparent 70%)";
    if (color === "text-green-500")
      return "radial-gradient(circle at center, rgba(34, 197, 94, 0.05), transparent 70%)";
    if (color === "text-yellow-500")
      return "radial-gradient(circle at center, rgba(234, 179, 8, 0.05), transparent 70%)";
    if (color === "text-purple-500")
      return "radial-gradient(circle at center, rgba(168, 85, 247, 0.05), transparent 70%)";
    return "radial-gradient(circle at center, rgba(59, 130, 246, 0.05), transparent 70%)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <Card
        className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/70 transition-all backdrop-blur-sm group relative overflow-hidden shadow-lg hover:shadow-xl"
        style={{ boxShadow: getBoxShadow() }}
      >
        {!isLoading && (
          <>
            <motion.div
              className="absolute inset-0 pointer-events-none z-0"
              style={{ background: getShimmerGradient() }}
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 5,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background: getGlowGradient(),
                opacity: 0.5,
              }}
            />
          </>
        )}
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  className={`inline-flex items-center justify-center p-2.5 rounded-xl ${bgColor}`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className={`h-5 w-5 ${color} shrink-0`} />
                </motion.div>
                <p className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
                  {label}
                </p>
              </div>
              {isLoading ? (
                <SkeletonLoader height={40} width="60%" className="mb-2" />
              ) : (
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-4xl font-bold text-white">
                    {isDecimal ? (
                      <LiveNumber
                        value={value}
                        decimals={1}
                        updateInterval={4000}
                        variance={0.01}
                      />
                    ) : (
                      <LiveNumber
                        value={value}
                        updateInterval={4000}
                        variance={0.01}
                      />
                    )}
                    {isDecimal && <span className="text-2xl">%</span>}
                  </p>
                  {trend && trendValue && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className={`flex items-center gap-1.5 text-sm font-semibold ${
                        trend === "up"
                          ? "text-green-400"
                          : trend === "down"
                          ? "text-red-400"
                          : "text-zinc-400"
                      }`}
                    >
                      {trend === "up" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : trend === "down" ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : null}
                      <span>{Math.abs(trendValue)}%</span>
                    </motion.div>
                  )}
                </div>
              )}
              {subtitle && (
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}



