"use client";

import { useState } from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  Search,
  Download,
  MoreHorizontal,
  Shield,
  Mail,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatCard } from "../components/StatCard";

const users = [
  {
    id: 1,
    name: "Alex Doe",
    email: "alex@example.com",
    role: "Agent",
    walletAddress: "0x7f3...4e21",
    verification: "Verified",
    status: "Active",
  },
  {
    id: 2,
    name: "Sarah Smith",
    email: "sarah@email.com",
    role: "Buyer",
    walletAddress: null,
    verification: "Pending",
    status: "Active",
  },
  {
    id: 3,
    name: "Michael Jones",
    email: "mjones@mail.com",
    role: "Agent",
    walletAddress: "0x4c2...8f9a",
    verification: "None",
    status: "Suspended",
  },
  {
    id: 4,
    name: "David Chen",
    email: "dchen@company.org",
    role: "Seller",
    walletAddress: "0x9a1...2bc3",
    verification: "Verified",
    status: "Active",
  },
];

export function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        Home / Admin / <span className="text-foreground">User Management</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage access roles and verification status for all platform users
            including Agents, Buyers, and Admins.
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <UserPlus className="size-4" />
          Add New User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value="1,248"
          change="+48 this week"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Active Agents"
          value="45"
          change="+3 this week"
          changeType="positive"
          icon={UserCheck}
        />
        <StatCard
          title="New Signups"
          value="892"
          change="+12% this month"
          changeType="positive"
          icon={UserPlus}
        />
        <StatCard
          title="Pending Verification"
          value="12"
          change="Requires action"
          changeType="neutral"
          icon={Clock}
        />
      </div>

      {/* Filters and Table */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or wallet ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Download className="size-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                  User
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase hidden lg:table-cell">
                  Wallet Address
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                  Verification
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border hover:bg-muted/20"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                        />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <Badge variant="outline">{user.role}</Badge>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <span className="text-sm font-mono text-muted-foreground">
                      {user.walletAddress || "—"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      {user.verification === "Verified" ? (
                        <Check className="size-4 text-green-600" />
                      ) : user.verification === "Pending" ? (
                        <Clock className="size-4 text-yellow-600" />
                      ) : (
                        <X className="size-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">{user.verification}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant={
                        user.status === "Active" ? "default" : "destructive"
                      }
                      className={
                        user.status === "Active"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : ""
                      }
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Shield className="mr-2 size-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 size-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <X className="mr-2 size-4" />
                          Suspend User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing 1-4 of 1,248 results</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              ...
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
