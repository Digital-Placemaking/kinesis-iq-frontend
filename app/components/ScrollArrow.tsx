// ScrollArrow
// Animated scroll indicator button that smoothly scrolls to content below the fold.
// Used in: app/page.tsx (root landing page)

"use client";

import { ChevronDown } from "lucide-react";

export default function ScrollArrow() {
  const scrollToDetails = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToDetails}
      className="mt-8 flex flex-col items-center gap-2 transition-opacity hover:opacity-80 hover:cursor-pointer"
      aria-label="Scroll to details"
    >
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        scroll down to learn more
      </p>
      <ChevronDown className="h-8 w-8 animate-bounce text-zinc-600 dark:text-zinc-400" />
    </button>
  );
}
