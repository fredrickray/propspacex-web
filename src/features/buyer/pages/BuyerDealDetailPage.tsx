"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCircle2, Wallet } from "lucide-react";
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
import { useCommunications } from "@/features/communications/communications-context";
import { formatMoney } from "@/features/payments/escrow-format";
import { useToast } from "@/components/ui/use-toast";

export default function BuyerDealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const dealId = typeof params.dealId === "string" ? params.dealId : "";
  const { engagements, buyerAcceptEngagement } = useCommunications();
  const deal = useMemo(() => engagements.find((e) => e.id === dealId), [engagements, dealId]);
  const [busy, setBusy] = useState(false);

  const accept = () => {
    if (!deal) return;
    setBusy(true);
    try {
      const escrowId = buyerAcceptEngagement(deal.id);
      if (!escrowId) {
        toast({
          title: "Could not accept",
          description: "Quote may be missing or already processed.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Quote accepted",
        description: "Open your wallet to fund this escrow.",
      });
      router.push(`/buyer/wallet?deal=${encodeURIComponent(escrowId)}`);
    } finally {
      setBusy(false);
    }
  };

  if (!deal) {
    return (
      <div className="p-6 max-w-lg space-y-4">
        <p className="text-muted-foreground">Deal not found.</p>
        <Button variant="outline" asChild>
          <Link href="/buyer/deals">Back to deals</Link>
        </Button>
      </div>
    );
  }

  const net = deal.amountCents - deal.platformFeeCents;

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
          <Link href="/buyer/deals">← Deals</Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{deal.title}</h1>
        <p className="text-muted-foreground mt-1">
          {deal.propertyTitle} · {deal.agentName}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={deal.status === "funding_ready" ? "default" : "secondary"}>
          {deal.status === "open" && "Awaiting agent quote"}
          {deal.status === "quoted" && "Quote received — review"}
          {deal.status === "accepted" && "Accepted"}
          {deal.status === "funding_ready" && "Ready to fund escrow"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commercial terms</CardTitle>
          <CardDescription>What you will pay into escrow when you fund.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold tabular-nums">{formatMoney(deal.amountCents)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Est. platform fee</span>
            <span className="font-medium tabular-nums">{formatMoney(deal.platformFeeCents)}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-2">
            <span className="text-muted-foreground">Est. net to agent</span>
            <span className="font-medium tabular-nums">{formatMoney(net)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scope</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{deal.description}</p>
        </CardContent>
      </Card>

      {deal.status === "quoted" && (
        <Alert>
          <CheckCircle2 className="size-4" />
          <AlertTitle>Accept the quote</AlertTitle>
          <AlertDescription>
            Accepting creates an escrow row in <strong>awaiting funding</strong> and sends you to
            the wallet to pay with card or balance.
          </AlertDescription>
        </Alert>
      )}

      {deal.status === "quoted" && (
        <Button className="w-full sm:w-auto" onClick={accept} disabled={busy}>
          Accept quote &amp; continue to wallet
        </Button>
      )}

      {deal.status === "funding_ready" && deal.escrowWalletId && (
        <Button className="w-full sm:w-auto" asChild>
          <Link href={`/buyer/wallet?deal=${encodeURIComponent(deal.escrowWalletId)}`}>
            <Wallet className="size-4 mr-2" />
            Open wallet to fund
          </Link>
        </Button>
      )}

      {deal.status === "open" && (
        <p className="text-sm text-muted-foreground">
          Waiting for the agent to send a quote. You can continue the conversation in{" "}
          <Link href="/buyer/messages" className="text-primary underline">
            Messages
          </Link>
          .
        </p>
      )}
    </div>
  );
}
