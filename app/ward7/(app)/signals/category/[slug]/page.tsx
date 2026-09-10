import { notFound } from "next/navigation";
import { AlertTriangle, Info, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getHotspots, getTopSignals, getWardView } from "@/lib/councillor/api";
import {
  buildCategoryDetail,
  categoryFromSlug,
  type CategoryDetail,
} from "@/lib/councillor/drilldown";
import {
  categoryLabel,
  formatCount,
  pctLabel,
  ratioLabel,
  sharePct,
} from "@/lib/councillor/format";
import { WARD } from "@/lib/councillor/config";
import type { StatusTone } from "@/lib/councillor/sample-indicators";
import { PctBadge } from "../../../../components/PctBadge";
import { ApiErrorBanner } from "../../../../components/StateBanner";
import { DrillHeader } from "../../../components/DrillHeader";
import { ShareBars } from "../../../components/ShareBars";
import { StatTile } from "../../../components/StatTile";
import { OverviewCard, type OverviewRow } from "../../../components/OverviewCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  return {
    title: category
      ? `${category} · Ward 7 Signals`
      : "Category · Ward 7 Signals",
  };
}

export default async function CategoryDrilldownPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [tsRes, wvRes, hsRes] = await Promise.allSettled([
    getTopSignals(),
    getWardView(),
    getHotspots(),
  ]);
  const bundles = {
    ts: tsRes.status === "fulfilled" ? tsRes.value : null,
    wv: wvRes.status === "fulfilled" ? wvRes.value : null,
    hs: hsRes.status === "fulfilled" ? hsRes.value : null,
  };

  if (!bundles.ts && !bundles.wv && !bundles.hs) {
    return (
      <div className="space-y-4">
        <DrillHeader
          eyebrow="Category"
          title={categoryFromSlug(slug) ?? categoryLabel(slug)}
        />
        <ApiErrorBanner />
      </div>
    );
  }

  const d = buildCategoryDetail(slug, bundles);
  if (!d) notFound();

  return (
    <div className="space-y-6">
      <DrillHeader
        eyebrow="Category drill-down"
        title={d.category}
        subtitle={
          <>
            Ward {WARD.id} · {WARD.name}
            {d.recentYear ? ` · ${d.recentYear}` : ""}
          </>
        }
        actions={<DirectionChip detail={d} />}
      />

      <StatStrip detail={d} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <YearOverYearTile detail={d} />
        <VsCityTile detail={d} />
        <EarlyWarningTile detail={d} />
        <ShareBars
          title="Where it's happening"
          hint={
            d.recentMonths
              ? `Micro-area split over the last ${d.recentMonths} months`
              : "Micro-area split"
          }
          rows={d.areas.map((a) => ({
            id: a.fsa,
            label: a.fsa,
            sub: `${sharePct(a.shareOfArea)} of ${a.fsa}'s ${formatCount(
              a.areaTotal
            )} requests`,
            value: a.count,
            share: d.areaTotal ? a.count / d.areaTotal : 0,
            href: `/ward7/signals/area/${a.fsa}`,
          }))}
          emptyText="This category is not in any ranked micro-area."
        />
        <RepeatedTile detail={d} />
        <DriftTile detail={d} />
      </div>

      <p className="text-xs text-slate-400">
        Every figure here is sliced from the ward-level story bundles
        (top-signals · ward-view · hotspots) — the gateway exposes no per-category
        endpoint, so no extra request is made for this view.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ header */

function DirectionChip({ detail: d }: { detail: CategoryDetail }) {
  if (!d.direction) return null;
  const rising = d.direction === "rising";
  const Icon = rising ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        rising
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      <Icon className="size-3.5" />
      {rising ? "Rising" : "Falling"}
      {d.risingRank ? ` · #${d.risingRank} in ward` : ""}
    </span>
  );
}

