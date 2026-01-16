"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  Target,
  Users,
  Clock,
  MapPin,
  BarChart3,
} from "lucide-react";
import { SignalCard } from "./SignalCard";
import type { ReportingData, TimeRange } from "../types";

interface SignalsCarouselProps {
  currentData: ReportingData;
  selectedTimeRange: TimeRange;
  isLoading: boolean;
}

export function SignalsCarousel({
  currentData,
  selectedTimeRange,
  isLoading,
}: SignalsCarouselProps) {
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
          " with a strong start rate. Consider A/B testing survey question formats to push completion rates even higher and capture more signals.",
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
    }, 6000);

    return () => clearInterval(interval);
  }, [allSignals.length]);

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
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



