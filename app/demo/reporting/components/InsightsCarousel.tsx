"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Rocket,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { InsightCard } from "./InsightCard";
import type { ReportingData } from "../types";

interface InsightsCarouselProps {
  currentData: ReportingData;
}

export function InsightsCarousel({ currentData }: InsightsCarouselProps) {
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
    }, 7000);

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



