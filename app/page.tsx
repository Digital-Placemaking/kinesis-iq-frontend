/**
 * app/page.tsx
 * Homepage component for the KinesisIQ platform.
 * Main landing page showcasing platform features and value proposition.
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
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MessageSquare, TrendingUp, Users, Brain, Database, Cpu, Sparkles, BarChart3, Network, Zap } from "lucide-react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AuthCallbackHandler from "./components/AuthCallbackHandler";


// Quotes array for scrolling testimonials
const QUOTES = [
  {
    text: "Your technology, it looks fantastic.",
    author: "Sharon Sukhdeo",
    role: "Program Manager, Ontario Centre of Innovation",
  },
  {
    text: "We had a chance to review Digital Placemaking and we're genuinely impressed by what you're building. The vision of transforming physical spaces into AI smart hubs—making the physical world as measurable and responsive as the digital one—is a sophisticated approach to bridging the gap between our physical and digital environments.",
    author: "Tessa Clarance",
    role: "Chief of Staff, GetFresh Ventures",
  },
  {
    text: "Reading the pulse of humanity—turning insight into foresight.",
    author: "KinesisIQ",
    role: "Platform Tagline",
  },
  {
    text: "It lets organizations act before change hits, turning real-world behavior into a strategic advantage.",
    author: "KinesisIQ",
    role: "Platform Value Proposition",
  },
  {
    text: "KinesisIQ transforms real-world interactions into foresight.",
    author: "KinesisIQ",
    role: "Platform Description",
  },
  {
    text: "By capturing and analyzing engagement across a network of businesses, communities, and users, KinesisIQ applies probabilistic modeling to predict how groups of people will think, move, and respond.",
    author: "KinesisIQ",
    role: "Platform Capabilities",
  },
];

/**
 * ScrollAnimation Component
 *
 * Wraps content with Framer Motion scroll-triggered animations.
 * Animates elements as they enter the viewport with a smooth fade-up effect.
 * Optimized for slow scrolling with earlier trigger point.
 *
 * @param {React.ReactNode} children - Content to animate
 * @returns {JSX.Element} Animated wrapper component
 */
