/**
 * app/[slug]/admin/components/DashboardKPICards.tsx
 * KPI Cards for Community Pulse Dashboard
 * Displays key performance indicators in a grid layout
 */

"use client";

import { Users, TrendingUp, Eye, Clock, List } from "lucide-react";
import Card from "@/app/components/ui/Card";

interface DashboardKPICardsProps {
  totalResponses: number;
  uniqueSessions: number;
  happinessScore: number;
  happyResponses: number;
  pageVisits: number;
  conversionRate: number;
  engagement: number;
  topCoupon: {
    name: string;
    count: number;
  } | null;
}

export default function DashboardKPICards({
  totalResponses,
  uniqueSessions,
  happinessScore,
  happyResponses,
  pageVisits,
  conversionRate,
  engagement,
  topCoupon,
}: DashboardKPICardsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
      {/* Total Responses */}
      <Card className="p-4" variant="elevated">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-zinc-600 dark:text-zinc-400 shrink-0" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Total Responses
              </p>
            </div>
            <p className="text-2xl font-bold text-black dark:text-zinc-50">
              {totalResponses}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              From {uniqueSessions} unique sessions
            </p>
          </div>
        </div>
      </Card>

      {/* Happiness Score */}
      <Card className="p-4" variant="elevated">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-zinc-600 dark:text-zinc-400 shrink-0" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Happiness Score
              </p>
            </div>
            <p className="text-2xl font-bold text-black dark:text-zinc-50">
              {happinessScore.toFixed(1)}%
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {happyResponses} happy responses
            </p>
          </div>
        </div>
      </Card>

      {/* Page Visits */}
      <Card className="p-4" variant="elevated">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-zinc-600 dark:text-zinc-400 shrink-0" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Page Visits
              </p>
            </div>
            <p className="text-2xl font-bold text-black dark:text-zinc-50">
              {pageVisits}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {conversionRate.toFixed(1)}% conversion rate
            </p>
          </div>
        </div>
      </Card>

      {/* Engagement */}
      <Card className="p-4" variant="elevated">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-zinc-600 dark:text-zinc-400 shrink-0" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Engagement
              </p>
            </div>
            <p className="text-2xl font-bold text-black dark:text-zinc-50">
              {engagement}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Copy/download actions
            </p>
          </div>
        </div>
      </Card>

      {/* Top Coupons */}
      <Card className="p-4" variant="elevated">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <List className="h-4 w-4 text-zinc-600 dark:text-zinc-400 shrink-0" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Top Coupons
              </p>
            </div>
            {topCoupon ? (
              <>
                <p className="text-lg font-bold text-black dark:text-zinc-50 truncate">
                  {topCoupon.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {topCoupon.count} issued
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-zinc-400 dark:text-zinc-500">
                  No coupons yet
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Create your first coupon
                </p>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
