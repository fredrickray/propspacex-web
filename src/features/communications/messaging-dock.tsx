"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { ArrowLeft, ChevronDown, ChevronUp, Search, Send, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignedInProfile } from "@/hooks/use-signed-in-profile";
import { api } from "@/lib/api";
import { parseDealEnvelope, parseDealList, type RemoteDeal } from "@/features/deals/remote-deal";
import { cn } from "@/lib/utils";
import { useCommunications } from "./communications-context";
import type { Conversation } from "./communications-types";

type MessagingDockContextValue = {
  listOpen: boolean;
  threadId: string | null;
  openList: () => void;
  closeList: () => void;
  openThread: (conversationId: string) => void;
  closeThread: () => void;
};

const MessagingDockContext = createContext<MessagingDockContextValue | null>(null);

export function useMessagingDock() {
  const ctx = useContext(MessagingDockContext);
  if (!ctx) {
    throw new Error("useMessagingDock must be used within MessagingDockProvider");
  }
  return ctx;
}

export function MessagingDockProvider({ children }: { children: ReactNode }) {
  const [listOpen, setListOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  const openList = useCallback(() => setListOpen(true), []);
  const closeList = useCallback(() => setListOpen(false), []);
  const openThread = useCallback((conversationId: string) => {
    setListOpen(true);
    setThreadId(conversationId);
  }, []);
  const closeThread = useCallback(() => setThreadId(null), []);

  const value = useMemo(
    () => ({ listOpen, threadId, openList, closeList, openThread, closeThread }),
    [listOpen, threadId, openList, closeList, openThread, closeThread],
  );

  return (
    <MessagingDockContext.Provider value={value}>
      {children}
      <MessagingDock />
    </MessagingDockContext.Provider>
  );
}

/** Old /messages links open the dock and return to the dashboard. */
export function OpenMessagingRoute({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const { openList, openThread } = useMessagingDock();

  useEffect(() => {
    const conv = params.get("conv");
    if (conv) openThread(conv);
    else openList();
    router.replace(fallbackHref);
  }, [fallbackHref, openList, openThread, params, router]);

  return null;
}

function initials(name: string) {
  const letters = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return letters || "?";
}

function formatDockTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function DockSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden border border-border bg-card shadow-2xl transition-[transform,opacity] duration-200 ease-out",
        shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

function MessagingDock() {
  const pathname = usePathname();
  const profile = useSignedInProfile();
  const role = profile?.appRole === "agent" || profile?.appRole === "buyer" ? profile.appRole : null;
  const hidden = !role || pathname.startsWith("/auth");

  if (hidden) return null;

  return <MessagingDockPanel role={role} viewerName={initials(
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" "),
  )} />;
}

function MessagingDockPanel({
  role,
  viewerName,
}: {
  role: "buyer" | "agent";
  viewerName: string;
}) {
  const {
    conversations,
    postMessage,
    chatConnectionStatus,
    isRemoteConversation,
  } = useCommunications();
  const { listOpen, threadId, openList, closeList, openThread, closeThread } = useMessagingDock();
  const router = useRouter();
  const [deals, setDeals] = useState<RemoteDeal[]>([]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const sorted = useMemo(
    () =>
      [...conversations].sort((a, b) => {
        const left = a.messages[a.messages.length - 1]?.createdAtIso ?? "";
        const right = b.messages[b.messages.length - 1]?.createdAtIso ?? "";
        return new Date(right).getTime() - new Date(left).getTime();
      }),
    [conversations],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return sorted;
    return sorted.filter((conversation) => {
      const name = role === "agent" ? conversation.buyerName : conversation.agentName;
      const last = conversation.messages[conversation.messages.length - 1]?.text ?? "";
      return (
        name.toLowerCase().includes(needle) ||
        conversation.propertyTitle.toLowerCase().includes(needle) ||
        last.toLowerCase().includes(needle)
      );
    });
  }, [query, role, sorted]);

  const selected = useMemo(
    () => sorted.find((conversation) => conversation.id === threadId),
    [sorted, threadId],
  );

  const engagement = useMemo(() => {
    if (!selected) return undefined;
    return deals.find((item) => item.conversationId === selected.id);
  }, [deals, selected]);

  useEffect(() => {
    if (!listOpen && !threadId) return;
    let cancelled = false;
    void api
      .listDeals(1, 50)
      .then((raw) => {
        if (!cancelled) setDeals(parseDealList(raw));
      })
      .catch(() => {
        if (!cancelled) setDeals([]);
      });
    return () => {
      cancelled = true;
    };
  }, [listOpen, threadId]);

  useEffect(() => {
    if (!listOpen && !threadId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (threadId) closeThread();
      else closeList();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeList, closeThread, listOpen, threadId]);

  useEffect(() => {
    if (threadId) composerRef.current?.focus();
    else if (listOpen) searchRef.current?.focus();
  }, [listOpen, threadId]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTop = scroller.scrollHeight;
  }, [threadId, selected?.messages.length]);

  const counterpart = (conversation: Conversation) =>
    role === "agent" ? conversation.buyerName : conversation.agentName;

  const isConnected = chatConnectionStatus === "connected";
  const selectedIsRemote = selected ? isRemoteConversation(selected.id) : false;
  const canSend = selected ? !selectedIsRemote || isConnected : false;

  const send = () => {
    if (!selected || !canSend) return;
    postMessage(selected.id, role, draft);
    setDraft("");
  };

  const startDeal = async () => {
    if (!selected || role !== "agent") return;
    if (engagement) {
      router.push(`/agent/deals/${engagement.id}`);
      return;
    }
    try {
      const created = parseDealEnvelope(
        await api.createOrGetDeal(selected.id, selected.propertyTitle),
      );
      if (created) router.push(`/agent/deals/${created.id}`);
    } catch {
      return;
    }
  };

  const panelHeight = "h-[min(34rem,calc(100dvh-4.5rem))]";

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-50 flex items-end justify-end gap-3 px-3 sm:px-4">
      {threadId ? (
        <DockSurface
          className={cn(
            "pointer-events-auto w-[min(100vw-1.5rem,24rem)] rounded-t-xl",
            panelHeight,
          )}
        >
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 md:hidden"
              onClick={closeThread}
              aria-label="Back to conversations"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">
                {initials(selected ? counterpart(selected) : "")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {selected ? counterpart(selected) : "Conversation"}
              </p>
              {selected ? (
                <Link
                  href={`/properties/${selected.propertyId}`}
                  className="block truncate text-xs text-muted-foreground hover:text-foreground"
                >
                  {selected.propertyTitle}
                </Link>
              ) : (
                <p className="truncate text-xs text-muted-foreground">Unavailable</p>
              )}
            </div>
            {role === "buyer" && engagement ? (
              <Button variant="ghost" size="sm" className="hidden h-8 px-2 sm:inline-flex" asChild>
                <Link href={`/buyer/deals/${engagement.id}`}>Deal</Link>
              </Button>
            ) : null}
            {role === "agent" && selected ? (
              engagement ? (
                <Button variant="ghost" size="sm" className="hidden h-8 px-2 sm:inline-flex" asChild>
                  <Link href={`/agent/deals/${engagement.id}`}>Deal</Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="hidden h-8 px-2 sm:inline-flex"
                  onClick={() => void startDeal()}
                >
                  Start deal
                </Button>
              )
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden size-8 md:inline-flex"
              onClick={closeThread}
              aria-label="Close conversation"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            {selected ? (
              <div className="space-y-3">
                {selected.messages.map((message) => {
                  const mine = message.role === role;
                  return (
                    <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[85%]", mine && "text-right")}>
                        <div
                          className={cn(
                            "rounded-2xl px-3 py-2 text-left text-sm",
                            mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                          )}
                        >
                          <p className="whitespace-pre-wrap">{message.text}</p>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatDockTime(message.createdAtIso)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                This conversation is no longer available.
              </p>
            )}
          </div>

          <form
            className="flex shrink-0 items-center gap-2 border-t border-border p-3"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <Input
              ref={composerRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={canSend ? "Write a message…" : "Reconnecting…"}
              disabled={!canSend}
              className="h-10"
            />
            <Button type="submit" size="icon" disabled={!canSend || !draft.trim()} aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </form>
        </DockSurface>
      ) : null}

      <div className={cn("pointer-events-auto", threadId && "hidden lg:block")}>
        {listOpen ? (
          <DockSurface className={cn("w-[min(100vw-1.5rem,22.5rem)] rounded-t-xl", panelHeight)}>
            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
              <p className="min-w-0 flex-1 truncate text-sm font-semibold">Messaging</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={closeList}
                aria-label="Collapse messaging"
              >
                <ChevronDown className="size-4" />
              </Button>
            </div>
            <div className="shrink-0 border-b border-border p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search messages"
                  className="h-9 pl-9"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  {sorted.length === 0
                    ? "No conversations yet."
                    : "No conversations match that search."}
                </p>
              ) : (
                filtered.map((conversation) => {
                  const last = conversation.messages[conversation.messages.length - 1];
                  const active = conversation.id === threadId;
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => openThread(conversation.id)}
                      className={cn(
                        "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors duration-150",
                        active ? "bg-muted" : "hover:bg-muted/70",
                      )}
                    >
                      <Avatar className="size-10">
                        <AvatarFallback>{initials(counterpart(conversation))}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-foreground">
                            {counterpart(conversation)}
                          </span>
                          {last ? (
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {formatDockTime(last.createdAtIso)}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {last?.text || conversation.propertyTitle}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </DockSurface>
        ) : (
          <button
            type="button"
            onClick={openList}
            className="flex h-12 w-[min(100vw-1.5rem,18rem)] items-center gap-2.5 rounded-t-xl border border-b-0 border-border bg-card px-3 shadow-[0_-10px_30px_rgba(0,0,0,0.12)] transition-transform duration-150 ease-out hover:bg-muted/70 active:scale-[0.98]"
            aria-label="Open messaging"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {viewerName}
            </span>
            <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold">Messaging</span>
            <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