function StatStrip({ detail: d }: { detail: CategoryDetail }) {
  // Headline tone: a flagged anomaly outranks a plain rise.
  const headline: { tone: StatusTone; status: string } = d.earlyWarning
    ? { tone: "critical", status: "Early warning" }
    : d.direction === "rising"
      ? { tone: "elevated", status: "Rising" }
      : d.direction === "falling"
        ? { tone: "good", status: "Falling" }
        : { tone: "watch", status: "No trend" };

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile
        label={d.recentYear ? `Requests ${d.recentYear}` : "Requests this year"}
        value={formatCount(d.yoy?.recent)}
        badge={d.yoy ? <PctBadge value={d.yoy.pct_change} /> : null}
        foot={
          d.yoy
            ? `vs ${formatCount(Math.round(d.yoy.baseline_avg))} baseline average`
            : "No year-over-year row in the bundle"
        }
        tone={headline.tone}
        status={headline.status}
      />
      <StatTile
        label="Share of ward requests"
        value={d.vsCity ? sharePct(d.vsCity.ward7_share) : "—"}
        foot={
          d.vsCity
            ? `city-wide share ${sharePct(d.vsCity.city_share)}`
            : "Not in the ward-vs-city mix"
        }
      />
      <StatTile
        label="Vs city concentration"
        value={d.vsCity ? ratioLabel(d.vsCity.ratio) : "—"}
        foot={
          d.vsCity?.ratio != null
            ? d.vsCity.ratio >= 1
              ? "over-represented in Ward 7"
              : "under-represented in Ward 7"
            : "City share undefined for this category"
        }
        muted={d.vsCity?.ratio == null}
        tone={
          d.vsCity?.ratio == null
            ? "watch"
            : d.vsCity.ratio >= 1
              ? "elevated"
              : "watch"
        }
        status={
          d.vsCity?.ratio == null
            ? "No city share"
            : d.vsCity.ratio >= 1
              ? "Over-represented"
              : "Under-represented"
        }
      />
      <StatTile
        label="Monthly drift"
        value={d.driftSlope != null ? `${d.driftSlope > 0 ? "+" : ""}${d.driftSlope.toFixed(1)}` : "—"}
        foot={
          d.driftSlope != null
            ? "requests per month, 6-month slope"
            : "No positive monthly slope this period"
        }
        muted={d.driftSlope == null}
        tone={d.driftSlope == null ? "watch" : "elevated"}
        status={d.driftSlope == null ? "No drift" : "Trending up"}
      />
    </div>
  );
}

/* ------------------------------------------------------------------- tiles */

function YearOverYearTile({ detail: d }: { detail: CategoryDetail }) {
  if (!d.yoy) {
    return (
      <OverviewCard
        title="Year over year"
        hint="Recent year vs the ward's own baseline"
        rows={[]}
        emptyText="No baseline comparison for this category."
      />
    );
  }
  const baseline = Math.round(d.yoy.baseline_avg);
  const delta = d.yoy.recent - baseline;
  const rows: OverviewRow[] = [
    {
      id: "recent",
      label: d.recentYear ? `${d.recentYear} requests` : "Recent year",
      sub: "count in the most recent full year",
      trailing: (
        <span className="text-sm font-semibold tabular-nums text-slate-800">
          {formatCount(d.yoy.recent)}
        </span>
      ),
    },
    {
      id: "baseline",
      label: "Baseline average",
      sub: "mean across the baseline years",
      trailing: (
        <span className="text-sm font-semibold tabular-nums text-slate-800">
          {formatCount(baseline)}
        </span>
      ),
    },
    {
      id: "delta",
      label: "Change",
      sub: `${delta >= 0 ? "+" : ""}${formatCount(delta)} requests`,
      trailing: <PctBadge value={d.yoy.pct_change} />,
    },
  ];
  return (
    <OverviewCard
      title="Year over year"
      hint="Recent year vs the ward's own baseline"
      rows={rows}
    />
  );
}

