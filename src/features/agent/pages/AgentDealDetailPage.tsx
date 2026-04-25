"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
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
import { useCommunications } from "@/features/communications/communications-context";
import { formatMoney } from "@/features/payments/escrow-format";
import { useToast } from "@/components/ui/use-toast";

export default function AgentDealDetailPage() {
  const params = useParams();
  const dealId = typeof params.dealId === "string" ? params.dealId : "";
  const { engagements, agentQuoteEngagement } = useCommunications();
  const { toast } = useToast();
  const deal = useMemo(() => engagements.find((e) => e.id === dealId), [engagements, dealId]);

  const [amount, setAmount] = useState("150");
  const [fee, setFee] = useState("7.5");
  const [note, setNote] = useState("");

  const submitQuote = () => {
    if (!deal) return;
    const a = parseFloat(amount);
    const f = parseFloat(fee);
    if (!Number.isFinite(a) || a <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(f) || f < 0 || f >= a) {
      toast({ title: "Invalid fee", description: "Fee must be less than total.", variant: "destructive" });
      return;
    }
    agentQuoteEngagement(deal.id, {
      amountDollars: a,
      platformFeeDollars: f,
      note: note.trim() || undefined,
    });
    toast({
      title: "Quote sent",
      description: "The buyer can review this under Buyer → Deals.",
    });
  };

  if (!deal) {
    return (
      <div className="max-w-lg space-y-4 p-6">
        <p className="text-muted-foreground">Engagement not found.</p>
        <Button variant="outline" asChild>
          <Link href="/agent/deals">Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link href="/agent/deals">← Engagements</Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{deal.title}</h1>
        <p className="mt-1 text-muted-foreground">
          {deal.buyerName} · {deal.propertyTitle}
        </p>
        <Badge className="mt-2" variant={deal.status === "open" ? "outline" : "secondary"}>
          {deal.status}
        </Badge>
      </div>

      {deal.status === "open" && (
        <Card>
          <CardHeader>
            <CardTitle>Send a quote</CardTitle>
            <CardDescription>Buyer sees this on their Deals page and can accept.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="q-amt">Total (USD)</Label>
                <Input
                  id="q-amt"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-fee">Platform fee (USD)</Label>
                <Input id="q-fee" inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-note">Note to buyer (optional)</Label>
              <Textarea id="q-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button type="button" onClick={submitQuote}>
              Send quote in thread
            </Button>
          </CardContent>
        </Card>
      )}

      {(deal.status === "quoted" || deal.status === "funding_ready") && deal.amountCents > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current quote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold tabular-nums">{formatMoney(deal.amountCents)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Platform fee</span>
              <span className="tabular-nums">{formatMoney(deal.platformFeeCents)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
