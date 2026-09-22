"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WARD_SCREENS } from "@/lib/councillor/config";

/** Screen nav for one ward. `basePath` is the ward root ("/ward/10"). */
export function WardNav({ basePath }: { basePath: string }) {
  const pathname = usePathname();
  const suffix = pathname.slice(basePath.length);

  return (
    <nav className="flex items-center gap-1">
      {WARD_SCREENS.map((s) => {
        const active =
          s.path === "" ? suffix === "" || suffix === "/" : suffix.startsWith(s.path);
        return (
          <Link
            key={s.path}
            href={`${basePath}${s.path}`}
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
