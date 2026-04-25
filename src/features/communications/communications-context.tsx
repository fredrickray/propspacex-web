"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ChatMessage,
  Conversation,
  EngagementDeal,
  Lead,
  SavedSearchRecord,
} from "./communications-types";
import { useEscrowSimulation } from "@/features/payments/escrow-context";

const STORAGE_KEY = "propspacex_comm_v1";
const SAVED_SEARCHES_KEY = "propspacex_saved_searches_v1";

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowIso() {
  return new Date().toISOString();
}

type CommState = {
  conversations: Conversation[];
  engagements: EngagementDeal[];
  leads: Lead[];
};

function defaultCommState(): CommState {
  const engagementId = "eng-seed-quoted";
  const convId = "conv-seed-quoted";
  const engagement: EngagementDeal = {
    id: engagementId,
    conversationId: convId,
    propertyId: "seed-1",
    propertyTitle: "Downtown Luxury Apt",
    buyerName: "Alex Morgan",
    buyerEmail: "alex@example.com",
    agentName: "Agent Smith",
    title: "Buyer consultation",
    description: "Agreed scope from thread.",
    amountCents: 15_000,
    platformFeeCents: 750,
    status: "quoted",
    escrowWalletId: null,
    createdAtIso: "2026-04-01T12:00:00.000Z",
    updatedAtIso: "2026-04-02T09:00:00.000Z",
  };

  const conv: Conversation = {
    id: convId,
    propertyId: "seed-1",
    propertyTitle: "Downtown Luxury Apt",
    agentName: "Agent Smith",
    buyerName: "Alex Morgan",
    engagementId,
    messages: [
      {
        id: "m1",
        role: "buyer",
        text: "Hi, I'd like to book a consultation about this building.",
        createdAtIso: "2026-04-01T12:00:00.000Z",
      },
      {
        id: "m2",
        role: "agent",
        text: "Absolutely. I can prepare a one-hour session. I'll send a formal quote next.",
        createdAtIso: "2026-04-01T12:05:00.000Z",
      },
      {
        id: "m3",
        role: "agent",
        text: "I've quoted $150.00 (platform fee $7.50) for the consultation. Please review under Deals.",
        createdAtIso: "2026-04-02T09:00:00.000Z",
      },
    ],
  };

  const seedLead: Lead = {
    id: "lead-seed-1",
    propertyId: "seed-1",
    propertyTitle: "Downtown Luxury Apt",
    buyerName: "Alex Morgan",
    buyerEmail: "alex@example.com",
    phone: "+1 555-0100",
    intent: "tour",
    message: "Hi, I'd like to book a consultation about this building.",
    conversationId: convId,
    engagementId,
    createdAtIso: "2026-04-01T12:00:00.000Z",
  };

  return {
    conversations: [conv],
    engagements: [engagement],
    leads: [seedLead],
  };
}

function loadComm(): CommState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CommState;
  } catch {
    return null;
  }
}

function loadSavedSearches(): SavedSearchRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedSearchRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type CommunicationsContextValue = {
  conversations: Conversation[];
  engagements: EngagementDeal[];
  leads: Lead[];
  savedSearches: SavedSearchRecord[];
  postMessage: (conversationId: string, role: "buyer" | "agent", text: string) => void;
  submitContactLead: (input: {
    propertyId: string;
    propertyTitle: string;
    buyerName: string;
    buyerEmail: string;
    phone: string;
    intent: string | null;
    message: string;
  }) => { conversationId: string; engagementId: string };
  agentQuoteEngagement: (
    engagementId: string,
    input: { amountDollars: number; platformFeeDollars: number; note?: string },
  ) => void;
  buyerAcceptEngagement: (engagementId: string) => string | null;
  addSavedSearch: (input: Omit<SavedSearchRecord, "id" | "createdAtIso">) => void;
  updateSavedSearch: (id: string, patch: Partial<SavedSearchRecord>) => void;
  deleteSavedSearch: (id: string) => void;
};

const CommunicationsContext = createContext<CommunicationsContextValue | null>(null);

