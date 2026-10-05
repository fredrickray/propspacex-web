export type RemoteDeal = {
  id: string;
  conversationId: string;
  propertyId: string;
  propertyTitle: string;
  buyerName: string;
  agentName: string;
  status: string;
  amountMinor: number;
  platformFeeMinor: number;
  quoteNote: string;
  escrowId: string;
  createdAt: string;
  updatedAt: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function minor(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.round(parsed);
  }
  return 0;
}

export function toRemoteDeal(raw: unknown): RemoteDeal | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = text(row.dealId) || text(row.id);
  if (!id) return null;
  return {
    id,
    conversationId: text(row.conversationId),
    propertyId: text(row.propertyId),
    propertyTitle: text(row.propertyTitle) || "Listing",
    buyerName: text(row.buyerName) || "Buyer",
    agentName: text(row.agentName) || "Agent",
    status: text(row.status) || "open",
    amountMinor: minor(row.quotedAmountMinor ?? row.amountMinor),
    platformFeeMinor: minor(row.platformFeeMinor),
    quoteNote: text(row.quoteNote),
    escrowId: text(row.escrowId),
    createdAt: text(row.createdAt),
    updatedAt: text(row.updatedAt),
  };
}

export function parseDealEnvelope(data: unknown): RemoteDeal | null {
  const row = asRecord(data);
  if (!row) return null;
  if (row.deal) return toRemoteDeal(row.deal);
  return toRemoteDeal(data);
}

export function parseDealList(data: unknown): RemoteDeal[] {
  const row = asRecord(data);
  const list = row && Array.isArray(row.deals) ? row.deals : Array.isArray(data) ? data : [];
  return list.map(toRemoteDeal).filter((deal): deal is RemoteDeal => deal !== null);
}

export function dealStatusMeta(status: string): {
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
} {
  switch (status) {
    case "open":
      return { label: "Awaiting quote", variant: "outline" };
    case "quoted":
      return { label: "Quoted", variant: "secondary" };
    case "funding_ready":
      return { label: "Ready to fund", variant: "default" };
    case "in_progress":
      return { label: "In progress", variant: "secondary" };
    case "pending_buyer_release":
      return { label: "Awaiting release", variant: "default" };
    case "released":
      return { label: "Released", variant: "secondary" };
    case "cancelled":
      return { label: "Cancelled", variant: "destructive" };
    case "disputed":
      return { label: "Disputed", variant: "destructive" };
    case "refunded":
      return { label: "Refunded", variant: "outline" };
    default:
      return { label: status || "Unknown", variant: "outline" };
  }
}
