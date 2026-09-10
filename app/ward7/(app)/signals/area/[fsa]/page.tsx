import { notFound } from "next/navigation";
import { AlertTriangle, Minus, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getHotspots, getTopSignals, getWardView } from "@/lib/councillor/api";
import {
  buildAreaDetail,
  categorySlug,
  fsaSlug,
  inferCategory,
  type AreaDetail,
} from "@/lib/councillor/drilldown";
import { categoryLabel, formatCount, sharePct } from "@/lib/councillor/format";
import { WARD } from "@/lib/councillor/config";
import { PctBadge } from "../../../../components/PctBadge";
import { ApiErrorBanner } from "../../../../components/StateBanner";
import { DrillHeader } from "../../../components/DrillHeader";
import { ShareBars } from "../../../components/ShareBars";
import { Sparkline } from "../../../components/Sparkline";
import { StatTile } from "../../../components/StatTile";
import { OverviewCard, type OverviewRow } from "../../../components/OverviewCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fsa: string }>;
}) {
  const { fsa } = await params;
  return { title: `${fsaSlug(fsa)} · Ward 7 Micro-Area` };
}

export default async function AreaDrilldownPage({
  params,
}: {
  params: Promise<{ fsa: string }>;
}) {
  const { fsa } = await params;

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
        <DrillHeader eyebrow="Micro-area" title={fsaSlug(fsa)} />
        <ApiErrorBanner />
      </div>
    );
  }

  const d = buildAreaDetail(fsa, bundles);
  if (!d) notFound();

  return (
    <div className="space-y-6">
      <DrillHeader
        eyebrow="Micro-area drill-down"
        title={d.fsa}
        subtitle={
          <>
            Ward {WARD.id} · {WARD.name}
            {d.recentMonths ? ` · last ${d.recentMonths} months` : ""}
            {d.recentYear ? ` · ${d.recentYear}` : ""}
          </>
        }
        actions={<DriftChip detail={d} />}
      />

      <StatStrip detail={d} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ShareBars
          title="Category mix"
          hint="What residents are reporting here"
          rows={d.categories.map((c) => ({
            id: c.category,
            label: categoryLabel(c.category),
            sub: `${sharePct(c.share)} of this area's requests`,
            value: c.count,
            share: c.share,
            href: `/ward7/signals/category/${categorySlug(c.category)}`,
            trailing: (
              <span className="inline-flex items-center gap-1.5">
                {c.flagged ? (
                  <AlertTriangle className="size-3.5 text-amber-500" />
                ) : null}
                <span className="tabular-nums">{formatCount(c.count)}</span>
              </span>
            ),
          }))}
          emptyText="No category breakdown for this micro-area."
        />
        <MonthlyTrendTile detail={d} />
        <RepeatedTile detail={d} />
        <WardContextTile detail={d} />
        <PeersTile detail={d} />
      </div>

      <p className="text-xs text-slate-400">
        Sliced from the ward-level story bundles (top-signals · ward-view ·
        hotspots); the gateway has no per-micro-area endpoint, so this view costs
        no extra request.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ header */

function DriftChip({ detail: d }: { detail: AreaDetail }) {
  if (!d.drift) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
        <Minus className="size-3.5" /> Stable
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      <TrendingUp className="size-3.5" />+{d.drift.slope.toFixed(1)}/mo
    </span>
  );
}

function StatStrip({ detail: d }: { detail: AreaDetail }) {
  const series = d.drift?.series ?? d.hotspot?.sparkline ?? [];
  const lastDelta =
    series.length >= 2 ? series[series.length - 1] - series[series.length - 2] : null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile
        label={d.recentMonths ? `Requests · last ${d.recentMonths} mo` : "Requests"}
        value={formatCount(d.hotspot?.total)}
        badge={d.hotspot ? <PctBadge value={d.hotspot.growth_pct} /> : null}
        foot={
          d.rank
            ? `#${d.rank} micro-area by volume in Ward ${WARD.id}`
            : "Not in the ranked hotspot list"
        }
        tone={d.drift ? "elevated" : "watch"}
        status={d.drift ? "Drifting up" : "Stable"}
      />
      <StatTile
        label="Share of hotspot volume"
        value={d.shareOfHotspots ? sharePct(d.shareOfHotspots) : "—"}
        foot="of all requests across ranked micro-areas"
      />
      <StatTile
        label="Top category"
        value={d.categories[0] ? categoryLabel(d.categories[0].category) : "—"}
        foot={
          d.categories[0]
            ? `${formatCount(d.categories[0].count)} requests · ${sharePct(
                d.categories[0].share
              )} of the area`
            : "No category breakdown"
        }
        tone={d.categories[0]?.flagged ? "critical" : undefined}
        status={d.categories[0]?.flagged ? "Early warning" : undefined}
      />
      <StatTile
        label="Last month change"
        value={
          lastDelta !== null
            ? `${lastDelta >= 0 ? "+" : ""}${formatCount(lastDelta)}`
            : "—"
        }
        foot={
          lastDelta !== null
            ? "requests vs the month before"
            : "No monthly series for this area"
        }
        muted={lastDelta === null}
        tone={
          lastDelta === null ? "watch" : lastDelta > 0 ? "elevated" : "good"
        }
        status={
          lastDelta === null ? "No series" : lastDelta > 0 ? "Rising" : "Easing"
        }
      />
    </div>
  );
}