export function CommunicationsProvider({ children }: { children: ReactNode }) {
  const { registerAwaitingFundingDeal } = useEscrowSimulation();
  const [state, setState] = useState<CommState>(() => defaultCommState());
  const [savedSearches, setSavedSearches] = useState<SavedSearchRecord[]>([]);
  const bootstrapped = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!bootstrapped.current) {
      bootstrapped.current = true;
      const saved = loadComm();
      if (saved?.conversations?.length) {
        setState({
          conversations: saved.conversations,
          engagements: Array.isArray(saved.engagements) ? saved.engagements : [],
          leads: Array.isArray(saved.leads) ? saved.leads : [],
        });
      } else {
        setState(defaultCommState());
      }
      setSavedSearches(loadSavedSearches());
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(savedSearches));
  }, [state, savedSearches]);

  const postMessage = useCallback((conversationId: string, role: "buyer" | "agent", text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const msg: ChatMessage = {
      id: uid("msg"),
      role,
      text: trimmed,
      createdAtIso: nowIso(),
    };
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) =>
        c.id === conversationId ? { ...c, messages: [...c.messages, msg] } : c,
      ),
    }));
  }, []);

  const submitContactLead = useCallback(
    (input: {
      propertyId: string;
      propertyTitle: string;
      buyerName: string;
      buyerEmail: string;
      phone: string;
      intent: string | null;
      message: string;
    }) => {
      const conversationId = uid("conv");
      const engagementId = uid("eng");
      const title =
        input.intent === "tour"
          ? "Property tour"
          : input.intent === "offer"
            ? "Offer discussion"
            : "Buyer inquiry";
      const engagement: EngagementDeal = {
        id: engagementId,
        conversationId,
        propertyId: input.propertyId,
        propertyTitle: input.propertyTitle,
        buyerName: input.buyerName,
        buyerEmail: input.buyerEmail,
        agentName: "Listing agent",
        title,
        description: input.message,
        amountCents: 0,
        platformFeeCents: 0,
        status: "open",
        escrowWalletId: null,
        createdAtIso: nowIso(),
        updatedAtIso: nowIso(),
      };
      const lead: Lead = {
        id: uid("lead"),
        propertyId: input.propertyId,
        propertyTitle: input.propertyTitle,
        buyerName: input.buyerName,
        buyerEmail: input.buyerEmail,
        phone: input.phone,
        intent: input.intent,
        message: input.message,
        conversationId,
        engagementId,
        createdAtIso: nowIso(),
      };
      const conv: Conversation = {
        id: conversationId,
        propertyId: input.propertyId,
        propertyTitle: input.propertyTitle,
        agentName: "Listing agent",
        buyerName: input.buyerName,
        engagementId,
        messages: [
          {
            id: uid("msg"),
            role: "buyer",
            text: input.message,
            createdAtIso: nowIso(),
          },
        ],
      };
      setState((prev) => ({
        conversations: [conv, ...prev.conversations],
        engagements: [engagement, ...prev.engagements],
        leads: [lead, ...prev.leads],
      }));
      return { conversationId, engagementId };
    },
    [],
  );

  const agentQuoteEngagement = useCallback(
    (
      engagementId: string,
      input: { amountDollars: number; platformFeeDollars: number; note?: string },
    ) => {
      const amountCents = Math.round(input.amountDollars * 100);
      const platformFeeCents = Math.round(input.platformFeeDollars * 100);
      const note = input.note?.trim();
      setState((prev) => {
        const eng = prev.engagements.find((e) => e.id === engagementId);
        if (!eng) return prev;
        const conv = prev.conversations.find((c) => c.id === eng.conversationId);
        const quoteMsg: ChatMessage = {
          id: uid("msg"),
          role: "agent",
          text:
            (note ? `${note}\n\n` : "") +
            `Quoted total ${(amountCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })} (platform fee ${(platformFeeCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}).`,
          createdAtIso: nowIso(),
        };
        return {
          ...prev,
          engagements: prev.engagements.map((e) =>
            e.id === engagementId
              ? {
                  ...e,
                  amountCents,
                  platformFeeCents,
                  status: "quoted" as const,
                  updatedAtIso: nowIso(),
                }
              : e,
          ),
          conversations: prev.conversations.map((c) =>
            c.id === eng.conversationId
              ? { ...c, messages: [...c.messages, quoteMsg] }
              : c,
          ),
        };
      });
    },
    [],
  );

  const buyerAcceptEngagement = useCallback(
    (engagementId: string) => {
      const eng = stateRef.current.engagements.find((e) => e.id === engagementId);
      if (!eng || eng.status !== "quoted" || eng.amountCents <= 0) return null;
      const escrowId = registerAwaitingFundingDeal({
        engagementId: eng.id,
        title: eng.title,
        buyerName: eng.buyerName,
        agentName: eng.agentName,
        amountCents: eng.amountCents,
        platformFeeCents: eng.platformFeeCents,
      });
      if (!escrowId) return null;
      const acceptMsg: ChatMessage = {
        id: uid("msg"),
        role: "buyer",
        text: "I accept the quote. I'm heading to Wallet to fund escrow.",
        createdAtIso: nowIso(),
      };
      setState((prev) => ({
        ...prev,
        engagements: prev.engagements.map((e) =>
          e.id === engagementId
            ? {
                ...e,
                status: "funding_ready" as const,
                escrowWalletId: escrowId,
                updatedAtIso: nowIso(),
              }
            : e,
        ),
        conversations: prev.conversations.map((c) =>
          c.id === eng.conversationId
            ? { ...c, messages: [...c.messages, acceptMsg] }
            : c,
        ),
      }));
      return escrowId;
    },
    [registerAwaitingFundingDeal],
  );

  const addSavedSearch = useCallback((input: Omit<SavedSearchRecord, "id" | "createdAtIso">) => {
    const row: SavedSearchRecord = {
      ...input,
      id: uid("search"),
      createdAtIso: nowIso(),
    };
    setSavedSearches((s) => [row, ...s]);
  }, []);

  const updateSavedSearch = useCallback((id: string, patch: Partial<SavedSearchRecord>) => {
    setSavedSearches((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const deleteSavedSearch = useCallback((id: string) => {
    setSavedSearches((s) => s.filter((x) => x.id !== id));
  }, []);

  const value = useMemo<CommunicationsContextValue>(
    () => ({
      conversations: state.conversations,
      engagements: state.engagements,
      leads: state.leads,
      savedSearches,
      postMessage,
      submitContactLead,
      agentQuoteEngagement,
      buyerAcceptEngagement,
      addSavedSearch,
      updateSavedSearch,
      deleteSavedSearch,
    }),
    [
      state,
      savedSearches,
      postMessage,
      submitContactLead,
      agentQuoteEngagement,
      buyerAcceptEngagement,
      addSavedSearch,
      updateSavedSearch,
      deleteSavedSearch,
    ],
  );

  return (
    <CommunicationsContext.Provider value={value}>{children}</CommunicationsContext.Provider>
  );
}

export function useCommunications() {
  const ctx = useContext(CommunicationsContext);
  if (!ctx) throw new Error("useCommunications must be used within CommunicationsProvider");
  return ctx;
}
