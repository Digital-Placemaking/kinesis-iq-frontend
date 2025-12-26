"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

/**
 * Navbar - Main navigation component for the website
 * Responsive navigation with logo, mobile menu, and CTA button
 */
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm">
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
              href="/#what-is-kinesisiq"
              className="text-sm sm:text-base font-medium text-zinc-400 hover:text-white transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/demo/reporting"
              className="text-sm sm:text-base font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Demo
            </Link>
            <Link
              href="/contact"
              className="text-sm sm:text-base font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Contact
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
              href="/#what-is-kinesisiq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/demo/reporting"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Demo
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-zinc-400 hover:text-white transition-colors"
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
    </nav>
  );
}

