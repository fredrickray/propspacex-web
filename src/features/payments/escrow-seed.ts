import type { CanonicalEscrowDeal } from "./types";

export const ESCROW_STORAGE_KEY = "propspacex_escrow_sim_v1";

/** Default demo timeline — includes one deal awaiting funding to exercise the fund flow. */
export const defaultEscrowDeals: CanonicalEscrowDeal[] = [
  {
    id: "esc-1",
    title: "Private viewing — Marina Bay penthouse",
    buyerName: "Alex Morgan",
    agentName: "Sarah Johnson",
    amountCents: 500_00,
    platformFeeCents: 25_00,
    status: "pending_buyer_release",
    fundingMethod: "card",
    fundedAtIso: "2026-04-08T14:00:00.000Z",
    engagementId: null,
  },
  {
    id: "esc-2",
    title: "Buyer consultation & neighborhood tour",
    buyerName: "Alex Morgan",
    agentName: "Marcus Chen",
    amountCents: 200_00,
    platformFeeCents: 10_00,
    status: "in_progress",
    fundingMethod: "wallet",
    fundedAtIso: "2026-04-09T10:30:00.000Z",
    engagementId: null,
  },
  {
    id: "esc-4",
    title: "Lease review & negotiation support",
    buyerName: "Alex Morgan",
    agentName: "Marcus Chen",
    amountCents: 350_00,
    platformFeeCents: 17_50,
    status: "awaiting_funding",
    fundingMethod: null,
    fundedAtIso: null,
    engagementId: null,
  },
  {
    id: "esc-3",
    title: "Offer preparation & submission support",
    buyerName: "Alex Morgan",
    agentName: "Sarah Johnson",
    amountCents: 1200_00,
    platformFeeCents: 60_00,
    status: "released",
    fundingMethod: "card",
    fundedAtIso: "2026-03-22T16:00:00.000Z",
    engagementId: null,
  },
];

export type EscrowSimulationState = {
  deals: CanonicalEscrowDeal[];
  buyerAvailableCents: number;
  agentAvailableCents: number;
  agentPendingWithdrawCents: number;
};

export function defaultEscrowSimulationState(): EscrowSimulationState {
  return {
    deals: defaultEscrowDeals,
    buyerAvailableCents: 450_00,
    agentAvailableCents: 3200_00,
    agentPendingWithdrawCents: 0,
  };
}
