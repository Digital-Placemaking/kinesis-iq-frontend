/**
 * TestimonialsSection Component
 * Scrolling testimonials/quotes section.
 */

"use client";

import { motion } from "framer-motion";
import { ScrollAnimation } from "./ScrollAnimation";
import { QUOTES } from "./constants";

export function TestimonialsSection() {
  return (
    <section className="bg-zinc-950 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollAnimation>
          <div className="flex justify-center">
            <div
              className="relative overflow-hidden py-6"
              style={{ width: "90vw", maxWidth: "100%" }}
            >
              {/* Gradient overlays for fade effect */}
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-zinc-950 to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-zinc-950 to-transparent" />

              {/* Scrolling quotes */}
              <div className="flex animate-scroll gap-6">
                {/* First set of quotes */}
                {QUOTES.map((quote, index) => (
                  <div
                    key={`quote-1-${index}`}
                    className="flex shrink-0 flex-row items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    style={{ maxWidth: "600px", minWidth: "500px" }}
                  >
                    <span className="text-2xl leading-none text-zinc-300 dark:text-zinc-700 shrink-0">
                      &ldquo;
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug text-zinc-700 dark:text-zinc-300 sm:text-base">
                        {quote.text}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <p className="text-xs font-semibold text-black dark:text-zinc-50">
                          {quote.author}
                        </p>
                        <span className="text-xs text-zinc-400 dark:text-zinc-600">
                          •
                        </span>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {quote.role}
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl leading-none text-zinc-300 dark:text-zinc-700 shrink-0">
                      &rdquo;
                    </span>
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {QUOTES.map((quote, index) => (
                  <div
                    key={`quote-2-${index}`}
                    className="flex shrink-0 flex-row items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    style={{ maxWidth: "600px", minWidth: "500px" }}
                  >
                    <span className="text-2xl leading-none text-zinc-300 dark:text-zinc-700 shrink-0">
                      &ldquo;
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug text-zinc-700 dark:text-zinc-300 sm:text-base">
                        {quote.text}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <p className="text-xs font-semibold text-black dark:text-zinc-50">
                          {quote.author}
                        </p>
                        <span className="text-xs text-zinc-400 dark:text-zinc-600">
                          •
                        </span>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {quote.role}
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl leading-none text-zinc-300 dark:text-zinc-700 shrink-0">
                      &rdquo;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}


