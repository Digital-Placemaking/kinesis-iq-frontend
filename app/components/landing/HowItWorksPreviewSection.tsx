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
      description: "Capture and analyze real-world conversations",
    },
    {
      icon: TrendingUp,
      iconColor: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      title: "Emerging Patterns",
      description: "Identify how groups will think and respond",
    },
    {
      icon: Users,
      iconColor: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      title: "Behavior Modeling",
      description: "Track engagement patterns across communities",
    },
    {
      icon: Brain,
      iconColor: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      title: "Adaptive Intelligence",
      description: "Combine conversation, behavior, and place",
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
          <motion.p 
            className="text-lg leading-relaxed text-zinc-300 sm:text-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            From multi-source data collection to actionable intelligence,
            KinesisIQ transforms real-world interactions into foresight through
            four core capabilities that work in concert to generate early signals and emerging patterns 
            for governments and businesses.
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`p-6 rounded-lg border-2 ${feature.borderColor} bg-zinc-900/50 hover:bg-zinc-900/70 hover:border-opacity-50 transition-all duration-300 group`}
              whileHover={{ scale: 1.03, y: -4 }}
            >
              <motion.div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.bgColor} mb-3 group-hover:scale-110 transition-transform duration-300`}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1, type: "spring", stiffness: 200 }}
              >
                <feature.icon
                  className={`h-6 w-6 ${feature.iconColor}`}
                />
              </motion.div>
              <h3 className="font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
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