/* ------------------------------------------------------------------- tiles */

function MonthlyTrendTile({ detail: d }: { detail: AreaDetail }) {
  const series = d.drift?.series ?? d.hotspot?.sparkline ?? [];
  if (!series.length) {
    return (
      <Card className="gap-2 p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Monthly trend
        </p>
        <p className="text-sm text-slate-400">
          No monthly series for {d.fsa} in this bundle.
        </p>
      </Card>
    );
  }
  const peak = Math.max(...series);
  const low = Math.min(...series);
  return (
    <Card className="gap-3 p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Monthly trend
      </p>
      <p className="text-xs text-slate-500">
        Requests per month, oldest to newest ({series.length} months)
      </p>
      <Sparkline values={series} width={280} height={64} className="w-full" />
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
        <span>
          Peak <strong className="tabular-nums text-slate-800">{formatCount(peak)}</strong>
        </span>
        <span>
          Low <strong className="tabular-nums text-slate-800">{formatCount(low)}</strong>
        </span>
        {d.drift ? (
          <span>
            Slope{" "}
            <strong className="tabular-nums text-emerald-700">
              +{d.drift.slope.toFixed(1)}/mo
            </strong>
          </span>
        ) : null}
      </div>
    </Card>
  );
}

function RepeatedTile({ detail: d }: { detail: AreaDetail }) {
  const rows: OverviewRow[] = d.repeated.map((r, i) => {
    const cat = inferCategory(r.type);
    return {
      id: `${r.type}-${i}`,
      label: r.type,
      sub: cat ? `${cat} · repeat complaint` : "repeat complaint",
      trailing: (
        <span className="text-sm font-semibold tabular-nums text-slate-800">
          {formatCount(r.count)}
        </span>
      ),
      href: cat ? `/ward7/signals/category/${categorySlug(cat)}` : undefined,
    };
  });
  return (
    <OverviewCard
      title="Recurring issues here"
      hint={`Same issue reported repeatedly in ${d.fsa}`}
      rows={rows}
      emptyText={`No repeat complaints recorded for ${d.fsa}.`}
    />
  );
}

function WardContextTile({ detail: d }: { detail: AreaDetail }) {
  const rows: OverviewRow[] = d.categories
    .filter((c) => c.wardPct !== null || c.flagged)
    .slice(0, 6)
    .map((c) => ({
      id: c.category,
      label: categoryLabel(c.category),
      sub: c.flagged
        ? "flagged ward-wide as an early warning"
        : "ward-wide year-over-year change",
      trailing: <PctBadge value={c.wardPct} />,
      href: `/ward7/signals/category/${categorySlug(c.category)}`,
    }));
  return (
    <OverviewCard
      title="Ward context"
      hint="How this area's categories are moving ward-wide"
      rows={rows}
      emptyText="None of this area's categories appear in the ward trend lists."
    />
  );
}

function PeersTile({ detail: d }: { detail: AreaDetail }) {
  const rows: OverviewRow[] = d.peers.map((p, i) => ({
    id: p.fsa,
    label: p.fsa === d.fsa ? `${p.fsa} · this area` : p.fsa,
    sub: `#${i + 1} by volume · ${formatCount(p.total)} requests`,
    trailing: <PctBadge value={p.growth_pct} />,
    href: p.fsa === d.fsa ? undefined : `/ward7/signals/area/${p.fsa}`,
  }));
  return (
    <OverviewCard
      title="How it compares"
      hint="Ranked micro-areas across the ward"
      rows={rows}
      emptyText="No peer micro-areas in this bundle."
    />
  );
}
