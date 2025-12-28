"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonLoader } from "@/app/components/ui/skeleton-loader";
import { ScrollReveal } from "@/app/components/ui/scroll-reveal";
import { LiveNumber } from "@/app/components/ui/live-number";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  Eye,
  CheckCircle,
  TrendingUp,
  TrendingDown,
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
  Zap,
  Activity,
  Brain,
  Smile,
  Frown,
  Meh,
  Sparkles,
  Award,
  CheckCircle2,
  Rocket,
} from "lucide-react";

/**
 * Reporting Demo Page
 * 
 * Frontend-only prototype for stakeholder demonstrations.
 * All data is mocked and aggregated - designed for backend integration without refactor.
 * 
 * Backend Integration Notes:
 * - Replace MOCK_DATA with API calls to fetch analytics data
 * - Data structure represents aggregated analytics (counts, rates, trends)
 * - Components receive data via props and can be easily adapted for real API responses
 * - Time range selection (7d/30d/90d) should trigger new API requests
 * - All animations and UI interactions are frontend-only and backend-safe
 */

// Mocked aggregated data — replace with API calls later
// Data structure designed to match expected backend response format
const MOCK_DATA = {
  "7d": {
    pageVisits: 1247,
    surveyResponses: 892,
    uniqueSessions: 634,
    conversionRate: 71.5,
    engagementActions: 523,
    happinessScore: 82.3,
    happyResponses: 734,
    trends: {
      pageVisits: { direction: "up" as const, value: 12.3 },
      surveyResponses: { direction: "up" as const, value: 8.7 },
      happinessScore: { direction: "up" as const, value: 2.1 },
      engagementActions: { direction: "up" as const, value: 15.4 },
    },
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
      {
        label: "Neutral",
        value: 112,
        percentage: 12.6,
        color: "bg-yellow-500",
      },
      { label: "Concerned", value: 46, percentage: 5.1, color: "bg-red-500" },
    ],
    locations: [
      { name: "Yonge-Dundas Square", responses: 342, sentiment: 85.2 },
      { name: "Harbourfront Centre", responses: 289, sentiment: 78.9 },
      { name: "Distillery District", responses: 156, sentiment: 81.4 },
      { name: "Kensington Market", responses: 105, sentiment: 79.2 },
    ],
    timeSeries: [
      { date: "2025-01-01", visits: 45, responses: 32 },
      { date: "2025-01-02", visits: 52, responses: 35 },
      { date: "2025-01-03", visits: 48, responses: 36 },
      { date: "2025-01-04", visits: 61, responses: 41 },
      { date: "2025-01-05", visits: 56, responses: 42 },
      { date: "2025-01-06", visits: 65, responses: 44 },
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
    trends: {
      pageVisits: { direction: "up" as const, value: 18.5 },
      surveyResponses: { direction: "up" as const, value: 14.2 },
      happinessScore: { direction: "up" as const, value: 3.8 },
      engagementActions: { direction: "up" as const, value: 22.1 },
    },
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
      {
        label: "Neutral",
        value: 512,
        percentage: 13.2,
        color: "bg-yellow-500",
      },
      { label: "Concerned", value: 146, percentage: 3.7, color: "bg-red-500" },
    ],
    locations: [
      { name: "Yonge-Dundas Square", responses: 1542, sentiment: 86.2 },
      { name: "Harbourfront Centre", responses: 1289, sentiment: 79.9 },
      { name: "Distillery District", responses: 756, sentiment: 82.4 },
      { name: "Kensington Market", responses: 305, sentiment: 80.2 },
    ],
    timeSeries: [
      { date: "2024-12-08", visits: 145, responses: 132 },
      { date: "2024-12-15", visits: 152, responses: 135 },
      { date: "2024-12-22", visits: 148, responses: 137 },
      { date: "2024-12-29", visits: 161, responses: 140 },
      { date: "2025-01-05", visits: 156, responses: 143 },
      { date: "2025-01-12", visits: 165, responses: 141 },
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
    trends: {
      pageVisits: { direction: "up" as const, value: 24.3 },
      surveyResponses: { direction: "up" as const, value: 19.8 },
      happinessScore: { direction: "up" as const, value: 5.2 },
      engagementActions: { direction: "up" as const, value: 28.7 },
    },
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
      {
        label: "Neutral",
        value: 1512,
        percentage: 12.7,
        color: "bg-yellow-500",
      },
      { label: "Concerned", value: 346, percentage: 2.8, color: "bg-red-500" },
    ],
    locations: [
      { name: "Yonge-Dundas Square", responses: 4542, sentiment: 87.2 },
      { name: "Harbourfront Centre", responses: 3289, sentiment: 81.9 },
      { name: "Distillery District", responses: 2256, sentiment: 83.4 },
      { name: "Kensington Market", responses: 1805, sentiment: 81.2 },
    ],
    timeSeries: [
      { date: "2024-10-20", visits: 445, responses: 332 },
      { date: "2024-10-27", visits: 438, responses: 328 },
      { date: "2024-11-03", visits: 452, responses: 335 },
      { date: "2024-11-10", visits: 448, responses: 337 },
      { date: "2024-11-17", visits: 455, responses: 340 },
      { date: "2024-11-24", visits: 450, responses: 338 },
      { date: "2024-12-01", visits: 461, responses: 342 },
      { date: "2024-12-08", visits: 458, responses: 345 },
      { date: "2024-12-15", visits: 465, responses: 343 },
      { date: "2024-12-22", visits: 462, responses: 347 },
      { date: "2024-12-29", visits: 470, responses: 350 },
      { date: "2025-01-05", visits: 467, responses: 348 },
      { date: "2025-01-12", visits: 472, responses: 352 },
    ],
  },
};

