"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  getPropertyId,
  normalizePropertyForDetail,
  parsePropertyListEnvelope,
} from "@/lib/property-normalize";

export function PropertyModerationPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [all, setAll] = useState<unknown[]>([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await api.getProperties();
      const list = parsePropertyListEnvelope(raw);
      setAll(list);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load properties.",
      );
      setAll([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const tabFiltered = useMemo(() => {
    return all.filter((r) => {
      if (typeof r !== "object" || r === null) return false;
      const o = r as Record<string, unknown>;
      const status = String(o.status ?? "").toLowerCase();
      const flagged = Boolean(o.flagged ?? o.isFlagged);

      if (activeTab === "pending") return status === "pending";
      if (activeTab === "approved")
        return status === "available" || o.isActive === true;
      if (activeTab === "flagged") return flagged;
      return true;
    });
  }, [all, activeTab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tabFiltered;
    return tabFiltered.filter((r) => {
      const o = r as Record<string, unknown>;
      const title = String(o.title ?? "").toLowerCase();
      const id = getPropertyId(r).toLowerCase();
      return title.includes(q) || id.includes(q);
    });
  }, [tabFiltered, query]);

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
              No listings in this queue.
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
                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 capitalize">
                  {selectedDetail.status}
                </Badge>
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

                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() =>
                      toast({
                        title: "Not available",
                        description:
                          "Escalation is not connected to the API yet.",
                      })
                    }
                  >
                    Escalate
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={() =>
                        toast({
                          title: "Not available",
                          description:
                            "Reject action is not connected to the API yet.",
                        })
                      }
                    >
                      Reject
                    </Button>
                    <Button
                      type="button"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() =>
                        toast({
                          title: "Not available",
                          description:
                            "Approve action is not connected to the API yet.",
                        })
                      }
                    >
                      Approve Listing
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
