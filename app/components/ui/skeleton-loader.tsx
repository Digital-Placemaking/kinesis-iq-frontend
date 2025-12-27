"use client";

import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

/**
 * SkeletonLoader - Shimmer loading state component
 * Provides visual feedback while data is loading
 */
export function SkeletonLoader({
  className = "",
  variant = "rectangular",
  width,
  height,
}: SkeletonLoaderProps) {
  const baseClasses = "bg-zinc-800 rounded";
  const variantClasses = {
    text: "h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      animate={{
        background: [
          "linear-gradient(90deg, rgb(39 39 42) 0%, rgb(63 63 70) 50%, rgb(39 39 42) 100%)",
          "linear-gradient(90deg, rgb(39 39 42) 100%, rgb(63 63 70) 50%, rgb(39 39 42) 0%)",
        ],
        backgroundPosition: ["0% 50%", "200% 50%"],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

