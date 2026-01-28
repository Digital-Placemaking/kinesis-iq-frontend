/**
 * ScrollAnimation Component
 * Scroll-triggered fade-up animation using Framer Motion.
 * Uses iOS-compatible viewport detection with fallback for reliability.
 */

"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollAnimationProps {
  children: React.ReactNode;
}

export function ScrollAnimation({ children }: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Use iOS-compatible viewport detection
  // iOS Safari can have issues with negative margins in Intersection Observer
  const isInView = useInView(ref, { 
    once: true, 
    margin: "0px 0px 0px 0px", // No negative margin for iOS compatibility
    amount: 0.1 // Trigger when at least 10% of element is visible
  });

  // Fallback: Manual viewport check for iOS Safari compatibility
  // This ensures content is visible even if Intersection Observer fails
  useEffect(() => {
    const checkInView = () => {
      if (isVisible || !ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // Element is in viewport if any part is visible (with 100px buffer)
      if (rect.top < windowHeight + 100 && rect.bottom > -100) {
        setIsVisible(true);
      }
    };

    // Check on mount (with small delay to ensure DOM is ready)
    const mountTimeout = setTimeout(checkInView, 100);
    
    // Check on scroll with throttling
    let scrollTimeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeoutId);
      scrollTimeoutId = setTimeout(checkInView, 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", checkInView, { passive: true });

    return () => {
      clearTimeout(mountTimeout);
      clearTimeout(scrollTimeoutId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkInView);
    };
  }, [isVisible]);

  // Use either Intersection Observer result or fallback
  // Ensure content is visible if either method detects it
  const shouldAnimate = isInView || isVisible;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}