function ScrollAnimation({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  // Trigger animation earlier (200px before entering viewport) for slow scrolling
  const isInView = useInView(ref, { once: true, margin: "-200px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Sequential Line Animation Component - Smooth wave pattern
function SequentialNetworkVisual({ className }: { className?: string }) {
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
  
  // Define connection paths - blue only connects to blue, orange only to orange
  const connections = [
    // Input to center - navy from navy nodes (120, 280), orange from orange nodes (150, 200, 250)
    { id: 0, d: "M 120 160 L 200 300", color: "#23137f", isOrange: false },
    { id: 1, d: "M 150 180 L 200 300", color: "#f16609", isOrange: true },
    { id: 2, d: "M 200 150 L 200 300", color: "#f16609", isOrange: true },
    { id: 3, d: "M 250 180 L 200 300", color: "#f16609", isOrange: true },
    { id: 4, d: "M 280 160 L 200 300", color: "#23137f", isOrange: false },
    // Cross-connections between orange input nodes only
    { id: 5, d: "M 150 180 L 200 150", color: "#f16609", isOrange: true },
    { id: 6, d: "M 200 150 L 250 180", color: "#f16609", isOrange: true },
    // Cross-connections between blue input nodes only
    { id: 7, d: "M 120 160 L 280 160", color: "#23137f", isOrange: false },
    // Center to output - navy to navy nodes (120, 280), orange to orange nodes (150, 200, 250)
    { id: 8, d: "M 200 300 L 120 440", color: "#23137f", isOrange: false },
    { id: 9, d: "M 200 300 L 150 420", color: "#f16609", isOrange: true },
    { id: 10, d: "M 200 300 L 200 450", color: "#f16609", isOrange: true },
    { id: 11, d: "M 200 300 L 250 420", color: "#f16609", isOrange: true },
    { id: 12, d: "M 200 300 L 280 440", color: "#23137f", isOrange: false },
    // Cross-connections between orange output nodes only
    { id: 13, d: "M 150 420 L 200 450", color: "#f16609", isOrange: true },
    { id: 14, d: "M 200 450 L 250 420", color: "#f16609", isOrange: true },
    // Cross-connections between blue output nodes only
    { id: 15, d: "M 120 440 L 280 440", color: "#23137f", isOrange: false },
  ];
  
  // Random aesthetic dots - purely decorative, not connected - more spread out and varied
  const aestheticDots = [
    // Left side - more dots, better spread
    { cx: 60, cy: 150, isOrange: true, size: 3.5 },
    { cx: 75, cy: 220, isOrange: false, size: 2.8 },
    { cx: 85, cy: 300, isOrange: true, size: 3 },
    { cx: 95, cy: 380, isOrange: false, size: 2.5 },
    { cx: 70, cy: 450, isOrange: true, size: 3.2 },
    { cx: 100, cy: 520, isOrange: false, size: 2.3 },
    // Right side - more dots, better spread
    { cx: 340, cy: 160, isOrange: true, size: 3.5 },
    { cx: 325, cy: 240, isOrange: false, size: 2.8 },
    { cx: 315, cy: 320, isOrange: true, size: 3 },
    { cx: 330, cy: 400, isOrange: false, size: 2.5 },
    { cx: 320, cy: 470, isOrange: true, size: 3.2 },
    { cx: 310, cy: 540, isOrange: false, size: 2.3 },
    // Top area - scattered
    { cx: 120, cy: 100, isOrange: false, size: 2.5 },
    { cx: 280, cy: 110, isOrange: true, size: 2.8 },
    { cx: 160, cy: 130, isOrange: true, size: 2.2 },
    { cx: 240, cy: 125, isOrange: false, size: 2.4 },
    // Bottom area - scattered
    { cx: 150, cy: 490, isOrange: true, size: 2.5 },
    { cx: 250, cy: 510, isOrange: false, size: 2.8 },
    { cx: 180, cy: 530, isOrange: true, size: 2.2 },
    { cx: 220, cy: 550, isOrange: false, size: 2.4 },
    // Middle left/right - more depth
    { cx: 50, cy: 280, isOrange: true, size: 2.6 },
    { cx: 50, cy: 420, isOrange: false, size: 2.4 },
    { cx: 350, cy: 290, isOrange: true, size: 2.6 },
    { cx: 350, cy: 410, isOrange: false, size: 2.4 },
  ];
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;
    
    const cycleLines = () => {
      setActiveLineIndex(currentIndex);
      currentIndex = (currentIndex + 1) % connections.length;
      // Smooth cycle timing
      timeoutId = setTimeout(() => cycleLines(), 1800);
    };
    
    // Start the cycle after initial delay
    timeoutId = setTimeout(() => cycleLines(), 1500);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);
  
  return (
    <svg
      className={className}
      viewBox="0 0 400 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Network nodes - smoother design */}
      {/* Input nodes (top) */}
      {[
        { cx: 120, cy: 160, isOrange: false },
        { cx: 150, cy: 180, isOrange: true },
        { cx: 200, cy: 150, isOrange: true },
        { cx: 250, cy: 180, isOrange: true },
        { cx: 280, cy: 160, isOrange: false },
      ].map((node, i) => (
        <g key={`input-node-${i}`}>
          {/* Outer glow - smooth and soft */}
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="12"
            fill={node.isOrange ? "rgba(241, 102, 9, 0.15)" : "rgba(35, 19, 127, 0.15)"}
            animate={{
              opacity: [0.2, 0.35, 0.2],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 4 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.15,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
          {/* Middle ring */}
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="7"
            fill={node.isOrange ? "rgba(241, 102, 9, 0.25)" : "rgba(35, 19, 127, 0.25)"}
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.15,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
          {/* Core dot - smooth and solid */}
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="4"
            fill={node.isOrange ? "#f16609" : "#23137f"}
            animate={{
              opacity: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 2.5 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.15,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        </g>
      ))}
      
      {/* Central processing hub - enhanced orange with occasional pulses */}
      <g>
        {/* Outer glow layers - stronger orange */}
        <motion.circle
          cx="200"
          cy="300"
          r="32"
          fill="rgba(241, 102, 9, 0.12)"
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
        <motion.circle
          cx="200"
          cy="300"
          r="24"
          fill="rgba(241, 102, 9, 0.25)"
          animate={{
            opacity: [0.25, 0.4, 0.25],
            scale: [1, 1.18, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
        {/* Middle ring with occasional pulse */}
        <motion.circle
          cx="200"
          cy="300"
          r="18"
          fill="rgba(241, 102, 9, 0.4)"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
        {/* Core hub - bright orange */}
        <motion.circle
          cx="200"
          cy="300"
          r="12"
          fill="#f16609"
          animate={{
            opacity: [0.95, 1, 0.95],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
        {/* Occasional sparkle effect */}
        {[0, 1, 2].map((i) => {
          const angle = (i * 120 * Math.PI) / 180;
          const radius = 20;
          const x = 200 + radius * Math.cos(angle);
          const y = 300 + radius * Math.sin(angle);
          return (
            <motion.circle
              key={`sparkle-${i}`}
              cx={x}
              cy={y}
              r="2"
              fill="#f16609"
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </g>
      
      {/* Output nodes (bottom) - symmetrical with top (3 orange, 2 navy) */}
      {[
        { cx: 120, cy: 440, isOrange: false },
        { cx: 150, cy: 420, isOrange: true },
        { cx: 200, cy: 450, isOrange: true },
        { cx: 250, cy: 420, isOrange: true },
        { cx: 280, cy: 440, isOrange: false },
      ].map((node, i) => (
        <g key={`output-node-${i}`}>
          {/* Outer glow - smooth and soft */}
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="12"
            fill={node.isOrange ? "rgba(241, 102, 9, 0.15)" : "rgba(35, 19, 127, 0.15)"}
            animate={{
              opacity: [0.2, 0.35, 0.2],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 4 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.15 + 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
          {/* Middle ring */}
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="7"
            fill={node.isOrange ? "rgba(241, 102, 9, 0.25)" : "rgba(35, 19, 127, 0.25)"}
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.15 + 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
          {/* Core dot - smooth and solid */}
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="4"
            fill={node.isOrange ? "#f16609" : "#23137f"}
            animate={{
              opacity: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 2.5 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.15 + 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        </g>
      ))}
      
      {/* Engaging wave pattern with 3D effect for center connections */}
      {connections.map((conn, index) => {
        const isActive = activeLineIndex === index;
        const wasActive = activeLineIndex === (index - 1 + connections.length) % connections.length;
        const willBeActive = activeLineIndex === (index + 1) % connections.length;
        const isOrangeLine = conn.isOrange;
        // Check if line connects to center (200, 300)
        const connectsToCenter = conn.d.includes("200 300");
        
        return (
          <g key={conn.id}>
            {/* Enhanced 3D glow for lines connecting to center */}
            {isActive && connectsToCenter && (
              <>
                {/* Deep shadow layer for 3D depth */}
                <motion.path
                  d={conn.d}
                  strokeWidth={isOrangeLine ? "8" : "7"}
                  fill="none"
                  strokeLinecap="round"
                  stroke="rgba(0, 0, 0, 0.4)"
                  opacity="0.3"
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: 1,
                  }}
                  transition={{ 
                    duration: 1.8,
                    ease: "easeOut"
                  }}
                  style={{
                    filter: "blur(4px)",
                    transform: "translate(2px, 2px)",
                  }}
                />
                {/* Mid shadow layer */}
                <motion.path
                  d={conn.d}
                  strokeWidth={isOrangeLine ? "6" : "5"}
                  fill="none"
                  strokeLinecap="round"
                  stroke={conn.color}
                  opacity="0.25"
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: 1,
                  }}
                  transition={{ 
                    duration: 1.8,
                    ease: "easeOut"
                  }}
                  style={{
                    filter: "blur(2px)",
                    transform: "translate(1px, 1px)",
                  }}
                />
              </>
            )}
            
            {/* Enhanced glow for orange lines */}
            {isActive && isOrangeLine && (
              <motion.path
                d={conn.d}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                stroke="#f16609"
                opacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ 
                  duration: 1.5, 
                  ease: "easeInOut",
                  opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              />
            )}
            {/* Subtle glow for navy lines */}
            {isActive && !isOrangeLine && (
              <motion.path
                d={conn.d}
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                stroke={conn.color}
                opacity="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            )}
            {/* Main line with 3D effect for center connections */}
            <motion.path
              d={conn.d}
              strokeWidth={isOrangeLine ? (connectsToCenter ? "3.5" : "3") : (connectsToCenter ? "3" : "2.5")}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: isActive ? 1 : wasActive ? 1 : 0,
                opacity: isActive 
                  ? (isOrangeLine ? 1 : 0.85) 
                  : wasActive 
                  ? (isOrangeLine ? 0.4 : 0.3) 
                  : willBeActive 
                  ? 0.1 
                  : 0,
                stroke: conn.color,
                filter: isActive && connectsToCenter ? "drop-shadow(0 0 8px " + conn.color + ")" : "none",
              }}
              transition={{
                pathLength: { 
                  duration: isActive ? 1.8 : 0.3, 
                  ease: [0.4, 0, 0.2, 1]
                },
                opacity: { 
                  duration: 0.5, 
                  ease: [0.4, 0, 0.2, 1]
                },
              }}
            />
            {/* Pulse effect on center-connecting lines */}
            {isActive && connectsToCenter && (
              <motion.circle
                cx="200"
                cy="300"
                r={isOrangeLine ? "5" : "4"}
                fill={conn.color}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </g>
        );
      })}
      
      {/* Aesthetic dots - brightness based on distance from center */}
      {aestheticDots.map((dot, i) => {
        // Calculate distance from center (200, 300)
        const centerX = 200;
        const centerY = 300;
        const distance = Math.sqrt(Math.pow(dot.cx - centerX, 2) + Math.pow(dot.cy - centerY, 2));
        const maxDistance = Math.sqrt(Math.pow(400, 2) + Math.pow(600, 2)); // Max possible distance
        const distanceRatio = distance / maxDistance;
        // Far dots are dimmer (0.2-0.6 opacity range), close dots are brighter (0.5-1.0)
        const baseOpacity = 0.5 - (distanceRatio * 0.3);
        const maxOpacity = 1.0 - (distanceRatio * 0.4);
        
        return (
          <g key={`aesthetic-${i}`}>
            {/* Outer glow - dimmer for far dots */}
            <motion.circle
              cx={dot.cx}
              cy={dot.cy}
              r={dot.size * 2.5}
              fill={dot.isOrange ? "rgba(241, 102, 9, 0.2)" : "rgba(35, 19, 127, 0.2)"}
              animate={{
                opacity: [baseOpacity * 0.2, baseOpacity * 0.4, baseOpacity * 0.2],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
            {/* Main dot - brightness based on distance */}
            <motion.circle
              cx={dot.cx}
              cy={dot.cy}
              r={dot.size}
              fill={dot.isOrange ? "#f16609" : "#23137f"}
              animate={{
                opacity: [baseOpacity, maxOpacity, baseOpacity, maxOpacity * 0.8, baseOpacity],
                scale: [0.8, 1.3, 0.9, 1.2, 0.8],
              }}
              transition={{
                duration: 2.5 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeInOut",
              }}
            />
            {/* Inner bright core - dimmer for far dots */}
            <motion.circle
              cx={dot.cx}
              cy={dot.cy}
              r={dot.size * 0.5}
              fill={dot.isOrange ? "#ff8c42" : "#4a3fa8"}
              animate={{
                opacity: [baseOpacity * 0.6, maxOpacity, baseOpacity * 0.6],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 1.8 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Track scroll progress for background gradient
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const maxScroll = documentHeight - windowHeight;
      const progress = Math.min(scrollTop / maxScroll, 1);
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Preload images
  useEffect(() => {
    const imagesToLoad = ["/toronto-skyline.jpg", "/dp-logo.png", "/KiQ Quantum Logo Final Black Circle Transparent.png"];

    let loadedCount = 0;
    const totalImages = imagesToLoad.length;

    const handleImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    };

    const handleImageError = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    };

    imagesToLoad.forEach((src) => {
      const img = new Image();
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      img.src = src;
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Handles OAuth callbacks and session establishment */}
      <AuthCallbackHandler />

      {/* Navbar */}
      <Navbar />

      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-4"
            >
              <img
                src="/dp-logo.png"
                alt="Digital Placemaking"
                className="h-16 w-16 object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-20 lg:pr-0">
          {/* Left Side - Main Content */}
          {/* 
            Branding and hero text with staggered fade-in animations.
            Each section animates in sequence for a polished entrance effect.
          */}
          <div className="flex flex-col justify-center space-y-8 py-12 lg:py-24 lg:pl-32 lg:pr-0">
            {/* Main headline and description - First animation */}
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
                {/* Logo and branding - Badge style */}
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
                  {/* KinesisIQ Logo - larger, more prominent */}
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
                early signals and emerging patterns. See what's happening now
                and anticipate what comes next.
              </motion.p>
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
              <Link
                href="/contact"
                className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: "#f16609" }}
              >
                Get started
              </Link>
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

          {/* Right Side - Abstract Signal Flow Visual */}
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
              {/* Animated gradient glow - cycling orange and blue */}
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
              
              {/* Signal flow visualization with wave pattern animations */}
              <div className="absolute inset-0 w-full h-full">
                <SequentialNetworkVisual className="w-full h-full" />
              </div>
              
              {/* Simplified labels - visually heavy, less text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-20 pointer-events-none">
                {/* Top: Community Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{ 
                    delay: 0.8,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative z-20"
                >
                  <div className="text-lg font-bold text-white uppercase tracking-wider"
                    style={{
                      textShadow: "0 2px 16px rgba(0, 0, 0, 0.95), 0 0 30px rgba(0, 0, 0, 0.8)",
                    }}
                  >
                    Community Input
                  </div>
                </motion.div>
                
                {/* Center: Early Signals */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                  }}
                  transition={{ 
                    delay: 1,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative z-20"
                >
                  <div className="text-xl font-bold text-white uppercase tracking-wider"
                    style={{
                      textShadow: "0 2px 20px rgba(0, 0, 0, 1), 0 0 40px rgba(0, 0, 0, 0.7)",
                    }}
                  >
                    Early Signals
                  </div>
                </motion.div>
                
                {/* Bottom: Emerging Patterns */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ 
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{ 
                    delay: 1.2,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative z-20"
                >
                  <div className="text-lg font-bold text-white uppercase tracking-wider"
                    style={{
                      textShadow: "0 2px 16px rgba(0, 0, 0, 0.95), 0 0 30px rgba(0, 0, 0, 0.8)",
                    }}
                  >
                    Emerging Patterns
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Details Section - Scrollable Content with Smooth Scroll-Responsive Background */}
      {/* 
        Content section below the hero with:
        - Platform description
        - Value proposition tagline
        - Customer testimonials
        All sections use ScrollAnimation for fade-in effects on scroll.
        Smooth background gradient responds to scroll position.
      */}
      <section className="relative min-h-screen py-24 overflow-hidden">
        {/* Smooth scroll-responsive gradient background - earlier orange, smoother blend */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, 
              rgb(9, 9, 11) 0%, 
              rgb(9, 9, 11) ${Math.max(5, 15 - scrollProgress * 10)}%, 
              rgba(35, 19, 127, ${Math.min(0.2, scrollProgress * 0.3)}) ${15 + scrollProgress * 20}%, 
              rgba(241, 102, 9, ${Math.min(0.18, scrollProgress * 0.25)}) ${35 + scrollProgress * 20}%, 
              rgba(35, 19, 127, ${Math.min(0.12, scrollProgress * 0.18)}) ${55 + scrollProgress * 15}%, 
              rgb(9, 9, 11) ${70 + scrollProgress * 15}%, 
              rgb(9, 9, 11) 100%)`,
            transition: 'background 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        
        {/* Subtle animated orbs in background - smooth and elegant */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          {[...Array(4)].map((_, i) => {
            const baseX = 15 + (i * 25);
            const baseY = 20 + (i * 20);
            const isOrange = i % 2 === 1;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${100 + i * 30}px`,
                  height: `${100 + i * 30}px`,
                  left: `${baseX}%`,
                  top: `${baseY}%`,
                  background: `radial-gradient(circle, rgba(${isOrange ? '241, 102, 9' : '35, 19, 127'}, ${0.08 + scrollProgress * 0.05}) 0%, transparent 70%)`,
                  filter: 'blur(60px)',
                }}
                animate={{
                  x: [0, Math.sin(i * 0.8) * 40, 0],
                  y: [0, Math.cos(i * 0.8) * 40, 0],
                }}
                transition={{
                  duration: 12 + i * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.8,
                }}
              />
            );
          })}
        </div>
        
        {/* Smooth scroll indicator line - left side only */}
        <div
          className="fixed left-8 top-0 bottom-0 w-0.5 -z-10 transition-all duration-300 ease-out"
          style={{
            background: `linear-gradient(to bottom, 
              transparent 0%, 
              rgba(241, 102, 9, 0.3) ${scrollProgress * 100}%, 
              transparent ${scrollProgress * 100}%)`,
          }}
        />
        
        {/* Orange dot on left - going down */}
        <motion.div
          className="fixed left-7 -z-10"
          style={{
            top: `${scrollProgress * 100}%`,
            transform: 'translateY(-50%)',
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 30,
          }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ 
              backgroundColor: '#f16609',
              boxShadow: '0 0 16px rgba(241, 102, 9, 0.7)',
            }}
          />
        </motion.div>
        
        <div className="relative z-10">
        <div className="mx-auto max-w-4xl space-y-16 px-8">
          {/* KinesisIQ Description Section */}
          {/* Target for smooth scroll from "Learn more" button */}
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
                  real-time community inputs to help governments and businesses understand what's happening now 
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
                {[
                  {
                    title: "Multi-Source Data",
                    description: "Combines public data, surveys, and real-time community inputs for comprehensive insights",
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
                    title: "Predictive Insights",
                    description: "See what's happening now and anticipate what comes next with probabilistic modeling",
                    icon: Sparkles,
                    iconColor: "text-purple-400",
                    bgColor: "bg-purple-500/10",
                    borderColor: "border-purple-500/30",
                  },
                ].map((card, i) => (
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

          {/* Tagline */}
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

          {/* How It Works Preview Section */}
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
                  four core capabilities that work in concert to deliver predictive insights 
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
                {[
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
                    title: "Predictive Insights",
                    description: "Forecast how groups will think and respond",
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
                ].map((feature, index) => (
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

          {/* Reporting & Analytics Section */}
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
                  and location performance analytics—helping governments and businesses make data-driven decisions 
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
                  View Analytics Demo →
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

        </div>
        </div>
      </section>

      {/* Scrolling Quotes Section - Separate section with dark background */}
      <section className="bg-zinc-950 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="flex justify-center">
              <div
                className="relative overflow-hidden py-6"
                style={{ width: "90vw", maxWidth: "100%" }}
              >
                {/* Gradient overlays for fade effect */}
                <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-zinc-950 to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-zinc-950 to-transparent" />

                {/* Scrolling quotes */}
                <div className="flex animate-scroll gap-6">
                  {/* First set of quotes */}
                  {QUOTES.map((quote, index) => (
                    <div
                      key={`quote-1-${index}`}
                      className="flex shrink-0 flex-row items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                      style={{ maxWidth: "600px", minWidth: "500px" }}
                    >
                      <span className="text-2xl leading-none text-zinc-300 dark:text-zinc-700 shrink-0">
                        &ldquo;
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug text-zinc-700 dark:text-zinc-300 sm:text-base">
                          {quote.text}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <p className="text-xs font-semibold text-black dark:text-zinc-50">
                            {quote.author}
                          </p>
                          <span className="text-xs text-zinc-400 dark:text-zinc-600">
                            •
                          </span>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {quote.role}
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl leading-none text-zinc-300 dark:text-zinc-700 shrink-0">
                        &rdquo;
                      </span>
                    </div>
                  ))}
                  {/* Duplicate set for seamless loop */}
                  {QUOTES.map((quote, index) => (
                    <div
                      key={`quote-2-${index}`}
                      className="flex shrink-0 flex-row items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                      style={{ maxWidth: "600px", minWidth: "500px" }}
                    >
                      <span className="text-2xl leading-none text-zinc-300 dark:text-zinc-700 shrink-0">
                        &ldquo;
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug text-zinc-700 dark:text-zinc-300 sm:text-base">
                          {quote.text}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <p className="text-xs font-semibold text-black dark:text-zinc-50">
                            {quote.author}
                          </p>
                          <span className="text-xs text-zinc-400 dark:text-zinc-600">
                            •
                          </span>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {quote.role}
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl leading-none text-zinc-300 dark:text-zinc-700 shrink-0">
                        &rdquo;
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
