"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Search, CalendarDays, MessageSquare, FileText } from "lucide-react";
import { useCommunications } from "@/features/communications/communications-context";
import type { EngagementDealStatus } from "@/features/communications/communications-types";

function formatLeadDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function intentLabel(intent: string | null) {
  if (intent === "tour") return "Tour request";
  if (intent === "offer") return "Offer discussion";
  return "Inquiry";
}

function stageBadge(status: EngagementDealStatus) {
  switch (status) {
    case "open":
      return { label: "Awaiting quote", variant: "default" as const };
    case "quoted":
      return { label: "Quoted", variant: "secondary" as const };
    case "accepted":
      return { label: "Accepted", variant: "outline" as const };
    case "funding_ready":
      return { label: "Funding", variant: "outline" as const };
    default:
      return { label: status, variant: "outline" as const };
  }
}

const LeadsPage = () => {
  const { leads, engagements } = useCommunications();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<"all" | EngagementDealStatus>("all");

  const engagementById = useMemo(
    () => new Map(engagements.map((e) => [e.id, e])),
    [engagements],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const eng = engagementById.get(lead.engagementId);
      const status = eng?.status ?? ("open" as EngagementDealStatus);
      const stageMatch = stage === "all" || status === stage;
      const textMatch =
        !q ||
        lead.buyerName.toLowerCase().includes(q) ||
        lead.propertyTitle.toLowerCase().includes(q) ||
        lead.buyerEmail.toLowerCase().includes(q);
      return stageMatch && textMatch;
    });
  }, [leads, engagementById, search, stage]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
        <p className="text-muted-foreground">
          Inquiries from contact forms and threads (demo: stored in this browser).
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="pl-9"
          />
        </div>
        <Select value={stage} onValueChange={(value: "all" | EngagementDealStatus) => setStage(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            <SelectItem value="open">Awaiting quote</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="funding_ready">Funding</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No leads match your filters. Submit a contact form as a buyer to create one.
          </p>
        ) : (
          filtered.map((lead) => {
            const eng = engagementById.get(lead.engagementId);
            const status = eng?.status ?? "open";
            const badge = stageBadge(status);
            const tel = lead.phone.replace(/[^\d+]/g, "");
            const canCall = tel.length > 3;

            return (
              <div
                key={lead.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={undefined} />
                    <AvatarFallback>{lead.buyerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-foreground">{lead.buyerName}</p>
                      <Badge variant={badge.variant} className="capitalize">
                        {badge.label}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{lead.propertyTitle}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="size-3.5" />
                        {lead.buyerEmail}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="size-3.5" />
                        {lead.phone}
                      </span>
                      <span>Source: {intentLabel(lead.intent)}</span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3.5" />
                        {formatLeadDate(lead.createdAtIso)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
                  {canCall ? (
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a href={`tel:${tel}`}>
                        <Phone className="size-4" />
                        Call
                      </a>
                    </Button>
                  ) : null}
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <Link href={`/agent/messages?conv=${encodeURIComponent(lead.conversationId)}`}>
                      <MessageSquare className="size-4" />
                      Message
                    </Link>
                  </Button>
                  <Button size="sm" className="gap-2" asChild>
                    <Link href={`/agent/deals/${lead.engagementId}`}>
                      <FileText className="size-4" />
                      Deal
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LeadsPage;
