/**
 * app/not-found.tsx
 * 404 Not Found page component.
 * Displays when a user navigates to a non-existent route.
 */

import Link from "next/link";
import { Home } from "lucide-react";
import Footer from "./components/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-8 py-12">
        {/* Digital Placemaking Logo */}
        <div className="mb-8 flex justify-center">
          <img
            src="/dp-logo.png"
            alt="Digital Placemaking"
            className="h-16 w-16 object-contain"
          />
        </div>

        {/* 404 Content */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-6xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-7xl md:text-8xl">
            404
          </h1>
          <h2 className="mb-2 text-2xl font-bold text-black dark:text-zinc-50 sm:text-3xl">
            Page Not Found
          </h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500 sm:text-base">
            If you think this is an error, please{" "}
            <Link
              href="/contact"
              className="font-medium text-blue-600 underline transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              contact support
            </Link>
            .
          </p>
        </div>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
        >
          <Home className="h-4 w-4" />
          Back to Homepage
        </Link>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
