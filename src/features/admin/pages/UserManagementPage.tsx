"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Search, UserCheck, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "../components/StatCard";
import { loadDirectory, type DirectoryUser } from "../admin-data";

const PAGE_SIZE = 10;

export function UserManagementPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [total, setTotal] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [role, setRole] = useState("all");
  const [verification, setVerification] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const directory = await loadDirectory();
        if (cancelled) return;
        setUsers(directory.users);
        setTotal(directory.total);
        setTruncated(directory.truncated);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load users.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return users.filter((user) => {
      if (role !== "all" && user.role !== role) return false;
      if (verification === "verified" && !user.verified) return false;
      if (verification === "unverified" && user.verified) return false;
      if (!query) return true;
      return [user.name, user.email, user.phone, user.role]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [users, searchQuery, role, verification]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const agents = users.filter((user) => user.role === "agent").length;
  const verified = users.filter((user) => user.verified).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground">
          People returned by the user directory.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total users"
          value={loading ? "…" : error ? "—" : total}
          icon={Users}
        />
        <StatCard
          title="Agents"
          value={loading ? "…" : error ? "—" : agents}
          icon={UserCheck}
        />
        <StatCard
          title="Verified"
          value={loading ? "…" : error ? "—" : verified}
          icon={Check}
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={role}
              onValueChange={(value) => {
                setRole(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={verification}
              onValueChange={(value) => {
                setVerification(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Not verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading users
          </p>
        ) : error ? (
          <p className="p-6 text-sm text-destructive">{error}</p>
        ) : visible.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No users match this view.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    User
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground md:table-cell">
                    Role
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground lg:table-cell">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Verification
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((user) => (
                  <tr key={user.id} className="border-b border-border">
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email || "—"}</p>
                    </td>
                    <td className="hidden px-4 py-4 md:table-cell">
                      <Badge variant="outline" className="capitalize">
                        {user.role || "—"}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-4 text-sm text-muted-foreground lg:table-cell">
                      {user.phone || "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-sm">
                        {user.verified ? (
                          <Check className="size-4 text-green-600" />
                        ) : (
                          <X className="size-4 text-muted-foreground" />
                        )}
                        {user.verified ? "Verified" : "Not verified"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between p-4 text-sm text-muted-foreground">
          <span>
            {error
              ? "User directory unavailable"
              : `Showing ${visible.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-${(currentPage - 1) * PAGE_SIZE + visible.length} of ${filtered.length}`}
            {truncated ? ` (${total} on the server)` : ""}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-border px-3 py-1 disabled:opacity-50"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-md border border-border px-3 py-1 disabled:opacity-50"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
