"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, FileCheck, Loader2, UserCheck, Users } from "lucide-react";
import { useSignedInProfile } from "@/hooks/use-signed-in-profile";
import { StatCard } from "../components/StatCard";
import { loadDirectory, loadListingSnapshot, type ListingSummary } from "../admin-data";

function formatWhen(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DashboardPage() {
  const profile = useSignedInProfile();
  const [loading, setLoading] = useState(true);
  const [listingError, setListingError] = useState("");
  const [userError, setUserError] = useState("");
  const [activeProperties, setActiveProperties] = useState<number | null>(null);
  const [pendingListings, setPendingListings] = useState<number | null>(null);
  const [userTotal, setUserTotal] = useState<number | null>(null);
  const [agentTotal, setAgentTotal] = useState<number | null>(null);
  const [recent, setRecent] = useState<ListingSummary[]>([]);
  const [pendingRows, setPendingRows] = useState<ListingSummary[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [listings, directory] = await Promise.allSettled([
        loadListingSnapshot(),
        loadDirectory(),
      ]);
      if (cancelled) return;
      if (listings.status === "fulfilled") {
        setActiveProperties(listings.value.activeProperties);
        setPendingListings(listings.value.pendingListings);
        setRecent(listings.value.listings.slice(0, 6));
        setPendingRows(
          listings.value.listings.filter((row) => row.status === "pending"),
        );
      } else {
        setListingError(
          listings.reason instanceof Error
            ? listings.reason.message
            : "Could not load listings.",
        );
      }
      if (directory.status === "fulfilled") {
        setUserTotal(directory.value.total);
        setAgentTotal(
          directory.value.users.filter((user) => user.role === "agent").length,
        );
      } else {
        setUserError(
          directory.reason instanceof Error
            ? directory.reason.message
            : "Could not load users.",
        );
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const name = profile?.firstName?.trim() || "Admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {name}</h1>
        <p className="text-sm text-muted-foreground">
          Counts come from the live catalog and the user directory.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total users"
          value={loading ? "…" : userError ? "—" : (userTotal ?? 0)}
          change={userError || undefined}
          changeType={userError ? "negative" : "neutral"}
          icon={Users}
        />
        <StatCard
          title="Active properties"
          value={loading ? "…" : listingError ? "—" : (activeProperties ?? 0)}
          change={listingError || "Status available"}
          changeType={listingError ? "negative" : "neutral"}
          icon={Building2}
        />
        <StatCard
          title="Agents"
          value={loading ? "…" : userError ? "—" : (agentTotal ?? 0)}
          change={userError ? undefined : "From the user directory"}
          icon={UserCheck}
        />
        <StatCard
          title="Pending listings"
          value={loading ? "…" : listingError ? "—" : (pendingListings ?? 0)}
          change={listingError || "Waiting for review"}
          changeType={listingError ? "negative" : "neutral"}
          icon={FileCheck}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent listings</h2>
            <Link href="/admin/properties" className="text-sm font-medium text-primary">
              Review queue
            </Link>
          </div>
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading listings
            </p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No listings yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((listing) => (
                <li key={listing.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {[listing.city, formatWhen(listing.createdAt)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs capitalize text-muted-foreground">
                    {listing.status || "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Pending review</h2>
            <Link href="/admin/properties" className="text-sm font-medium text-primary">
              Open queue
            </Link>
          </div>
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading the queue
            </p>
          ) : pendingRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No listings are waiting for review.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {pendingRows.map((listing) => (
                <li key={listing.id} className="py-3">
                  <p className="text-sm font-medium">{listing.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {listing.city || "Location not set"} · {formatWhen(listing.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
