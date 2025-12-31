"use client";

import { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";

interface LiveNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  updateInterval?: number; // milliseconds between updates
  variance?: number; // percentage variance for live effect (0-1)
}

/**
 * LiveNumber - Displays a number that subtly updates over time to simulate live data
 * Adds small random variations to make numbers feel alive without being distracting
 */
export function LiveNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  updateInterval = 3000, // Update every 3 seconds
  variance = 0.02, // 2% variance
}: LiveNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // Set initial value
    setDisplayValue(value);
  }, [value]);

  useEffect(() => {
    // Live number updates
    const interval = setInterval(() => {
      const variation = value * variance * (Math.random() * 2 - 1); // -variance to +variance
      const newValue = Math.max(0, value + variation);
      
      const controls = animate(displayValue, newValue, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate: (latest) => {
          setDisplayValue(latest);
        },
      });

      return () => controls.stop();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [displayValue, value, updateInterval, variance]);

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <motion.span
      className={className}
      key={formattedValue}
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </motion.span>
  );
}

