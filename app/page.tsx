/**
 * Homepage Component
 *
 * Main landing page for KinesisIQ platform showcasing:
 * - Hero section with animated text and preview image
 * - Platform description and value proposition
 * - Customer testimonials
 *
 * Features:
 * - Smooth scroll animations using Framer Motion
 * - Responsive design (mobile-first)
 * - Dark mode support
 *
 * @component
 */

"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";
import { motion } from "framer-motion";
import Footer from "./components/Footer";
import AuthCallbackHandler from "./components/AuthCallbackHandler";

// Preview image displayed on the right side of the hero section
const PREVIEW_IMAGE_URL = "/questions-dashboard-preview.png";

/**
 * ScrollAnimation Component
 *
 * Wraps content with Framer Motion scroll-triggered animations.
 * Animates elements as they enter the viewport with a smooth fade-up effect.
 *
 * @param {React.ReactNode} children - Content to animate
 * @returns {JSX.Element} Animated wrapper component
 */
function ScrollAnimation({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  // Trigger animation when element is 100px before entering viewport
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Handles OAuth callbacks and session establishment */}
      <AuthCallbackHandler />

      {/* Hero Section - Split Layout */}
      {/* 
        Main hero section with two-column layout:
        - Left: Branding, headline, description, and CTA buttons
        - Right: Preview image of the platform dashboard
      */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-zinc-950">
        {/* Toronto Skyline Image Background */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <img
            src="/toronto-skyline.jpg"
            alt="Toronto Skyline"
            className="absolute top-0 left-0 w-full h-full object-cover"
            style={{
              objectPosition: "center 10%",
            }}
          />
          {/* Gradient overlay - expanded fade transition (dark mode only) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, transparent 5%, rgba(9, 9, 11, 0.1) 12%, rgba(9, 9, 11, 0.25) 20%, rgba(9, 9, 11, 0.45) 30%, rgba(9, 9, 11, 0.65) 40%, rgba(9, 9, 11, 0.85) 50%, rgb(9, 9, 11) 70%, rgb(9, 9, 11) 100%)",
            }}
          />
        </div>

        {/* Decorative gradient blur for visual depth */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[50vh] w-[50vh] rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-8xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:pr-0">
          {/* Left Side - Main Content */}
          {/* 
            Branding and hero text with staggered fade-in animations.
            Each section animates in sequence for a polished entrance effect.
          */}
          <div className="flex flex-col justify-center space-y-8 py-12 lg:py-24 lg:pl-32 lg:pr-0">
            {/* Logo and branding - First animation */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900/60 shadow-sm ring-1 ring-zinc-700 backdrop-blur">
                  <img
                    src="/dp-logo.png"
                    alt="Digital Placemaking"
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-zinc-300">
                  by Digital Placemaking
                </span>
              </div>
            </motion.div>

            {/* Main headline and description - Second animation (0.1s delay) */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                KinesisIQ
              </h1>
              <p className="text-xl leading-relaxed text-zinc-200 sm:text-2xl">
                Reading the pulse of humanity—turning insight into foresight.
              </p>
              <p className="text-lg leading-relaxed text-zinc-300">
                KinesisIQ is a Conversational Intelligence and Predictive
                Insight Platform that transforms real-world interactions into
                foresight.
              </p>
            </motion.div>

            {/* CTA Buttons - Third animation (0.2s delay) */}
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {/* Primary CTA - Links to contact form */}
              <a
                href="/contact"
                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Get started
              </a>
              {/* Secondary CTA - Smooth scrolls to "What is KinesisIQ?" section */}
              <a
                href="#what-is-kinesisiq"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById("what-is-kinesisiq");
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className="inline-flex items-center rounded-lg border border-zinc-600 bg-zinc-900/80 backdrop-blur-sm px-6 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800/80"
              >
                Learn more →
              </a>
            </motion.div>
          </div>

          {/* Right Side - Preview Image */}
          {/* 
            Dashboard preview image positioned to extend beyond the grid column.
            Uses sticky positioning to remain visible while scrolling.
            Animates in from the right with a slide effect.
          */}
          <div className="relative hidden lg:flex items-center justify-center left-[150px] w-[150%]">
            <motion.div
              className="sticky top-0 w-full"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <img
                src={PREVIEW_IMAGE_URL}
                alt="KinesisIQ Platform Preview"
                className="w-full rounded-l-xl object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Details Section - Scrollable Content */}
      {/* 
        Content section below the hero with:
        - Platform description
        - Value proposition tagline
        - Customer testimonials
        All sections use ScrollAnimation for fade-in effects on scroll.
      */}
      <section className="min-h-screen bg-white py-24 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl space-y-16 px-8">
          {/* KinesisIQ Description Section */}
          {/* Target for smooth scroll from "Learn more" button */}
          <ScrollAnimation>
            <div id="what-is-kinesisiq" className="scroll-mt-24 space-y-6">
              <h2 className="text-3xl font-bold text-black dark:text-zinc-50 sm:text-4xl">
                What is KinesisIQ?
              </h2>
              <div className="space-y-4 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-xl">
                <p>
                  KinesisIQ is a Conversational Intelligence and Predictive
                  Insight Platform that transforms real-world interactions into
                  foresight.
                </p>
                <p>
                  By capturing and analyzing engagement across a network of
                  businesses, communities, and users, KinesisIQ applies
                  probabilistic modeling to predict how groups of people will
                  think, move, and respond — locally or across regions.
                </p>
                <p>
                  It connects conversation, behavior, and place into one dynamic
                  system of intelligence, empowering organizations to see
                  emerging patterns, anticipate change, and act with confidence
                  before the future unfolds.
                </p>
              </div>
            </div>
          </ScrollAnimation>

          {/* Tagline */}
          <ScrollAnimation>
            <div className="space-y-4 border-t border-zinc-200 pt-16 dark:border-zinc-800">
              <p className="text-2xl leading-relaxed text-zinc-800 dark:text-zinc-200 sm:text-3xl">
                Reading the pulse of humanity—turning insight into foresight.
              </p>
              <p className="text-xl leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-2xl">
                It lets organizations act before change hits, turning real-world
                behavior into a strategic advantage.
              </p>
            </div>
          </ScrollAnimation>

          {/* Testimonials Section */}
          {/* 
            Customer testimonials displayed as cards.
            Note: When adding more testimonials, consider implementing a carousel component.
          */}
          <div className="space-y-8 border-t border-zinc-200 pt-16 dark:border-zinc-800">
            <ScrollAnimation>
              <div className="group rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-8 shadow-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
                <div className="mb-4 text-2xl text-zinc-400 dark:text-zinc-600">
                  "
                </div>
                <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                  ...your technology, it looks fantastic.
                </p>
                <div className="mt-6">
                  <p className="font-semibold text-black dark:text-zinc-50">
                    Sharon Sukhdeo
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Program Manager, Ontario Centre of Innovation
                  </p>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation>
              <div className="group rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-8 shadow-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
                <div className="mb-4 text-2xl text-zinc-400 dark:text-zinc-600">
                  "
                </div>
                <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                  We had a chance to review Digital Placemaking and we're
                  genuinely impressed by what you're building. The vision of
                  transforming physical spaces into AI smart hubs—making the
                  physical world as measurable and responsive as the digital
                  one—is a sophisticated approach to bridging the gap between
                  our physical and digital environments.
                </p>
                <div className="mt-6">
                  <p className="font-semibold text-black dark:text-zinc-50">
                    Tessa Clarance
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Chief of Staff, GetFresh Ventures
                  </p>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
