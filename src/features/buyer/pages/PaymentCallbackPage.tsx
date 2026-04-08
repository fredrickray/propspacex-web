"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Paystack (and similar) redirect target after checkout.
 * Query params are illustrative — align with your gateway when wiring the backend.
 */
export default function PaymentCallbackPage() {
  const sp = useSearchParams();
  const reference = sp.get("reference") ?? sp.get("trxref") ?? "";
  const status = (sp.get("status") ?? "").toLowerCase();
  const success = status === "success" || status === "completed" || (!status && reference);

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
              In production your backend verifies this reference with Paystack, then credits escrow
              or wallet. For now continue in the wallet demo.
            </p>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <XCircle className="size-5" />
          <AlertTitle>Payment not completed</AlertTitle>
          <AlertDescription>
            {status ? `Status: ${status}.` : "No status returned."} You can retry from the wallet
            flow.
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
