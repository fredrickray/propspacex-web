"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { dealStatusMeta, parseDealList, type RemoteDeal } from "@/features/deals/remote-deal";
import { formatMoney } from "@/features/payments/escrow-format";

export default function AgentDealsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deals, setDeals] = useState<RemoteDeal[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = parseDealList(await api.listDeals(1, 50));
        if (!cancelled) setDeals(rows);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load deals.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <p className="mb-1 text-sm text-muted-foreground">Deals &amp; quotes</p>
        <h1 className="text-2xl font-bold text-foreground">Deals</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Send a quote from an inquiry. When the buyer accepts, they fund escrow from their wallet.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Active pipeline
          </CardTitle>
          <CardDescription>Loaded from your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading deals
            </p>
          ) : error ? (
            <p className="py-8 text-center text-sm text-destructive">{error}</p>
          ) : deals.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No deals yet.</p>
          ) : (
            deals.map((deal) => {
              const meta = dealStatusMeta(deal.status);
              return (
                <div
                  key={deal.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{deal.propertyTitle}</p>
                    <p className="truncate text-sm text-muted-foreground">{deal.buyerName}</p>
                    {deal.amountMinor > 0 ? (
                      <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                        {formatMoney(deal.amountMinor)} (fee {formatMoney(deal.platformFeeMinor)})
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                    <Button size="sm" asChild>
                      <Link href={`/agent/deals/${deal.id}`}>Open</Link>
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
