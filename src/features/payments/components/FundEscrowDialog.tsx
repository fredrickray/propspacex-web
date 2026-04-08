"use client";

import { useMemo, useState } from "react";
import { CreditCard, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import type { BuyerEscrowDeal } from "../types";
import { formatMoney } from "../escrow-format";
import { useEscrowSimulation } from "../escrow-context";

type Step = "method" | "paystack";

function makeMockReference(dealId: string) {
  return `PSX-${dealId}-${Date.now().toString(36).slice(-6).toUpperCase()}`;
}

export function FundEscrowDialog({
  deal,
  open,
  onOpenChange,
}: {
  deal: BuyerEscrowDeal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const { state, fundWithWallet, fundWithCard } = useEscrowSimulation();
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<"card" | "wallet">("card");
  const [mockReference, setMockReference] = useState<string | null>(null);

  const canWallet = useMemo(() => {
    if (!deal) return false;
    return state.buyerAvailableCents >= deal.amountCents;
  }, [deal, state.buyerAvailableCents]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStep("method");
      setMethod("card");
      setMockReference(null);
    }
    onOpenChange(next);
  };

  const startCardFlow = () => {
    if (!deal) return;
    setMockReference(makeMockReference(deal.id));
    setStep("paystack");
  };

  const confirmWallet = () => {
    if (!deal) return;
    if (!canWallet) {
      toast({
        title: "Insufficient balance",
        description: `You need ${formatMoney(deal.amountCents)} available. Add funds or pay with card.`,
        variant: "destructive",
      });
      return;
    }
    fundWithWallet(deal.id);
    toast({
      title: "Escrow funded",
      description: `${formatMoney(deal.amountCents)} moved from your wallet into escrow.`,
    });
    handleOpenChange(false);
  };

  const confirmCardSimulated = () => {
    if (!deal) return;
    fundWithCard(deal.id);
    toast({
      title: "Payment confirmed",
      description: "In production, Paystack webhooks and verify would confirm this before crediting escrow.",
    });
    handleOpenChange(false);
  };

  if (!deal) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {step === "method" ? (
          <>
            <DialogHeader>
              <DialogTitle>Fund escrow</DialogTitle>
              <DialogDescription>
                Secure <strong className="text-foreground">{formatMoney(deal.amountCents)}</strong>{" "}
                for <strong className="text-foreground">{deal.title}</strong> with{" "}
                {deal.agentName}. Choose how you want to pay.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Available balance:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {formatMoney(state.buyerAvailableCents)}
              </span>
            </div>

            <RadioGroup
              value={method}
              onValueChange={(v) => setMethod(v as "card" | "wallet")}
              className="grid gap-3 pt-1"
            >
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                  method === "card" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                }`}
              >
                <RadioGroupItem value="card" id="fund-card" className="mt-1" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <CreditCard className="size-4 text-primary" aria-hidden />
                    Pay with card
                  </div>
                  <p className="text-sm text-muted-foreground leading-snug">
                    Opens Paystack checkout (test keys in development). Best when you do not want
                    to pre-load your PropSpace wallet.
                  </p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                  method === "wallet" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                } ${!canWallet ? "opacity-60" : ""}`}
              >
                <RadioGroupItem value="wallet" id="fund-wallet" className="mt-1" disabled={!canWallet} />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Wallet className="size-4 text-primary" aria-hidden />
                    Use wallet balance
                  </div>
                  <p className="text-sm text-muted-foreground leading-snug">
                    Reserves funds you already hold on PropSpace. No external checkout for this
                    portion.
                  </p>
                  {!canWallet && (
                    <p className="text-xs text-destructive">
                      Not enough available — add funds or choose card.
                    </p>
                  )}
                </div>
              </label>
            </RadioGroup>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              {method === "card" ? (
                <Button type="button" onClick={startCardFlow}>
                  Continue to Paystack
                </Button>
              ) : (
                <Button type="button" onClick={confirmWallet} disabled={!canWallet}>
                  Fund from wallet
                </Button>
              )}
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Pay with Paystack (simulated)</DialogTitle>
              <DialogDescription>
                In production you would be redirected to Paystack. Here we mimic the return path
                after a successful test charge.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-muted-foreground">Reference</Label>
                <code className="rounded bg-muted px-2 py-1 text-xs font-mono">{mockReference}</code>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Paystack would show the amount <strong>{formatMoney(deal.amountCents)}</strong> and
                collect card or bank. When Paystack reports success, your backend runs{" "}
                <code className="rounded bg-muted px-1 text-xs">VerifyPaymentByReference</code> or
                a webhook handler, then credits escrow on the ledger.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setStep("method")}>
                Back
              </Button>
              <Button type="button" onClick={confirmCardSimulated}>
                I’ve completed payment (simulate success)
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
