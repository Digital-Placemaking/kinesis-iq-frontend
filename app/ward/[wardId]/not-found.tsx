"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, MapPinOff } from "lucide-react";
import {
  enabledWards,
  isWardEnabled,
  parseWard,
  wardPath,
} from "@/lib/councillor/wards";

/**
 * 404 for everything under /ward/{N}. resolveWard() sends both unknown and
 * not-yet-enabled wards here; a missing drill-down (bad category/FSA) lands
 * here too. The ward id in the URL tells the three cases apart.
 */
export default function WardNotFound() {
  const { wardId } = useParams<{ wardId: string }>();
  const ward = parseWard(wardId);
  const available = enabledWards();

  const { heading, body } = !ward
    ? {
        heading: "Ward not found",
        body: `“${wardId}” isn’t a Toronto ward.`,
      }
    : !isWardEnabled(ward)
      ? {
          heading: `${ward.label} isn’t available yet`,
          body: `KinesisIQ dashboards for ${ward.name} aren’t available at this time. Check back soon.`,
        }
      : {
          heading: "Page not found",
          body: `That page doesn’t exist in ${ward.label} · ${ward.name}.`,
        };

  return (
    <main className="flex min-h-screen items-center justify-center bg-kinesisiq-gradient px-4">
      <div className="w-full max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          KinesisIQ
        </p>
        <MapPinOff className="mx-auto mt-6 size-10 text-slate-400" />
        <h1 className="mt-4 text-2xl font-semibold text-white">{heading}</h1>
        <p className="mt-2 text-sm text-slate-300">{body}</p>

        {available.length ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Available wards
            </p>
            <ul>
              {available.map((w) => (
                <li key={w.id}>
                  <Link
                    href={wardPath(w)}
                    className="flex items-center justify-between rounded-md px-2 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <span>
                      {w.label} · <span className="text-slate-400">{w.name}</span>
                    </span>
                    <ArrowRight className="size-4 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </main>
  );
}
