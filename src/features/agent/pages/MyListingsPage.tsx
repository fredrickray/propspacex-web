"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  getPropertyId,
  listingStatusForAgent,
  normalizePropertyForCard,
  parsePropertyListEnvelope,
  type NormalizedPropertyCard,
} from "@/lib/property-normalize";

const statusVariant = (
  status: string,
): "default" | "secondary" | "outline" | "destructive" => {
  if (status === "active") return "default";
  if (status === "pending") return "secondary";
  if (status === "sold" || status === "rented") return "outline";
  if (status === "inactive") return "destructive";
  return "outline";
};

type Row = NormalizedPropertyCard & { agentStatus: string; raw: unknown };

function pickListedDate(raw: unknown): string {
  if (typeof raw !== "object" || raw === null) return "—";
  const r = raw as Record<string, unknown>;
  const d = r.createdAt ?? r.created_at ?? r.updatedAt ?? r.updated_at;
  if (typeof d === "string") {
    const t = Date.parse(d);
    if (!Number.isNaN(t))
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
      }).format(t);
  }
  return "—";
}

const MyListingsPage = () => {
  const { toast } = useToast();
  const [notice, setNotice] = useState<"published" | "preview" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await api.getMyProperties(1, 50);
      const list = parsePropertyListEnvelope(raw);
      const next: Row[] = [];
      for (const item of list) {
        const card = normalizePropertyForCard(item);
        if (!card) continue;
        next.push({
          ...card,
          agentStatus: listingStatusForAgent(item),
          raw: item,
        });
      }
      setRows(next);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load your listings.",
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const isPublished = url.searchParams.get("published") === "true";
    const isPreview = url.searchParams.get("preview") === "true";

    if (isPublished) {
      setNotice("published");
      toast({
        title: "Property published",
        description: "Your listing is now live and visible to buyers.",
      });
    } else if (isPreview) {
      setNotice("preview");
      toast({
        title: "Preview mode",
        description: "You are viewing this page from preview action.",
      });
    }

    if (isPublished || isPreview) {
      url.searchParams.delete("published");
      url.searchParams.delete("preview");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.agentStatus !== statusFilter)
        return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter]);

  const handleDelete = async (row: Row) => {
    const pid = getPropertyId(row.raw);
    if (!pid) return;
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await api.deleteProperty(pid);
      toast({ title: "Listing removed" });
      setRows((prev) => prev.filter((r) => getPropertyId(r.raw) !== pid));
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            notice === "published"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          {notice === "published"
            ? "Success: your property has been published."
            : "Preview loaded from the review screen."}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            My Listings
          </h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>

        <Button className="gap-2 h-11 px-5" asChild>
          <Link href="/agent/add-property">
            <Plus className="size-4" />
            Add Property
          </Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}{" "}
          <button
            type="button"
            className="underline font-medium"
            onClick={() => void load()}
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            className="pl-9 h-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px] h-11">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="rented">Rented</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            Loading listings…
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-muted-foreground text-sm">
            No listings yet.{" "}
            <Link href="/agent/add-property" className="text-primary underline">
              Add a property
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="text-left text-sm font-semibold text-muted-foreground px-4 py-4">
                    Property
                  </th>
                  <th className="text-left text-sm font-semibold text-muted-foreground px-4 py-4">
                    Type
                  </th>
                  <th className="text-left text-sm font-semibold text-muted-foreground px-4 py-4">
                    Price
                  </th>
                  <th className="text-left text-sm font-semibold text-muted-foreground px-4 py-4">
                    Status
                  </th>
                  <th className="text-left text-sm font-semibold text-muted-foreground px-4 py-4">
                    Views
                  </th>
                  <th className="text-left text-sm font-semibold text-muted-foreground px-4 py-4">
                    Inquiries
                  </th>
                  <th className="text-left text-sm font-semibold text-muted-foreground px-4 py-4">
                    Listed
                  </th>
                  <th className="w-12 px-4 py-4" />
                </tr>
              </thead>

              <tbody>
                {filtered.map((listing) => {
                  const pid = getPropertyId(listing.raw);
                  return (
                    <tr
                      key={pid || listing.title}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={listing.image}
                            alt={listing.title}
                            className="h-12 w-16 rounded-lg object-cover"
                          />
                          <p className="font-semibold text-foreground whitespace-nowrap max-w-[200px] truncate">
                            {listing.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground font-medium capitalize">
                        {typeof listing.raw === "object" &&
                        listing.raw !== null &&
                        "type" in listing.raw
                          ? String(
                              (listing.raw as Record<string, unknown>).type ??
                                "",
                            )
                          : "—"}
                      </td>
                      <td className="px-4 py-4 font-semibold text-foreground whitespace-nowrap">
                        {listing.price}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={statusVariant(listing.agentStatus)}
                          className="capitalize"
                        >
                          {listing.agentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">—</td>
                      <td className="px-4 py-4 text-muted-foreground">—</td>
                      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                        {pickListedDate(listing.raw)}
                      </td>
                      <td className="px-4 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem className="gap-2" asChild>
                              <Link href={`/buyer/property/${pid}`}>
                                <Eye className="size-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" disabled>
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-destructive focus:text-destructive"
                              onClick={() => void handleDelete(listing)}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListingsPage;
