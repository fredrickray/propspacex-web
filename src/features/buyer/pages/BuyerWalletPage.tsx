"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  CircleDollarSign,
  CreditCard,
  HandCoins,
  History,
  Lock,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useEscrowSimulation } from "@/features/payments/escrow-context";
import { FundEscrowDialog } from "@/features/payments/components/FundEscrowDialog";
import {
  buyerDealSummary,
  buyerStatusMeta,
  formatMoney,
  toBuyerEscrowDeal,
} from "@/features/payments/escrow-format";
import type { BuyerEscrowDeal, EscrowDealStatus } from "@/features/payments/types";

const activeFundedStatuses: EscrowDealStatus[] = ["in_progress", "pending_buyer_release"];
const terminalStatuses: EscrowDealStatus[] = ["released", "refunded"];

export default function BuyerWalletPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { state, deals, buyerRelease, topUpBuyerWallet, resetSimulation } = useEscrowSimulation();

  const buyerDeals = useMemo(() => deals.map(toBuyerEscrowDeal), [deals]);

  const [addOpen, setAddOpen] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [releaseTarget, setReleaseTarget] = useState<BuyerEscrowDeal | null>(null);
  const [fundTarget, setFundTarget] = useState<BuyerEscrowDeal | null>(null);

  const focusedDealId = searchParams.get("deal");
  const focusedDeal = useMemo(
    () => buyerDeals.find((deal) => deal.id === focusedDealId),
    [buyerDeals, focusedDealId],
  );

  const awaitingDeals = useMemo(
    () => buyerDeals.filter((d) => d.status === "awaiting_funding"),
    [buyerDeals],
  );

  const activeFundedDeals = useMemo(
    () => buyerDeals.filter((d) => activeFundedStatuses.includes(d.status)),
    [buyerDeals],
  );

  const pastDeals = useMemo(
    () => buyerDeals.filter((d) => terminalStatuses.includes(d.status)),
    [buyerDeals],
  );

  const inEscrowCents = useMemo(
    () =>
      activeFundedDeals.reduce((sum, d) => {
        return sum + d.amountCents;
      }, 0),
    [activeFundedDeals],
  );

  const confirmAddFunds = () => {
    const raw = parseFloat(addAmount.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(raw) || raw <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive amount to add to your wallet.",
        variant: "destructive",
      });
      return;
    }
    const cents = Math.round(raw * 100);
    topUpBuyerWallet(cents);
    setAddOpen(false);
    setAddAmount("");
    toast({
      title: "Funds added (demo)",
      description: `${formatMoney(cents)} was credited to your available balance. In production this would run a Paystack wallet top-up flow.`,
    });
  };

  const confirmRelease = () => {
    if (!releaseTarget) return;
    buyerRelease(releaseTarget.id);
    const net = releaseTarget.amountCents - releaseTarget.platformFeeCents;
    toast({
      title: "Payment released",
      description: `${formatMoney(releaseTarget.amountCents)} left escrow (${formatMoney(net)} net to ${releaseTarget.agentName} after platform fee).`,
    });
    setReleaseTarget(null);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Dashboard &gt; Wallet &amp; escrow</p>
        <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          Add funds to your PropSpace balance, fund escrows with a card or wallet, then release
          payment when each service is complete.
        </p>
      </div>

      <Alert>
        <ShieldCheck className="size-4" />
        <AlertTitle>How funding and release work</AlertTitle>
        <AlertDescription className="space-y-2 text-sm leading-relaxed">
          <p>
            <strong>Phase A — Agree the deal:</strong> amount and agent are fixed per engagement.
          </p>
          <p>
            <strong>Phase B — Fund escrow:</strong> either <strong>Pay with card</strong> (Paystack
            in production; simulated here) or <strong>Use wallet balance</strong> if you already
            added money on-platform.
          </p>
          <p>
            <strong>Release:</strong> when your agent marks the service complete, you confirm with{" "}
            <strong>Release payment</strong> so net funds move to their PropSpace balance.
          </p>
        </AlertDescription>
      </Alert>

      {focusedDeal && (
        <Alert>
          <HandCoins className="size-4" />
          <AlertTitle>Escrow deal opened from another screen</AlertTitle>
          <AlertDescription>
            You are viewing <strong>{focusedDeal.title}</strong>. Scroll to its card below to
            continue.{" "}
            <Link href="/buyer/messages" className="underline underline-offset-2">
              Back to messages
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available balance
            </CardTitle>
            <CircleDollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight tabular-nums">
              {formatMoney(state.buyerAvailableCents)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ready to reserve for agent services (wallet path)
            </p>
            <Button className="mt-4 w-full sm:w-auto" onClick={() => setAddOpen(true)}>
              Add funds
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In escrow</CardTitle>
            <Lock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight tabular-nums">{formatMoney(inEscrowCents)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total held across funded active deals (after you pay, before release)
            </p>
          </CardContent>
        </Card>
      </div>

      {awaitingDeals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Needs your payment
            </CardTitle>
            <CardDescription>
              These engagements are agreed but not yet funded — choose card or wallet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {awaitingDeals.map((deal) => {
              const meta = buyerStatusMeta(deal.status);
              const netToAgent = deal.amountCents - deal.platformFeeCents;
              return (
                <div
                  key={deal.id}
                  className={`rounded-lg border p-4 space-y-3 ${
                    focusedDealId === deal.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card/50"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{deal.title}</p>
                      <p className="text-sm text-muted-foreground">with {deal.agentName}</p>
                    </div>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{buyerDealSummary(deal)}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span>
                      <span className="text-muted-foreground">Amount to fund </span>
                      <span className="font-medium tabular-nums">{formatMoney(deal.amountCents)}</span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Est. platform fee </span>
                      <span className="font-medium tabular-nums">
                        {formatMoney(deal.platformFeeCents)}
                      </span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Est. net to agent </span>
                      <span className="font-medium tabular-nums">{formatMoney(netToAgent)}</span>
                    </span>
                  </div>
                  <Button onClick={() => setFundTarget(deal)}>Fund escrow</Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandCoins className="size-5" />
            Active holds
          </CardTitle>
          <CardDescription>
            Funded deals still in escrow or waiting for you to release after the agent finishes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeFundedDeals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No funded active escrow. Fund a deal above or start a new engagement from messages.
            </p>
          ) : (
            activeFundedDeals.map((deal) => {
              const meta = buyerStatusMeta(deal.status);
              const netToAgent = deal.amountCents - deal.platformFeeCents;
              return (
                <div
                  key={deal.id}
                  className={`rounded-lg border p-4 space-y-3 ${
                    focusedDealId === deal.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card/50"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{deal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        with {deal.agentName} · Funded {deal.fundedAtLabel}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {deal.fundingMethod && (
                        <Badge variant="outline" className="gap-1 font-normal">
                          {deal.fundingMethod === "card" ? (
                            <CreditCard className="size-3" />
                          ) : (
                            <Wallet className="size-3" />
                          )}
                          {deal.fundingMethod === "card" ? "Card" : "Wallet"}
                        </Badge>
                      )}
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{buyerDealSummary(deal)}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span>
                      <span className="text-muted-foreground">Total held </span>
                      <span className="font-medium tabular-nums">{formatMoney(deal.amountCents)}</span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Est. platform fee </span>
                      <span className="font-medium tabular-nums">
                        {formatMoney(deal.platformFeeCents)}
                      </span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Est. net to agent </span>
                      <span className="font-medium tabular-nums">{formatMoney(netToAgent)}</span>
                    </span>
                  </div>
                  {deal.status === "pending_buyer_release" && (
                    <Button onClick={() => setReleaseTarget(deal)}>Release payment to agent</Button>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {pastDeals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-5" />
              History
            </CardTitle>
            <CardDescription>Completed releases and refunds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pastDeals.map((deal) => {
              const meta = buyerStatusMeta(deal.status);
              return (
                <div
                  key={deal.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{deal.title}</p>
                    <p className="text-xs text-muted-foreground">{deal.agentName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold tabular-nums">{formatMoney(deal.amountCents)}</span>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Demo state is saved in this browser.{" "}
        <button
          type="button"
          className="underline underline-offset-2 hover:text-foreground"
          onClick={() => {
            resetSimulation();
            toast({ title: "Demo reset", description: "Wallet and escrow restored to defaults." });
          }}
        >
          Reset demo data
        </button>
      </p>

      <FundEscrowDialog deal={fundTarget} open={!!fundTarget} onOpenChange={(o) => !o && setFundTarget(null)} />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add funds</DialogTitle>
            <DialogDescription>
              Demo credit to your <strong>available</strong> balance only. Production would use a
              Paystack wallet top-up intent before you choose &quot;Use wallet balance&quot; on an
              escrow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="add-amount">Amount (USD)</Label>
            <Input
              id="add-amount"
              inputMode="decimal"
              placeholder="250.00"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddFunds}>
              <ArrowDownLeft className="size-4 mr-2" />
              Add to wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!releaseTarget} onOpenChange={(o) => !o && setReleaseTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release payment from escrow?</DialogTitle>
            <DialogDescription>
              This confirms you are satisfied with the service.{" "}
              <strong>{releaseTarget ? formatMoney(releaseTarget.amountCents) : ""}</strong> will
              leave escrow for <strong>{releaseTarget?.agentName}</strong> (net amount may be lower
              after the platform fee).
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Prefer resolving issues with support before you release if something is wrong.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setReleaseTarget(null)}>
              Not yet
            </Button>
            <Button onClick={confirmRelease}>Yes, release payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
