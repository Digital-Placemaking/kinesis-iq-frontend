/**
 * app/page.tsx
 * Homepage component for the KinesisIQ platform.
 * Main landing page showcasing platform features and value proposition.
 *
 * Features:
 * - Smooth scroll animations using Framer Motion
 * - Responsive design (mobile-first)
 * - Dark mode support
 *
 * @component
 */

"use client";

import { useState, useEffect } from "react";
import AuthCallbackHandler from "./components/AuthCallbackHandler";
import { LoadingScreen } from "./components/landing/LoadingScreen";
import { HeroSection } from "./components/landing/HeroSection";
import { DetailsSection } from "./components/landing/DetailsSection";
import { TestimonialsSection } from "./components/landing/TestimonialsSection";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  // Preload images
  useEffect(() => {
    const imagesToLoad = [
      "/toronto-skyline.jpg",
      "/dp-logo.png",
      "/KiQ Quantum Logo Final Black Circle Transparent.png",
    ];

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
      <AuthCallbackHandler />
      <LoadingScreen isLoading={isLoading} />
      <HeroSection isLoading={isLoading} />
      <DetailsSection />
      <TestimonialsSection />
    </div>
  );
}
