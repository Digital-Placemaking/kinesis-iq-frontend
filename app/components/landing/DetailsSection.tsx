/**
 * DetailsSection Component
 * Main content section with platform description, features, and CTAs.
 * Includes scroll-responsive background effects and scroll indicator.
 */

"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PlatformDescriptionSection } from "./PlatformDescriptionSection";
import { TaglineSection } from "./TaglineSection";
import { HowItWorksPreviewSection } from "./HowItWorksPreviewSection";
import { ReportingSection } from "./ReportingSection";

export function DetailsSection() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const detailsSectionRef = useRef<HTMLElement>(null);
  
  // Track scroll progress for background gradient - relative to details section
  useEffect(() => {
    const handleScroll = () => {
      if (!detailsSectionRef.current) {
        setScrollProgress(0);
        return;
      }
      
      const section = detailsSectionRef.current;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;
      
      // Calculate progress within the section
      const sectionStart = sectionTop - windowHeight * 0.5;
      const sectionEnd = sectionTop + sectionHeight;
      const scrollPosition = scrollTop + windowHeight * 0.5;
      
      if (scrollPosition < sectionStart) {
        setScrollProgress(0);
      } else if (scrollPosition > sectionEnd) {
        setScrollProgress(1);
      } else {
        const progress = (scrollPosition - sectionStart) / (sectionEnd - sectionStart);
        setScrollProgress(Math.max(0, Math.min(1, progress)));
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={detailsSectionRef} className="relative min-h-screen py-24 overflow-hidden">
      {/* Scroll-responsive gradient background */}
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
      
      {/* Animated background orbs */}
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
      
      {/* Scroll indicator line */}
      <div
        className="fixed left-8 top-0 bottom-0 w-0.5 -z-10 transition-opacity duration-700 ease-out"
        style={{
          opacity: scrollProgress > 0.02 ? Math.min(1, scrollProgress * 5) : 0,
          background: `linear-gradient(to bottom, 
            transparent 0%, 
            rgba(241, 102, 9, 0.3) ${Math.min(100, scrollProgress * 100)}%, 
            transparent ${Math.min(100, scrollProgress * 100)}%)`,
        }}
      />
      
      {/* Orange dot on left */}
      {scrollProgress > 0.02 && (
        <motion.div
          className="fixed left-7 -z-10"
          style={{
            top: `${Math.min(100, scrollProgress * 100)}%`,
            transform: 'translateY(-50%)',
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 50,
            mass: 0.3,
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
      )}
      
      <div className="relative z-10">
        <div className="mx-auto max-w-4xl space-y-16 px-8">
          <PlatformDescriptionSection />
          <TaglineSection />
          <HowItWorksPreviewSection />
          <ReportingSection />
        </div>
      </div>
    </section>
  );
}


