"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

/**
 * Paystack (and similar) redirect target after checkout.
 * Query params are illustrative — align with your gateway when wiring the backend.
 */
export default function PaymentCallbackPage() {
  const sp = useSearchParams();
  const reference = sp.get("reference") ?? sp.get("trxref") ?? "";
  const flow = sp.get("flow") ?? "escrow";
  const status = (sp.get("status") ?? "").toLowerCase();
  const [verified, setVerified] = useState<null | boolean>(null);
  const [message, setMessage] = useState<string>("");
  const success =
    verified ?? status === "success" || status === "completed" || (!status && reference);

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      if (!reference) return;
      try {
        if (flow === "wallet_topup") {
          const response = await api.verifyWalletTopupByReference("paystack", reference);
          if (!cancelled) {
            setVerified(response.status === "success");
            setMessage(response.message);
          }
          return;
        }
        const response = await api.verifyEscrowPaymentByReference("paystack", reference);
        if (!cancelled) {
          setVerified(response.status === "success");
          setMessage(response.message);
        }
      } catch (error) {
        if (!cancelled) {
          setVerified(false);
          setMessage(error instanceof Error ? error.message : "Payment verification failed.");
        }
      }
    };
    void verify();
    return () => {
      cancelled = true;
    };
  }, [flow, reference]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center gap-6 p-6">
      {success ? (
        <Alert className="border-emerald-500/40 bg-emerald-500/10">
          <CheckCircle2 className="size-5 text-emerald-600" />
          <AlertTitle>Payment received</AlertTitle>
          <AlertDescription className="space-y-2 text-sm">
            {reference ? (
              <p>
                Reference <code className="rounded bg-muted px-1 font-mono text-xs">{reference}</code>
              </p>
            ) : null}
            <p>
              {message ||
                "Your backend verification succeeded. Escrow or wallet balance will update from settlement flow."}
            </p>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <XCircle className="size-5" />
          <AlertTitle>Payment not completed</AlertTitle>
          <AlertDescription>
            {message || (status ? `Status: ${status}.` : "No status returned.")} You can retry from
            the wallet flow.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/buyer/wallet">Open wallet</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/buyer/deals">View deals</Link>
        </Button>
      </div>
    </div>
  );
}
