"use client";

import { useState } from "react";
import {
  FileCheck,
  AlertTriangle,
  Activity,
  CheckCircle,
  Search,
  Download,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "../components/StatCard";

const auditLogs = [
  {
    id: 1,
    eventType: "Ownership Verified",
    userWallet: "0x8f4...b2c1",
    propertyRef: "Unit 402, Marina Bay",
    method: "API",
    status: "Success",
    timestamp: "2 mins ago",
  },
  {
    id: 2,
    eventType: "Identity Check",
    userWallet: "0x3a9...7e5d",
    propertyRef: "—",
    method: "Smart Contract",
    status: "Success",
    timestamp: "5 mins ago",
  },
  {
    id: 3,
    eventType: "Transfer Flagged",
    userWallet: "0x2b1...9f3c",
    propertyRef: "Villa 12, Park Jumeir...",
    method: "Smart Contract",
    status: "Flagged",
    timestamp: "12 mins ago",
  },
  {
    id: 4,
    eventType: "Admin Login",
    userWallet: "admin_01",
    propertyRef: "—",
    method: "System Admin",
    status: "Success",
    timestamp: "15 mins ago",
  },
  {
    id: 5,
    eventType: "Wallet Linked",
    userWallet: "0x5c7...2a8b",
    propertyRef: "—",
    method: "MetaMask",
    status: "Success",
    timestamp: "22 mins ago",
  },
  {
    id: 6,
    eventType: "M. Thompson",
    userWallet: "0x1d4...6e9f",
    propertyRef: "Apt 203, Marina Crest",
    method: "Smart Contract",
    status: "Pending",
    timestamp: "28 mins ago",
  },
];

export function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        Home / Administration /{" "}
        <span className="text-foreground">Audit Logs</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Audit & Verification Logs</h1>
          <p className="text-muted-foreground text-sm">
            Immutable registry of property ownership events, identity
            verifications, and smart contract interactions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Verifications"
          value="2,405"
          change="+156 this week"
          changeType="positive"
          icon={FileCheck}
        />
        <StatCard
          title="Flagged Events"
          value="12"
          change="Requires review"
          changeType="neutral"
          icon={AlertTriangle}
        />
        <StatCard
          title="Active Wallets"
          value="856"
          change="Authorized today"
          changeType="positive"
          icon={Activity}
        />
        <StatCard
          title="System Health"
          value="99.9%"
          change="All systems operational"
          changeType="positive"
          icon={CheckCircle}
        />
      </div>

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by hash, Property ID, or User Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="ownership">Ownership</SelectItem>
                <SelectItem value="identity">Identity</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="login">Login</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="30">
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Last 30 Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                  Event Type
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">
                  User / Wallet
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase hidden lg:table-cell">
                  Property Ref
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase hidden lg:table-cell">
                  Method
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border hover:bg-muted/20"
                >
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">
                      {log.timestamp}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium">{log.eventType}</span>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <span className="text-sm font-mono text-muted-foreground">
                      {log.userWallet}
                    </span>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground truncate max-w-[150px] block">
                      {log.propertyRef}
                    </span>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {log.method}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant={
                        log.status === "Success"
                          ? "default"
                          : log.status === "Flagged"
                            ? "destructive"
                            : "secondary"
                      }
                      className={
                        log.status === "Success"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : ""
                      }
                    >
                      {log.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing 1-6 of 2,405 events</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
