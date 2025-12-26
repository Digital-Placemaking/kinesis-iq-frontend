"use client";

import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  CheckCircle,
  Copy,
  Download,
  Wallet,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  PieChart,
  MapPin,
  Shield,
  Info,
} from "lucide-react";

/**
 * Reporting Demo Page
 * Frontend-only prototype demonstrating KinesisIQ's data acquisition and reporting capabilities
 * Uses mocked data to showcase the analytics experience
 */

// Mock data - structured to be easily replaceable with real API calls
const MOCK_OVERVIEW_DATA = {
  pageVisits: 1247,
  surveyResponses: 892,
  uniqueSessions: 634,
  conversionRate: 71.5,
  engagementActions: 523,
  happinessScore: 82.3,
  happyResponses: 734,
};

const MOCK_FUNNEL_DATA = [
  { label: "Page Visits", value: 1247, color: "bg-blue-500" },
  { label: "Survey Started", value: 1034, color: "bg-indigo-500" },
  { label: "Survey Completed", value: 892, color: "bg-green-500" },
  { label: "Coupon Code Copied", value: 456, color: "bg-purple-500" },
  { label: "Coupon Downloaded", value: 312, color: "bg-orange-500" },
  { label: "Added to Wallet", value: 189, color: "bg-yellow-500" },
];

const MOCK_SENTIMENT_DATA = [
  { label: "Happy", value: 734, percentage: 82.3, color: "bg-green-500" },
  { label: "Neutral", value: 112, percentage: 12.6, color: "bg-yellow-500" },
  { label: "Concerned", value: 46, percentage: 5.1, color: "bg-red-500" },
];

const MOCK_LOCATION_DATA = [
  { name: "Downtown Core", responses: 342, sentiment: 85.2 },
  { name: "Waterfront", responses: 289, sentiment: 78.9 },
  { name: "Financial District", responses: 156, sentiment: 81.4 },
  { name: "Entertainment District", responses: 105, sentiment: 79.2 },
];

const MOCK_TIME_SERIES = [
  { date: "2025-01-01", visits: 45, responses: 32 },
  { date: "2025-01-02", visits: 52, responses: 38 },
  { date: "2025-01-03", visits: 48, responses: 35 },
  { date: "2025-01-04", visits: 61, responses: 44 },
  { date: "2025-01-05", visits: 55, responses: 41 },
  { date: "2025-01-06", visits: 67, responses: 48 },
  { date: "2025-01-07", visits: 72, responses: 52 },
];

