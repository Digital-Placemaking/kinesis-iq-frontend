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

interface LearningCardProps {
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
}

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

export function LearningCard({
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
}: LearningCardProps) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

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



