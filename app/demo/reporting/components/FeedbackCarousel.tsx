"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Smile, Frown, Meh } from "lucide-react";
import { ALL_FEEDBACK } from "../mock-data";
import type { FeedbackItem } from "../types";

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

export function FeedbackCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const displayedFeedback = useMemo(() => {
    const feedback: FeedbackItem[] = [];
    for (let i = 0; i < 6; i++) {
      feedback.push(ALL_FEEDBACK[(currentIndex + i) % ALL_FEEDBACK.length]);
    }
    return feedback;
  }, [currentIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ALL_FEEDBACK.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 600);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {displayedFeedback.map((feedback, index) => {
        const config =
          sentimentConfig[feedback.sentiment as keyof typeof sentimentConfig] ||
          sentimentConfig.Neutral;
        const Icon = config.icon;
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



