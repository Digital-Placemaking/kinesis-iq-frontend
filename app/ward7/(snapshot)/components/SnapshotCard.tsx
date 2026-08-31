"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type SnapshotAccent = "green" | "gold" | "red" | "purple" | "blue";

const ACCENT: Record<
  SnapshotAccent,
  { bar: string; value: string; badge: string }
> = {
  green: {
    bar: "bg-[#05841d]",
    value: "text-[#05841d]",
    badge: "bg-[#05841d]/15 text-[#05841d]",
  },
  gold: {
    bar: "bg-[#846100]",
    value: "text-[#846100]",
    badge: "bg-[#846100]/15 text-[#846100]",
  },
  red: {
    bar: "bg-[#D10101]",
    value: "text-[#D10101]",
    badge: "bg-[#D10101]/15 text-[#D10101]",
  },
  purple: {
    bar: "bg-[#530084]",
    value: "text-[#530084]",
    badge: "bg-[#530084]/15 text-[#530084]",
  },
  blue: {
    bar: "bg-[#026183]",
    value: "text-[#026183]",
    badge: "bg-[#026183]/15 text-[#026183]",
  },
};

export interface SnapshotRow {
  label: string;
  value: string;
}

function parseCount(headline: string): number | null {
  const cleaned = headline.replace(/,/g, "").trim();
  if (!/^\d+$/.test(cleaned)) return null;
  return Number(cleaned);
}

function formatCount(n: number): string {
  return n.toLocaleString("en-CA");
}

function CountUp({
  value,
  className,
  delayMs,
  style,
}: {
  value: string;
  className?: string;
  delayMs: number;
  style?: CSSProperties;
}) {
  const target = parseCount(value);
  const [display, setDisplay] = useState(target === null ? value : "0");

  useEffect(() => {
    if (target === null) {
      setDisplay(value);
      return;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || target === 0) {
      setDisplay(formatCount(target));
      return;
    }

    let frame = 0;
    const duration = 700;
    const startAt = performance.now() + delayMs;

    const tick = (now: number) => {
      if (now < startAt) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, (now - startAt) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(formatCount(Math.round(target * eased)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, value, delayMs]);

  return (
    <p className={className} style={style}>
      {display}
    </p>
  );
}

function reveal(delayMs: number) {
  return {
    className:
      "animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-500",
    style: { animationDelay: `${delayMs}ms` } as const,
  };
}

export function SnapshotCard({
  title,
  accent,
  headline,
  subtitle,
  highlight,
  rows,
  emptyText = "No data this period.",
  index = 0,
}: {
  title: string;
  accent: SnapshotAccent;
  headline: string;
  subtitle: string;
  highlight?: string;
  rows: SnapshotRow[];
  emptyText?: string;
  index?: number;
}) {
  const tone = ACCENT[accent];
  const base = index * 90;
  const titleIn = reveal(base + 40);
  const headlineIn = reveal(base + 120);
  const subtitleIn = reveal(base + 200);
  const pillIn = reveal(base + 280);

  return (
    <article
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
      style={{ animationDelay: `${base}ms` }}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-1.5", tone.bar)}
      />
      <h2
        className={cn(
          "pl-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500",
          titleIn.className
        )}
        style={titleIn.style}
      >
        {title}
      </h2>
      <CountUp
        value={headline}
        delayMs={base + 120}
        style={headlineIn.style}
        className={cn(
          "mt-2 pl-2 text-4xl font-semibold tabular-nums",
          tone.value,
          headlineIn.className
        )}
      />
      <p
        className={cn(
          "mt-1 pl-2 text-sm leading-snug text-slate-500",
          subtitleIn.className
        )}
        style={subtitleIn.style}
      >
        {subtitle}
      </p>
      {highlight ? (
        <p
          className={cn(
            "mt-2.5 ml-2 inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold",
            tone.badge,
            pillIn.className
          )}
          style={pillIn.style}
        >
          {highlight}
        </p>
      ) : null}
      <ul className="mt-3 space-y-1.5 pl-2">
        {rows.length ? (
          rows.map((row, i) => {
            const rowIn = reveal(base + 340 + i * 70);
            return (
              <li
                key={`${row.label}-${row.value}`}
                className={cn(
                  "flex items-baseline justify-between gap-3 text-sm text-slate-700",
                  rowIn.className
                )}
                style={rowIn.style}
              >
                <span className="truncate">{row.label}</span>
                <span className="shrink-0 tabular-nums font-medium">
                  {row.value}
                </span>
              </li>
            );
          })
        ) : (
          <li className="text-sm text-slate-400">{emptyText}</li>
        )}
      </ul>
    </article>
  );
}
