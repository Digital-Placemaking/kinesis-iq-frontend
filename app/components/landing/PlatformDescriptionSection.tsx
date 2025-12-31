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
      description: "Combines public data, surveys, and real-time community inputs to generate early signals",
      icon: Database,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      title: "Intelligent Processing",
      description: "Advanced algorithms transform raw data into actionable signals for confident decision-making",
      icon: Cpu,
      iconColor: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
    },
    {
      title: "Emerging Patterns",
      description: "See what's happening now and identify emerging patterns with probabilistic modeling",
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
          className="space-y-5 text-lg leading-relaxed text-zinc-300 sm:text-xl"
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
          >
            KinesisIQ transforms real-world interactions into early signals and emerging patterns. 
            We combine public data sources—city surveys, economic indicators, and official communications—with 
            real-time community inputs to help governments and businesses understand what&apos;s happening now 
            and anticipate what comes next.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            Our intelligent platform processes aggregated data to generate actionable signals about 
            sentiment, intent, behavior, and emerging patterns. These signals enable organizations to make 
            confident decisions before change fully unfolds—turning insight into strategic advantage.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Built by Digital Placemaking, KinesisIQ helps cities, businesses, and communities read the 
            pulse of humanity and act with foresight, not just hindsight.
          </motion.p>
        </motion.div>
        
        {/* Feature Cards */}
        <motion.div 
          className="grid gap-6 sm:grid-cols-3 mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          {featureCards.map((card, i) => (
            <motion.div
              key={card.title}
              className={`p-6 rounded-xl border-2 ${card.borderColor} bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 hover:border-opacity-50 transition-all duration-300 group`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.5 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.03, y: -4 }}
            >
              <motion.div 
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${card.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1, type: "spring", stiffness: 200 }}
              >
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </ScrollAnimation>
  );
}


