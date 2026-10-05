"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  Bed,
  Bath,
  Square,
  Calendar,
  Car,
  Loader2,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api, PropertyStatus } from "@/lib/api";
import {
  getPropertyId,
  normalizePropertyForDetail,
  parsePropertyListEnvelope,
} from "@/lib/property-normalize";

async function loadFlaggedListings() {
  const [pending, available] = await Promise.all([
    api.getProperties({ status: PropertyStatus.PENDING, page: 1, limit: 50 }),
    api.getProperties({ status: PropertyStatus.AVAILABLE, page: 1, limit: 50 }),
  ]);
  const merged = [
    ...parsePropertyListEnvelope(pending),
    ...parsePropertyListEnvelope(available),
  ];
  const seen = new Set<string>();
  return merged.filter((row) => {
    const id = getPropertyId(row);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return matchesModerationTab(row, "flagged");
  });
}

function matchesModerationTab(raw: unknown, tab: string) {
  if (typeof raw !== "object" || raw === null) return false;
  const row = raw as Record<string, unknown>;
  const status = String(row.status ?? "").toLowerCase();
  const flagged = row.flagged === true;
  if (tab === "flagged") return flagged;
  if (tab === "pending") return status === "pending";
  if (tab === "approved") return status === "available";
  return true;
}

