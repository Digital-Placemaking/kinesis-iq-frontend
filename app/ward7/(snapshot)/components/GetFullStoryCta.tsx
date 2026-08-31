"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function GetFullStoryCta() {
  return (
    <Link
      href="/ward7/signals"
      className="fixed bottom-20 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition-transform hover:scale-105 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 animate-in fade-in slide-in-from-bottom-3 duration-500"
    >
      <span>Get the full story</span>
      <ArrowRight className="size-4 animate-pulse" />
    </Link>
  );
}
