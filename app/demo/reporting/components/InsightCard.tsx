"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InsightCardProps {
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
}

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

export function InsightCard({
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
}: InsightCardProps) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

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



