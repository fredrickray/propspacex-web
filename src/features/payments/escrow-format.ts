import type {
  AgentEscrowDeal,
  BuyerEscrowDeal,
  CanonicalEscrowDeal,
  EscrowDealStatus,
  FundingMethod,
} from "./types";

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function fundedAtLabel(iso: string | null, status: EscrowDealStatus): string {
  if (status === "awaiting_funding" || !iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function buyerStatusMeta(
  status: EscrowDealStatus,
): { label: string; variant: "default" | "secondary" | "outline" | "destructive" } {
  switch (status) {
    case "awaiting_funding":
      return { label: "Awaiting payment", variant: "outline" };
    case "in_progress":
      return { label: "In progress", variant: "secondary" };
    case "pending_buyer_release":
      return { label: "Ready for your release", variant: "default" };
    case "released":
      return { label: "Released to agent", variant: "secondary" };
    case "refunded":
      return { label: "Refunded to you", variant: "outline" };
    default:
      return { label: status, variant: "outline" };
  }
}

export function agentStatusMeta(
  status: EscrowDealStatus,
): { label: string; variant: "default" | "secondary" | "outline" | "destructive" } {
  switch (status) {
    case "awaiting_funding":
      return { label: "Awaiting buyer payment", variant: "outline" };
    case "in_progress":
      return { label: "In progress", variant: "secondary" };
    case "pending_buyer_release":
      return { label: "Awaiting buyer release", variant: "default" };
    case "released":
      return { label: "Released to you", variant: "secondary" };
    case "refunded":
      return { label: "Refunded to buyer", variant: "outline" };
    default:
      return { label: status, variant: "outline" };
  }
}

export function buyerDealSummary(deal: {
  status: EscrowDealStatus;
  fundingMethod: FundingMethod | null;
  agentName: string;
  title: string;
}): string {
  switch (deal.status) {
    case "awaiting_funding":
      return `Fund this engagement to lock in ${deal.agentName} for “${deal.title}”. You can pay with a card (Paystack test in production) or use your PropSpace wallet balance.`;
    case "in_progress":
      return deal.fundingMethod === "wallet"
        ? "Funds are held in escrow from your wallet until you release or a refund applies."
        : "Funds are held in escrow after card payment until you release or a refund applies.";
    case "pending_buyer_release":
      return "Your agent marked this complete. Release when you’re satisfied—funds move to their PropSpace balance (minus the platform fee).";
    case "released":
      return "You released payment; the agent received their net after the platform fee.";
    case "refunded":
      return "This engagement was refunded to your available balance.";
    default:
      return "";
  }
}

export function agentDealSummary(deal: {
  status: EscrowDealStatus;
  buyerName: string;
  title: string;
}): string {
  switch (deal.status) {
    case "awaiting_funding":
      return `${deal.buyerName} still needs to fund “${deal.title}”. You’ll see secured funds here once they pay.`;
    case "in_progress":
      return "Payment is secured in escrow. Mark complete when the buyer’s expectations are met.";
    case "pending_buyer_release":
      return "You marked this complete. The buyer can release payment; you’ll see it in your available balance after release.";
    case "released":
      return "Released to your wallet. Platform fee deducted; net is available to withdraw.";
    case "refunded":
      return "Funds were returned to the buyer.";
    default:
      return "";
  }
}

export function toBuyerEscrowDeal(d: CanonicalEscrowDeal): BuyerEscrowDeal {
  return {
    id: d.id,
    title: d.title,
    agentName: d.agentName,
    amountCents: d.amountCents,
    platformFeeCents: d.platformFeeCents,
    status: d.status,
    fundingMethod: d.fundingMethod,
    fundedAtLabel: fundedAtLabel(d.fundedAtIso, d.status),
  };
}

export function toAgentEscrowDeal(d: CanonicalEscrowDeal): AgentEscrowDeal {
  return {
    id: d.id,
    title: d.title,
    buyerName: d.buyerName,
    amountCents: d.amountCents,
    platformFeeCents: d.platformFeeCents,
    status: d.status,
    fundingMethod: d.fundingMethod,
    fundedAtLabel: fundedAtLabel(d.fundedAtIso, d.status),
  };
}
