/**
 * app/components/Footer.tsx
 * Site-wide footer component.
 * Provides navigation links, branding, and additional information.
 *
 * @component
 */

import Link from "next/link";
import {
  Settings,
  Mail,
  ExternalLink,
  Linkedin,
  Instagram,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <img
                src="/dp-logo.png"
                alt="Digital Placemaking"
                className="h-10 w-10 rounded-lg object-contain"
              />
              <div>
                <div className="text-sm font-semibold text-white">
                  KinesisIQ
                </div>
                <div className="text-xs text-zinc-400">
                  by Digital Placemaking
                </div>
              </div>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Reading the pulse of humanity. Turning insight into foresight.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://www.linkedin.com/company/digital-placemaking-canada/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-zinc-400 transition-colors hover:text-white"
                aria-label="Visit Digital Placemaking on LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="inline-flex items-center text-zinc-400 transition-colors hover:text-white"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Navigation</h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/how-it-works"
                className="text-sm text-zinc-400 transition-colors hover:text-white"
              >
                How It Works
              </Link>
              <Link
                href="/demo/reporting"
                className="text-sm text-zinc-400 transition-colors hover:text-white"
              >
                Demo
              </Link>
              <Link
                href="/about-us"
                className="text-sm text-zinc-400 transition-colors hover:text-white"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-sm text-zinc-400 transition-colors hover:text-white"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Legal & Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Resources</h3>
            <nav className="flex flex-col gap-3">
              <a
                href="#"
                className="text-sm text-zinc-400 transition-colors hover:text-white flex items-center gap-1"
              >
                Privacy Policy
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="#"
                className="text-sm text-zinc-400 transition-colors hover:text-white flex items-center gap-1"
              >
                Terms of Service
                <ExternalLink className="h-3 w-3" />
              </a>
              <Link
                href="/contact"
                className="text-sm text-zinc-400 transition-colors hover:text-white flex items-center gap-1"
              >
                <Mail className="h-3 w-3" />
                Get in Touch
              </Link>
            </nav>
          </div>

          {/* CTA Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Get Started</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Ready to transform real-world interactions into actionable
              signals?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 hover:scale-105"
              style={{ backgroundColor: "#f16609" }}
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-zinc-800/50 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-zinc-500 text-center sm:text-left">
              © {new Date().getFullYear()} KinesisIQ by Digital Placemaking. All
              rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              >
                <Settings className="h-3 w-3" />
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
