/**
 * Footer Component
 *
 * Site-wide footer component with:
 * - Logo linking to homepage
 * - Centered navigation links (About Us, Contact, Privacy Policy, Terms of Service)
 * - Admin access button
 * - Theme toggle
 * - Copyright notice
 *
 * Used across all pages for consistent navigation and branding.
 *
 * @component
 */

import Link from "next/link";
import { Settings } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-8">
      <div className="mx-auto max-w-7xl px-8">
        <div className="relative flex min-h-12 flex-col gap-6 sm:flex-row sm:items-center">
          {/* Logo Section */}
          <Link
            href="/"
            className="z-10 flex items-center transition-opacity hover:opacity-80 sm:shrink-0"
          >
            <img
              src="/dp-logo.png"
              alt="Digital Placemaking"
              className="h-10 w-10 rounded-lg object-contain"
            />
          </Link>

          {/* Navigation Links - Absolutely Centered */}
          <nav className="absolute left-1/2 top-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 flex-wrap items-center justify-center gap-6 text-sm sm:top-1/2">
            <Link
              href="/about-us"
              className="text-zinc-400 transition-colors hover:text-zinc-100"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Contact
            </Link>
            <a
              href="#"
              className="text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Terms of Service
            </a>
          </nav>

          {/* Right Side Actions */}
          <div className="z-10 ml-auto flex items-center gap-4 sm:shrink-0">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              <Settings className="h-4 w-4" />
              Admin
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 border-t border-zinc-800 pt-6">
          <p className="text-center text-xs text-zinc-400">
            © {new Date().getFullYear()} KinesisIQ by Digital Placemaking. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
