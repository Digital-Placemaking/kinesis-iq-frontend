"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SignalCardProps {
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
}

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

export function SignalCard({
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
}: SignalCardProps) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

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