function VsCityTile({ detail: d }: { detail: CategoryDetail }) {
  const rows: OverviewRow[] = [];
  if (d.vsCity) {
    rows.push(
      {
        id: "ward-share",
        label: "Ward 7 share",
        sub: "of all Ward 7 requests",
        trailing: (
          <span className="text-sm font-semibold tabular-nums text-slate-800">
            {sharePct(d.vsCity.ward7_share)}
          </span>
        ),
      },
      {
        id: "city-share",
        label: "City share",
        sub: "of all Toronto requests",
        trailing: (
          <span className="text-sm font-semibold tabular-nums text-slate-800">
            {sharePct(d.vsCity.city_share)}
          </span>
        ),
      },
      {
        id: "ratio",
        label: "Concentration",
        sub: "ward share ÷ city share",
        trailing: (
          <span className="text-sm font-semibold tabular-nums text-slate-800">
            {ratioLabel(d.vsCity.ratio)}
          </span>
        ),
      }
    );
  }
  if (d.fasterThanCity) {
    rows.push(
      {
        id: "ward-growth",
        label: "Ward 7 growth",
        sub: "year-over-year",
        trailing: <PctBadge value={d.fasterThanCity.ward7_growth_pct} />,
      },
      {
        id: "city-growth",
        label: "City growth",
        sub: "year-over-year",
        trailing: <PctBadge value={d.fasterThanCity.city_growth_pct} />,
      },
      {
        id: "delta-growth",
        label: "Growth gap",
        sub: "how much faster Ward 7 is moving",
        trailing: (
          <span className="text-sm font-semibold tabular-nums text-slate-800">
            {pctLabel(d.fasterThanCity.delta_pct)}
          </span>
        ),
      }
    );
  }
  return (
    <OverviewCard
      title="Ward 7 vs city"
      hint="Mix and growth against the citywide picture"
      rows={rows}
      emptyText="This category is not in the ward-vs-city comparison."
    />
  );
}

function EarlyWarningTile({ detail: d }: { detail: CategoryDetail }) {
  const e = d.earlyWarning;
  if (!e) {
    return (
      <Card className="gap-2 p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Early warning
        </p>
        <p className="text-sm text-slate-400">
          No anomaly flagged for {d.category} this period (z-score under 2).
        </p>
      </Card>
    );
  }
  return (
    <Card className="gap-3 p-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 text-amber-500" />
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Early warning
        </p>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums text-slate-900">
          {e.z_score.toFixed(2)}
        </span>
        <span className="text-xs text-slate-500">z-score</span>
        <PctBadge value={e.pct_change} className="ml-auto" />
      </div>
      <p className="text-sm text-slate-600">
        {formatCount(e.recent)} this year against {formatCount(e.prior)} in the
        prior period — {e.z_score >= 3 ? "well beyond" : "beyond"} the normal
        year-to-year swing for this category.
      </p>
    </Card>
  );
}

function RepeatedTile({ detail: d }: { detail: CategoryDetail }) {
  const rows: OverviewRow[] = d.repeated.map((r, i) => ({
    id: `${r.fsa}-${r.type}-${i}`,
    label: r.type,
    sub: r.fsa,
    trailing: (
      <span className="text-sm font-semibold tabular-nums text-slate-800">
        {formatCount(r.count)}
      </span>
    ),
    href: `/ward7/signals/area/${r.fsa}`,
  }));
  return (
    <div className="space-y-1.5">
      <OverviewCard
        title="Recurring issues"
        hint="Repeat complaints matched to this category"
        rows={rows}
        emptyText="No repeat complaints matched to this category."
      />
      {rows.length ? (
        <p className="flex items-start gap-1.5 px-1 text-[11px] leading-snug text-slate-400">
          <Info className="mt-0.5 size-3 shrink-0" />
          Repeat complaints arrive as raw 311 request types; the category match is
          inferred by keyword.
        </p>
      ) : null}
    </div>
  );
}

function DriftTile({ detail: d }: { detail: CategoryDetail }) {
  const rows: OverviewRow[] = d.areas.slice(0, 5).map((a) => ({
    id: a.fsa,
    label: a.fsa,
    sub: `${formatCount(a.count)} ${d.category.toLowerCase()} requests · ${formatCount(
      a.areaTotal
    )} total`,
    trailing: <PctBadge value={a.areaGrowth} />,
    href: `/ward7/signals/area/${a.fsa}`,
  }));
  return (
    <OverviewCard
      title="Micro-area momentum"
      hint="Overall growth of the areas carrying this category"
      rows={rows}
      emptyText="No ranked micro-area carries this category."
    />
  );
}
