"use client";

import { useEffect, useState, useRef } from "react";
import { animate } from "framer-motion";

interface AnimatedKPINumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * AnimatedKPINumber - Smoothly animates a number from 0 to target
 * Stable animation without glitching
 */
export function AnimatedKPINumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedKPINumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const isInitialMount = useRef(true);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    // Stop any existing animation
    if (animationRef.current) {
      animationRef.current.stop();
    }

    // Initial load: animate from 0 to value
    if (isInitialMount.current) {
      isInitialMount.current = false;
      animationRef.current = animate(0, value, {
        duration: 1.5,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (latest) => {
          setDisplayValue(latest);
        },
      });
    } else {
      // Subsequent updates: animate from current to new value
      animationRef.current = animate(displayValue, value, {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (latest) => {
          setDisplayValue(latest);
        },
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [value]); // Only depend on value, not displayValue

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <span className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

