"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  Calendar,
  Video,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCommunications } from "@/features/communications/communications-context";
import type { Conversation } from "@/features/communications/communications-types";

function formatShortTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

const MessagesPage = () => {
  const searchParams = useSearchParams();
  const convParam = searchParams.get("conv");
  const {
    conversations,
    engagements,
    postMessage,
    chatConnectionStatus,
    chatDebug,
    isRemoteConversation,
  } = useCommunications();

  const sorted = useMemo(
    () =>
      [...conversations].sort((a, b) => {
        const la = a.messages[a.messages.length - 1]?.createdAtIso ?? "";
        const lb = b.messages[b.messages.length - 1]?.createdAtIso ?? "";
        return new Date(lb).getTime() - new Date(la).getTime();
      }),
    [conversations],
  );

  const [selectedId, setSelectedId] = useState<string>(sorted[0]?.id ?? "");
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    if (convParam && sorted.some((c) => c.id === convParam)) {
      setSelectedId(convParam);
    }
  }, [convParam, sorted]);

  useEffect(() => {
    if (!selectedId && sorted[0]) setSelectedId(sorted[0].id);
  }, [sorted, selectedId]);

  const selected: Conversation | undefined = useMemo(
    () => sorted.find((c) => c.id === selectedId),
    [sorted, selectedId],
  );

  const engagement = useMemo(
    () =>
      selected?.engagementId
        ? engagements.find((e) => e.id === selected.engagementId)
        : undefined,
    [engagements, selected],
  );

  const send = () => {
    if (!selected) return;
    postMessage(selected.id, "buyer", messageText);
    setMessageText("");
  };

  const isConnected = chatConnectionStatus === "connected";
  const selectedIsRemote = selected ? isRemoteConversation(selected.id) : false;
  const canSend = selected ? (!selectedIsRemote || isConnected) : false;

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100dvh-3.5rem)] min-h-[420px] overflow-hidden">
      <div className="flex h-full w-80 shrink-0 flex-col border-r border-border">
        <div className="border-b border-border p-4">
          <h1 className="mb-3 text-xl font-bold text-foreground">Inquiries</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search threads…" className="pl-9" disabled />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-2">
            {sorted.map((conv) => {
              const last = conv.messages[conv.messages.length - 1];
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full rounded-lg p-3 text-left transition-colors ${
                    selectedId === conv.id
                      ? "border border-primary/20 bg-primary/10"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>
                        {conv.agentName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex min-w-0 items-center justify-between gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate text-sm font-medium text-foreground">
                              {conv.agentName}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{conv.agentName}</TooltipContent>
                        </Tooltip>
                        {last ? (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatShortTime(last.createdAtIso)}
                          </span>
                        ) : null}
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="max-w-full truncate text-xs font-medium text-primary">
                            {conv.propertyTitle}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>{conv.propertyTitle}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="mt-1 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-foreground">
                            {last?.text ?? "—"}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>{last?.text ?? "—"}</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {selected ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>AG</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{selected.agentName}</span>
                    <Badge variant="secondary" className="text-xs">
                      Agent
                    </Badge>
                    <Badge
                      variant={selectedIsRemote && isConnected ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {selectedIsRemote ? (isConnected ? "Live" : "Reconnecting") : "Local"}
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    Regarding: {selected.propertyTitle}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" type="button" disabled>
                  <Calendar className="mr-1 size-4" /> Schedule
                </Button>
                <Button size="sm" type="button" disabled>
                  <Video className="mr-1 size-4" /> Video
                </Button>
                {engagement ? (
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/buyer/deals/${engagement.id}`}>
                      <FileText className="mr-1 size-4" />
                      Deal
                    </Link>
                  </Button>
                ) : null}
                {engagement?.escrowWalletId ? (
                  <Button size="sm" asChild>
                    <Link href={`/buyer/wallet?deal=${encodeURIComponent(engagement.escrowWalletId)}`}>
                      Wallet / escrow
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
            {process.env.NODE_ENV !== "production" ? (
              <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
                WS: {chatConnectionStatus} | endpoint: {chatDebug.endpoint || "n/a"} | in:{" "}
                {chatDebug.lastInboundEvent || "-"} | out: {chatDebug.lastOutboundEvent || "-"}{" "}
                | close: {chatDebug.lastCloseCode ?? "-"} | err: {chatDebug.lastError || "-"}
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="mx-auto max-w-3xl space-y-4">
                {selected.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "buyer" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[70%] gap-2 ${msg.role === "buyer" ? "flex-row-reverse" : ""}`}
                    >
                      {msg.role === "agent" && (
                        <Avatar className="size-8 shrink-0">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div
                          className={`rounded-2xl px-4 py-2.5 ${
                            msg.role === "buyer"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <p
                          className={`mt-1 text-xs text-muted-foreground ${msg.role === "buyer" ? "text-right" : ""}`}
                        >
                          {formatShortTime(msg.createdAtIso)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border p-4">
              <div className="mx-auto flex max-w-3xl items-center gap-2">
                <Button variant="ghost" size="icon" type="button" disabled>
                  <Paperclip className="size-5" />
                </Button>
                <Input
                  placeholder="Type your message…"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1"
                  disabled={!canSend}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="bg-primary hover:bg-primary/90"
                  type="button"
                  onClick={send}
                  disabled={!canSend}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
            No conversations yet. Contact an agent from a listing.
          </div>
        )}
      </div>
      </div>
    </TooltipProvider>
  );
};

export default MessagesPage;
