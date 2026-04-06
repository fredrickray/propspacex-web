"use client";

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
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** SVG fills resolve against page CSS (`:root` tokens). */
const KPI_BLUE = "var(--primary)";
const CHART_GREEN = "#10b981";
const DONUT_COLORS = {
  website: "var(--primary)",
  referral: "#10b981",
  social: "#8b5cf6",
  portal: "#f97316",
} as const;

const kpiCards = [
  {
    title: "Total Views",
    value: "2,841",
    trend: "+15.2% vs last month",
    trendPositive: true,
    icon: Eye,
  },
  {
    title: "Total Leads",
    value: "47",
    trend: "+67.8% vs last month",
    trendPositive: true,
    icon: UserPlus,
  },
  {
    title: "Avg. Conversion",
    value: "6.2%",
    trend: "-0.3% vs last month",
    trendPositive: false,
    icon: TrendingUp,
  },
  {
    title: "Active Listings",
    value: "12",
    trend: "+2 this month",
    trendPositive: true,
    icon: Building2,
  },
] as const;

const propertyViewsData = [
  { month: "Sep", views: 820 },
  { month: "Oct", views: 1450 },
  { month: "Nov", views: 2100 },
  { month: "Dec", views: 1780 },
  { month: "Jan", views: 2520 },
  { month: "Feb", views: 2890 },
];

const leadGenerationData = [
  { month: "Sep", leads: 12 },
  { month: "Oct", leads: 18 },
  { month: "Nov", leads: 22 },
  { month: "Dec", leads: 15 },
  { month: "Jan", leads: 35 },
  { month: "Feb", leads: 48 },
];

const leadSourcesData = [
  { name: "Website", value: 45, color: DONUT_COLORS.website },
  { name: "Referral", value: 25, color: DONUT_COLORS.referral },
  { name: "Social Media", value: 18, color: DONUT_COLORS.social },
  { name: "Portal", value: 12, color: DONUT_COLORS.portal },
];

const topProperties = [
  {
    rank: 1,
    name: "Marina Bay Tower - Unit 1204",
    views: 342,
    leads: 18,
    conversion: 5.3,
  },
  {
    rank: 2,
    name: "Palm Jumeirah Villa #8",
    views: 278,
    leads: 12,
    conversion: 4.3,
  },
  {
    rank: 3,
    name: "Downtown Heights - Penthouse",
    views: 195,
    leads: 8,
    conversion: 4.1,
  },
  {
    rank: 4,
    name: "Business Bay Studio",
    views: 156,
    leads: 5,
    conversion: 3.2,
  },
  {
    rank: 5,
    name: "JBR 2BR Sea View",
    views: 410,
    leads: 22,
    conversion: 5.4,
  },
];

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
                  data={propertyViewsData}
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
                    ticks={[0, 750, 1500, 2250, 3000]}
                    domain={[0, 3000]}
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
                  data={leadGenerationData}
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
                    ticks={[0, 15, 30, 45, 60]}
                    domain={[0, 60]}
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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourcesData}
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="82%"
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {leadSourcesData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Share"]}
                    contentStyle={{
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {leadSourcesData.map((item) => (
                <div
                  key={item.name}
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
                    {item.value}%
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
                  {topProperties.map((row) => (
                    <tr
                      key={row.rank}
                      className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-primary">
                          #{row.rank}
                        </span>{" "}
                        <span className="font-semibold text-foreground">
                          {row.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground">
                        {row.views}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground">
                        {row.leads}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums font-medium text-foreground">
                        {row.conversion}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
