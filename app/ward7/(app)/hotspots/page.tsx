import Link from "next/link";
import { ArrowLeft, TrendingUp, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getHotspots, getTopSignals } from "@/lib/councillor/api";
import { categoryLabel, formatCount } from "@/lib/councillor/format";
import { WARD } from "@/lib/councillor/config";
import { Sparkline } from "../components/Sparkline";
import { PctBadge } from "../../components/PctBadge";
import { ApiErrorBanner } from "../../components/StateBanner";

export const metadata = { title: "Hotspots Explorer · Ward 7" };

export default async function HotspotsPage() {
  const [hsRes, tsRes] = await Promise.allSettled([
    getHotspots(),
    getTopSignals(),
  ]);
  const hs = hsRes.status === "fulfilled" ? hsRes.value : null;
  const ts = tsRes.status === "fulfilled" ? tsRes.value : null;

  if (!hs) {
    return (
      <div className="space-y-4">
        <Header />
        <ApiErrorBanner />
        <div className="flex justify-end">
          <Link
            href="/ward7/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <ArrowLeft className="size-4" /> Back to Dashboard
          </Link>
        </div>
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
      <Header recentMonths={hs.recent_months} recentYear={hs.recent_year} />

      <div className="space-y-3">
        {hs.hotspots.map((h, i) => {
          const slope = driftBy.get(h.fsa);
          const lastDelta =
            h.sparkline.length >= 2
              ? h.sparkline[h.sparkline.length - 1] -
                h.sparkline[h.sparkline.length - 2]
              : null;
          return (
            <Card key={h.fsa} className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {h.fsa}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatCount(h.total)} requests · last {hs.recent_months}{" "}
                      mo
                    </p>
                  </div>
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
                      <span
                        key={c.category}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {categoryLabel(c.category)} · {formatCount(c.count)}
                      </span>
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
        FSA over the window.
      </p>

      <div className="flex justify-end">
        <Link
          href="/ward7/dashboard"
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function Header({
  recentMonths,
  recentYear,
}: {
  recentMonths?: number;
  recentYear?: number;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Hotspots &amp; Micro-Areas
      </h1>
      <p className="text-sm text-slate-500">
        Ward {WARD.id} · {WARD.name}
        {recentMonths ? ` · last ${recentMonths} months` : ""}
        {recentYear ? ` · ${recentYear}` : ""}
      </p>
    </div>
  );
}
