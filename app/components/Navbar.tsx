"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
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
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isScrolled ? 0 : 0 }}
      className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm transition-all"
      style={{
        backgroundColor: isScrolled
          ? "rgba(9, 9, 11, 0.95)"
          : "rgba(9, 9, 11, 0.8)",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Digital Placemaking as home link */}
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

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
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
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
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
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
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
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:block">
            <Link href="/contact">
              <Button
                variant="default"
                size="default"
                className="bg-blue-600 text-white hover:bg-blue-700"
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
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800/50 py-4 space-y-4">
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
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="default"
                size="sm"
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
