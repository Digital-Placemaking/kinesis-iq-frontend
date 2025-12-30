"use client";

import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { ScrollReveal } from "@/app/components/ui/scroll-reveal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  MessageSquare,
  TrendingUp,
  Users,
  Brain,
  Shield,
  BarChart3,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";

/**
 * How It Works Page
 * Explains KinesisIQ's core capabilities and value proposition
 * Modern design with animations and clear visual hierarchy
 */

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Conversational Intelligence",
    description:
      "Capture and analyze real-world conversations to understand sentiment and intent across communities. Transform dialogue into data-driven insights.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    icon: TrendingUp,
    title: "Predictive Insights",
    description:
      "Apply probabilistic modeling to forecast how groups will think, move, and respond to changes. See patterns before they fully emerge.",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
  {
    icon: Users,
    title: "Behavior Modeling",
    description:
      "Track engagement patterns across businesses and public spaces to identify emerging trends. Understand how communities interact and evolve.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    icon: Brain,
    title: "Adaptive Intelligence",
    description:
      "Combine conversation, behavior, and place into one intelligent system for confident decision-making. Act before change hits.",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Data Collection",
    description:
      "KinesisIQ captures anonymized interaction data from surveys, engagement actions, and location-based signals. All data collection is consent-aware and privacy-compliant.",
    icon: Shield,
    color: "text-blue-400",
  },
  {
    step: "02",
    title: "Analysis & Processing",
    description:
      "Our platform uses probabilistic modeling and machine learning to identify patterns, predict trends, and generate actionable insights from aggregated data streams.",
    icon: BarChart3,
    color: "text-green-400",
  },
  {
    step: "03",
    title: "Signal Generation",
    description:
      "Transform aggregated data into early signals. Identify sentiment patterns, engagement flows, location performance, and emerging patterns across your community.",
    icon: TrendingUp,
    color: "text-purple-400",
  },
  {
    step: "04",
    title: "Actionable Intelligence",
    description:
      "Receive clear, visual reports that help you see emerging patterns, anticipate change, and act with confidence before the future unfolds.",
    icon: Brain,
    color: "text-orange-400",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative border-b border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 py-20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* KinesisIQ Logo - Integrated with title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <Link
                href="/"
                className="flex items-center hover:opacity-80 transition-opacity"
                aria-label="KinesisIQ Home"
              >
                <img
                  src="/KiQ Quantum Logo Final Black Circle Transparent.png"
                  alt="KinesisIQ"
                  className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
                />
              </Link>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white"
            >
              How KinesisIQ Works
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
              KinesisIQ transforms real-world interactions into early signals and emerging patterns, 
              helping governments and businesses see what's happening now and anticipate what comes next— 
              enabling confident decision-making before change fully unfolds.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Core Capabilities Section */}
      <section className="py-20 relative overflow-hidden bg-zinc-950">
        {/* Subtle background effects - consistent pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/3 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Core Capabilities
              </h2>
              <p className="text-lg text-zinc-400">
                Where mathematics meets humanity. Understand engagement patterns before they fully emerge, 
                enabling governments and businesses to make proactive decisions with confidence.
              </p>
            </div>
          </ScrollReveal>

          <div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto"
            style={{ gridAutoRows: "1fr" }}
          >
            {FEATURES.map((feature, index) => (
              <ScrollReveal key={feature.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -6 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="h-full"
                >
                  <Card
                    className={`border-2 ${feature.borderColor} bg-zinc-900/50 hover:bg-zinc-900/70 transition-all duration-300 backdrop-blur-sm hover:border-opacity-60 hover:shadow-lg hover:shadow-${feature.color.replace('text-', '')}/10 h-full flex flex-col group`}
                    style={{
                      boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
                    }}
                  >
                    <CardHeader className="flex-shrink-0">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: index * 0.1 + 0.3,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.bgColor} mb-4`}
                      >
                        <feature.icon className={`h-7 w-7 ${feature.color}`} />
                      </motion.div>
                      <CardTitle className="text-white text-xl mb-3 font-bold">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <CardDescription className="text-zinc-300 text-base leading-relaxed flex-1">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 relative overflow-hidden bg-zinc-950">
        {/* Subtle background effects - consistent pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 -left-32 w-96 h-96 bg-orange-500/3 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                The KinesisIQ Process
              </h2>
              <p className="text-lg text-zinc-400">
                From data collection to early signals—see how patterns emerge through our platform 
                to help organizations act with foresight, not just hindsight.
              </p>
            </div>
          </ScrollReveal>

          <div className="max-w-5xl mx-auto space-y-8">
            {WORKFLOW_STEPS.map((step, index) => (
              <ScrollReveal key={step.step} delay={index * 0.15}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 + 0.3 }}
                  className="flex flex-col md:flex-row gap-6 items-start"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            delay: index * 0.15 + 0.3,
                            type: "spring",
                            stiffness: 200,
                          }}
                          className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700 flex items-center justify-center shadow-lg"
                        >
                          <span className="text-2xl font-bold text-zinc-300">
                            {step.step}
                          </span>
                        </motion.div>
                        {index < WORKFLOW_STEPS.length - 1 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 64 }}
                            transition={{
                              delay: index * 0.15 + 0.5,
                              duration: 0.5,
                            }}
                            className="w-0.5 bg-gradient-to-b from-zinc-700 to-zinc-800 mt-2"
                          />
                        )}
                      </div>
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: index * 0.15 + 0.4,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className={`w-16 h-16 rounded-xl ${step.color
                          .replace("text-", "bg-")
                          .replace(
                            "-400",
                            "-500/20"
                          )} border border-${step.color
                          .replace("text-", "")
                          .replace(
                            "-400",
                            "-500/30"
                          )} flex items-center justify-center shadow-lg backdrop-blur-sm`}
                      >
                        <step.icon className={`h-8 w-8 ${step.color}`} />
                      </motion.div>
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 + 0.5 }}
                    className="flex-1"
                  >
                    <Card className={`border-2 ${step.color.replace('text-', 'border-').replace('-400', '-500/30')} bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 hover:border-opacity-50 transition-all duration-300 h-full group hover:shadow-lg`}>
                      <CardHeader>
                      <CardTitle className="text-white text-2xl mb-3 font-bold">
                        {step.title}
                      </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-zinc-300 text-base leading-relaxed">
                          {step.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 relative overflow-hidden bg-zinc-950">
        {/* Subtle background effects - consistent pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/3 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Why KinesisIQ?
                </h2>
                <p className="text-lg text-zinc-400">
                  Transform how you understand and engage with your community—whether you're a city planner, 
                  business leader, or government decision-maker.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid gap-6 md:grid-cols-3">
              <ScrollReveal delay={0.1}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                <Card className="border-2 border-blue-500/30 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg group">
                  <CardHeader>
                    <MapPin className="h-8 w-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <CardTitle className="text-white">
                      Location Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-zinc-300 text-base">
                      Understand how different locations perform, identify
                      hotspots, and optimize engagement strategies based on
                      geographic insights.
                    </CardDescription>
                  </CardContent>
                </Card>
                </motion.div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                <Card className="border-2 border-green-500/30 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg group">
                  <CardHeader>
                    <Clock className="h-8 w-8 text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <CardTitle className="text-white">
                      Time-Based Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-zinc-300 text-base">
                      Track engagement patterns over time, identify seasonal
                      trends, and predict future behavior with probabilistic
                      modeling.
                    </CardDescription>
                  </CardContent>
                </Card>
                </motion.div>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                <Card className="border-2 border-purple-500/30 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg group">
                  <CardHeader>
                    <Shield className="h-8 w-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <CardTitle className="text-white">Privacy-First</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-zinc-300 text-base">
                      All data is anonymized, aggregated, and consent-aware. We
                      comply with GDPR, CCPA, and other privacy regulations.
                    </CardDescription>
                  </CardContent>
                </Card>
                </motion.div>
              </ScrollReveal>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-zinc-950">
        {/* Subtle background effects - consistent pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 -left-32 w-96 h-96 bg-orange-500/3 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-zinc-400">
                Experience KinesisIQ and see how early signals and emerging patterns can inform your 
                organization's decisions—helping governments and businesses act before change hits.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Button
                  asChild
                  className="text-white hover:opacity-90"
                  style={{ backgroundColor: "#f16609" }}
                  size="lg"
                >
                  <Link href="/contact">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <Link href="/demo/reporting">View Demo</Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
