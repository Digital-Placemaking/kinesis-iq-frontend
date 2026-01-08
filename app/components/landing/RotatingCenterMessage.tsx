/**
 * RotatingCenterMessage Component
 * Rotating two-line messages in the center, cycling through value propositions and process labels.
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function RotatingCenterMessage() {
  const messagePairs = [
    { primary: "Move before change hits", secondary: "See tomorrow, today" },
    { primary: "Turn signals into decisions", secondary: "Anticipate, don't react" },
    { primary: "Community Inputs", secondary: "Early Signals" },
    { primary: "Emerging Patterns", secondary: "Turn signals into strategy" },
    { primary: "See what's coming next", secondary: "Early Signals" },
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Delay initial appearance to let network pattern load first
    const initialDelay = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    
    return () => clearTimeout(initialDelay);
  }, []);
  
  useEffect(() => {
    if (!isVisible) return;
    
    // Start cycling after initial delay
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messagePairs.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isVisible, messagePairs.length]);
  
  if (!isVisible) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ 
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-center space-y-3"
        >
          <div
            className="text-xl font-bold text-white uppercase tracking-wider"
            style={{
              textShadow: "0 2px 20px rgba(0, 0, 0, 1), 0 0 40px rgba(0, 0, 0, 0.7)",
            }}
          >
            {(() => {
              const primary = messagePairs[currentIndex].primary;
              // Add color to key phrases
              if (primary.includes("Move before")) {
                return (
                  <>
                    Move before <span className="text-orange-400">change hits</span>
                  </>
                );
              }
              if (primary.includes("Turn signals")) {
                return (
                  <>
                    Turn <span className="text-blue-400">signals</span> into decisions
                  </>
                );
              }
              if (primary.includes("Community Inputs")) {
                return (
                  <>
                    <span className="text-purple-400">Community Inputs</span>
                  </>
                );
              }
              if (primary.includes("Emerging Patterns")) {
                return (
                  <>
                    <span className="text-orange-400">Emerging Patterns</span>
                  </>
                );
              }
              if (primary.includes("See what's coming")) {
                return (
                  <>
                    See what&apos;s <span className="text-orange-400">coming next</span>
                  </>
                );
              }
              return primary;
            })()}
          </div>
          <div
            className="text-lg font-semibold text-white/90 uppercase tracking-wide"
            style={{
              textShadow: "0 2px 16px rgba(0, 0, 0, 0.95), 0 0 30px rgba(0, 0, 0, 0.8)",
            }}
          >
            {(() => {
              const secondary = messagePairs[currentIndex].secondary;
              // Add color to key phrases
              if (secondary.includes("See tomorrow")) {
                return (
                  <>
                    See <span className="text-orange-400">tomorrow</span>, today
                  </>
                );
              }
              if (secondary.includes("Anticipate")) {
                return (
                  <>
                    <span className="text-blue-400">Anticipate</span>, don&apos;t react
                  </>
                );
              }
              if (secondary.includes("Early Signals")) {
                return (
                  <>
                    <span className="text-orange-400">Early Signals</span>
                  </>
                );
              }
              if (secondary.includes("Turn signals")) {
                return (
                  <>
                    Turn <span className="text-blue-400">signals</span> into strategy
                  </>
                );
              }
              return secondary;
            })()}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


