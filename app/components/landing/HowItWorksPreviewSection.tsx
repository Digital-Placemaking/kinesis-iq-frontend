/**
 * HowItWorksPreviewSection Component
 * Preview of platform capabilities with feature cards.
 */

"use client";

import { motion } from "framer-motion";
import { MessageSquare, TrendingUp, Users, Brain } from "lucide-react";
import { ScrollAnimation } from "./ScrollAnimation";

export function HowItWorksPreviewSection() {
  const features = [
    {
      icon: MessageSquare,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      title: "Conversational Intelligence",
      description: "Capture and analyze real-world conversations to understand community sentiment, concerns, and priorities through natural language processing.",
    },
    {
      icon: TrendingUp,
      iconColor: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      title: "Emerging Patterns",
      description: "Identify how groups will think and respond by detecting subtle shifts in behavior and sentiment before they become obvious trends.",
    },
    {
      icon: Users,
      iconColor: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      title: "Behavior Modeling",
      description: "Track engagement patterns across communities to understand interactions with services, spaces, and initiatives for optimized outreach.",
    },
    {
      icon: Brain,
      iconColor: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      title: "Adaptive Intelligence",
      description: "Combine conversation, behavior, and place data to create a comprehensive understanding that evolves with your community's changing needs.",
    },
  ];

  return (
    <ScrollAnimation>
      <div className="pt-16 space-y-6">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="text-3xl font-bold text-white sm:text-4xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            How KinesisIQ Works
          </motion.h2>
          <motion.div 
            className="space-y-3 text-lg leading-relaxed text-zinc-300 sm:text-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <p>
              Four core capabilities work together to transform real-world interactions into <span className="text-orange-400 font-medium">actionable intelligence</span>. Each capability builds on the others, creating a comprehensive system that generates early signals and emerging patterns for governments and businesses.
            </p>
            <p>
              Whether you&apos;re tracking community sentiment, modeling behavior patterns, or identifying emerging trends, KinesisIQ provides the tools and insights you need to make informed decisions with confidence.
            </p>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="grid gap-6 sm:grid-cols-2 mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          {features.map((feature, index) => {
            const glowColors = {
              blue: "rgba(59, 130, 246, 0.3)",
              green: "rgba(34, 197, 94, 0.3)",
              purple: "rgba(168, 85, 247, 0.3)",
              orange: "rgba(241, 102, 9, 0.3)",
            };
            const glowColor = feature.iconColor.includes("blue") ? glowColors.blue : 
                             feature.iconColor.includes("green") ? glowColors.green :
                             feature.iconColor.includes("purple") ? glowColors.purple : 
                             glowColors.orange;

            const getBoxShadow = () => {
              if (feature.iconColor.includes("blue"))
                return "0 10px 40px -10px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.1)";
              if (feature.iconColor.includes("green"))
                return "0 10px 40px -10px rgba(34, 197, 94, 0.2), 0 0 0 1px rgba(34, 197, 94, 0.1)";
              if (feature.iconColor.includes("purple"))
                return "0 10px 40px -10px rgba(168, 85, 247, 0.2), 0 0 0 1px rgba(168, 85, 247, 0.1)";
              return "0 10px 40px -10px rgba(241, 102, 9, 0.2), 0 0 0 1px rgba(241, 102, 9, 0.1)";
            };

            const getGlowGradient = () => {
              if (feature.iconColor.includes("blue"))
                return "radial-gradient(circle at center, rgba(59, 130, 246, 0.05), transparent 70%)";
              if (feature.iconColor.includes("green"))
                return "radial-gradient(circle at center, rgba(34, 197, 94, 0.05), transparent 70%)";
              if (feature.iconColor.includes("purple"))
                return "radial-gradient(circle at center, rgba(168, 85, 247, 0.05), transparent 70%)";
              return "radial-gradient(circle at center, rgba(241, 102, 9, 0.05), transparent 70%)";
            };
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative p-8 rounded-xl border-2 ${feature.borderColor} bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/80 hover:border-opacity-100 cursor-pointer overflow-hidden min-h-[280px] shadow-lg hover:shadow-xl`}
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
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.bgColor} mb-4 transition-all duration-150 ease-out group-hover:scale-110 group-hover:rotate-3`}
                    style={{
                      boxShadow: `0 0 20px ${glowColor}`,
                    }}
                  >
                    <feature.icon
                      className={`h-7 w-7 ${feature.iconColor} transition-transform duration-150 ease-out group-hover:scale-110`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white transition-colors duration-150">
                    {feature.title}
                  </h3>
                  <p className="text-base text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors duration-150">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        <div className="flex flex-wrap gap-4 pt-4">
          <motion.a
            href="/how-it-works"
            className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: "#f16609", boxShadow: "0 10px 40px -10px rgba(241, 102, 9, 0.3)" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Learn More →
          </motion.a>
        </div>
      </div>
    </ScrollAnimation>
  );
}


