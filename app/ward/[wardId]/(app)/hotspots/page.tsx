import Link from "next/link";
import { ChevronRight, Minus, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getHotspots, getTopSignals, settledValue } from "@/lib/councillor/api";
import { categoryLabel, formatCount } from "@/lib/councillor/format";
import { resolveWard, wardMetadata, type WardParams } from "@/lib/councillor/ward-context";
import { areaHref, categoryHref } from "@/lib/councillor/drilldown";
import { Sparkline } from "../components/Sparkline";
import { WardPageHeader } from "../components/WardPageHeader";
import { PctBadge } from "../../components/PctBadge";
import { ApiErrorBanner } from "../../components/StateBanner";

export const generateMetadata = wardMetadata((ward) => `Hotspots Explorer · ${ward.label}`);

export default async function HotspotsPage({
  params,
}: {
  params: WardParams;
}) {
  const ward = await resolveWard(params);
  const [hsRes, tsRes] = await Promise.allSettled([
    getHotspots(ward.id),
    getTopSignals(ward.id),
  ]);
  const hs = settledValue(hsRes);
  const ts = settledValue(tsRes);

  if (!hs) {
    return (
      <div className="space-y-4">
        <WardPageHeader ward={ward} title="Hotspots & Micro-Areas" />
        <ApiErrorBanner />
      </div>
    );
  }

  // Slope per micro-area comes from drifting_locations (top-signals); FSAs absent
  // there have no positive drift → "stable".
  const driftBy = new Map(
    (ts?.drifting_locations ?? []).map((d) => [d.fsa, d.slope])
  );

  return (
    <div className="space-y-6">
      <WardPageHeader ward={ward} title="Hotspots & Micro-Areas" recentMonths={hs.recent_months} recentYear={hs.recent_year} />

      <div className="space-y-3">
        {hs.hotspots.map((h, i) => {
          const slope = driftBy.get(h.fsa);
          const lastDelta =
            h.sparkline.length >= 2
              ? h.sparkline[h.sparkline.length - 1] -
                h.sparkline[h.sparkline.length - 2]
              : null;
          return (
            <Card key={h.fsa} className="p-4 transition-colors hover:border-slate-300">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <Link
                    href={areaHref(ward, h.fsa)}
                    className="group"
                  >
                    <p className="flex items-center gap-1 text-lg font-semibold text-slate-900 group-hover:underline">
                      {h.fsa}
                      <ChevronRight className="size-4 text-slate-300 transition-colors group-hover:text-slate-600" />
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatCount(h.total)} requests · last {hs.recent_months}{" "}
                      mo
                    </p>
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <PctBadge value={h.growth_pct} />
                  {lastDelta !== null ? (
                    <span className="text-xs text-slate-500">
                      {lastDelta >= 0 ? "+" : ""}
                      {formatCount(lastDelta)} last month
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5">
                  {slope !== undefined ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <TrendingUp className="size-3" />+{slope.toFixed(1)}/mo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                      <Minus className="size-3" /> stable
                    </span>
                  )}
                </div>

                <div className="ml-auto flex items-center gap-4">
                  <div className="hidden flex-wrap gap-1.5 sm:flex">
                    {h.categories.slice(0, 3).map((c) => (
                      <Link
                        key={c.category}
                        href={categoryHref(ward, c.category)}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                      >
                        {categoryLabel(c.category)} · {formatCount(c.count)}
                      </Link>
                    ))}
                  </div>
                  <Sparkline values={h.sparkline} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-slate-400">
        Micro-area chips show the top request categories (fixed buckets) for each
        FSA over the window. Select an FSA for its full breakdown, or a chip for
        that category across the ward.
      </p>
    </div>
  );
}
