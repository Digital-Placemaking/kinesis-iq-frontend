"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

/**
 * Navbar - Main navigation component for the website
 * Responsive navigation with logo, mobile menu, and CTA button
 * Includes active state detection and smooth scroll behavior
 */
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const pathname = usePathname();

  // Reliable scroll detection that works on all pages
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
          const lastScroll = lastScrollYRef.current;
          const scrollDelta = currentScroll - lastScroll;
          
          setIsScrolled(currentScroll > 20);
          
          // Always show navbar at top
          if (currentScroll < 10) {
            setIsVisible(true);
            lastScrollYRef.current = currentScroll;
            ticking = false;
            return;
          }
          
          // Hide navbar on scroll down, show on scroll up with threshold
          if (scrollDelta > 5 && currentScroll > 100) {
            setIsVisible(false);
          } else if (scrollDelta < -5) {
            setIsVisible(true);
          }
          
          lastScrollYRef.current = currentScroll;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ 
        y: (isVisible || mobileMenuOpen) ? 0 : -100,
        opacity: (isVisible || mobileMenuOpen) ? 1 : 0
      }}
      transition={{ 
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className="sticky top-0 z-50 w-full border-b border-zinc-800/40 bg-zinc-950/70 backdrop-blur-md transition-all relative"
      style={{
        backgroundColor: isScrolled
          ? "rgba(9, 9, 11, 0.85)"
          : "rgba(9, 9, 11, 0.65)",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/dp-logo.png"
              alt="Digital Placemaking"
              className="h-8 w-8 object-contain"
            />
            <span className="text-base sm:text-lg font-semibold text-white">
              Digital Placemaking
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-10">
            <Link
              href="/how-it-works"
              className={`text-sm sm:text-base font-medium transition-colors relative ${
                isActive("/how-it-works")
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              How It Works
              {isActive("/how-it-works") && (
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange-500"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
              )}
            </Link>
            <Link
              href="/demo/reporting"
              className={`text-sm sm:text-base font-medium transition-colors relative ${
                isActive("/demo")
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Demo
              {isActive("/demo") && (
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange-500"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
              )}
            </Link>
            <Link
              href="/about-us"
              className={`text-sm sm:text-base font-medium transition-colors relative ${
                isActive("/about-us")
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              About
              {isActive("/about-us") && (
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange-500"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
              )}
            </Link>
            <Link
              href="/contact"
              className={`text-sm sm:text-base font-medium transition-colors relative ${
                isActive("/contact")
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Contact
              {isActive("/contact") && (
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange-500"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
              )}
            </Link>
          </div>

          {/* CTA and Logo */}
          <div className="hidden md:flex items-center gap-4">
            {/* KinesisIQ Logo */}
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity"
              aria-label="KinesisIQ"
            >
              <img
                src="/KiQ Quantum Logo Final Black Circle Transparent.png"
                alt="KinesisIQ"
                className="h-8 w-8 object-contain opacity-90"
              />
            </Link>
            <Link href="/contact">
              <Button
                variant="default"
                size="default"
                className="text-white hover:opacity-90"
                style={{ backgroundColor: "#f16609" }}
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-blue-400 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            type="button"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="md:hidden overflow-hidden"
            >
              <motion.div
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                exit={{ y: -10 }}
                transition={{
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.05,
                }}
                className="border-t border-zinc-800/50 py-4 space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <Link
                    href="/how-it-works"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-sm font-medium transition-colors ${
                      isActive("/how-it-works")
                        ? "text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    How It Works
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.15 }}
                >
                  <Link
                    href="/demo/reporting"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-sm font-medium transition-colors ${
                      isActive("/demo")
                        ? "text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Demo
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                >
                  <Link
                    href="/about-us"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-sm font-medium transition-colors ${
                      isActive("/about-us")
                        ? "text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    About
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.25 }}
                >
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-sm font-medium transition-colors ${
                      isActive("/contact")
                        ? "text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Contact
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                  className="flex items-center gap-3 pt-2"
                >
                  {/* KinesisIQ Logo */}
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center hover:opacity-80 transition-opacity"
                    aria-label="KinesisIQ"
                  >
                    <img
                      src="/KiQ Quantum Logo Final Black Circle Transparent.png"
                      alt="KinesisIQ"
                      className="h-7 w-7 object-contain opacity-90"
                    />
                  </Link>
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full text-white hover:opacity-90"
                      style={{ backgroundColor: "#f16609" }}
                    >
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
