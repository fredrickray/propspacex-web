"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Banknote,
  CreditCard,
  History,
  Lock,
  Send,
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
import {
  agentDealSummary,
  agentStatusMeta,
  formatMoney,
} from "@/features/payments/escrow-format";
import type { AgentEscrowDeal, EscrowDealStatus } from "@/features/payments/types";

const activePipelineStatuses: EscrowDealStatus[] = [
  "awaiting_funding",
  "in_progress",
  "pending_buyer_release",
];
const fundedSecuredStatuses: EscrowDealStatus[] = ["in_progress", "pending_buyer_release"];
const terminalStatuses: EscrowDealStatus[] = ["released", "refunded"];

export default function AgentWalletPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<AgentEscrowDeal[]>([]);
  const [walletAvailableCents, setWalletAvailableCents] = useState(0);
  const [pendingWithdrawalCents, setPendingWithdrawalCents] = useState(0);

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
      const [wallet, escrows, withdrawals] = await Promise.all([
        api.getMyWallet(),
        api.listEscrowsByUser({ role: 2, page: 1, limit: 100 }),
        api.listMyWithdrawals({ page: 1, limit: 100 }),
      ]);
      setWalletAvailableCents(parseMinor(wallet.wallet?.available_balance_minor));
      const withdrawalTotal = (withdrawals.withdrawals ?? []).reduce((sum, row) => {
        const record = row as Record<string, unknown>;
        const lifecycle = String(record.lifecycle_state ?? "").toLowerCase();
        if (lifecycle !== "pending" && lifecycle !== "processing") return sum;
        return sum + parseMinor(record.amount_minor);
      }, 0);
      setPendingWithdrawalCents(withdrawalTotal);
      const rows = (escrows.escrows ?? []).map((row) => {
        const record = row as Record<string, unknown>;
        const status = mapEscrowStatus(record.status);
        return {
          id: String(record.escrow_id ?? ""),
          title: String(record.deal_ref ?? "Escrow deal"),
          buyerName: String(record.buyer_user_id ?? "Buyer"),
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
        } satisfies AgentEscrowDeal;
      });
      setDeals(rows);
    } catch (error) {
      toast({
        title: "Unable to load earnings data",
        description: error instanceof Error ? error.message : "Failed to fetch wallet/escrows.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadRemoteData();
  }, [loadRemoteData]);

  const agentDeals = useMemo(() => deals, [deals]);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const securedNetCents = useMemo(
    () =>
      deals
        .filter((d) => fundedSecuredStatuses.includes(d.status))
        .reduce((s, d) => s + (d.amountCents - d.platformFeeCents), 0),
    [deals],
  );

  const activeDeals = useMemo(
    () => agentDeals.filter((d) => activePipelineStatuses.includes(d.status)),
    [agentDeals],
  );

  const pastDeals = useMemo(
    () => agentDeals.filter((d) => terminalStatuses.includes(d.status)),
    [agentDeals],
  );

  const markComplete = async (id: string) => {
    try {
      await api.markEscrowServiceComplete({
        escrow_id: id,
        idempotency_key: `mark_complete_${id}_${Date.now()}`,
      });
      await loadRemoteData();
      toast({
        title: "Marked complete",
        description: "The buyer can release escrow when they’re satisfied.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unable to mark service complete.",
        variant: "destructive",
      });
    }
  };

  const confirmWithdraw = async () => {
    const raw = parseFloat(withdrawAmount.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(raw) || raw <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive amount to withdraw.",
        variant: "destructive",
      });
      return;
    }
    const cents = Math.round(raw * 100);
    const spendable = walletAvailableCents - pendingWithdrawalCents;
    if (cents > spendable) {
      toast({
        title: "Insufficient balance",
        description: `You can withdraw up to ${formatMoney(spendable)} right now.`,
        variant: "destructive",
      });
      return;
    }
    try {
      await api.requestWithdrawal({
        amount_minor: cents,
        bank_code: "000",
        account_number: "0000000000",
        account_name: "Agent Account",
        idempotency_key: `wd_${Date.now()}`,
      });
      await loadRemoteData();
      setWithdrawOpen(false);
      setWithdrawAmount("");
      toast({
        title: "Withdrawal requested",
        description: `${formatMoney(cents)} was submitted for payout processing.`,
      });
    } catch (error) {
      toast({
        title: "Withdrawal failed",
        description: error instanceof Error ? error.message : "Unable to request withdrawal.",
        variant: "destructive",
      });
    }
  };

  const spendableCents = walletAvailableCents - pendingWithdrawalCents;

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Wallet &amp; payouts</p>
        <h1 className="text-2xl font-bold text-foreground">Earnings &amp; escrow</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          Track when buyers fund with card or wallet, mark services complete, then receive net
          payouts after buyer release.
        </p>
      </div>

      <Alert>
        <Banknote className="size-4" />
        <AlertTitle>Your side of the escrow flow</AlertTitle>
        <AlertDescription className="space-y-2 text-sm leading-relaxed">
          <p>
            Buyers <strong>fund escrow</strong> (Paystack or wallet). You deliver the service and
            tap <strong>Mark service complete</strong>.
          </p>
          <p>
            After the buyer <strong>releases</strong>, your <strong>available</strong> balance
            increases by the net amount (after the platform fee).
          </p>
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
            <Banknote className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight tabular-nums">
              {formatMoney(spendableCents)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">After pending withdrawals</p>
            <Button className="mt-4 w-full" variant="secondary" onClick={() => setWithdrawOpen(true)}>
              Withdraw
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Secured (your net)
            </CardTitle>
            <Lock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight tabular-nums">
              {formatMoney(securedNetCents)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated net across funded active deals (before buyer release)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending withdrawal
            </CardTitle>
            <Send className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight tabular-nums">
              {formatMoney(pendingWithdrawalCents)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">On the way to your bank (demo)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active deals</CardTitle>
          <CardDescription>
            Awaiting buyer payment, in progress, or waiting for buyer release.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeDeals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No active pipeline. When a buyer funds an engagement with you, it appears here.
            </p>
          ) : (
            activeDeals.map((deal) => {
              const meta = agentStatusMeta(deal.status);
              const net = deal.amountCents - deal.platformFeeCents;
              return (
                <div key={deal.id} className="rounded-lg border border-border bg-card/50 p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{deal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Buyer {deal.buyerName}
                        {deal.status !== "awaiting_funding" ? ` · Funded ${deal.fundedAtLabel}` : ""}
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
                  <p className="text-sm text-muted-foreground">{agentDealSummary(deal)}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span>
                      <span className="text-muted-foreground">Gross in escrow </span>
                      <span className="font-medium tabular-nums">{formatMoney(deal.amountCents)}</span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Platform fee </span>
                      <span className="font-medium tabular-nums">
                        {formatMoney(deal.platformFeeCents)}
                      </span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Your estimated net </span>
                      <span className="font-medium tabular-nums">{formatMoney(net)}</span>
                    </span>
                  </div>
                  {deal.status === "in_progress" && (
                    <Button variant="default" onClick={() => markComplete(deal.id)}>
                      Mark service complete
                    </Button>
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
            <CardDescription>Released and refunded deals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pastDeals.map((deal) => {
              const meta = agentStatusMeta(deal.status);
              const net = deal.amountCents - deal.platformFeeCents;
              return (
                <div
                  key={deal.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{deal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {deal.buyerName} · Net {formatMoney(net)}
                    </p>
                  </div>
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {loading && <p className="text-center text-xs text-muted-foreground">Loading wallet data...</p>}

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw to bank</DialogTitle>
            <DialogDescription>
              Demo only. Available after payouts:{" "}
              <strong className="text-foreground">{formatMoney(spendableCents)}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="wd-amount">Amount (NGN)</Label>
            <Input
              id="wd-amount"
              inputMode="decimal"
              placeholder="500.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmWithdraw}>
              <ArrowUpRight className="size-4 mr-2" />
              Request payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
