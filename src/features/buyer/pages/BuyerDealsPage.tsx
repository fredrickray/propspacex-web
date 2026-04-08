"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCommunications } from "@/features/communications/communications-context";
import { formatMoney } from "@/features/payments/escrow-format";

function statusLabel(s: string) {
  switch (s) {
    case "open":
      return { label: "Awaiting quote", variant: "outline" as const };
    case "quoted":
      return { label: "Quote received", variant: "secondary" as const };
    case "accepted":
      return { label: "Accepted", variant: "default" as const };
    case "funding_ready":
      return { label: "Fund escrow", variant: "default" as const };
    default:
      return { label: s, variant: "outline" as const };
  }
}

export default function BuyerDealsPage() {
  const { engagements } = useCommunications();
  const sorted = [...engagements].sort(
    (a, b) => new Date(b.updatedAtIso).getTime() - new Date(a.updatedAtIso).getTime(),
  );

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Dashboard &gt; Deals</p>
        <h1 className="text-2xl font-bold text-foreground">Service engagements</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          Each row is a scoped engagement with an agent (Phase A). After you accept a quote, fund
          escrow on the wallet screen (Phase B).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Your deals
          </CardTitle>
          <CardDescription>
            Created from contact forms and message threads — demo data persists in this browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No engagements yet. Contact an agent from a listing to start one.
            </p>
          ) : (
            sorted.map((d) => {
              const meta = statusLabel(d.status);
              return (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{d.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {d.propertyTitle} · {d.agentName}
                    </p>
                    {d.status === "quoted" || d.status === "funding_ready" ? (
                      <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                        {formatMoney(d.amountCents)} + fee {formatMoney(d.platformFeeCents)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                    <Button size="sm" asChild>
                      <Link href={`/buyer/deals/${d.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
