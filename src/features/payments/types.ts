/** Escrow lifecycle — mirrors payment-service semantics for future API mapping. */
export type EscrowDealStatus =
  | "awaiting_funding"
  | "in_progress"
  | "pending_buyer_release"
  | "released"
  | "refunded";

export type FundingMethod = "wallet" | "card";

/** Single source of truth for a deal (buyer + agent UIs derive from this). */
export type CanonicalEscrowDeal = {
  id: string;
  title: string;
  buyerName: string;
  agentName: string;
  amountCents: number;
  platformFeeCents: number;
  status: EscrowDealStatus;
  /** Set when funded (wallet or card). */
  fundingMethod: FundingMethod | null;
  fundedAtIso: string | null;
  /** Links wallet escrow row to engagement / deal flow (optional). */
  engagementId?: string | null;
};

/** Buyer-facing row (wallet UI). */
export type BuyerEscrowDeal = {
  id: string;
  title: string;
  agentName: string;
  amountCents: number;
  platformFeeCents: number;
  status: EscrowDealStatus;
  fundingMethod: FundingMethod | null;
  fundedAtLabel: string;
};

/** Agent-facing row (wallet UI). */
export type AgentEscrowDeal = {
  id: string;
  title: string;
  buyerName: string;
  amountCents: number;
  platformFeeCents: number;
  status: EscrowDealStatus;
  fundingMethod: FundingMethod | null;
  fundedAtLabel: string;
};
