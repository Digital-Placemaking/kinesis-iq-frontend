/**
 * ReportingSection Component
 * Early Signals & Reporting section with CTA buttons.
 */

"use client";

import { motion } from "framer-motion";
import { ScrollAnimation } from "./ScrollAnimation";

export function ReportingSection() {
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
            Early Signals & Reporting
          </motion.h2>
          <motion.p 
            className="text-lg leading-relaxed text-zinc-300 sm:text-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            KinesisIQ transforms real-world interactions into early signals and emerging patterns. 
            Our comprehensive reporting dashboard visualizes engagement metrics, sentiment distribution, 
            and location performance analytics, helping governments and businesses make data-driven decisions 
            while maintaining strict privacy protocols and consent awareness.
          </motion.p>
        </motion.div>
        <div className="flex flex-wrap gap-4 pt-4">
          <motion.a
            href="/demo/reporting"
            className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: "#f16609", boxShadow: "0 10px 40px -10px rgba(241, 102, 9, 0.3)" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            View Demo Dashboard →
          </motion.a>
          <motion.a
            href="/contact"
            className="inline-flex items-center rounded-lg border border-zinc-600 bg-zinc-900/80 backdrop-blur-sm px-6 py-3 text-sm font-medium text-zinc-200 transition-all hover:bg-zinc-800/80 hover:border-zinc-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
          </motion.a>
        </div>
      </div>
    </ScrollAnimation>
  );
}


