/**
 * app/about-us/page.tsx
 * About Us page component.
 * Displays information about the KinesisIQ platform and company.
 */

"use client";

import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ScrollReveal } from "../components/ui/scroll-reveal";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <Navbar />
      
      {/* Subtle background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl" />
      </div>
      
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative border-b border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 py-20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white"
            >
              About KinesisIQ
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-zinc-300 leading-relaxed"
            >
              Reading the pulse of humanity—turning insight into foresight.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-zinc-400 max-w-2xl mx-auto"
            >
              KinesisIQ by Digital Placemaking transforms real-world interactions
              into early signals and emerging patterns.
            </motion.p>
          </div>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-20 relative z-10">
        <div className="space-y-16">

          {/* KinesisIQ Platform Information */}
          <ScrollReveal>
            <div className="space-y-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm p-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  The Platform
                </h2>
                <p className="text-lg text-zinc-400">
                  KinesisIQ combines public data and community inputs to generate
                  early signals and emerging patterns.
                </p>
              </div>

              <div className="space-y-4 text-base leading-relaxed text-zinc-300">
                <p>
                  Our system captures and analyzes real-world interactions—from
                  surveys and engagement actions to location-based signals. We
                  transform aggregated, anonymized data into early signals about
                  sentiment, intent, behavior, and emerging patterns.
                </p>
                <p>
                  These signals help organizations see what's happening now and
                  anticipate what might come next. All data collection is
                  consent-aware, privacy-compliant, and designed to respect
                  individual privacy while providing valuable community insights.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Key Points */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-6 text-base leading-relaxed text-zinc-300 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm p-8">
              <p>
                <strong className="font-semibold text-zinc-50">
                  KinesisIQ is built by Digital Placemaking
                </strong>{" "}
                to help cities, businesses, and communities make better decisions
                by reading the pulse of humanity.
              </p>

              <p>
                We're transforming how organizations understand and engage with
                their communities—creating systems that reveal behaviors and
                sentiments in the very context where they happen, while
                maintaining privacy and ethical standards.
              </p>

              <p>
                <strong className="font-semibold text-zinc-50">
                  Privacy-first and consent-aware
                </strong>{" "}
                — all data is anonymized, aggregated, and designed to empower
                smarter, engaged, and connected communities.
              </p>
            </div>
          </ScrollReveal>

          {/* Contact Section */}
          <ScrollReveal delay={0.2}>
            <div className="pt-8 space-y-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm p-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Get in Touch
                </h2>
                <p className="text-zinc-400 mb-4">
                  Interested in learning more about KinesisIQ? We'd love to hear
                  from you.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-zinc-400 mb-2">
                    Email Us:
                  </p>
                  <a
                    href="mailto:sales@digitalplacemaking.ca"
                    className="inline-flex items-center gap-2 text-lg font-medium transition-colors hover:opacity-80"
                    style={{ color: "#f16609" }}
                  >
                    <Mail className="h-5 w-5" />
                    sales@digitalplacemaking.ca
                  </a>
                </div>

                <div className="pt-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: "#f16609" }}
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <Footer />
    </div>
  );
}
