/**
 * TaglineSection Component
 * Platform tagline and value proposition section.
 */

"use client";

import { motion } from "framer-motion";
import { ScrollAnimation } from "./ScrollAnimation";

export function TaglineSection() {
  return (
    <ScrollAnimation>
      <motion.div 
        className="space-y-5 pt-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <motion.p 
          className="text-2xl leading-relaxed text-white sm:text-3xl font-medium"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Reading the pulse of humanity. Turning insight into foresight.
        </motion.p>
        <motion.p 
          className="text-xl leading-relaxed text-zinc-400 sm:text-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          KinesisIQ enables governments and businesses to act before change hits, 
          transforming real-world behavior patterns into strategic advantage through 
          predictive intelligence and early signal detection.
        </motion.p>
      </motion.div>
    </ScrollAnimation>
  );
}