function KPICard({
  icon: Icon,
  label,
  value,
  subtitle,
  color = "text-blue-500",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${color} shrink-0`} />
              <p className="text-xs text-zinc-400">{label}</p>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subtitle && (
              <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FunnelChart({ data }: { data: typeof MOCK_FUNNEL_DATA }) {
  const maxValue = Math.max(...data.map((step) => step.value));

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-white">User Engagement Funnel</CardTitle>
        <CardDescription className="text-zinc-400">
          User journey through the experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((step, index) => {
            const percentage = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
            return (
              <div key={index}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {step.label}
                  </span>
                  <span className="text-sm text-zinc-400">{step.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full ${step.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SentimentDistribution({ data }: { data: typeof MOCK_SENTIMENT_DATA }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-white">Sentiment Distribution</CardTitle>
        <CardDescription className="text-zinc-400">
          How people are feeling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div key={index}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {item.label}
                  </span>
                  <span className="text-sm text-zinc-400">
                    {item.percentage}% ({item.value})
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function LocationSummary({ data }: { data: typeof MOCK_LOCATION_DATA }) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-white">Location Performance</CardTitle>
        <CardDescription className="text-zinc-400">
          Responses and sentiment by location
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((location, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-zinc-800 p-4"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-zinc-400" />
                <div>
                  <p className="font-medium text-white">{location.name}</p>
                  <p className="text-xs text-zinc-400">
                    {location.responses} responses
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-400">
                  {location.sentiment}%
                </p>
                <p className="text-xs text-zinc-400">sentiment</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TimeSeriesChart({ data }: { data: typeof MOCK_TIME_SERIES }) {
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.visits, d.responses))
  );

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-white">7-Day Trend</CardTitle>
        <CardDescription className="text-zinc-400">
          Page visits and survey responses over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((day, index) => {
            const visitPercentage =
              maxValue > 0 ? (day.visits / maxValue) * 100 : 0;
            const responsePercentage =
              maxValue > 0 ? (day.responses / maxValue) * 100 : 0;
            const date = new Date(day.date);
            const dateLabel = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            return (
              <div key={index} className="space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <span className="text-zinc-400 font-medium">{dateLabel}</span>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="text-zinc-400">
                      <span className="text-blue-400">{day.visits}</span> visits
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400">
                      <span className="text-green-400">{day.responses}</span> responses
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-blue-400">Visits</span>
                      <span className="text-zinc-400">{day.visits}</span>
                    </div>
                    <div className="h-6 sm:h-8 w-full overflow-hidden rounded bg-zinc-800">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${visitPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-green-400">Responses</span>
                      <span className="text-zinc-400">{day.responses}</span>
                    </div>
                    <div className="h-6 sm:h-8 w-full overflow-hidden rounded bg-zinc-800">
                      <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${responsePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportingDemoPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Data Acquisition & Reporting
            </h1>
            <p className="text-xl text-zinc-300 leading-relaxed">
              See how KinesisIQ transforms real-world interactions into actionable
              insights
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
              <Shield className="h-4 w-4" />
              <span>All data is anonymized and consent-aware</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Time Range Selector */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Overview</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Real-time metrics and analytics
              </p>
            </div>
            <div className="flex gap-2">
              {(["7d", "30d", "90d"] as const).map((range) => (
                <Button
                  key={range}
                  variant={selectedTimeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeRange(range)}
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

          {/* KPI Cards */}
          <div className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              icon={Eye}
              label="Page Visits"
              value={MOCK_OVERVIEW_DATA.pageVisits.toLocaleString()}
              subtitle={`${MOCK_OVERVIEW_DATA.uniqueSessions} unique sessions`}
              color="text-blue-500"
            />
            <KPICard
              icon={CheckCircle}
              label="Survey Responses"
              value={MOCK_OVERVIEW_DATA.surveyResponses.toLocaleString()}
              subtitle={`${MOCK_OVERVIEW_DATA.conversionRate}% conversion rate`}
              color="text-green-500"
            />
            <KPICard
              icon={TrendingUp}
              label="Happiness Score"
              value={`${MOCK_OVERVIEW_DATA.happinessScore}%`}
              subtitle={`${MOCK_OVERVIEW_DATA.happyResponses} happy responses`}
              color="text-yellow-500"
            />
            <KPICard
              icon={Users}
              label="Engagement Actions"
              value={MOCK_OVERVIEW_DATA.engagementActions.toLocaleString()}
              subtitle="Copy, download, wallet"
              color="text-purple-500"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <FunnelChart data={MOCK_FUNNEL_DATA} />
            <SentimentDistribution data={MOCK_SENTIMENT_DATA} />
            <TimeSeriesChart data={MOCK_TIME_SERIES} />
            <LocationSummary data={MOCK_LOCATION_DATA} />
          </div>

          {/* Data Transparency Section */}
          <Card className="mt-8 border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-white">Data Transparency</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-zinc-300">
                <p>
                  <strong className="text-white">What data is collected:</strong>{" "}
                  KinesisIQ collects anonymized interaction data including survey
                  responses, engagement actions, and location-based signals. All
                  data is aggregated and cannot be traced back to individual users.
                </p>
                <p>
                  <strong className="text-white">How insights are generated:</strong>{" "}
                  Our platform uses probabilistic modeling and machine learning to
                  identify patterns, predict trends, and generate actionable
                  insights from aggregated data streams.
                </p>
                <p>
                  <strong className="text-white">Consent & Privacy:</strong>{" "}
                  All data collection is consent-aware. Users are informed about
                  data usage and can opt out at any time. We comply with privacy
                  regulations including GDPR and CCPA.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to see this in action?
            </h3>
            <p className="text-zinc-400 mb-6">
              Connect with our team to learn how KinesisIQ can transform your
              community engagement
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                asChild
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <a href="/contact">Get Started</a>
              </Button>
              <Button
                asChild
                variant="outline"
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

