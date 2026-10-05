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
  SavedSearchRecord,
} from "./communications-types";
import { parseDealEnvelope } from "@/features/deals/remote-deal";
import { api } from "@/lib/api";

const STORAGE_KEY = "propspacex_comm_v1";
const SAVED_SEARCHES_KEY = "propspacex_saved_searches_v1";

const WS_REQUEST_TIMEOUT_MS = 10_000;
const WS_RECONNECT_BASE_MS = 1_000;
const WS_RECONNECT_MAX_MS = 15_000;

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowIso() {
  return new Date().toISOString();
}

type CommState = {
  conversations: Conversation[];
};

type WsIncomingEvent = {
  event: string;
  requestId?: string;
  success: boolean;
  data?: Record<string, unknown>;
  error?: { code?: string; message?: string };
};

type WsRequestResolver = {
  resolve: (value: WsIncomingEvent) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

type RemoteConversationMeta = {
  conversationId: string;
  buyerId: string;
  agentId: string;
  propertyId: string | null;
  buyerName: string | null;
  agentName: string | null;
};

function defaultCommState(): CommState {
  return {
    conversations: [],
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

function buildChatWsUrl(token: string): string | null {
  const explicit = process.env.NEXT_PUBLIC_CHAT_WS_URL?.trim();
  const candidate =
    explicit || process.env.NEXT_PUBLIC_API_URL?.trim() || api.getBaseUrl();
  if (!candidate) return null;

  try {
    const parsed = new URL(candidate);
    parsed.protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
    if (!explicit) {
      parsed.pathname = "/v1/ws/chat";
      parsed.search = "";
    }
    parsed.searchParams.set("accessToken", token);
    return parsed.toString();
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parseRemoteConversationMeta(value: unknown): RemoteConversationMeta | null {
  const row = asRecord(value);
  if (!row) return null;
  const conversationId =
    typeof row.conversationId === "string" ? row.conversationId : "";
  const buyerId = typeof row.buyerId === "string" ? row.buyerId : "";
  const agentId = typeof row.agentId === "string" ? row.agentId : "";
  if (!conversationId || !buyerId || !agentId) return null;
  const propertyId =
    typeof row.propertyId === "string" ? row.propertyId : null;
  const buyerName =
    typeof row.buyerName === "string" && row.buyerName.trim()
      ? row.buyerName.trim()
      : null;
  const agentName =
    typeof row.agentName === "string" && row.agentName.trim()
      ? row.agentName.trim()
      : null;
  return { conversationId, buyerId, agentId, propertyId, buyerName, agentName };
}

function displayNameFromId(prefix: string, id: string): string {
  if (!id) return prefix;
  return `${prefix} ${id.slice(0, 8)}`;
}

function isUuidLike(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

type CommunicationsContextValue = {
  conversations: Conversation[];
  savedSearches: SavedSearchRecord[];
  chatConnectionStatus: "idle" | "connecting" | "connected" | "reconnecting" | "error";
  chatDebug: {
    endpoint: string;
    lastInboundEvent: string | null;
    lastOutboundEvent: string | null;
    lastError: string | null;
    lastCloseCode: number | null;
  };
  isRemoteConversation: (conversationId: string) => boolean;
  postMessage: (conversationId: string, role: "buyer" | "agent", text: string) => void;
  submitContactLead: (input: {
    propertyId: string;
    propertyTitle: string;
    agentId?: string | null;
    buyerName: string;
    buyerEmail: string;
    phone: string;
    intent: string | null;
    message: string;
  }  ) => Promise<{ conversationId: string; engagementId: string; isRemote: boolean }>;
  addSavedSearch: (input: Omit<SavedSearchRecord, "id" | "createdAtIso">) => void;
  updateSavedSearch: (id: string, patch: Partial<SavedSearchRecord>) => void;
  deleteSavedSearch: (id: string) => void;
};

const CommunicationsContext = createContext<CommunicationsContextValue | null>(null);

export function CommunicationsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CommState>(() => defaultCommState());
  const [savedSearches, setSavedSearches] = useState<SavedSearchRecord[]>([]);
  const [chatConnectionStatus, setChatConnectionStatus] = useState<
    "idle" | "connecting" | "connected" | "reconnecting" | "error"
  >("idle");
  const chatConnectionStatusRef = useRef(chatConnectionStatus);
  const [chatDebug, setChatDebug] = useState<{
    endpoint: string;
    lastInboundEvent: string | null;
    lastOutboundEvent: string | null;
    lastError: string | null;
    lastCloseCode: number | null;
  }>({
    endpoint: "",
    lastInboundEvent: null,
    lastOutboundEvent: null,
    lastError: null,
    lastCloseCode: null,
  });
  const bootstrapped = useRef(false);
  const stateRef = useRef(state);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRequestsRef = useRef<Map<string, WsRequestResolver>>(new Map());
  const remoteMetaByConversationRef = useRef<Map<string, RemoteConversationMeta>>(new Map());
  const userNameByIdRef = useRef<Map<string, string>>(new Map());
  const wsSessionReadyRef = useRef(false);
  const isUnmountedRef = useRef(false);
  chatConnectionStatusRef.current = chatConnectionStatus;
  stateRef.current = state;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!bootstrapped.current) {
      bootstrapped.current = true;
      const saved = loadComm();
      if (saved?.conversations?.length) {
        const remoteConversations = saved.conversations.filter((conversation) =>
          isUuidLike(conversation.id),
        );
        setState({
          conversations: remoteConversations,
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

  const clearPendingRequests = useCallback((reason: string) => {
    for (const [requestId, pending] of pendingRequestsRef.current.entries()) {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error(reason));
      pendingRequestsRef.current.delete(requestId);
    }
  }, []);

  const sendWsRequest = useCallback(
    (event: string, data?: Record<string, unknown>) => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return Promise.reject(new Error("Chat websocket is not connected"));
      }
      if (!wsSessionReadyRef.current) {
        return Promise.reject(new Error("Chat websocket session is not ready"));
      }

      const requestId = uid("wsreq");
      const payload = JSON.stringify({ event, requestId, data });
      setChatDebug((prev) => ({ ...prev, lastOutboundEvent: event }));
      socket.send(payload);

      return new Promise<WsIncomingEvent>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          pendingRequestsRef.current.delete(requestId);
          reject(new Error(`${event} timed out`));
        }, WS_REQUEST_TIMEOUT_MS);
        pendingRequestsRef.current.set(requestId, { resolve, reject, timeoutId });
      });
    },
    [],
  );

  const refreshConversationsFromServer = useCallback(async () => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN || !wsSessionReadyRef.current) {
      return;
    }

    const profile = api.getProfile();
    const myUserId = profile?.userId ?? "";
    const myName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "You";
    if (myUserId && myName) {
      userNameByIdRef.current.set(myUserId, myName);
    }

    const response = await sendWsRequest("conversations.list", { page: 1, limit: 50 });
    const rows = Array.isArray(response.data?.conversations) ? response.data.conversations : [];
    const remoteConversations: Conversation[] = [];
    const metas = new Map<string, RemoteConversationMeta>();

    for (const row of rows) {
      const rowRecord = asRecord(row);
      const meta = parseRemoteConversationMeta(rowRecord?.conversation);
      if (!meta) continue;
      metas.set(meta.conversationId, meta);

      const messagesResponse = await sendWsRequest("messages.list", {
        conversationId: meta.conversationId,
        page: 1,
        limit: 100,
      });
      const rawMessages = Array.isArray(messagesResponse.data?.messages)
        ? messagesResponse.data.messages
        : [];
      const parsedMessages: ChatMessage[] = [];
      let buyerNameFromMessages: string | null = meta.buyerName;
      let agentNameFromMessages: string | null = meta.agentName;
      for (const rawMessage of rawMessages) {
        const messageRow = asRecord(rawMessage);
        if (!messageRow) continue;
        const messageId =
          typeof messageRow.messageId === "string" ? messageRow.messageId : uid("msg");
        const senderId = typeof messageRow.senderId === "string" ? messageRow.senderId : "";
        const senderName =
          typeof messageRow.senderName === "string" && messageRow.senderName.trim()
            ? messageRow.senderName.trim()
            : null;
        const body = typeof messageRow.body === "string" ? messageRow.body : "";
        if (!body.trim()) continue;
        const createdAtIso =
          typeof messageRow.createdAt === "string" ? messageRow.createdAt : nowIso();
        const role: "buyer" | "agent" = senderId === meta.buyerId ? "buyer" : "agent";
        if (senderId === meta.buyerId && senderName) buyerNameFromMessages = senderName;
        if (senderId === meta.agentId && senderName) agentNameFromMessages = senderName;
        parsedMessages.push({
          id: messageId,
          role,
          text: body,
          createdAtIso,
        });
      }

      parsedMessages.sort(
        (a, b) => new Date(a.createdAtIso).getTime() - new Date(b.createdAtIso).getTime(),
      );

      const resolvedBuyerName =
        buyerNameFromMessages ||
        userNameByIdRef.current.get(meta.buyerId) ||
        (meta.buyerId === myUserId ? myName : displayNameFromId("Buyer", meta.buyerId));
      const resolvedAgentName =
        agentNameFromMessages ||
        userNameByIdRef.current.get(meta.agentId) ||
        (meta.agentId === myUserId ? myName : displayNameFromId("Agent", meta.agentId));
      userNameByIdRef.current.set(meta.buyerId, resolvedBuyerName);
      userNameByIdRef.current.set(meta.agentId, resolvedAgentName);
      remoteConversations.push({
        id: meta.conversationId,
        propertyId: meta.propertyId ?? "",
        propertyTitle: meta.propertyId ? `Property ${meta.propertyId.slice(0, 8)}` : "General inquiry",
        agentName: resolvedAgentName,
        buyerName: resolvedBuyerName,
        engagementId: null,
        messages: parsedMessages,
      });
    }

    remoteMetaByConversationRef.current = metas;

    setState((prev) => ({
      ...prev,
      conversations: remoteConversations,
    }));
  }, [sendWsRequest]);

  useEffect(() => {
    isUnmountedRef.current = false;
    let tokenWatchTimer: ReturnType<typeof setInterval> | null = null;
    let resolvedWsUrl: string | null = null;

    const tryStart = () => {
      const token = api.getAccessToken();
      const wsUrl = token ? buildChatWsUrl(token) : null;
      if (!token || !wsUrl) {
        setChatConnectionStatus("error");
        setChatDebug((prev) => ({
          ...prev,
          endpoint: "",
          lastError: !token
            ? "No access token found for websocket auth"
            : "Unable to build websocket URL",
        }));
        return false;
      }

      resolvedWsUrl = wsUrl;
      setChatDebug((prev) => ({
        ...prev,
        endpoint: wsUrl.replace(/\?.*$/, ""),
        lastError: null,
      }));
      connect();
      return true;
    };

    const connect = () => {
      if (isUnmountedRef.current || !resolvedWsUrl) return;
      wsSessionReadyRef.current = false;
      setChatConnectionStatus(
        reconnectAttemptsRef.current > 0 ? "reconnecting" : "connecting",
      );
      const socket = new WebSocket(resolvedWsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setChatConnectionStatus("connected");
        setChatDebug((prev) => ({ ...prev, lastError: null, lastCloseCode: null }));
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as WsIncomingEvent;
          setChatDebug((prev) => ({ ...prev, lastInboundEvent: payload.event }));

          if (payload.event === "connection.ready") {
            wsSessionReadyRef.current = true;
            void refreshConversationsFromServer().catch((error) => {
              setChatDebug((prev) => ({
                ...prev,
                lastError:
                  error instanceof Error
                    ? error.message
                    : "Failed to refresh conversations",
              }));
            });
          }

          if (payload.requestId) {
            const pending = pendingRequestsRef.current.get(payload.requestId);
            if (pending) {
              clearTimeout(pending.timeoutId);
              pendingRequestsRef.current.delete(payload.requestId);
              if (payload.success) {
                pending.resolve(payload);
              } else {
                pending.reject(
                  new Error(payload.error?.message || "Chat request failed"),
                );
              }
            }
          }

          if (payload.event === "message.new") {
            const messageRow = asRecord(payload.data?.message);
            if (!messageRow) return;
            const conversationId =
              typeof messageRow.conversationId === "string"
                ? messageRow.conversationId
                : "";
            const messageId =
              typeof messageRow.messageId === "string" ? messageRow.messageId : uid("msg");
            const body = typeof messageRow.body === "string" ? messageRow.body : "";
            const createdAtIso =
              typeof messageRow.createdAt === "string" ? messageRow.createdAt : nowIso();
            if (!conversationId || !body.trim()) return;
            const senderId = typeof messageRow.senderId === "string" ? messageRow.senderId : "";
            const recipientId =
              typeof messageRow.recipientId === "string" ? messageRow.recipientId : "";
            const senderName =
              typeof messageRow.senderName === "string" && messageRow.senderName.trim()
                ? messageRow.senderName.trim()
                : null;
            const recipientName =
              typeof messageRow.recipientName === "string" && messageRow.recipientName.trim()
                ? messageRow.recipientName.trim()
                : null;
            if (senderId && senderName) {
              userNameByIdRef.current.set(senderId, senderName);
            }
            if (recipientId && recipientName) {
              userNameByIdRef.current.set(recipientId, recipientName);
            }
            const meta = remoteMetaByConversationRef.current.get(conversationId);
            const role: "buyer" | "agent" =
              meta && senderId === meta.buyerId ? "buyer" : "agent";
            const incoming: ChatMessage = {
              id: messageId,
              role,
              text: body,
              createdAtIso,
            };

            let foundConversation = false;
            setState((prev) => ({
              ...prev,
              conversations: prev.conversations.map((conversation) => {
                if (conversation.id !== conversationId) return conversation;
                foundConversation = true;
                if (conversation.messages.some((message) => message.id === messageId)) {
                  return conversation;
                }
                const buyerName =
                  meta?.buyerId === senderId
                    ? senderName || conversation.buyerName
                    : meta?.buyerId === recipientId
                      ? recipientName || conversation.buyerName
                      : conversation.buyerName;
                const agentName =
                  meta?.agentId === senderId
                    ? senderName || conversation.agentName
                    : meta?.agentId === recipientId
                      ? recipientName || conversation.agentName
                      : conversation.agentName;
                return {
                  ...conversation,
                  buyerName,
                  agentName,
                  messages: [...conversation.messages, incoming],
                };
              }),
            }));
            if (!foundConversation) {
              void refreshConversationsFromServer().catch((error) => {
                setChatDebug((prev) => ({
                  ...prev,
                  lastError:
                    error instanceof Error
                      ? error.message
                      : "Failed to refresh conversations",
                }));
              });
            }
          }
          if (payload.event === "request.error") {
            setChatDebug((prev) => ({
              ...prev,
              lastError: payload.error?.message || "Chat request.error received",
            }));
          }
        } catch {
          // Ignore malformed non-JSON frames.
        }
      };

      socket.onclose = (closeEvent) => {
        wsSessionReadyRef.current = false;
        clearPendingRequests("Chat websocket disconnected");
        if (isUnmountedRef.current) return;
        setChatConnectionStatus("reconnecting");
        setChatDebug((prev) => ({
          ...prev,
          lastCloseCode: closeEvent.code,
          lastError: closeEvent.reason || "Websocket closed",
        }));
        reconnectAttemptsRef.current += 1;
        const delay = Math.min(
          WS_RECONNECT_BASE_MS * 2 ** (reconnectAttemptsRef.current - 1),
          WS_RECONNECT_MAX_MS,
        );
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        setChatConnectionStatus("error");
        setChatDebug((prev) => ({
          ...prev,
          lastError: "Websocket error event emitted by browser",
        }));
      };
    };

    if (!tryStart()) {
      tokenWatchTimer = setInterval(() => {
        if (isUnmountedRef.current) return;
        if (tryStart() && tokenWatchTimer) {
          clearInterval(tokenWatchTimer);
          tokenWatchTimer = null;
        }
      }, 1_000);
    }

    return () => {
      isUnmountedRef.current = true;
      wsSessionReadyRef.current = false;
      if (tokenWatchTimer) {
        clearInterval(tokenWatchTimer);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      clearPendingRequests("Chat websocket closed");
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [clearPendingRequests, refreshConversationsFromServer]);

  const postMessage = useCallback(
    (conversationId: string, role: "buyer" | "agent", text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const isRemoteConversation = remoteMetaByConversationRef.current.has(conversationId);
      if (isRemoteConversation) {
        void sendWsRequest("message.send", { conversationId, body: trimmed }).catch((error) => {
          setChatDebug((prev) => ({
            ...prev,
            lastError: error instanceof Error ? error.message : "Failed to send message",
          }));
        });
        return;
      }

      const msg: ChatMessage = {
        id: uid("msg"),
        role,
        text: trimmed,
        createdAtIso: nowIso(),
      };
      setState((prev) => ({
        ...prev,
        conversations: prev.conversations.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, messages: [...conversation.messages, msg] }
            : conversation,
        ),
      }));
    },
    [sendWsRequest],
  );

  const createOrGetRemoteConversation = useCallback(
    async (input: { agentId: string }) => {
      const response = await sendWsRequest("conversation.create_or_get", {
        agentId: input.agentId,
      });
      const meta = parseRemoteConversationMeta(response.data?.conversation);
      if (!meta) {
        throw new Error("Invalid conversation response from chat service");
      }
      if (meta.buyerName) {
        userNameByIdRef.current.set(meta.buyerId, meta.buyerName);
      }
      if (meta.agentName) {
        userNameByIdRef.current.set(meta.agentId, meta.agentName);
      }
      remoteMetaByConversationRef.current.set(meta.conversationId, meta);
      return meta;
    },
    [sendWsRequest],
  );

  const waitForChatConnection = useCallback((timeoutMs = 12_000) => {
    if (
      chatConnectionStatusRef.current === "connected" &&
      wsSessionReadyRef.current
    ) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const startedAt = Date.now();
      const timer = setInterval(() => {
        if (chatConnectionStatusRef.current === "connected") {
          if (!wsSessionReadyRef.current) {
            return;
          }
          clearInterval(timer);
          resolve();
          return;
        }

        if (Date.now() - startedAt >= timeoutMs) {
          clearInterval(timer);
          reject(new Error("Chat socket is not connected"));
        }
      }, 150);
    });
  }, []);

  const submitContactLead = useCallback(
    async (input: {
      propertyId: string;
      propertyTitle: string;
      agentId?: string | null;
      buyerName: string;
      buyerEmail: string;
      phone: string;
      intent: string | null;
      message: string;
    }) => {
      if (!isUuidLike(input.agentId)) {
        setChatDebug((prev) => ({
          ...prev,
          lastError: "Property is missing a valid agentId for chat",
        }));
        throw new Error("Property is missing a valid agentId for chat");
      }

      try {
        await waitForChatConnection();
      } catch {
        setChatDebug((prev) => ({
          ...prev,
          lastError: "Chat socket is still connecting",
        }));
        throw new Error("Chat is still connecting. Please wait a few seconds and try again.");
      }

      let remoteConversationId = "";
      let remoteMeta: RemoteConversationMeta | null = null;
      try {
        const remote = await createOrGetRemoteConversation({
          agentId: input.agentId,
        });
        remoteMeta = remote;
        remoteConversationId = remote.conversationId;
      } catch {
        setChatDebug((prev) => ({
          ...prev,
          lastError: "Failed to create/get remote conversation",
        }));
        throw new Error("Failed to create/get remote conversation");
      }

      const conversationId = remoteConversationId;
      const resolvedAgentName = input.agentId
        ? remoteMeta?.agentName ||
          userNameByIdRef.current.get(input.agentId) ||
          displayNameFromId("Agent", input.agentId)
        : "Listing agent";
      const conv: Conversation = {
        id: conversationId,
        propertyId: input.propertyId,
        propertyTitle: input.propertyTitle,
        agentName: resolvedAgentName,
        buyerName:
          remoteMeta?.buyerName ||
          userNameByIdRef.current.get(remoteMeta?.buyerId || "") ||
          input.buyerName,
        engagementId: null,
        messages: [],
      };
      setState((prev) => ({
        conversations: [conv, ...prev.conversations.filter((row) => row.id !== conversationId)],
      }));

      if (input.message.trim()) {
        await sendWsRequest("message.send", {
          conversationId,
          body: input.message.trim(),
        });
      }

      const created = parseDealEnvelope(
        await api.createOrGetDeal(conversationId, input.propertyTitle),
      );
      if (!created) {
        throw new Error("Could not open a deal for this conversation.");
      }

      return {
        conversationId,
        engagementId: created.id,
        isRemote: true,
      };
    },
    [createOrGetRemoteConversation, sendWsRequest, waitForChatConnection],
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

  const isRemoteConversation = useCallback((conversationId: string) => {
    return (
      remoteMetaByConversationRef.current.has(conversationId) ||
      isUuidLike(conversationId)
    );
  }, []);

  const value = useMemo<CommunicationsContextValue>(
    () => ({
      conversations: state.conversations,
      savedSearches,
      chatConnectionStatus,
      chatDebug,
      isRemoteConversation,
      postMessage,
      submitContactLead,
      addSavedSearch,
      updateSavedSearch,
      deleteSavedSearch,
    }),
    [
      state,
      savedSearches,
      chatConnectionStatus,
      chatDebug,
      isRemoteConversation,
      postMessage,
      submitContactLead,
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
