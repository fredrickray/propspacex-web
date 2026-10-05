"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building2,
  Eye,
  Loader2,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

/** SVG fills resolve against page CSS (`:root` tokens). */
const KPI_BLUE = "var(--primary)";
const CHART_GREEN = "#10b981";
const DONUT_COLORS = {
  website: "var(--primary)",
  referral: "#10b981",
  social: "#8b5cf6",
  portal: "#f97316",
} as const;

const SOURCE_LABELS: Record<string, { name: string; color: string }> = {
  website: { name: "Website", color: DONUT_COLORS.website },
  referral: { name: "Referral", color: DONUT_COLORS.referral },
  social: { name: "Social Media", color: DONUT_COLORS.social },
  portal: { name: "Portal", color: DONUT_COLORS.portal },
};

type AnalyticsMonth = { month: string; views: number; leads: number };
type AnalyticsSource = { source: string; count: number };
type TopProperty = { propertyId: string; title: string; views: number; leads: number };

type AgentAnalytics = {
  views: number;
  viewsLastMonth: number;
  leads: number;
  leadsLastMonth: number;
  activeListings: number;
  listingsCreatedThisMonth: number;
  months: AnalyticsMonth[];
  sources: AnalyticsSource[];
  topProperties: TopProperty[];
};

function asNumber(value: unknown): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parseAnalytics(data: unknown): AgentAnalytics {
  const row = asRecord(data) ?? {};
  const months = Array.isArray(row.months) ? row.months : [];
  const sources = Array.isArray(row.sources) ? row.sources : [];
  const top = Array.isArray(row.topProperties) ? row.topProperties : [];
  return {
    views: asNumber(row.views),
    viewsLastMonth: asNumber(row.viewsLastMonth),
    leads: asNumber(row.leads),
    leadsLastMonth: asNumber(row.leadsLastMonth),
    activeListings: asNumber(row.activeListings),
    listingsCreatedThisMonth: asNumber(row.listingsCreatedThisMonth),
    months: months.flatMap((item) => {
      const month = asRecord(item);
      if (!month || typeof month.month !== "string") return [];
      return [{ month: month.month, views: asNumber(month.views), leads: asNumber(month.leads) }];
    }),
    sources: sources.flatMap((item) => {
      const source = asRecord(item);
      if (!source || typeof source.source !== "string") return [];
      return [{ source: source.source, count: asNumber(source.count) }];
    }),
    topProperties: top.flatMap((item) => {
      const property = asRecord(item);
      if (!property) return [];
      const propertyId = typeof property.propertyId === "string" ? property.propertyId : "";
      const title = typeof property.title === "string" ? property.title : "Listing";
      return [{ propertyId, title, views: asNumber(property.views), leads: asNumber(property.leads) }];
    }),
  };
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  if (!year || !month) return key;
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString(undefined, {
    month: "short",
    timeZone: "UTC",
  });
}

function rate(leads: number, views: number) {
  if (views <= 0) return 0;
  return (leads / views) * 100;
}

function formatRate(value: number) {
  return `${Math.round(value * 10) / 10}%`;
}

function relativeTrend(current: number, previous: number) {
  if (previous <= 0) {
    if (current <= 0) return { text: "0% vs last month", positive: true };
    return { text: `+${current.toLocaleString()} this month`, positive: true };
  }
  const pct = Math.round((((current - previous) / previous) * 100) * 10) / 10;
  const sign = pct > 0 ? "+" : "";
  return { text: `${sign}${pct}% vs last month`, positive: pct >= 0 };
}

