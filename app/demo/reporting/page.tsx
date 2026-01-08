"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/app/components/ui/scroll-reveal";
import {
  Eye,
  CheckCircle,
  TrendingUp,
  Users,
  Shield,
  Info,
  ArrowUpRight,
  MessageSquare,
  Zap,
  Lightbulb,
  Brain,
  Download,
  Activity,
  Target,
} from "lucide-react";
import { MOCK_DATA } from "./mock-data";
import { KPICard } from "./components/KPICard";
import { FunnelChart } from "./components/FunnelChart";
import { SentimentDistribution } from "./components/SentimentDistribution";
import { LocationSummary } from "./components/LocationSummary";
import { TimeSeriesChart } from "./components/TimeSeriesChart";
import { SignalsCarousel } from "./components/SignalsCarousel";
import { InsightsCarousel } from "./components/InsightsCarousel";
import { LearningCard } from "./components/LearningCard";
import { FeedbackCarousel } from "./components/FeedbackCarousel";
import type { TimeRange } from "./types";

export default function ReportingDemoPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentData = MOCK_DATA[selectedTimeRange];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleTimeRangeChange = (range: TimeRange) => {
    if (range === selectedTimeRange) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedTimeRange(range);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute top-3/4 -right-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <section className="relative border-b border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 py-12 sm:py-16 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center space-y-5 sm:space-y-6">
              {/* KinesisIQ Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.1,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex justify-center mb-2 sm:mb-4"
              >
                <Link
                  href="/"
                  className="flex items-center hover:opacity-80 transition-all duration-300 hover:scale-105"
                  aria-label="KinesisIQ Home"
                >
                  <img
                    src="/KiQ Quantum Logo Final Black Circle Transparent.png"
                    alt="KinesisIQ"
                    className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain drop-shadow-lg"
                  />
                </Link>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight"
              >
                Community Intelligence Dashboard
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-base sm:text-lg lg:text-xl text-zinc-300 leading-relaxed max-w-3xl mx-auto"
              >
                See how KinesisIQ transforms real-world interactions into
                actionable signals and emerging patterns
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex items-center justify-center gap-2.5 text-sm sm:text-base text-zinc-400 pt-1"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut",
                  }}
                >
                  <Shield className="h-5 w-5 text-blue-400" />
                </motion.div>
                <span> All data is anonymized and consent-aware</span>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <ScrollReveal>
            <div className="mb-8 sm:mb-12 lg:mb-16 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
                  Overview
                </h2>
                <p className="text-base text-zinc-400 mb-6">
                  Real-time metrics and analytics •{" "}
                  {selectedTimeRange === "7d"
                    ? "Last 7 days"
                    : selectedTimeRange === "30d"
                    ? "Last 30 days"
                    : "Last 90 days"}
                </p>
              </div>
              <div className="flex gap-2">
                {(["7d", "30d", "90d"] as const).map((range) => (
                  <Button
                    key={range}
                    variant={
                      selectedTimeRange === range ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleTimeRangeChange(range)}
                    disabled={isTransitioning}
                    className={
                      selectedTimeRange === range
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    }
                  >
                    {range === "7d"
                      ? "7 Days"
                      : range === "30d"
                      ? "30 Days"
                      : "90 Days"}
                  </Button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              icon={Eye}
              label="Page Visits"
              value={currentData.pageVisits}
              subtitle={`From ${currentData.uniqueSessions.toLocaleString()} unique ${
                currentData.uniqueSessions === 1 ? "session" : "sessions"
              }`}
              color="text-blue-500"
              isLoading={isLoading || isTransitioning}
              trend={currentData.trends.pageVisits.direction}
              trendValue={currentData.trends.pageVisits.value}
            />
            <KPICard
              icon={CheckCircle}
              label="Survey Responses"
              value={currentData.surveyResponses}
              subtitle={`${currentData.conversionRate}% of visitors completed surveys`}
              color="text-green-500"
              isLoading={isLoading || isTransitioning}
              trend={currentData.trends.surveyResponses.direction}
              trendValue={currentData.trends.surveyResponses.value}
            />
            <KPICard
              icon={TrendingUp}
              label="Happiness Score"
              value={currentData.happinessScore}
              subtitle={`${currentData.happyResponses.toLocaleString()} positive ${
                currentData.happyResponses === 1 ? "response" : "responses"
              } recorded`}
              color="text-yellow-500"
              isLoading={isLoading || isTransitioning}
              trend={currentData.trends.happinessScore.direction}
              trendValue={currentData.trends.happinessScore.value}
            />
            <KPICard
              icon={Users}
              label="Engagement Actions"
              value={currentData.engagementActions}
              subtitle={`Copy, download, and wallet actions`}
              color="text-purple-500"
              isLoading={isLoading || isTransitioning}
              trend={currentData.trends.engagementActions.direction}
              trendValue={currentData.trends.engagementActions.value}
            />
          </div>
        </div>
      </section>

      <section className="relative py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <ScrollReveal>
            <div className="mb-8 sm:mb-12 mt-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
                Analytics & Emerging Patterns
              </h2>
              <p className="text-base text-zinc-400 mb-6">
                Engagement patterns and performance signals •{" "}
                {selectedTimeRange === "7d"
                  ? "7-day view"
                  : selectedTimeRange === "30d"
                  ? "30-day view"
                  : "90-day view"}
              </p>
            </div>
          </ScrollReveal>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTimeRange}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="grid gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-2">
                <ScrollReveal delay={0.1}>
                  <FunnelChart
                    data={currentData.funnel}
                    isLoading={isLoading || isTransitioning}
                  />
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <SentimentDistribution
                    data={currentData.sentiment}
                    isLoading={isLoading || isTransitioning}
                  />
                </ScrollReveal>
              </div>

              <div className="grid gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-2">
                <ScrollReveal delay={0.3}>
                  <TimeSeriesChart
                    data={currentData.timeSeries}
                    timeRange={selectedTimeRange}
                    isLoading={isLoading || isTransitioning}
                  />
                </ScrollReveal>
                <ScrollReveal delay={0.4}>
                  <LocationSummary
                    data={currentData.locations}
                    isLoading={isLoading || isTransitioning}
                  />
                </ScrollReveal>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="relative py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <ScrollReveal>
            <div className="mb-8 sm:mb-12 mt-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-blue-400" />
                Recent User Feedback
              </h2>
              <p className="text-base text-zinc-400 mb-6">
                Sample responses and comments from community members •{" "}
                {selectedTimeRange === "7d"
                  ? "This week"
                  : selectedTimeRange === "30d"
                  ? "This month"
                  : "This quarter"}
              </p>
            </div>
          </ScrollReveal>
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <FeedbackCarousel />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="relative py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <ScrollReveal>
            <div className="mb-8 sm:mb-12 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="p-2 rounded-lg bg-blue-500/10"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-blue-400" />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  Signals Detected
                </h2>
              </div>
              <p className="text-base text-zinc-400 max-w-3xl mb-6">
                Early signals and emerging patterns identified from aggregated
                data • These inputs feed future intelligence layers •{" "}
                {selectedTimeRange === "7d"
                  ? "7-day analysis"
                  : selectedTimeRange === "30d"
                  ? "30-day analysis"
                  : "90-day analysis"}
              </p>
            </div>
          </ScrollReveal>
          <SignalsCarousel
            currentData={currentData}
            selectedTimeRange={selectedTimeRange}
            isLoading={isLoading || isTransitioning}
          />
        </div>
      </section>

      <section className="relative py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <ScrollReveal>
            <div className="mb-8 sm:mb-12 mt-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <motion.div
                  className="p-2 sm:p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30 relative"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut",
                  }}
                >
                  <div className="absolute inset-0 bg-yellow-500/20 rounded-xl blur-sm" />
                  <div className="absolute inset-0 bg-yellow-400/10 rounded-xl blur-md" />
                  <Lightbulb
                    className="h-6 w-6 sm:h-8 sm:w-8 relative z-10"
                    style={{
                      color: "#facc15",
                      filter: "drop-shadow(0 0 8px rgba(250, 204, 21, 0.8))",
                    }}
                  />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  Early Signals & Recommendations
                </h2>
              </div>
              <p className="text-base text-zinc-400 max-w-3xl mb-6">
                Early signals identified from aggregated data patterns • These
                inputs feed future intelligence layers • Based on{" "}
                {selectedTimeRange === "7d"
                  ? "7-day"
                  : selectedTimeRange === "30d"
                  ? "30-day"
                  : "90-day"}{" "}
                data patterns
              </p>
            </div>
          </ScrollReveal>
          <InsightsCarousel currentData={currentData} />
        </div>
      </section>

      <section className="relative py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <ScrollReveal>
            <div className="mb-8 sm:mb-12 mt-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <motion.div
                  className="p-2 sm:p-3 rounded-xl bg-purple-500/15 border border-purple-500/20 relative"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut",
                  }}
                >
                  <div className="absolute inset-0 bg-purple-500/10 rounded-xl blur-sm" />
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-purple-300 relative z-10" />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  What KinesisIQ Learns From Your Data
                </h2>
              </div>
              <p className="text-base text-zinc-400 max-w-3xl mb-6">
                Early signals and patterns derived from aggregated data • These
                inputs support future intelligence layers •{" "}
                {selectedTimeRange === "7d"
                  ? "7-day"
                  : selectedTimeRange === "30d"
                  ? "30-day"
                  : "90-day"}{" "}
                analysis
              </p>
            </div>
          </ScrollReveal>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <LearningCard
              icon={MessageSquare}
              title="Survey Optimization"
              description={`${currentData.surveyResponses.toLocaleString()} responses show `}
              highlight="sentiment-based"
              highlightValue="15% higher"
              descriptionAfter=" completion rates than open-text questions. Restructure surveys to prioritize sentiment capture."
              footerIcon={TrendingUp}
              footerText="Optimization opportunity identified"
              color="purple"
              delay={0.1}
            />
            <LearningCard
              icon={Download}
              title="Coupon Effectiveness"
              description={`${(
                (currentData.funnel[4].value / currentData.funnel[3].value) *
                100
              ).toFixed(
                1
              )}% of users download after copying codes. Optimize the download experience to increase wallet additions by `}
              highlight="20-25%"
              descriptionAfter="."
              footerIcon={Target}
              footerText="Conversion improvement potential"
              color="orange"
              delay={0.2}
            />
            <LearningCard
              icon={TrendingUp}
              title="Forward-Looking Opportunity"
              description="Engagement actions projected to increase by "
              highlight={`${Math.round(
                currentData.trends.engagementActions.value * 1.2
              )}%`}
              highlightValue={
                currentData.locations[0]?.name || "Yonge-Dundas Square"
              }
              descriptionAfter=". The "
              descriptionAfterHighlight=" location shows strongest momentum and may benefit from expanded offerings."
              footerIcon={Activity}
              footerText="Forward-looking projection"
              color="blue"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollReveal>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 transition-all">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="p-2.5 rounded-lg bg-blue-500/15 border border-blue-500/20"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "easeInOut",
                      }}
                    >
                      <Info className="h-6 w-6 text-blue-400" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-white">
                      Data Transparency
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 text-base text-zinc-300">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      <p>
                        <strong className="text-white text-lg">
                          What data is collected:
                        </strong>{" "}
                        <span className="leading-relaxed">
                          KinesisIQ collects anonymized interaction data
                          including survey responses, engagement actions, and
                          location-based signals. All data is aggregated and
                          cannot be traced back to individual users.
                        </span>
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <p>
                        <strong className="text-white text-lg">
                          How signals are generated:
                        </strong>{" "}
                        <span className="leading-relaxed">
                          Our platform uses probabilistic modeling and machine
                          learning to identify patterns, detect emerging
                          patterns, and generate actionable signals from
                          aggregated data streams.
                        </span>
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <p>
                        <strong className="text-white text-lg">
                          Consent & Privacy:
                        </strong>{" "}
                        <span className="leading-relaxed">
                          All data collection is consent-aware. Users are
                          informed about data usage and can opt out at any time.
                          We comply with privacy regulations including GDPR and
                          CCPA.
                        </span>
                      </p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 bg-zinc-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl mx-auto text-center space-y-6"
            >
              <motion.h2
                className="text-3xl sm:text-4xl font-bold text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                Ready to see this in action?
              </motion.h2>
              <motion.p
                className="text-lg text-zinc-400"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Connect with our team to learn how KinesisIQ can transform your
                community engagement
              </motion.p>
              <motion.div
                className="flex flex-wrap items-center justify-center gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    className="bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/20"
                    size="lg"
                  >
                    <Link href="/contact">
                      Get Started
                      <ArrowUpRight className="ml-2 h-4 w-4 inline" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all"
                  >
                    <Link href="/#what-is-kinesisiq">Learn More</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
