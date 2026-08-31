"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WARD7_SCREENS } from "@/lib/councillor/config";

export function Ward7Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {WARD7_SCREENS.map((s) => {
        const active =
          pathname === s.href || pathname.startsWith(`${s.href}/`);
        return (
          <Link
            key={s.href}
            href={s.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-white/15 text-white"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            )}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
