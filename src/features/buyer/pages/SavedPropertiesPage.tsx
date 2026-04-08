"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PropertyGridCard from "../components/PropertyGridCard";
import { readFavoriteSnapshots } from "@/lib/favorites-storage";

const SavedPropertiesPage = () => {
  const [query, setQuery] = useState("");
  const favorites = useMemo(() => readFavoriteSnapshots(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return favorites;
    return favorites.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.locationLabel.toLowerCase().includes(q) ||
        p.priceLabel.toLowerCase().includes(q),
    );
  }, [favorites, query]);

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saved properties</h1>
          <p className="text-muted-foreground">
            Listings you heart from search or detail pages (stored on this device).
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/buyer/search">
            <Plus className="mr-2 size-4" />
            Browse more
          </Link>
        </Button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter saved…"
          className="pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-16 text-center">
          <Heart className="size-10 text-muted-foreground" />
          <p className="max-w-sm text-sm text-muted-foreground">
            {favorites.length === 0
              ? "No favorites yet. Open a listing and tap Save to favorites."
              : "No matches for your filter."}
          </p>
          <Button asChild>
            <Link href="/buyer/search">Go to search</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PropertyGridCard
              key={p.id}
              id={p.id}
              image={p.imageUrl}
              price={p.priceLabel}
              title={p.title}
              location={p.locationLabel}
              beds={0}
              baths={0}
              sqft="—"
              isFavorited
              badge="Saved"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPropertiesPage;
