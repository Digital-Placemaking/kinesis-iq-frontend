import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHotspots, getTopSignals } from "@/lib/councillor/api";
import { categoryLabel, formatCount } from "@/lib/councillor/format";
import { WARD } from "@/lib/councillor/config";
import { OverviewCard, type OverviewRow } from "../components/OverviewCard";
import { PctBadge } from "../../components/PctBadge";
import { ApiErrorBanner } from "../../components/StateBanner";

export const metadata = { title: "Signal Overview · Ward 7" };

export default async function SignalOverviewPage() {
  const [tsRes, hsRes] = await Promise.allSettled([
    getTopSignals(),
    getHotspots(),
  ]);
  const ts = tsRes.status === "fulfilled" ? tsRes.value : null;
  const hs = hsRes.status === "fulfilled" ? hsRes.value : null;

  if (!ts && !hs) {
    return (
      <div className="space-y-4">
        <Header />
        <ApiErrorBanner />
      </div>
    );
  }

  const rising: OverviewRow[] =
    ts?.rising_categories.map((c) => ({
      id: c.category,
      label: categoryLabel(c.category),
      sub: `${formatCount(c.recent)} this year vs ${formatCount(
        Math.round(c.baseline_avg)
      )} baseline`,
      trailing: <PctBadge value={c.pct_change} />,
    })) ?? [];

  const drifting: OverviewRow[] =
    ts?.drifting_locations.map((d) => ({
      id: d.fsa,
      label: d.fsa,
      sub: "monthly trend (6 mo)",
      trailing: (
        <span className="text-sm font-semibold tabular-nums text-emerald-700">
          +{d.slope.toFixed(1)}/mo
        </span>
      ),
    })) ?? [];

  const hotspots: OverviewRow[] =
    hs?.hotspots.map((h) => ({
      id: h.fsa,
      label: h.fsa,
      sub: h.categories
        .slice(0, 3)
        .map((c) => categoryLabel(c.category))
        .join(" · "),
      trailing: (
        <span className="text-sm font-semibold tabular-nums text-slate-800">
          {formatCount(h.total)}
        </span>
      ),
    })) ?? [];

  const repeated: OverviewRow[] =
    ts?.repeated_complaints.slice(0, 6).map((r, i) => ({
      id: `${r.fsa}-${r.type}-${i}`,
      label: r.type,
      sub: r.fsa,
      trailing: (
        <span className="text-sm font-semibold tabular-nums text-slate-800">
          {formatCount(r.count)}
        </span>
      ),
    })) ?? [];

  const earlyWarning: OverviewRow[] =
    ts?.early_warning.map((e) => ({
      id: e.category,
      label: `${categoryLabel(e.category)}`,
      sub: `z-score ${e.z_score.toFixed(2)}`,
      trailing: <PctBadge value={e.pct_change} />,
    })) ?? [];

  return (
    <div className="space-y-6">
      <Header recentYear={ts?.meta.recent_year} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <OverviewCard
          title="Rising Categories"
          hint="Largest year-over-year rise vs the ward's own baseline"
          rows={rising}
        />
        <OverviewCard
          title="Drifting Locations"
          hint="Micro-areas trending up over the last 6 months"
          rows={drifting}
        />
        <OverviewCard
          title="Hotspots"
          hint="Top micro-areas by recent request volume"
          rows={hotspots}
        />
        <OverviewCard
          title="Repeated Complaints"
          hint="Same issue recurring at one micro-area"
          rows={repeated}
        />
        <OverviewCard
          title="Early Warning Flags"
          hint="Unusual jumps vs prior years (z-score ≥ 2)"
          rows={earlyWarning}
          emptyText="No categories flagged this period."
        />
      </div>

      <div className="flex justify-end">
        <Link
          href="/ward7/story"
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Ward Story <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function Header({ recentYear }: { recentYear?: number }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Signal Overview</h1>
      <p className="text-sm text-slate-500">
        Ward {WARD.id} · {WARD.name}
        {recentYear ? ` · ${recentYear}` : ""}
      </p>
    </div>
  );
}
