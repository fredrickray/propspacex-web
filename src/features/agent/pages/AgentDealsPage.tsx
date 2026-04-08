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

function statusMeta(s: string) {
  switch (s) {
    case "open":
      return { label: "Needs your quote", variant: "outline" as const };
    case "quoted":
      return { label: "Awaiting buyer", variant: "secondary" as const };
    case "accepted":
      return { label: "Accepted", variant: "default" as const };
    case "funding_ready":
      return { label: "Buyer funding", variant: "default" as const };
    default:
      return { label: s, variant: "outline" as const };
  }
}

export default function AgentDealsPage() {
  const { engagements } = useCommunications();
  const sorted = [...engagements].sort(
    (a, b) => new Date(b.updatedAtIso).getTime() - new Date(a.updatedAtIso).getTime(),
  );

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <p className="mb-1 text-sm text-muted-foreground">Deals &amp; quotes</p>
        <h1 className="text-2xl font-bold text-foreground">Engagements</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Send quotes from property inquiries. When the buyer accepts, they fund escrow on their
          wallet.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Active pipeline
          </CardTitle>
          <CardDescription>Demo data stored in this browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sorted.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No engagements yet.</p>
          ) : (
            sorted.map((d) => {
              const meta = statusMeta(d.status);
              return (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{d.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {d.buyerName} · {d.propertyTitle}
                    </p>
                    {d.amountCents > 0 ? (
                      <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                        {formatMoney(d.amountCents)} (fee {formatMoney(d.platformFeeCents)})
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                    <Button size="sm" asChild>
                      <Link href={`/agent/deals/${d.id}`}>Open</Link>
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
