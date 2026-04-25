export type ChatRole = "buyer" | "agent";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAtIso: string;
};

export type EngagementDealStatus = "open" | "quoted" | "accepted" | "funding_ready";

export type EngagementDeal = {
  id: string;
  conversationId: string;
  propertyId: string;
  propertyTitle: string;
  buyerName: string;
  buyerEmail: string;
  agentName: string;
  title: string;
  description: string;
  amountCents: number;
  platformFeeCents: number;
  status: EngagementDealStatus;
  /** Populated after buyer accepts quote — wallet escrow row id. */
  escrowWalletId: string | null;
  createdAtIso: string;
  updatedAtIso: string;
};

export type Conversation = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  agentName: string;
  buyerName: string;
  engagementId: string | null;
  messages: ChatMessage[];
};

export type Lead = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerName: string;
  buyerEmail: string;
  phone: string;
  intent: string | null;
  message: string;
  conversationId: string;
  engagementId: string;
  createdAtIso: string;
};

export type SavedSearchRecord = {
  id: string;
  name: string;
  location: string;
  filters: string[];
  alertsEnabled: boolean;
  createdAtIso: string;
};
