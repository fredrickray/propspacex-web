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

export default function BuyerDealsPage() {
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
    <div className="p-6 lg:p-8 max-w-4xl space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Dashboard &gt; Deals</p>
        <h1 className="text-2xl font-bold text-foreground">Deals</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          Quotes and escrow for conversations you have with agents.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Your deals
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
            <p className="text-sm text-muted-foreground py-8 text-center">
              No deals yet. Contact an agent from a listing to start one.
            </p>
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
                    <p className="text-sm text-muted-foreground truncate">{deal.agentName}</p>
                    {deal.amountMinor > 0 ? (
                      <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                        {formatMoney(deal.amountMinor)} + fee {formatMoney(deal.platformFeeMinor)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                    <Button size="sm" asChild>
                      <Link href={`/buyer/deals/${deal.id}`}>View</Link>
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
