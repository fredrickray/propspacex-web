"use client";

import {
  Users,
  Building2,
  UserCheck,
  FileCheck,
  Server,
  Database,
  Wallet,
  UserPlus,
  Building,
  Link as LinkIcon,
  Download,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "../components/StatCard";
import { RecentActivityItem } from "../components/RecentActivityItem";
import { VerificationRequestItem } from "../components/VerificationRequestItem";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const platformGrowthData = [
  { name: "Week 1", users: 1800 },
  { name: "Week 2", users: 2000 },
  { name: "Week 3", users: 2100 },
  { name: "Week 4", users: 2250 },
  { name: "Week 5", users: 2405 },
];

const recentActivities = [
  {
    icon: Building,
    title: "New Property Listed",
    description: "Agent Smith listed 'Modern Villa in Palm Jumeirah'",
    time: "2m ago",
    iconColor: "text-blue-600",
  },
  {
    icon: Wallet,
    title: "Wallet Connected",
    description: "User 0x8f4...b2c1 connected wallet",
    time: "5m ago",
    iconColor: "text-purple-600",
  },
  {
    icon: UserPlus,
    title: "User Registration",
    description: "sarah_j registered as Buyer",
    time: "12m ago",
    iconColor: "text-green-600",
  },
];

const verificationRequests = [
  {
    name: "James Wilson",
    type: "Agent - ID Verification",
    date: "Oct 24, 2023",
    status: "pending" as const,
  },
  {
    name: "Sunset Blvd Condo",
    type: "Property - Document Verification",
    date: "Oct 23, 2023",
    status: "pending" as const,
  },
  {
    name: "Sarah Chen",
    type: "Agent - License Verification",
    date: "Oct 23, 2023",
    status: "pending" as const,
  },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Admin</h1>
          <p className="text-muted-foreground text-sm">
            Here is your platform performance summary for today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
            Export Report
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value="12,450"
          change="+12% this month"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Active Properties"
          value="840"
          change="+8% this month"
          changeType="positive"
          icon={Building2}
        />
        <StatCard
          title="Active Agents"
          value="120"
          change="+5% this month"
          changeType="positive"
          icon={UserCheck}
        />
        <StatCard
          title="Pending Verifications"
          value="15"
          change="-3% this week"
          changeType="negative"
          icon={FileCheck}
        />
      </div>

      {/* Charts and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Growth Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Platform Growth</h3>
              <p className="text-2xl font-bold">
                2,405{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  +12% last month
                </span>
              </p>
            </div>
            <Button variant="outline" size="sm">
              Last 30 Days
            </Button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
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
                  dataKey="name"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="size-4 text-green-500" />
                <span className="text-sm">Server Uptime</span>
              </div>
              <span className="text-sm font-medium text-green-600">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="size-4 text-green-500" />
                <span className="text-sm">Database Latency</span>
              </div>
              <span className="text-sm font-medium">12ms</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="size-4 text-green-500" />
                <span className="text-sm">Web3 Nodes</span>
              </div>
              <span className="text-sm font-medium text-green-600">Online</span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Recent Activity</h4>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-primary"
              >
                View All
              </Button>
            </div>
            <div className="space-y-0">
              {recentActivities.map((activity, i) => (
                <RecentActivityItem key={i} {...activity} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Requests */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Pending Verification Requests</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Filter
            </Button>
            <Button variant="link" size="sm" className="text-primary">
              View All
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase">
                  Entity
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">
                  Type
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">
                  Submitted
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase">
                  Status
                </th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {verificationRequests.map((request, i) => (
                <VerificationRequestItem key={i} {...request} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
