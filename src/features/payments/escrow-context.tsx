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
import type { CanonicalEscrowDeal, FundingMethod } from "./types";
import {
  defaultEscrowSimulationState,
  ESCROW_STORAGE_KEY,
  type EscrowSimulationState,
} from "./escrow-seed";

function loadPersistedState(): EscrowSimulationState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ESCROW_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EscrowSimulationState;
    if (!parsed?.deals || !Array.isArray(parsed.deals)) return null;
    return {
      ...defaultEscrowSimulationState(),
      ...parsed,
      deals: parsed.deals,
    };
  } catch {
    return null;
  }
}

type RegisterAwaitingPayload = {
  engagementId: string;
  title: string;
  buyerName: string;
  agentName: string;
  amountCents: number;
  platformFeeCents: number;
};

type EscrowContextValue = {
  state: EscrowSimulationState;
  deals: CanonicalEscrowDeal[];
  fundWithWallet: (dealId: string) => void;
  fundWithCard: (dealId: string) => void;
  buyerRelease: (dealId: string) => void;
  agentMarkComplete: (dealId: string) => void;
  topUpBuyerWallet: (cents: number) => void;
  requestAgentWithdrawal: (cents: number) => void;
  /** From accepted engagement — adds `awaiting_funding` row (Phase B entry). */
  registerAwaitingFundingDeal: (payload: RegisterAwaitingPayload) => string | null;
  resetSimulation: () => void;
};

const EscrowContext = createContext<EscrowContextValue | null>(null);

function nowIso() {
  return new Date().toISOString();
}

export function EscrowSimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EscrowSimulationState>(() => defaultEscrowSimulationState());
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!bootstrapped.current) {
      bootstrapped.current = true;
      const saved = loadPersistedState();
      if (saved) setState(saved);
      return;
    }
    localStorage.setItem(ESCROW_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const fundWithWallet = useCallback((dealId: string) => {
    setState((prev) => {
      const deal = prev.deals.find((d) => d.id === dealId);
      if (!deal || deal.status !== "awaiting_funding") return prev;
      if (prev.buyerAvailableCents < deal.amountCents) return prev;
      const deals = prev.deals.map((d) =>
        d.id === dealId
          ? {
              ...d,
              status: "in_progress" as const,
              fundingMethod: "wallet" as FundingMethod,
              fundedAtIso: nowIso(),
            }
          : d,
      );
      return {
        ...prev,
        buyerAvailableCents: prev.buyerAvailableCents - deal.amountCents,
        deals,
      };
    });
  }, []);

  const fundWithCard = useCallback((dealId: string) => {
    setState((prev) => {
      const deal = prev.deals.find((d) => d.id === dealId);
      if (!deal || deal.status !== "awaiting_funding") return prev;
      const deals = prev.deals.map((d) =>
        d.id === dealId
          ? {
              ...d,
              status: "in_progress" as const,
              fundingMethod: "card" as FundingMethod,
              fundedAtIso: nowIso(),
            }
          : d,
      );
      return { ...prev, deals };
    });
  }, []);

  const buyerRelease = useCallback((dealId: string) => {
    setState((prev) => {
      const deal = prev.deals.find((d) => d.id === dealId);
      if (!deal || deal.status !== "pending_buyer_release") return prev;
      const net = deal.amountCents - deal.platformFeeCents;
      const deals = prev.deals.map((d) =>
        d.id === dealId ? { ...d, status: "released" as const } : d,
      );
      return {
        ...prev,
        deals,
        agentAvailableCents: prev.agentAvailableCents + net,
      };
    });
  }, []);

  const agentMarkComplete = useCallback((dealId: string) => {
    setState((prev) => {
      const deal = prev.deals.find((d) => d.id === dealId);
      if (!deal || deal.status !== "in_progress") return prev;
      const deals = prev.deals.map((d) =>
        d.id === dealId ? { ...d, status: "pending_buyer_release" as const } : d,
      );
      return { ...prev, deals };
    });
  }, []);

  const topUpBuyerWallet = useCallback((cents: number) => {
    if (!Number.isFinite(cents) || cents <= 0) return;
    setState((prev) => ({
      ...prev,
      buyerAvailableCents: prev.buyerAvailableCents + Math.round(cents),
    }));
  }, []);

  const requestAgentWithdrawal = useCallback((cents: number) => {
    if (!Number.isFinite(cents) || cents <= 0) return;
    setState((prev) => ({
      ...prev,
      agentPendingWithdrawCents: prev.agentPendingWithdrawCents + Math.round(cents),
    }));
  }, []);

  const registerAwaitingFundingDeal = useCallback((payload: RegisterAwaitingPayload) => {
    let createdId: string | null = null;
    setState((prev) => {
      if (prev.deals.some((d) => d.engagementId === payload.engagementId)) {
        const hit = prev.deals.find((d) => d.engagementId === payload.engagementId);
        createdId = hit?.id ?? null;
        return prev;
      }
      const id = `esc-${Date.now().toString(36)}`;
      createdId = id;
      const row: CanonicalEscrowDeal = {
        id,
        title: payload.title,
        buyerName: payload.buyerName,
        agentName: payload.agentName,
        amountCents: payload.amountCents,
        platformFeeCents: payload.platformFeeCents,
        status: "awaiting_funding",
        fundingMethod: null,
        fundedAtIso: null,
        engagementId: payload.engagementId,
      };
      return { ...prev, deals: [row, ...prev.deals] };
    });
    return createdId;
  }, []);

  const resetSimulation = useCallback(() => {
    setState(defaultEscrowSimulationState());
  }, []);

  const value = useMemo<EscrowContextValue>(
    () => ({
      state,
      deals: state.deals,
      fundWithWallet,
      fundWithCard,
      buyerRelease,
      agentMarkComplete,
      topUpBuyerWallet,
      requestAgentWithdrawal,
      registerAwaitingFundingDeal,
      resetSimulation,
    }),
    [
      state,
      fundWithWallet,
      fundWithCard,
      buyerRelease,
      agentMarkComplete,
      topUpBuyerWallet,
      requestAgentWithdrawal,
      registerAwaitingFundingDeal,
      resetSimulation,
    ],
  );

  return <EscrowContext.Provider value={value}>{children}</EscrowContext.Provider>;
}

export function useEscrowSimulation() {
  const ctx = useContext(EscrowContext);
  if (!ctx) {
    throw new Error("useEscrowSimulation must be used within EscrowSimulationProvider");
  }
  return ctx;
}
