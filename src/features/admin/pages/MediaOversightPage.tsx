"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ImageIcon, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatCard } from "../components/StatCard";
import { loadListingSnapshot, type ListingPhoto } from "../admin-data";

export function MediaOversightPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<ListingPhoto[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const snapshot = await loadListingSnapshot();
        if (!cancelled) setPhotos(snapshot.photos);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load listing photos.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return photos;
    return photos.filter((photo) =>
      [photo.propertyTitle, photo.propertyId, photo.status].join(" ").toLowerCase().includes(needle),
    );
  }, [photos, query]);

  const flagged = photos.filter((photo) => photo.flagged).length;
  const listings = new Set(photos.map((photo) => photo.propertyId)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Media</h1>
        <p className="text-sm text-muted-foreground">
          Photos attached to listings in the catalog.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Photos"
          value={loading ? "…" : error ? "—" : photos.length}
          icon={ImageIcon}
        />
        <StatCard
          title="Listings with photos"
          value={loading ? "…" : error ? "—" : listings}
          icon={ImageIcon}
        />
        <StatCard
          title="On flagged listings"
          value={loading ? "…" : error ? "—" : flagged}
          icon={AlertTriangle}
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by listing title or id"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading photos
          </p>
        ) : error ? (
          <p className="p-6 text-sm text-destructive">{error}</p>
        ) : visible.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No listing photos match this view.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((photo) => (
              <Link
                key={photo.id}
                href={`/properties/${photo.propertyId}`}
                className="overflow-hidden rounded-lg border border-border"
              >
                <img
                  src={photo.url}
                  alt={photo.propertyTitle}
                  className="h-36 w-full object-cover"
                />
                <div className="space-y-1 p-3">
                  <p className="truncate text-sm font-medium">{photo.propertyTitle}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {photo.status || "unknown"}
                    </Badge>
                    {photo.flagged ? (
                      <Badge variant="destructive">Flagged</Badge>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
