"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
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
import { api } from "@/lib/api";
import { FundEscrowDialog } from "@/features/payments/components/FundEscrowDialog";
import {
  buyerDealSummary,
  buyerStatusMeta,
  formatMoney,
} from "@/features/payments/escrow-format";
import type { BuyerEscrowDeal, EscrowDealStatus } from "@/features/payments/types";

const activeFundedStatuses: EscrowDealStatus[] = ["in_progress", "pending_buyer_release"];
const terminalStatuses: EscrowDealStatus[] = ["released", "refunded"];

export default function BuyerWalletPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [walletAvailableCents, setWalletAvailableCents] = useState(0);
  const [deals, setDeals] = useState<BuyerEscrowDeal[]>([]);

  const parseMinor = (value: unknown): number => {
    if (typeof value === "number") return Number.isFinite(value) ? Math.round(value) : 0;
    if (typeof value === "string") {
      const n = Number(value);
      return Number.isFinite(n) ? Math.round(n) : 0;
    }
    return 0;
  };

  const mapEscrowStatus = (status: unknown): EscrowDealStatus => {
    const s = String(status ?? "").toLowerCase().trim();
    if (s.includes("held")) return "awaiting_funding";
    if (s.includes("in_progress")) return "in_progress";
    if (s.includes("pending_buyer_release")) return "pending_buyer_release";
    if (s.includes("released")) return "released";
    if (s.includes("refunded")) return "refunded";
    return "awaiting_funding";
  };

  const loadRemoteData = useCallback(async () => {
    setLoading(true);
    try {
      const [wallet, escrows] = await Promise.all([
        api.getMyWallet(),
        api.listEscrowsByUser({ role: 1, page: 1, limit: 100 }),
      ]);
      setWalletAvailableCents(parseMinor(wallet.wallet?.available_balance_minor));
      const rows = (escrows.escrows ?? []).map((row) => {
        const record = row as Record<string, unknown>;
        const status = mapEscrowStatus(record.status);
        return {
          id: String(record.escrow_id ?? ""),
          title: String(record.deal_ref ?? "Escrow deal"),
          agentName: String(record.agent_user_id ?? "Agent"),
          amountCents: parseMinor(record.amount_minor),
          platformFeeCents: parseMinor(record.platform_fee_minor),
          status,
          fundingMethod: status === "awaiting_funding" ? null : "card",
          fundedAtLabel:
            typeof record.funded_at === "string"
              ? new Date(record.funded_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—",
        } satisfies BuyerEscrowDeal;
      });
      setDeals(rows);
    } catch (error) {
      toast({
        title: "Unable to load wallet data",
        description: error instanceof Error ? error.message : "Failed to fetch wallet/escrow data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadRemoteData();
  }, [loadRemoteData]);

  const buyerDeals = useMemo(() => deals, [deals]);

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

  const confirmAddFunds = async () => {
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
    try {
      const callback_url =
        typeof window !== "undefined"
          ? `${window.location.origin}/buyer/payment/callback?flow=wallet_topup`
          : undefined;
      const intent = await api.createWalletTopupIntent({
        amount_minor: cents,
        currency_code: 1,
        idempotency_key: `topup_${Date.now()}`,
        callback_url,
      });
      if (intent.payment_link && typeof window !== "undefined") {
        window.location.href = intent.payment_link;
        return;
      }
      await loadRemoteData();
      setAddOpen(false);
      setAddAmount("");
      toast({
        title: "Funds added",
        description: `${formatMoney(cents)} was credited to your available balance.`,
      });
    } catch (error) {
      toast({
        title: "Top-up failed",
        description: error instanceof Error ? error.message : "Unable to initialize wallet top-up.",
        variant: "destructive",
      });
    }
  };

  const formatAmountInput = (value: string) => {
    const sanitized = value.replace(/[^\d.]/g, "");
    if (!sanitized) return "";
    const [rawWhole = "", ...rest] = sanitized.split(".");
    const rawFraction = rest.join("");
    const whole = rawWhole.replace(/^0+(?=\d)/, "");
    const groupedWhole = (whole || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const hasDot = sanitized.includes(".");
    const fraction = rawFraction.slice(0, 2);
    if (hasDot) return `${groupedWhole}.${fraction}`;
    return groupedWhole;
  };

  const confirmRelease = async () => {
    if (!releaseTarget) return;
    try {
      await api.releaseEscrow({
        escrow_id: releaseTarget.id,
        idempotency_key: `release_${releaseTarget.id}_${Date.now()}`,
      });
      await loadRemoteData();
      const net = releaseTarget.amountCents - releaseTarget.platformFeeCents;
      toast({
        title: "Payment released",
        description: `${formatMoney(releaseTarget.amountCents)} left escrow (${formatMoney(net)} net to ${releaseTarget.agentName} after platform fee).`,
      });
      setReleaseTarget(null);
    } catch (error) {
      toast({
        title: "Release failed",
        description: error instanceof Error ? error.message : "Unable to release escrow.",
        variant: "destructive",
      });
    }
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
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight tabular-nums">
              {formatMoney(walletAvailableCents)}
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

      {loading && <p className="text-center text-xs text-muted-foreground">Loading wallet data...</p>}

      <FundEscrowDialog
        deal={fundTarget}
        open={!!fundTarget}
        onOpenChange={(o) => !o && setFundTarget(null)}
        availableCents={walletAvailableCents}
        onSuccessfulFunding={() => {
          void loadRemoteData();
        }}
      />

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
            <Label htmlFor="add-amount">Amount (NGN)</Label>
            <Input
              id="add-amount"
              inputMode="decimal"
              placeholder="250,000.00"
              value={addAmount}
              onChange={(e) => setAddAmount(formatAmountInput(e.target.value))}
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
