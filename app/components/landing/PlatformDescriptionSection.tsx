/**
 * PlatformDescriptionSection Component
 * "What is KinesisIQ?" section with description and feature cards.
 */

"use client";

import { motion } from "framer-motion";
import { Database, Cpu, Sparkles } from "lucide-react";
import { ScrollAnimation } from "./ScrollAnimation";

export function PlatformDescriptionSection() {
  const featureCards = [
    {
      title: "Multi-Source Data",
      description:
        "Combines public data, surveys, and real-time community inputs to generate early signals and capture the full spectrum of community sentiment.",
      icon: Database,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      title: "Intelligent Processing",
      description:
        "Advanced algorithms transform raw data into actionable signals, identifying meaningful patterns while filtering out noise for trusted insights.",
      icon: Cpu,
      iconColor: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
    },
    {
      title: "Emerging Patterns",
      description:
        "Detects subtle shifts in behavior and sentiment before they become trends, giving you time to respond strategically with probabilistic modeling.",
      icon: Sparkles,
      iconColor: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
    },
  ];

  return (
    <ScrollAnimation>
      <div id="what-is-kinesisiq" className="scroll-mt-24 space-y-8">
        <motion.h2
          className="text-3xl font-bold text-white sm:text-4xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          What is KinesisIQ?
        </motion.h2>
        <motion.div
          className="space-y-6 text-lg leading-relaxed text-zinc-300 sm:text-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl sm:text-2xl font-medium text-white"
          >
            KinesisIQ transforms real-world interactions into{" "}
            <span className="text-orange-400">early signals</span> and{" "}
            <span className="text-purple-400">emerging patterns</span>.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <p>
              We combine{" "}
              <strong className="text-white">public data sources</strong> like
              city surveys, economic indicators, and official communications
              with{" "}
              <strong className="text-white">real-time community inputs</strong>{" "}
              to help you understand what&apos;s happening now and anticipate
              what comes next. This multi-layered approach ensures you have a
              complete picture of community sentiment and behavior.
            </p>
            <p>
              Our intelligent platform processes aggregated data to generate
              actionable signals about sentiment, intent, behavior, and emerging
              patterns. These signals enable confident decision-making before
              change fully unfolds, giving you the strategic advantage of
              foresight rather than hindsight.
            </p>
            <p>
              Built by Digital Placemaking, KinesisIQ helps cities, businesses,
              and communities read the pulse of humanity. We transform complex
              data streams into clear, actionable intelligence that drives
              better outcomes for everyone.
            </p>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          {featureCards.map((card, i) => {
            const glowColors = {
              blue: "rgba(59, 130, 246, 0.3)",
              orange: "rgba(241, 102, 9, 0.3)",
              purple: "rgba(168, 85, 247, 0.3)",
            };
            const glowColor = card.iconColor.includes("blue")
              ? glowColors.blue
              : card.iconColor.includes("orange")
              ? glowColors.orange
              : glowColors.purple;

            const getBoxShadow = () => {
              if (card.iconColor.includes("blue"))
                return "0 10px 40px -10px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.1)";
              if (card.iconColor.includes("orange"))
                return "0 10px 40px -10px rgba(241, 102, 9, 0.2), 0 0 0 1px rgba(241, 102, 9, 0.1)";
              return "0 10px 40px -10px rgba(168, 85, 247, 0.2), 0 0 0 1px rgba(168, 85, 247, 0.1)";
            };

            const getGlowGradient = () => {
              if (card.iconColor.includes("blue"))
                return "radial-gradient(circle at center, rgba(59, 130, 246, 0.05), transparent 70%)";
              if (card.iconColor.includes("orange"))
                return "radial-gradient(circle at center, rgba(241, 102, 9, 0.05), transparent 70%)";
              return "radial-gradient(circle at center, rgba(168, 85, 247, 0.05), transparent 70%)";
            };

            return (
              <motion.div
                key={card.title}
                className={`group relative p-8 rounded-xl border-2 ${card.borderColor} bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/80 hover:border-opacity-100 cursor-pointer overflow-hidden min-h-[280px] shadow-lg hover:shadow-xl`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                style={{
                  boxShadow: getBoxShadow(),
                }}
              >
                {/* Subtle glow gradient background */}
                <div
                  className="absolute inset-0 pointer-events-none z-0 opacity-50"
                  style={{
                    background: getGlowGradient(),
                  }}
                />
                {/* Hover glow effect - fast and responsive */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out rounded-xl z-[1]"
                  style={{
                    background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`,
                    filter: "blur(20px)",
                  }}
                />
                {/* Content */}
                <div className="relative z-10">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${card.bgColor} mb-4 transition-all duration-150 ease-out group-hover:scale-110 group-hover:rotate-3`}
                    style={{
                      boxShadow: `0 0 20px ${glowColor}`,
                    }}
                  >
                    <card.icon
                      className={`h-7 w-7 ${card.iconColor} transition-transform duration-150 ease-out group-hover:scale-110`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white transition-colors duration-150">
                    {card.title}
                  </h3>
                  <p className="text-base text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors duration-150">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </ScrollAnimation>
  );
}
