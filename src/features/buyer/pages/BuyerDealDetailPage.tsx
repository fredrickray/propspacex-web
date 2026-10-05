"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Wallet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMessagingDock } from "@/features/communications/messaging-dock";
import { api } from "@/lib/api";
import { dealStatusMeta, parseDealEnvelope, type RemoteDeal } from "@/features/deals/remote-deal";
import { formatMoney } from "@/features/payments/escrow-format";
import { useToast } from "@/components/ui/use-toast";

export default function BuyerDealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const dealId = typeof params.dealId === "string" ? params.dealId : "";
  const { openThread } = useMessagingDock();
  const [deal, setDeal] = useState<RemoteDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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

  const accept = async () => {
    if (!deal) return;
    setBusy(true);
    try {
      const updated = parseDealEnvelope(
        await api.acceptDealQuote(deal.id, crypto.randomUUID()),
      );
      const escrowId = updated?.escrowId;
      if (!escrowId) {
        toast({
          title: "Quote accepted",
          description: "Open your wallet to fund the escrow.",
        });
        router.push("/buyer/wallet");
        return;
      }
      toast({
        title: "Quote accepted",
        description: "Open your wallet to fund this escrow.",
      });
      router.push(`/buyer/wallet?deal=${encodeURIComponent(escrowId)}`);
    } catch (err) {
      toast({
        title: "Could not accept",
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
      <div className="p-6 max-w-lg space-y-4">
        <p className="text-muted-foreground">{error || "Deal not found."}</p>
        <Button variant="outline" asChild>
          <Link href="/buyer/deals">Back to deals</Link>
        </Button>
      </div>
    );
  }

  const meta = dealStatusMeta(deal.status);
  const net = deal.amountMinor - deal.platformFeeMinor;

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
          <Link href="/buyer/deals">← Deals</Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{deal.propertyTitle}</h1>
        <p className="text-muted-foreground mt-1">{deal.agentName}</p>
      </div>

      <Badge variant={meta.variant}>{meta.label}</Badge>

      <Card>
        <CardHeader>
          <CardTitle>Commercial terms</CardTitle>
          <CardDescription>What you pay into escrow when you fund.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold tabular-nums">{formatMoney(deal.amountMinor)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Platform fee</span>
            <span className="font-medium tabular-nums">{formatMoney(deal.platformFeeMinor)}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-2">
            <span className="text-muted-foreground">Net to agent</span>
            <span className="font-medium tabular-nums">{formatMoney(net)}</span>
          </div>
        </CardContent>
      </Card>

      {deal.quoteNote ? (
        <Card>
          <CardHeader>
            <CardTitle>Note from the agent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{deal.quoteNote}</p>
          </CardContent>
        </Card>
      ) : null}

      {deal.status === "quoted" ? (
        <Alert>
          <CheckCircle2 className="size-4" />
          <AlertTitle>Accept the quote</AlertTitle>
          <AlertDescription>
            Accepting opens an escrow and sends you to the wallet to pay.
          </AlertDescription>
        </Alert>
      ) : null}

      {deal.status === "quoted" ? (
        <Button className="w-full sm:w-auto" onClick={() => void accept()} disabled={busy}>
          Accept quote and continue to wallet
        </Button>
      ) : null}

      {deal.status === "funding_ready" && deal.escrowId ? (
        <Button className="w-full sm:w-auto" asChild>
          <Link href={`/buyer/wallet?deal=${encodeURIComponent(deal.escrowId)}`}>
            <Wallet className="size-4 mr-2" />
            Open wallet to fund
          </Link>
        </Button>
      ) : null}

      {deal.status === "open" ? (
        <p className="text-sm text-muted-foreground">
          Waiting for the agent to send a quote. You can continue in{" "}
          <button
            type="button"
            className="text-primary underline"
            onClick={() => openThread(deal.conversationId)}
          >
            Messaging
          </button>
          .
        </p>
      ) : null}
    </div>
  );
}