export function PropertyModerationPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [all, setAll] = useState<unknown[]>([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<"approve" | "reject" | "escalate" | null>(null);
  const [noteKind, setNoteKind] = useState<"reject" | "escalate" | null>(null);
  const [note, setNote] = useState("");
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const rows =
        activeTab === "flagged"
          ? await loadFlaggedListings()
          : parsePropertyListEnvelope(
              await api.getProperties({
                status:
                  activeTab === "pending"
                    ? PropertyStatus.PENDING
                    : PropertyStatus.AVAILABLE,
                page: 1,
                limit: 50,
              }),
            );
      if (requestId !== requestRef.current) return;
      setAll(rows.filter((row) => matchesModerationTab(row, activeTab)));
    } catch (e) {
      if (requestId !== requestRef.current) return;
      setError(
        e instanceof Error ? e.message : "Failed to load properties.",
      );
      setAll([]);
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((r) => {
      const o = r as Record<string, unknown>;
      const title = String(o.title ?? "").toLowerCase();
      const id = getPropertyId(r).toLowerCase();
      return title.includes(q) || id.includes(q);
    });
  }, [all, query]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    const stillSelected = filtered.some(
      (r) => getPropertyId(r) === selectedId,
    );
    if (!stillSelected) {
      const next = getPropertyId(filtered[0]);
      setSelectedId(next || null);
    }
  }, [filtered, selectedId]);

  const selectedRaw = useMemo(() => {
    return all.find((r) => getPropertyId(r) === selectedId) ?? null;
  }, [all, selectedId]);

  const selectedDetail = selectedRaw
    ? normalizePropertyForDetail(selectedRaw)
    : null;

  const queueForList = useMemo(() => {
    return filtered.map((r) => {
      const d = normalizePropertyForDetail(r);
      const id = getPropertyId(r);
      return {
        id,
        title: d?.title ?? "Untitled",
        price: d?.price ?? "—",
        image: d?.image ?? "",
        status: String((r as Record<string, unknown>).status ?? ""),
      };
    });
  }, [filtered]);

  const moderation = useMemo(() => {
    if (typeof selectedRaw !== "object" || selectedRaw === null) return null;
    const row = selectedRaw as Record<string, unknown>;
    return {
      flagged: row.flagged === true,
      flagNote: typeof row.flagNote === "string" ? row.flagNote.trim() : "",
      rejectionReason:
        typeof row.rejectionReason === "string" ? row.rejectionReason.trim() : "",
    };
  }, [selectedRaw]);

  const approve = async () => {
    if (!selectedId) return;
    setBusy("approve");
    try {
      await api.approveProperty(selectedId);
      toast({
        title: "Listing approved",
        description: "It is now available on the catalog.",
      });
      await load();
    } catch (error) {
      toast({
        title: "Could not approve listing",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const submitNote = async () => {
    if (!selectedId || !noteKind) return;
    const text = note.trim();
    if (!text) return;
    setBusy(noteKind);
    try {
      if (noteKind === "reject") {
        await api.rejectProperty(selectedId, text);
        toast({ title: "Listing rejected" });
      } else {
        await api.escalateProperty(selectedId, text);
        toast({ title: "Listing escalated" });
      }
      setNoteKind(null);
      setNote("");
      await load();
    } catch (error) {
      toast({
        title:
          noteKind === "reject"
            ? "Could not reject listing"
            : "Could not escalate listing",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground mb-1">
            Home / Admin /{" "}
            <span className="text-foreground">Property Moderation</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary">
              All Properties
            </Badge>
            <Badge variant="secondary">{filtered.length}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedId
              ? `Listing ${selectedId.slice(0, 8)}…`
              : "No selection"}
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}{" "}
          <button
            type="button"
            className="underline font-medium"
            onClick={() => void load()}
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or ID…"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" type="button">
              <Filter className="size-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-8 text-muted-foreground justify-center">
              <Loader2 className="size-5 animate-spin" />
              Loading queue…
            </div>
          ) : queueForList.length === 0 ? (
            <div className="text-sm text-muted-foreground border border-border rounded-lg p-6 text-center">
              {activeTab === "flagged"
                ? "No flagged listings."
                : activeTab === "pending"
                  ? "No listings are waiting for review."
                  : "No live listings in this queue."}
            </div>
          ) : (
            <div className="space-y-2">
              {queueForList.map((property) => (
                <div
                  key={property.id}
                  onClick={() => setSelectedId(property.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(property.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedId === property.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Image
                    src={property.image}
                    alt={property.title}
                    className="size-16 rounded-lg object-cover"
                    width={64}
                    height={64}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {property.title}
                    </p>
                    <p className="text-primary font-semibold">{property.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-8 bg-card border border-border rounded-xl overflow-hidden">
          {!selectedDetail || !selectedRaw ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Select a listing to review.
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin">
                      <ChevronLeft className="size-4" />
                    </Link>
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Back to Dashboard
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 capitalize">
                    {selectedDetail.status}
                  </Badge>
                  {moderation?.flagged ? (
                    <Badge variant="outline">Flagged</Badge>
                  ) : null}
                </div>
              </div>

              <div className="p-4">
                <div className="flex flex-col items-end mb-2">
                  <p className="text-2xl font-bold text-primary">
                    {selectedDetail.price}
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-4 md:col-span-3 h-64 md:h-80 rounded-lg overflow-hidden relative bg-muted">
                    <Image
                      src={selectedDetail.image}
                      alt={selectedDetail.title}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 75vw"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedDetail.title}</h2>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-4" />
                    {selectedDetail.location}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 py-4 border-y border-border">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase">
                      Type
                    </p>
                    <p className="font-semibold capitalize">{selectedDetail.type}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase">
                      Beds
                    </p>
                    <p className="font-semibold flex items-center justify-center gap-1">
                      <Bed className="size-4" /> {selectedDetail.beds}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase">
                      Baths
                    </p>
                    <p className="font-semibold flex items-center justify-center gap-1">
                      <Bath className="size-4" /> {selectedDetail.baths}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase">
                      Area
                    </p>
                    <p className="font-semibold flex items-center justify-center gap-1">
                      <Square className="size-4" /> {selectedDetail.sqft}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase">
                      Status
                    </p>
                    <p className="font-semibold flex items-center justify-center gap-1">
                      <Calendar className="size-4" /> {selectedDetail.status}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase">
                      Parking
                    </p>
                    <p className="font-semibold flex items-center justify-center gap-1">
                      <Car className="size-4" />{" "}
                      {typeof selectedRaw === "object" &&
                      selectedRaw !== null &&
                      "size" in selectedRaw &&
                      typeof (selectedRaw as { size?: { parkingSpaces?: number } })
                        .size === "object"
                        ? String(
                            (selectedRaw as { size?: { parkingSpaces?: number } })
                              .size?.parkingSpaces ?? "—",
                          )
                        : "—"}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedDetail.description}
                </p>
                {moderation?.flagNote ? (
                  <p className="text-sm text-muted-foreground">
                    Escalation note: {moderation.flagNote}
                  </p>
                ) : null}
                {moderation?.rejectionReason ? (
                  <p className="text-sm text-muted-foreground">
                    Rejection reason: {moderation.rejectionReason}
                  </p>
                ) : null}

                <div className="flex flex-wrap justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    disabled={busy !== null}
                    onClick={() => {
                      setNote("");
                      setNoteKind("escalate");
                    }}
                  >
                    {busy === "escalate" ? "Saving…" : "Escalate"}
                  </Button>
                  <Button
                    variant="destructive"
                    type="button"
                    disabled={busy !== null}
                    onClick={() => {
                      setNote("");
                      setNoteKind("reject");
                    }}
                  >
                    {busy === "reject" ? "Saving…" : "Reject"}
                  </Button>
                  <Button
                    type="button"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={busy !== null}
                    onClick={() => void approve()}
                  >
                    {busy === "approve" ? "Saving…" : "Approve Listing"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Dialog
        open={noteKind !== null}
        onOpenChange={(open) => {
          if (open || busy) return;
          setNoteKind(null);
          setNote("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {noteKind === "reject" ? "Reject listing" : "Escalate listing"}
            </DialogTitle>
            <DialogDescription>
              {noteKind === "reject"
                ? "This reason is stored on the listing and sent with the rejection."
                : "This note is stored on the listing and keeps it in review."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={
              noteKind === "reject" ? "Reason for rejection" : "Escalation note"
            }
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null}
              onClick={() => {
                setNoteKind(null);
                setNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={noteKind === "reject" ? "destructive" : "default"}
              disabled={!note.trim() || busy !== null}
              onClick={() => void submitNote()}
            >
              {busy ? "Saving…" : noteKind === "reject" ? "Reject" : "Escalate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
