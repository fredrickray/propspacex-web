"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building2,
  Eye,
  MessageSquareMore,
  BadgeDollarSign,
  CalendarDays,
  Plus,
  Mail,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    title: "Total Listings",
    value: "12",
    trend: "+2 this week",
    trendTone: "text-emerald-600",
    icon: Building2,
  },
  {
    title: "Total Views",
    value: "1,450",
    trend: "+15% trend",
    trendTone: "text-emerald-600",
    icon: Eye,
  },
  {
    title: "Active Inquiries",
    value: "8",
    trend: "1 urgent",
    trendTone: "text-amber-600",
    icon: MessageSquareMore,
  },
  {
    title: "Total Volume",
    value: "$1.2M",
    trend: "+5% trend",
    trendTone: "text-emerald-600",
    icon: BadgeDollarSign,
  },
];

const chartData = [
  { day: "Mon", views: 120, inquiries: 60 },
  { day: "Tue", views: 190, inquiries: 85 },
  { day: "Wed", views: 220, inquiries: 90 },
  { day: "Thu", views: 260, inquiries: 110 },
  { day: "Fri", views: 245, inquiries: 100 },
  { day: "Sat", views: 290, inquiries: 120 },
  { day: "Sun", views: 305, inquiries: 125 },
];

const listings = [
  {
    name: "Sunset Villa",
    location: "Beverly Hills, CA",
    status: "Active",
    price: "$2,450,000",
    views: 842,
  },
  {
    name: "Palm Heights",
    location: "Miami, FL",
    status: "Active",
    price: "$1,980,000",
    views: 601,
  },
  {
    name: "Urban Loft",
    location: "Chicago, IL",
    status: "Pending",
    price: "$890,000",
    views: 344,
  },
];

const activity = [
  {
    icon: Mail,
    title: "New Inquiry Received",
    description: "John Doe requested a viewing for Sunset Villa.",
    time: "2 hours ago",
    tone: "text-primary",
  },
  {
    icon: CheckCircle2,
    title: "Listing Approved",
    description: "Palm Heights has passed compliance review.",
    time: "6 hours ago",
    tone: "text-emerald-600",
  },
  {
    icon: Clock3,
    title: "Viewing Reminder",
    description: "Client tour scheduled tomorrow at 11:00 AM.",
    time: "1 day ago",
    tone: "text-amber-600",
  },
];

const DashboardPage = () => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, Alex
          </h1>
          <p className="text-muted-foreground">
            Manage your real estate portfolio and track performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <CalendarDays className="size-4" />
            Schedule
          </Button>
          <Button className="gap-2" asChild>
            <Link href="/agent/add-property">
              <Plus className="size-4" />
              Add New Property
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((item) => (
          <Card key={item.title}>
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.title}
              </CardTitle>
              <item.icon className="size-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold leading-none">{item.value}</p>
              <p className={`text-xs mt-2 font-medium ${item.trendTone}`}>
                {item.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Performance Analytics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Listing views vs inquiries over time
              </p>
            </div>
            <div className="inline-flex rounded-md bg-muted p-1 text-xs font-semibold text-muted-foreground">
              <span className="px-2 py-1 rounded bg-background text-foreground">
                7D
              </span>
              <span className="px-2 py-1">30D</span>
              <span className="px-2 py-1">90D</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="agentViews" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.22}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fill="url(#agentViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Active Listings</CardTitle>
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/agent/listings">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left font-medium py-3">Property</th>
                    <th className="text-left font-medium py-3">Status</th>
                    <th className="text-left font-medium py-3">Price</th>
                    <th className="text-right font-medium py-3">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr
                      key={listing.name}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="py-3">
                        <p className="font-medium text-foreground">
                          {listing.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {listing.location}
                        </p>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            listing.status === "Active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {listing.status}
                        </Badge>
                      </td>
                      <td className="py-3 font-medium">{listing.price}</td>
                      <td className="py-3 text-right">{listing.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="mt-0.5 size-8 rounded-full bg-muted flex items-center justify-center">
                  <item.icon className={`size-4 ${item.tone}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