function ChartTooltip({
  active,
  payload,
  label,
  valueSuffix = "",
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  valueSuffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        {payload[0].value.toLocaleString()}
        {valueSuffix}
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<AgentAnalytics | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const next = parseAnalytics(await api.getAgentAnalytics());
        if (!cancelled) setStats(next);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load analytics.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentMonth = stats?.months[stats.months.length - 1];
  const viewTrend = relativeTrend(currentMonth?.views ?? 0, stats?.viewsLastMonth ?? 0);
  const leadTrend = relativeTrend(currentMonth?.leads ?? 0, stats?.leadsLastMonth ?? 0);
  const conversion = rate(stats?.leads ?? 0, stats?.views ?? 0);
  const conversionDelta =
    Math.round(
      (rate(currentMonth?.leads ?? 0, currentMonth?.views ?? 0) -
        rate(stats?.leadsLastMonth ?? 0, stats?.viewsLastMonth ?? 0)) *
        10,
    ) / 10;
  const conversionTrend = {
    text: `${conversionDelta > 0 ? "+" : ""}${conversionDelta}% vs last month`,
    positive: conversionDelta >= 0,
  };
  const listingTrend = {
    text: `+${(stats?.listingsCreatedThisMonth ?? 0).toLocaleString()} this month`,
    positive: true,
  };
  const kpiCards = [
    {
      title: "Total Views",
      value: (stats?.views ?? 0).toLocaleString(),
      trend: viewTrend.text,
      trendPositive: viewTrend.positive,
      icon: Eye,
    },
    {
      title: "Total Leads",
      value: (stats?.leads ?? 0).toLocaleString(),
      trend: leadTrend.text,
      trendPositive: leadTrend.positive,
      icon: UserPlus,
    },
    {
      title: "Avg. Conversion",
      value: formatRate(conversion),
      trend: conversionTrend.text,
      trendPositive: conversionTrend.positive,
      icon: TrendingUp,
    },
    {
      title: "Active Listings",
      value: (stats?.activeListings ?? 0).toLocaleString(),
      trend: listingTrend.text,
      trendPositive: listingTrend.positive,
      icon: Building2,
    },
  ];
  const viewChart = (stats?.months ?? []).map((month) => ({
    month: monthLabel(month.month),
    views: month.views,
  }));
  const leadChart = (stats?.months ?? []).map((month) => ({
    month: monthLabel(month.month),
    leads: month.leads,
  }));
  const sourceTotal = (stats?.sources ?? []).reduce((sum, item) => sum + item.count, 0);
  const sourceRows = (stats?.sources ?? []).map((item) => {
    const meta = SOURCE_LABELS[item.source] ?? {
      name: item.source,
      color: DONUT_COLORS.website,
    };
    return {
      ...meta,
      source: item.source,
      count: item.count,
      share: sourceTotal > 0 ? Math.round((item.count / sourceTotal) * 100) : 0,
    };
  });
  const sourceSlices = sourceRows.filter((item) => item.count > 0);

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Performance insights for your listings
        </p>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading analytics
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card
            key={kpi.title}
            className="overflow-hidden rounded-xl border-border shadow-sm"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {kpi.value}
                  </p>
                  <p
                    className={cn(
                      "text-xs font-medium",
                      kpi.trendPositive
                        ? "text-emerald-600"
                        : "text-destructive",
                    )}
                  >
                    {kpi.trend}
                  </p>
                </div>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <kpi.icon className="size-5 text-primary" strokeWidth={2} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Property Views
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[280px] w-full min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={viewChart}
                  margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.35 }}
                    content={
                      <ChartTooltip valueSuffix=" views" />
                    }
                  />
                  <Bar
                    dataKey="views"
                    fill={KPI_BLUE}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Lead Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[280px] w-full min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={leadChart}
                  margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<ChartTooltip valueSuffix=" leads" />}
                  />
                  <Line
                    type="natural"
                    dataKey="leads"
                    stroke={CHART_GREEN}
                    strokeWidth={2.5}
                    dot={{
                      fill: "#fff",
                      stroke: CHART_GREEN,
                      strokeWidth: 2,
                      r: 5,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#fff",
                      stroke: CHART_GREEN,
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="rounded-xl border-border shadow-sm lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <div className="mx-auto h-[200px] w-full max-w-[220px]">
              {sourceSlices.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No leads yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceSlices}
                      cx="50%"
                      cy="50%"
                      innerRadius="58%"
                      outerRadius="82%"
                      paddingAngle={sourceSlices.length > 1 ? 2 : 0}
                      dataKey="count"
                      nameKey="name"
                    >
                      {sourceSlices.map((entry) => (
                        <Cell key={entry.source} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [Number(value).toLocaleString(), "Leads"]}
                      contentStyle={{
                        borderRadius: "0.5rem",
                        border: "1px solid var(--border)",
                        background: "var(--popover)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {sourceRows.map((item) => (
                <div
                  key={item.source}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                    <span
                      className="size-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: item.color }}
                      aria-hidden
                    />
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-foreground">
                    {item.share}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm lg:col-span-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Top Performing Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Property
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Views
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Leads
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Conversion
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.topProperties.length ?? 0) === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-sm text-muted-foreground">
                        No listing views yet.
                      </td>
                    </tr>
                  ) : (
                    stats?.topProperties.map((row, index) => (
                      <tr
                        key={row.propertyId || row.title}
                        className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                      >
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-primary">#{index + 1}</span>{" "}
                          {row.propertyId ? (
                            <Link href={`/properties/${row.propertyId}`} className="font-semibold text-foreground">
                              {row.title || "Listing"}
                            </Link>
                          ) : (
                            <span className="font-semibold text-foreground">{row.title || "Listing"}</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground">
                          {row.views.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground">
                          {row.leads.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right tabular-nums font-medium text-foreground">
                          {formatRate(rate(row.leads, row.views))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
