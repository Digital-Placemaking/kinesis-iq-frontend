/**
 * HeroSection Component
 * Main hero section with branding, headline, CTAs, and network visualization.
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SequentialNetworkVisual } from "../SequentialNetworkVisual";
import { RotatingCenterMessage } from "./RotatingCenterMessage";

interface HeroSectionProps {
  isLoading: boolean;
}

export function HeroSection({ isLoading }: HeroSectionProps) {
  return (
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
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, transparent 5%, rgba(9, 9, 11, 0.1) 12%, rgba(9, 9, 11, 0.25) 20%, rgba(9, 9, 11, 0.45) 30%, rgba(9, 9, 11, 0.65) 40%, rgba(9, 9, 11, 0.85) 50%, rgb(9, 9, 11) 70%, rgb(9, 9, 11) 100%)",
          }}
        />
      </div>

      {/* Background gradient blur */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[50vh] w-[50vh] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-20 lg:pr-0">
        {/* Left Side - Main Content */}
        <div className="flex flex-col justify-center space-y-8 py-12 lg:py-24 lg:pl-32 lg:pr-0">
          {/* Main headline and description */}
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
            <div className="space-y-4">
              <motion.h1 
                className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl relative"
                initial={{ opacity: 0, y: 10 }}
                animate={isLoading ? { opacity: 0 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: isLoading ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="inline-block relative">
                  <span
                    className="inline-block"
                    style={{
                      backgroundImage: "linear-gradient(135deg, #ff9d5c 0%, #ff8c42 25%, #f16609 50%, #ff8c42 75%, #ff9d5c 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    KinesisIQ
                  </span>
                  <motion.span
                    className="absolute inset-0 inline-block"
                    initial={{ opacity: 0 }}
                    animate={
                      isLoading
                        ? { opacity: 0, backgroundPosition: "-50% 0%" }
                        : {
                            opacity: 1,
                            backgroundPosition: ["-50% 0%", "250% 0%"],
                          }
                    }
                    transition={{
                      opacity: { duration: 0.3, delay: isLoading ? 0 : 1.1 },
                      backgroundPosition: {
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 3.5,
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: isLoading ? 0 : 1.1,
                      },
                    }}
                    style={{
                      backgroundImage: "linear-gradient(90deg, transparent 0%, transparent 35%, rgba(255, 255, 255, 0.2) 45%, rgba(255, 255, 255, 0.5) 48%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.5) 52%, rgba(255, 255, 255, 0.2) 55%, transparent 65%, transparent 100%)",
                      backgroundSize: "300% 100%",
                      backgroundPosition: "-50% 0%",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      willChange: "background-position",
                      pointerEvents: "none",
                    }}
                  >
                    KinesisIQ
                  </motion.span>
                </span>
              </motion.h1>
              {/* Logo and branding */}
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="inline-flex items-center gap-2 rounded-lg bg-zinc-900/60 px-3 py-1.5 backdrop-blur-sm ring-1 ring-zinc-700/50">
                  <div className="flex h-6 w-6 items-center justify-center">
                    <img
                      src="/dp-logo.png"
                      alt="Digital Placemaking"
                      className="h-5 w-5 object-contain"
                    />
                  </div>
                  <span className="text-xs font-medium text-zinc-300">
                    by Digital Placemaking
                  </span>
                </div>
                {/* KinesisIQ Logo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="ml-3"
                >
                  <img
                    src="/KiQ Quantum Logo Final Black Circle Transparent.png"
                    alt="KinesisIQ"
                    className="h-12 w-12 object-contain opacity-95 hover:opacity-100 transition-all hover:scale-110"
                  />
                </motion.div>
              </motion.div>
            </div>
            <motion.p 
              className="text-xl leading-relaxed text-zinc-200 sm:text-2xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              Reading the pulse of humanity. Turning insight into foresight.
            </motion.p>
            <motion.p 
              className="text-lg leading-relaxed text-zinc-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              KinesisIQ combines public data and community inputs to generate
              early signals and emerging patterns. See what&apos;s happening now
              and anticipate what comes next.
            </motion.p>
          </motion.div>

          {/* CTA Buttons */}
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
            <Link
              href="/contact"
              className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "#f16609" }}
            >
              Get started
            </Link>
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

        {/* Right Side - Signal Flow Visual */}
        <div className="relative hidden lg:flex items-center justify-center py-8">
          <motion.div
            className="relative w-full max-w-2xl h-[700px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1.2,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Animated gradient glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{
                background: [
                  "radial-gradient(circle at 40% 40%, rgba(35, 19, 127, 0.25) 0%, transparent 50%), radial-gradient(circle at 60% 60%, rgba(241, 102, 9, 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 60% 60%, rgba(241, 102, 9, 0.25) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(35, 19, 127, 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 40% 40%, rgba(35, 19, 127, 0.25) 0%, transparent 50%), radial-gradient(circle at 60% 60%, rgba(241, 102, 9, 0.15) 0%, transparent 50%)",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Signal flow visualization */}
            <div className="absolute inset-0 w-full h-full">
              <SequentialNetworkVisual className="w-full h-full" />
            </div>
            
            {/* Rotating center message */}
            <RotatingCenterMessage />
          </motion.div>
        </div>
      </div>
    </section>
  );
}


