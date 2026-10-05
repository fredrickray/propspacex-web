"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, FileText, Loader2, MessageSquare, Search } from "lucide-react";
import { useMessagingDock } from "@/features/communications/messaging-dock";
import { api } from "@/lib/api";
import { dealStatusMeta, parseDealList, type RemoteDeal } from "@/features/deals/remote-deal";

function formatLeadDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return "—";
  }
}

const LeadsPage = () => {
  const { openThread } = useMessagingDock();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deals, setDeals] = useState<RemoteDeal[]>([]);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = parseDealList(await api.listDeals(1, 50));
        if (!cancelled) setDeals(rows);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load leads.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return deals.filter((deal) => {
      if (stage !== "all" && deal.status !== stage) return false;
      if (!query) return true;
      return [deal.buyerName, deal.propertyTitle, deal.agentName]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [deals, search, stage]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
        <p className="text-muted-foreground">
          Inquiries that already have a deal on your account.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by buyer or listing"
            className="pl-9"
          />
        </div>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            <SelectItem value="open">Awaiting quote</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="funding_ready">Ready to fund</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="released">Released</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading leads
        </p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          No leads match this view.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((deal) => {
            const badge = dealStatusMeta(deal.status);
            return (
              <div
                key={deal.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback>{deal.buyerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-foreground">{deal.buyerName}</p>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{deal.propertyTitle}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      {formatLeadDate(deal.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    type="button"
                    onClick={() => openThread(deal.conversationId)}
                    disabled={!deal.conversationId}
                  >
                    <MessageSquare className="size-4" />
                    Message
                  </Button>
                  <Button size="sm" className="gap-2" asChild>
                    <Link href={`/agent/deals/${deal.id}`}>
                      <FileText className="size-4" />
                      Deal
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