// Feedback data for carousel
const ALL_FEEDBACK = [
  {
    text: "I feel good about the community here",
    sentiment: "Happy",
    date: "2 days ago",
  },
  {
    text: "Toronto has a great music scene",
    sentiment: "Happy",
    date: "3 days ago",
  },
  {
    text: "It's beautiful and welcoming",
    sentiment: "Happy",
    date: "4 days ago",
  },
  {
    text: "Could use more public spaces",
    sentiment: "Neutral",
    date: "5 days ago",
  },
  {
    text: "Love the diversity and culture",
    sentiment: "Happy",
    date: "6 days ago",
  },
  {
    text: "Traffic can be challenging",
    sentiment: "Neutral",
    date: "1 week ago",
  },
  {
    text: "The waterfront area needs better maintenance",
    sentiment: "Concerned",
    date: "1 week ago",
  },
  {
    text: "Great events happening downtown",
    sentiment: "Happy",
    date: "1 week ago",
  },
  {
    text: "Wish there were more bike lanes",
    sentiment: "Neutral",
    date: "2 weeks ago",
  },
];

// Signals Carousel Component
function SignalsCarousel({
  currentData,
  selectedTimeRange,
  isLoading,
}: {
  currentData: (typeof MOCK_DATA)["7d"];
  selectedTimeRange: "7d" | "30d" | "90d";
  isLoading: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const allSignals = useMemo(() => {
    const timeText =
      selectedTimeRange === "7d"
        ? "this week"
        : selectedTimeRange === "30d"
        ? "this month"
        : "this quarter";

    return [
      {
        icon: Activity,
        title: "Rising Engagement Signal",
        description: "Engagement actions increased by ",
        value: currentData.trends.engagementActions.value,
        valueSuffix: "%",
        descriptionAfter:
          " over the selected period. This suggests growing interest in coupon offers. Consider expanding the coupon catalog to capitalize on this momentum.",
        footerIcon: Clock,
        footerText: `Detected ${timeText}`,
        color: "blue" as const,
      },
      {
        icon: TrendingUp,
        title: "Sentiment Improvement Trend",
        description: "Positive sentiment has improved by ",
        value: currentData.trends.happinessScore.value,
        valueSuffix: "%",
        descriptionAfter: `. The ${
          currentData.locations[0]?.name || "Yonge-Dundas Square"
        } location shows the highest satisfaction at `,
        secondaryValue: currentData.locations[0]?.sentiment || 85,
        secondaryValueSuffix: "%",
        descriptionAfterSecondary:
          ". Analyze successful practices from this location to replicate elsewhere.",
        footerIcon: MapPin,
        footerText: `Strongest in ${
          currentData.locations[0]?.name || "Yonge-Dundas Square"
        }`,
        color: "green" as const,
      },
      {
        icon: Target,
        title: "Conversion Opportunity",
        description: "Survey completion rate is ",
        value:
          (currentData.funnel[2].value / currentData.funnel[1].value) * 100,
        valueSuffix: "%",
        descriptionAfter:
          " with a strong start rate. Consider A/B testing survey question formats to push completion rates even higher and capture more insights.",
        footerIcon: BarChart3,
        footerText: `${
          selectedTimeRange === "7d"
            ? "7-day"
            : selectedTimeRange === "30d"
            ? "30-day"
            : "90-day"
        } performance`,
        color: "purple" as const,
      },
      {
        icon: Users,
        title: "Location Engagement Pattern",
        description: "Top location shows ",
        value: currentData.locations[0]?.responses || 0,
        valueSuffix: " responses",
        descriptionAfter: ` with ${
          currentData.locations[0]?.sentiment || 85
        }% positive sentiment. This location demonstrates best practices for community engagement that can be applied to other areas.`,
        footerIcon: MapPin,
        footerText: `Leading: ${
          currentData.locations[0]?.name || "Yonge-Dundas Square"
        }`,
        color: "orange" as const,
      },
    ];
  }, [currentData, selectedTimeRange]);

  const displayedSignals = useMemo(() => {
    return [
      allSignals[currentIndex % allSignals.length],
      allSignals[(currentIndex + 1) % allSignals.length],
    ];
  }, [currentIndex, allSignals]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % allSignals.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 600);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [allSignals.length]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {displayedSignals.map((signal, index) => (
        <motion.div
          key={`${signal.title}-${currentIndex}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isTransitioning ? 0 : 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
            delay: index * 0.1,
          }}
          style={{ minHeight: "100%" }}
          className="h-full"
        >
          <SignalCard
            icon={signal.icon}
            title={signal.title}
            description={signal.description}
            value={signal.value}
            valueSuffix={signal.valueSuffix}
            descriptionAfter={signal.descriptionAfter}
            secondaryValue={signal.secondaryValue}
            secondaryValueSuffix={signal.secondaryValueSuffix}
            descriptionAfterSecondary={signal.descriptionAfterSecondary}
            footerIcon={signal.footerIcon}
            footerText={signal.footerText}
            color={signal.color}
            isLoading={isLoading}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Signal Card Component with animations
function SignalCard({
  icon: Icon,
  title,
  description,
  value,
  valueSuffix = "",
  descriptionAfter,
  secondaryValue,
  secondaryValueSuffix = "",
  descriptionAfterSecondary,
  footerIcon: FooterIcon,
  footerText,
  color = "blue",
  isLoading = false,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  value: number;
  valueSuffix?: string;
  descriptionAfter: string;
  secondaryValue?: number;
  secondaryValueSuffix?: string;
  descriptionAfterSecondary?: string;
  footerIcon: React.ElementType;
  footerText: string;
  color?: "blue" | "green" | "yellow" | "purple" | "orange" | "red";
  isLoading?: boolean;
}) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  const colorConfig = {
    blue: {
      iconColor: "text-blue-400",
      bgGradient: "from-blue-500/15 via-blue-500/8 to-transparent",
      bgSolid: "bg-blue-500/5",
      borderColor: "border-blue-500/20",
      borderHover: "hover:border-blue-500/40",
      valueColor: "text-blue-400",
      iconBg: "bg-blue-500/15",
      glow: "shadow-blue-500/20",
      glassEffect: "backdrop-blur-md",
    },
    green: {
      iconColor: "text-green-400",
      bgGradient: "from-green-500/15 via-green-500/8 to-transparent",
      bgSolid: "bg-green-500/5",
      borderColor: "border-green-500/20",
      borderHover: "hover:border-green-500/40",
      valueColor: "text-green-400",
      iconBg: "bg-green-500/15",
      glow: "shadow-green-500/20",
      glassEffect: "backdrop-blur-md",
    },
    yellow: {
      iconColor: "text-yellow-400",
      bgGradient: "from-yellow-500/15 via-yellow-500/8 to-transparent",
      bgSolid: "bg-yellow-500/5",
      borderColor: "border-yellow-500/20",
      borderHover: "hover:border-yellow-500/40",
      valueColor: "text-yellow-400",
      iconBg: "bg-yellow-500/15",
      glow: "shadow-yellow-500/20",
      glassEffect: "backdrop-blur-md",
    },
    purple: {
      iconColor: "text-purple-400",
      bgGradient: "from-purple-500/15 via-purple-500/8 to-transparent",
      bgSolid: "bg-purple-500/5",
      borderColor: "border-purple-500/20",
      borderHover: "hover:border-purple-500/40",
      valueColor: "text-purple-400",
      iconBg: "bg-purple-500/15",
      glow: "shadow-purple-500/20",
      glassEffect: "backdrop-blur-md",
    },
    orange: {
      iconColor: "text-orange-400",
      bgGradient: "from-orange-500/15 via-orange-500/8 to-transparent",
      bgSolid: "bg-orange-500/5",
      borderColor: "border-orange-500/20",
      borderHover: "hover:border-orange-500/40",
      valueColor: "text-orange-400",
      iconBg: "bg-orange-500/15",
      glow: "shadow-orange-500/20",
      glassEffect: "backdrop-blur-md",
    },
    red: {
      iconColor: "text-red-400",
      bgGradient: "from-red-500/15 via-red-500/8 to-transparent",
      bgSolid: "bg-red-500/5",
      borderColor: "border-red-500/20",
      borderHover: "hover:border-red-500/40",
      valueColor: "text-red-400",
      iconBg: "bg-red-500/15",
      glow: "shadow-red-500/20",
      glassEffect: "backdrop-blur-md",
    },
  };

  const config = colorConfig[color];

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card
        className={`border ${config.borderColor} ${config.bgSolid} bg-gradient-to-br ${config.bgGradient} ${config.glassEffect} ${config.borderHover} transition-all relative overflow-hidden group ${config.glow} shadow-lg hover:shadow-xl`}
      >
        {/* Animated background glow */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          animate={{
            opacity: [0, 0.1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
          }}
        />
        <CardHeader>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <motion.div
              className={`p-2.5 rounded-lg ${config.iconBg} ${config.iconColor}`}
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
              <Icon className="h-5 w-5" />
            </motion.div>
            <CardTitle className="text-white text-lg font-bold">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <CardDescription className="text-zinc-300 leading-relaxed text-base">
            {description}
            <motion.strong
              className={config.valueColor}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={
                isInView && !isLoading
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0.8, opacity: 0 }
              }
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            >
              {isLoading ? (
                <span className="inline-block w-12 h-5 bg-zinc-700 rounded animate-pulse" />
              ) : (
                <>
                  {value % 1 === 0 ? value : value.toFixed(1)}
                  {valueSuffix}
                </>
              )}
            </motion.strong>
            {descriptionAfter}
            {secondaryValue !== undefined && (
              <>
                {" "}
                <motion.strong
                  className={config.valueColor}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={
                    isInView && !isLoading
                      ? { scale: 1, opacity: 1 }
                      : { scale: 0.8, opacity: 0 }
                  }
                  transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                >
                  {isLoading ? (
                    <span className="inline-block w-12 h-5 bg-zinc-700 rounded animate-pulse" />
                  ) : (
                    <>
                      {secondaryValue % 1 === 0
                        ? secondaryValue
                        : secondaryValue.toFixed(1)}
                      {secondaryValueSuffix}
                    </>
                  )}
                </motion.strong>
                {descriptionAfterSecondary}
              </>
            )}
          </CardDescription>
          <motion.div
            className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center gap-2 text-sm text-zinc-400"
            initial={{ opacity: 0, y: 5 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <FooterIcon className="h-4 w-4" />
            <span className="font-semibold">{footerText}</span>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Insights Carousel Component
function InsightsCarousel({
  currentData,
}: {
  currentData: (typeof MOCK_DATA)["7d"];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const allInsights = useMemo(() => {
    return [
      {
        icon: Award,
        title: "Conversion Optimization",
        description: "Your conversion rate of ",
        value: currentData.conversionRate,
        valueSuffix: "%",
        descriptionAfter: " exceeds industry benchmarks. With a ",
        secondaryValue:
          (currentData.funnel[1].value / currentData.funnel[0].value) * 100,
        secondaryValueSuffix: "%",
        descriptionAfterSecondary:
          " survey start rate, you're capturing strong initial interest. Recommendation: Test shorter survey formats to convert more starts into completions.",
        color: "yellow" as const,
      },
      {
        icon: CheckCircle2,
        title: "Sentiment Stability",
        description: "",
        value: currentData.happinessScore,
        valueSuffix: "%",
        descriptionAfter:
          " positive sentiment shows strong community satisfaction. Only ",
        secondaryValue: currentData.sentiment[2]?.percentage || 5,
        secondaryValueSuffix: "%",
        descriptionAfterSecondary:
          " concerned responses indicates effective engagement. Recommendation: Continue proactive outreach to maintain this positive trend.",
        color: "green" as const,
      },
      {
        icon: Rocket,
        title: "Growth Opportunity",
        description:
          "Analysis shows a drop-off at coupon downloads. Optimizing this stage could boost wallet additions by ",
        value: "15",
        valueSuffix: "-20%",
        descriptionAfter:
          " Recommendation: Simplify the download flow and add progress indicators to reduce friction at this critical point",
        color: "blue" as const,
      },
      {
        icon: MapPin,
        title: "Location Performance",
        description: "Top location generated ",
        value: currentData.locations[0]?.responses || 0,
        valueSuffix: " responses",
        descriptionAfter: ` with ${
          currentData.locations[0]?.sentiment || 85
        }% satisfaction—well above average. Recommendation: Analyze this location's engagement tactics and replicate successful strategies to other areas, potentially increasing overall engagement by `,
        secondaryValue: 12,
        secondaryValueSuffix: "%",
        descriptionAfterSecondary: "",
        color: "purple" as const,
      },
      {
        icon: Clock,
        title: "Timing Opportunity",
        description: "Data shows peak engagement during ",
        value: "evening",
        valueSuffix: " hours",
        descriptionAfter:
          " Recommendation: Schedule high-priority campaigns during these optimal windows to potentially increase response rates by ",
        secondaryValue: 18,
        secondaryValueSuffix: "%",
        descriptionAfterSecondary:
          " Our system continuously learns from your engagement patterns to identify the best times",
        color: "orange" as const,
      },
      {
        icon: Sparkles,
        title: "Quick Win Alert",
        description: "Survey responses grew ",
        value: currentData.trends.surveyResponses.value,
        valueSuffix: "%",
        descriptionAfter: " this period. Your ",
        secondaryValue:
          (currentData.funnel[2].value / currentData.funnel[1].value) * 100,
        secondaryValueSuffix: "%",
        descriptionAfterSecondary:
          " completion rate demonstrates strong user commitment. Recommendation: Scale current successful survey strategies to maximize this momentum.",
        color: "blue" as const,
      },
    ];
  }, [currentData]);

  const displayedInsights = useMemo(() => {
    // Show 3 cards at a time, cycling through all 6
    return [
      allInsights[currentIndex % allInsights.length],
      allInsights[(currentIndex + 1) % allInsights.length],
      allInsights[(currentIndex + 2) % allInsights.length],
    ];
  }, [currentIndex, allInsights]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % allInsights.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 600);
    }, 7000); // Change every 7 seconds

    return () => clearInterval(interval);
  }, [allInsights.length]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {displayedInsights.map((insight, index) => (
        <motion.div
          key={`${insight.title}-${currentIndex}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isTransitioning ? 0 : 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
            delay: index * 0.1,
          }}
          style={{ minHeight: "100%" }}
          className="h-full"
        >
          <InsightCard
            icon={insight.icon}
            title={insight.title}
            description={insight.description}
            value={insight.value}
            valueSuffix={insight.valueSuffix}
            descriptionAfter={insight.descriptionAfter}
            secondaryValue={insight.secondaryValue}
            secondaryValueSuffix={insight.secondaryValueSuffix}
            descriptionAfterSecondary={insight.descriptionAfterSecondary}
            color={insight.color}
            delay={index * 0.1}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Learning Card Component (for "What KinesisIQ Learns From Your Data")
function LearningCard({
  icon: Icon,
  title,
  description,
  highlight,
  highlightValue,
  descriptionAfter,
  descriptionAfterHighlight,
  footerIcon: FooterIcon,
  footerText,
  color = "purple",
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  highlight: string;
  highlightValue?: string;
  descriptionAfter: string;
  descriptionAfterHighlight?: string;
  footerIcon: React.ElementType;
  footerText: string;
  color?: "purple" | "orange" | "blue";
  delay?: number;
}) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  const colorConfig = {
    purple: {
      iconColor: "text-purple-400",
      bgGradient: "from-purple-500/15 via-purple-500/8 to-transparent",
      bgSolid: "bg-purple-500/5",
      borderColor: "border-purple-500/20",
      borderHover: "hover:border-purple-500/40",
      highlightColor: "text-purple-400",
      highlightValueColor: "text-white",
      iconBg: "bg-purple-500/15",
      glow: "shadow-purple-500/20",
      glassEffect: "backdrop-blur-md",
    },
    orange: {
      iconColor: "text-orange-400",
      bgGradient: "from-orange-500/15 via-orange-500/8 to-transparent",
      bgSolid: "bg-orange-500/5",
      borderColor: "border-orange-500/20",
      borderHover: "hover:border-orange-500/40",
      highlightColor: "text-orange-400",
      highlightValueColor: "text-orange-400",
      iconBg: "bg-orange-500/15",
      glow: "shadow-orange-500/20",
      glassEffect: "backdrop-blur-md",
    },
    blue: {
      iconColor: "text-blue-400",
      bgGradient: "from-blue-500/15 via-blue-500/8 to-transparent",
      bgSolid: "bg-blue-500/5",
      borderColor: "border-blue-500/20",
      borderHover: "hover:border-blue-500/40",
      highlightColor: "text-blue-400",
      highlightValueColor: "text-white",
      iconBg: "bg-blue-500/15",
      glow: "shadow-blue-500/20",
      glassEffect: "backdrop-blur-md",
    },
  };

  const config = colorConfig[color];

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card
        className={`border ${config.borderColor} ${config.bgSolid} bg-gradient-to-br ${config.bgGradient} ${config.glassEffect} ${config.borderHover} transition-all relative overflow-hidden group ${config.glow} shadow-lg hover:shadow-xl h-full`}
      >
        {/* Animated background glow */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          animate={{
            opacity: [0, 0.1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
          }}
        />
        <CardHeader>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <motion.div
              className={`p-2.5 rounded-lg ${config.iconBg} ${config.iconColor}`}
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
              <Icon className="h-5 w-5" />
            </motion.div>
            <CardTitle className="text-white text-lg font-bold">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <CardDescription className="text-zinc-300 leading-relaxed text-base">
            {description}
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={
                isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }
              }
              transition={{
                delay: delay + 0.3,
                duration: 0.5,
                ease: "easeOut",
              }}
              className="inline-block"
            >
              <strong className={`${config.highlightColor} font-semibold`}>
                {highlight}
              </strong>
            </motion.span>
            {descriptionAfter}
            {highlightValue && (
              <>
                {" "}
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={
                    isInView
                      ? { scale: 1, opacity: 1 }
                      : { scale: 0.8, opacity: 0 }
                  }
                  transition={{
                    delay: delay + 0.5,
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                  className="inline-block"
                >
                  <strong className={`${config.highlightColor} font-semibold`}>
                    {highlightValue}
                  </strong>
                </motion.span>
              </>
            )}
            {descriptionAfterHighlight}
          </CardDescription>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: delay + 0.6, duration: 0.5 }}
            className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center gap-2 text-sm font-semibold text-zinc-400"
          >
            <FooterIcon className="h-4 w-4 shrink-0" />
            <span>{footerText}</span>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Insight Card Component with animations
function InsightCard({
  icon: Icon,
  title,
  description,
  value,
  valueSuffix = "",
  descriptionAfter,
  secondaryValue,
  secondaryValueSuffix = "",
  descriptionAfterSecondary,
  color = "yellow",
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  value: number | string;
  valueSuffix?: string;
  descriptionAfter: string;
  secondaryValue?: number;
  secondaryValueSuffix?: string;
  descriptionAfterSecondary?: string;
  color?: "yellow" | "green" | "blue" | "purple" | "orange";
  delay?: number;
}) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  const colorConfig = {
    yellow: {
      iconColor: "text-yellow-400",
      bgGradient: "from-yellow-500/15 via-yellow-500/8 to-transparent",
      bgSolid: "bg-yellow-500/5",
      borderColor: "border-yellow-500/20",
      borderHover: "hover:border-yellow-500/40",
      valueColor: "text-yellow-400",
      iconBg: "bg-yellow-500/15",
      glow: "shadow-yellow-500/20",
      glassEffect: "backdrop-blur-md",
    },
    green: {
      iconColor: "text-green-400",
      bgGradient: "from-green-500/15 via-green-500/8 to-transparent",
      bgSolid: "bg-green-500/5",
      borderColor: "border-green-500/20",
      borderHover: "hover:border-green-500/40",
      valueColor: "text-green-400",
      iconBg: "bg-green-500/15",
      glow: "shadow-green-500/20",
      glassEffect: "backdrop-blur-md",
    },
    blue: {
      iconColor: "text-blue-400",
      bgGradient: "from-blue-500/15 via-blue-500/8 to-transparent",
      bgSolid: "bg-blue-500/5",
      borderColor: "border-blue-500/20",
      borderHover: "hover:border-blue-500/40",
      valueColor: "text-blue-400",
      iconBg: "bg-blue-500/15",
      glow: "shadow-blue-500/20",
      glassEffect: "backdrop-blur-md",
    },
    purple: {
      iconColor: "text-purple-400",
      bgGradient: "from-purple-500/15 via-purple-500/8 to-transparent",
      bgSolid: "bg-purple-500/5",
      borderColor: "border-purple-500/20",
      borderHover: "hover:border-purple-500/40",
      valueColor: "text-purple-400",
      iconBg: "bg-purple-500/15",
      glow: "shadow-purple-500/20",
      glassEffect: "backdrop-blur-md",
    },
    orange: {
      iconColor: "text-orange-400",
      bgGradient: "from-orange-500/15 via-orange-500/8 to-transparent",
      bgSolid: "bg-orange-500/5",
      borderColor: "border-orange-500/20",
      borderHover: "hover:border-orange-500/40",
      valueColor: "text-orange-400",
      iconBg: "bg-orange-500/15",
      glow: "shadow-orange-500/20",
      glassEffect: "backdrop-blur-md",
    },
  };

  const config = colorConfig[color];
  const numericValue =
    typeof value === "number" ? value : parseFloat(value as string) || 0;
  const numericSecondary =
    secondaryValue !== undefined ? secondaryValue : undefined;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card
        className={`border ${config.borderColor} ${config.bgSolid} bg-gradient-to-br ${config.bgGradient} ${config.glassEffect} ${config.borderHover} transition-all relative overflow-hidden group ${config.glow} shadow-lg hover:shadow-xl h-full`}
      >
        {/* Animated background glow */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          animate={{
            opacity: [0, 0.1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
          }}
        />
        <CardHeader>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <motion.div
              className={`p-2.5 rounded-lg ${config.iconBg} ${config.iconColor}`}
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
              <Icon className="h-5 w-5" />
            </motion.div>
            <CardTitle className="text-white text-lg font-bold">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-zinc-200 leading-relaxed text-base space-y-3">
            {description && <p className="text-zinc-300">{description}</p>}
            <div className="flex items-baseline gap-2 flex-wrap">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={
                  isInView
                    ? { scale: 1, opacity: 1 }
                    : { scale: 0.8, opacity: 0 }
                }
                transition={{
                  delay: delay + 0.3,
                  duration: 0.5,
                  ease: "easeOut",
                }}
              >
                <span className={`${config.valueColor} text-3xl font-bold`}>
                  {typeof value === "number"
                    ? numericValue % 1 === 0
                      ? numericValue
                      : numericValue.toFixed(1)
                    : value}
                  {valueSuffix}
                </span>
              </motion.span>
            </div>
            {descriptionAfter && (
              <p className="text-zinc-300">{descriptionAfter}</p>
            )}
            {numericSecondary !== undefined && (
              <>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={
                      isInView
                        ? { scale: 1, opacity: 1 }
                        : { scale: 0.8, opacity: 0 }
                    }
                    transition={{
                      delay: delay + 0.5,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                  >
                    <span className={`${config.valueColor} text-3xl font-bold`}>
                      {numericSecondary % 1 === 0
                        ? numericSecondary
                        : numericSecondary.toFixed(1)}
                      {secondaryValueSuffix}
                    </span>
                  </motion.span>
                </div>
                {descriptionAfterSecondary && (
                  <p className="text-zinc-300">{descriptionAfterSecondary}</p>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Feedback Carousel Component
function FeedbackCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const displayedFeedback = useMemo(() => {
    const feedback = [];
    for (let i = 0; i < 6; i++) {
      feedback.push(ALL_FEEDBACK[(currentIndex + i) % ALL_FEEDBACK.length]);
    }
    return feedback;
  }, [currentIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      // Wait for fade out to complete
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ALL_FEEDBACK.length);
        // Small delay before fading in
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 600); // Match fade out duration
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const sentimentConfig = {
    Happy: {
      icon: Smile,
      iconColor: "text-green-400",
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
      borderColor: "border-green-500/20",
      iconColorHex: "#4ade80",
      textColorHex: "#4ade80",
      bgColorHex: "rgba(34, 197, 94, 0.1)",
      borderColorHex: "rgba(34, 197, 94, 0.2)",
    },
    Concerned: {
      icon: Frown,
      iconColor: "text-red-400",
      bgColor: "bg-red-500/10",
      textColor: "text-red-400",
      borderColor: "border-red-500/20",
      iconColorHex: "#ef4444",
      textColorHex: "#ef4444",
      bgColorHex: "rgba(239, 68, 68, 0.1)",
      borderColorHex: "rgba(239, 68, 68, 0.2)",
    },
    Neutral: {
      icon: Meh,
      iconColor: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-400",
      borderColor: "border-yellow-500/20",
      iconColorHex: "#eab308",
      textColorHex: "#eab308",
      bgColorHex: "rgba(234, 179, 8, 0.1)",
      borderColorHex: "rgba(234, 179, 8, 0.2)",
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {displayedFeedback.map((feedback, index) => {
        const config =
          sentimentConfig[feedback.sentiment as keyof typeof sentimentConfig] ||
          sentimentConfig.Neutral;
        const Icon = config.icon;

        // Simple stagger for smooth wave effect
        const staggerDelay = index * 0.08;

        return (
          <motion.div
            key={`${feedback.text}-${currentIndex}-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: isTransitioning ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              ease: "easeInOut",
              delay: isTransitioning ? staggerDelay * 0.5 : staggerDelay,
            }}
            className="p-5 rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm relative overflow-hidden min-h-[140px]"
            style={{
              pointerEvents: isTransitioning ? "none" : "auto",
            }}
          >
            {/* Subtle left border accent based on sentiment */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                feedback.sentiment === "Happy"
                  ? "bg-green-500/40"
                  : feedback.sentiment === "Concerned"
                  ? "bg-red-500/40"
                  : "bg-yellow-500/40"
              }`}
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon
                    className={`h-4 w-4 ${config.iconColor} shrink-0`}
                    style={{ color: config.iconColorHex }}
                  />
                  <div
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border flex items-center gap-1.5 ${config.bgColor} ${config.textColor} ${config.borderColor}`}
                    style={{
                      backgroundColor: config.bgColorHex,
                      color: config.textColorHex,
                      borderColor: config.borderColorHex,
                    }}
                  >
                    {feedback.sentiment}
                  </div>
                </div>
                <span className="text-xs text-zinc-500 font-medium">
                  {feedback.date}
                </span>
              </div>
              <p className="text-sm text-zinc-100 leading-relaxed font-medium">
                {feedback.text}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// KPI Card Component with animations and trend indicators
function KPICard({
  icon: Icon,
  label,
  value,
  subtitle,
  color = "text-blue-500",
  isLoading = false,
  trend,
  trendValue,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  subtitle?: string;
  color?: string;
  isLoading?: boolean;
  trend?: "up" | "down" | "neutral";
  trendValue?: number;
}) {
  const isDecimal = label === "Happiness Score" || label === "Conversion Rate";

  // Map text colors to background colors with opacity (matching how-it-works pattern)
  const bgColorMap: Record<string, string> = {
    "text-blue-500": "bg-blue-500/10",
    "text-green-500": "bg-green-500/10",
    "text-yellow-500": "bg-yellow-500/10",
    "text-purple-500": "bg-purple-500/10",
    "text-orange-500": "bg-orange-500/10",
    "text-red-500": "bg-red-500/10",
  };

  const bgColor = bgColorMap[color] || "bg-blue-500/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <Card
        className={`border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/70 transition-all backdrop-blur-sm group relative overflow-hidden shadow-lg hover:shadow-xl`}
        style={{
          boxShadow:
            color === "text-blue-500"
              ? "0 10px 40px -10px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.1)"
              : color === "text-green-500"
              ? "0 10px 40px -10px rgba(34, 197, 94, 0.2), 0 0 0 1px rgba(34, 197, 94, 0.1)"
              : color === "text-yellow-500"
              ? "0 10px 40px -10px rgba(234, 179, 8, 0.2), 0 0 0 1px rgba(234, 179, 8, 0.1)"
              : color === "text-purple-500"
              ? "0 10px 40px -10px rgba(168, 85, 247, 0.2), 0 0 0 1px rgba(168, 85, 247, 0.1)"
              : "0 10px 40px -10px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.1)",
        }}
      >
        {/* Enhanced shimmer effect */}
        {!isLoading && (
          <>
            {/* Smooth color-matched shimmer */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r from-transparent via-${color.replace(
                "text-",
                ""
              )}/20 to-transparent pointer-events-none z-0`}
              style={{
                background:
                  color === "text-blue-500"
                    ? "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.12) 50%, transparent 100%)"
                    : color === "text-green-500"
                    ? "linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.12) 50%, transparent 100%)"
                    : color === "text-yellow-500"
                    ? "linear-gradient(90deg, transparent 0%, rgba(234, 179, 8, 0.12) 50%, transparent 100%)"
                    : color === "text-purple-500"
                    ? "linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.12) 50%, transparent 100%)"
                    : "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.12) 50%, transparent 100%)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 5,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
            {/* Static gentle glow */}
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background:
                  color === "text-blue-500"
                    ? "radial-gradient(circle at center, rgba(59, 130, 246, 0.05), transparent 70%)"
                    : color === "text-green-500"
                    ? "radial-gradient(circle at center, rgba(34, 197, 94, 0.05), transparent 70%)"
                    : color === "text-yellow-500"
                    ? "radial-gradient(circle at center, rgba(234, 179, 8, 0.05), transparent 70%)"
                    : color === "text-purple-500"
                    ? "radial-gradient(circle at center, rgba(168, 85, 247, 0.05), transparent 70%)"
                    : "radial-gradient(circle at center, rgba(59, 130, 246, 0.05), transparent 70%)",
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

// Funnel Chart Component - Professional horizontal bar chart using Recharts
function FunnelChart({
  data,
  isLoading = false,
}: {
  data: (typeof MOCK_DATA)["7d"]["funnel"];
  isLoading?: boolean;
}) {
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

  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={
        isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }
      }
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
            <div className="h-64 flex items-center justify-center">
              <SkeletonLoader height={200} width="100%" />
            </div>
          ) : (
            <div className="space-y-4">
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    barCategoryGap="10%"
                  >
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
                      width={110}
                      tick={{ fill: "#a1a1aa", fontSize: 12 }}
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

              {/* Legend with icons and conversion rates */}
              <div className="space-y-1.5 pt-4 border-t border-zinc-800">
                {chartData.map((item, index) => {
                  const Icon = item.icon;
                  const previousValue =
                    index > 0 ? chartData[index - 1].value : maxValue;
                  const conversionRate =
                    previousValue > 0
                      ? ((item.value / previousValue) * 100).toFixed(1)
                      : "0";

                  // Color coding based on conversion rate quality
                  const getConversionColor = (rate: number) => {
                    if (rate >= 80) return "text-green-400";
                    if (rate >= 50) return "text-yellow-400";
                    return "text-red-400";
                  };

                  const getConversionBg = (rate: number) => {
                    if (rate >= 80)
                      return "bg-green-500/10 border-green-500/20";
                    if (rate >= 50)
                      return "bg-yellow-500/10 border-yellow-500/20";
                    return "bg-red-500/10 border-red-500/20";
                  };

                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className="h-4 w-4 shrink-0"
                          style={{ color: item.color }}
                        />
                        <span className="text-white font-medium text-sm">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-300 font-semibold text-sm min-w-[60px] text-right">
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

// Sentiment Distribution Component
function SentimentDistribution({
  data,
  isLoading = false,
}: {
  data: (typeof MOCK_DATA)["7d"]["sentiment"];
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
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-green-400" />
          Sentiment Distribution
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          How people are feeling • Visual breakdown by sentiment
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex flex-col flex-1 min-h-0">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <SkeletonLoader height={200} width={200} variant="circular" />
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 space-y-4">
            <div className="relative flex-1 min-h-0 flex items-center justify-center">
              <ChartContainer
                config={chartConfig}
                className="w-full h-full max-w-md max-h-md"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
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
              {/* Center label */}
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
            <div className="space-y-2.5 pt-2 flex-shrink-0">
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
                    className="flex items-center justify-between py-3.5 px-3 rounded-lg bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full ${item.color} shrink-0 ring-2 ${ringColor}`}
                      />
                      <span className="text-white font-semibold text-sm">
                        {item.label}
                      </span>
                      <span className="text-zinc-400 font-medium text-sm">
                        {item.percentage}%
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-zinc-500/60">
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

// Location Summary Component
function LocationSummary({
  data,
  isLoading = false,
}: {
  data: (typeof MOCK_DATA)["7d"]["locations"];
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

// Time Series Chart Component
function TimeSeriesChart({
  data,
  timeRange,
  isLoading = false,
}: {
  data: (typeof MOCK_DATA)["7d"]["timeSeries"];
  timeRange: "7d" | "30d" | "90d";
  isLoading?: boolean;
}) {
  // Format dates based on time range
  const chartData = data.map((day) => {
    const date = new Date(day.date);
    let dateLabel: string;

    if (timeRange === "7d") {
      // Daily: "Jan 1"
      dateLabel = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (timeRange === "30d") {
      // Weekly: "Week of Jan 1"
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      dateLabel = `Week of ${weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    } else {
      // 90d: Bi-weekly or monthly
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

  const rangeLabels = {
    "7d": "Daily trends",
    "30d": "Weekly trends",
    "90d": "Monthly trends",
  };

  const chartConfig = {
    visits: { label: "Page Visits", color: "#3b82f6" },
    responses: { label: "Survey Responses", color: "#22c55e" },
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
          <Clock className="h-6 w-6 text-orange-400" />
          Trend Over Time
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          {rangeLabels[timeRange]} • Page visits and survey responses
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 pb-2 flex flex-col flex-1 min-h-0">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <SkeletonLoader height={200} width="100%" />
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <ChartContainer config={chartConfig} className="flex-1 min-h-0">
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

export default function ReportingDemoPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "7d" | "30d" | "90d"
  >("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get current data based on selected time range
  // TODO: Replace with API call when backend is ready
  const currentData = MOCK_DATA[selectedTimeRange];

  // Simulate initial load - replace with actual API loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Handle time range transitions
  // TODO: Trigger API call when time range changes to fetch new data
  const handleTimeRangeChange = (range: "7d" | "30d" | "90d") => {
    if (range === selectedTimeRange) return;
    setIsTransitioning(true);
    // In production, fetch new data here based on selected range
    setTimeout(() => {
      setSelectedTimeRange(range);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center space-y-5 sm:space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight"
              >
                Data Acquisition & Reporting
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-base sm:text-lg lg:text-xl text-zinc-300 leading-relaxed max-w-3xl mx-auto"
              >
                See how KinesisIQ transforms real-world interactions into
                actionable insights
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
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

      {/* Section 1: Overview Header + KPI Cards */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollReveal>
            {/* Section Header */}
            <div className="mb-12 sm:mb-16 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-4xl font-bold text-white mb-4">Overview</h2>
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

          {/* KPI Cards Grid */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Section 2: Charts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollReveal>
            <div className="mb-12 mt-4">
              <h2 className="text-4xl font-bold text-white mb-4">
                Analytics & Trends
              </h2>
              <p className="text-base text-zinc-400 mb-6">
                Engagement patterns and performance insights •{" "}
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
              className="space-y-8"
            >
              {/* Row 1: Funnel and Sentiment */}
              <div className="grid gap-12 lg:grid-cols-2">
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

              {/* Row 2: Time Series and Location */}
              <div className="grid gap-12 lg:grid-cols-2">
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

      {/* Section 3: User Feedback */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollReveal>
            <div className="mb-12 mt-4">
              <h2 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
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

      {/* Section 4: Signals Detected */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollReveal>
            <div className="mb-12 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="p-2 rounded-lg bg-blue-500/10"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Zap className="h-7 w-7 text-blue-400" />
                </motion.div>
                <h2 className="text-4xl font-bold text-white">
                  Signals Detected
                </h2>
              </div>
              <p className="text-base text-zinc-400 max-w-3xl mb-6">
                Emerging patterns and opportunities identified from aggregated
                data •{" "}
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

      {/* Section 5: Key Insights & Recommendations */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollReveal>
            <div className="mb-12 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30 relative"
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
                  <div className="absolute inset-0 bg-yellow-500/10 rounded-xl blur-sm" />
                  <Lightbulb className="h-8 w-8 text-yellow-300 relative z-10" />
                </motion.div>
                <h2 className="text-4xl font-bold text-white">
                  Key Insights & Recommendations
                </h2>
              </div>
              <p className="text-base text-zinc-400 max-w-3xl mb-6">
                Actionable intelligence derived from probabilistic modeling and
                pattern analysis • Based on{" "}
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

      {/* Section 6: What KinesisIQ Learns From Your Data */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollReveal>
            <div className="mb-12 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/20 relative"
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
                  <Brain className="h-8 w-8 text-purple-300 relative z-10" />
                </motion.div>
                <h2 className="text-4xl font-bold text-white">
                  What KinesisIQ Learns From Your Data
                </h2>
              </div>
              <p className="text-base text-zinc-400 max-w-3xl mb-6">
                Intelligent insights derived from aggregated patterns •{" "}
                {selectedTimeRange === "7d"
                  ? "7-day"
                  : selectedTimeRange === "30d"
                  ? "30-day"
                  : "90-day"}{" "}
                analysis
              </p>
            </div>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              title="Predictive Opportunity"
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

      {/* Section 7: Data Transparency */}
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
                          How insights are generated:
                        </strong>{" "}
                        <span className="leading-relaxed">
                          Our platform uses probabilistic modeling and machine
                          learning to identify patterns, predict trends, and
                          generate actionable insights from aggregated data
                          streams.
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

      {/* Section 8: CTA */}
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

      <Footer />
    </div>
  );
}
