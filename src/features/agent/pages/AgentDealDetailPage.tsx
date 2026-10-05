"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { dealStatusMeta, parseDealEnvelope, type RemoteDeal } from "@/features/deals/remote-deal";
import { formatMoney } from "@/features/payments/escrow-format";
import { useToast } from "@/components/ui/use-toast";

export default function AgentDealDetailPage() {
  const params = useParams();
  const dealId = typeof params.dealId === "string" ? params.dealId : "";
  const { toast } = useToast();
  const [deal, setDeal] = useState<RemoteDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    if (!dealId) return;
    setLoading(true);
    setError("");
    try {
      const next = parseDealEnvelope(await api.getDeal(dealId));
      setDeal(next);
      if (!next) setError("Deal not found.");
    } catch (err) {
      setDeal(null);
      setError(err instanceof Error ? err.message : "Could not load this deal.");
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitQuote = async () => {
    if (!deal) return;
    const total = Number(amount);
    const platformFee = fee.trim() === "" ? 0 : Number(fee);
    if (!Number.isFinite(total) || total <= 0) {
      toast({ title: "Enter a total greater than 0", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(platformFee) || platformFee < 0 || platformFee >= total) {
      toast({ title: "Fee must be less than the total", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const updated = parseDealEnvelope(
        await api.quoteDeal(deal.id, {
          amountMinor: Math.round(total * 100),
          platformFeeMinor: Math.round(platformFee * 100),
          quoteNote: note.trim() || undefined,
        }),
      );
      if (updated) setDeal(updated);
      toast({ title: "Quote sent", description: "The buyer can accept it from their deals." });
    } catch (err) {
      toast({
        title: "Could not send the quote",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading deal
      </p>
    );
  }

  if (!deal) {
    return (
      <div className="max-w-lg space-y-4 p-6">
        <p className="text-muted-foreground">{error || "Deal not found."}</p>
        <Button variant="outline" asChild>
          <Link href="/agent/deals">Back</Link>
        </Button>
      </div>
    );
  }

  const meta = dealStatusMeta(deal.status);

  return (
    <div className="max-w-xl space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link href="/agent/deals">← Deals</Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{deal.propertyTitle}</h1>
        <p className="mt-1 text-muted-foreground">{deal.buyerName}</p>
        <Badge className="mt-2" variant={meta.variant}>
          {meta.label}
        </Badge>
      </div>

      {deal.status === "open" ? (
        <Card>
          <CardHeader>
            <CardTitle>Send a quote</CardTitle>
            <CardDescription>The buyer can accept this from their deals page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="q-amt">Total (NGN)</Label>
                <Input
                  id="q-amt"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-fee">Platform fee (NGN)</Label>
                <Input
                  id="q-fee"
                  inputMode="decimal"
                  value={fee}
                  onChange={(event) => setFee(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-note">Note to buyer</Label>
              <Textarea id="q-note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
            </div>
            <Button type="button" onClick={() => void submitQuote()} disabled={busy}>
              Send quote
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {deal.amountMinor > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Current quote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold tabular-nums">{formatMoney(deal.amountMinor)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Platform fee</span>
              <span className="tabular-nums">{formatMoney(deal.platformFeeMinor)}</span>
            </div>
            {deal.quoteNote ? (
              <p className="whitespace-pre-wrap border-t border-border pt-2 text-muted-foreground">
                {deal.quoteNote}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
