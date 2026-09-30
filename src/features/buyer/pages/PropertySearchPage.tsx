"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Grid,
  List,
  BookmarkPlus,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PropertyFilters from "../components/PropertyFilters";
import PropertyGridCard from "../components/PropertyGridCard";
import { api } from "@/lib/api";
import {
  normalizeCatalogListing,
  parsePropertyListEnvelope,
  type CatalogListing,
} from "@/lib/property-normalize";
import {
  isListingIntent,
  listingMatchesIntent,
  type ListingIntent,
} from "@/lib/catalog-query";

const HEADINGS: Record<ListingIntent | "all", string> = {
  all: "Properties",
  buy: "Properties for sale",
  rent: "Properties for rent",
  sold: "Sold properties",
};

type PropertySearchPageProps = {
  detailBasePath?: string;
  publicCatalog?: boolean;
};

const PropertySearchPage = ({
  detailBasePath = "/buyer/property",
  publicCatalog = false,
}: PropertySearchPageProps) => {
  const searchParams = useSearchParams();
  const intentParam = searchParams.get("intent");
  const intent: ListingIntent | "" = isListingIntent(intentParam)
    ? intentParam
    : "";
  const typeFilter = (searchParams.get("type") ?? "").trim().toLowerCase();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CatalogListing[]>([]);
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [sort, setSort] = useState<
    "relevance" | "price-asc" | "price-desc" | "newest"
  >("relevance");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await api.getProperties(
        publicCatalog ? { skipAuthRedirect: true } : undefined,
      );
      const rows = parsePropertyListEnvelope(raw);
      const cards: CatalogListing[] = [];
      for (const row of rows) {
        const c = normalizeCatalogListing(row);
        if (c) cards.push(c);
      }
      setItems(cards);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load properties.",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [publicCatalog]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((property) => {
      if (typeFilter && property.propertyType !== typeFilter) return false;
      if (!listingMatchesIntent(property.status, intent)) return false;
      if (!q) return true;
      const haystack = `${property.title} ${property.location} ${property.propertyType}`;
      return haystack.toLowerCase().includes(q);
    });
  }, [items, query, typeFilter, intent]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sort === "price-asc" || sort === "price-desc") {
      copy.sort((a, b) => {
        const na = Number(String(a.price).replace(/[^\d.-]/g, "")) || 0;
        const nb = Number(String(b.price).replace(/[^\d.-]/g, "")) || 0;
        return sort === "price-asc" ? na - nb : nb - na;
      });
    }
    return copy;
  }, [filtered, sort]);

  return (
    <div className="p-6">
      <div className="text-sm text-muted-foreground mb-4">
        Home &gt; Search &gt;{" "}
        <span className="text-foreground">Browse listings</span>
      </div>

      <div className="flex gap-6">
        <div className="w-72 flex-shrink-0 hidden lg:block">
          <PropertyFilters />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {HEADINGS[intent || "all"]}
              </h1>
              <p className="text-muted-foreground">
                {loading
                  ? "Loading…"
                  : `${sorted.length} propert${sorted.length === 1 ? "y" : "ies"} found`}
              </p>
              {intent === "rent" && !loading ? (
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Listings are marked available, pending, rented, or sold. None
                  of those means a home is offered for rent, so this view stays
                  empty until the catalog has a for-rent flag.
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <BookmarkPlus className="size-4 mr-2" /> Save Search
              </Button>
              <Select
                value={sort}
                onValueChange={(v) =>
                  setSort(v as typeof sort)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border border-border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="size-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode("list")}
                >
                  <List className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or location…"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="lg:hidden w-full sm:w-auto">
              <SlidersHorizontal className="size-4 mr-2" /> Filters
            </Button>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-4">
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

          {loading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
              <Loader2 className="size-6 animate-spin" />
              Loading listings…
            </div>
          ) : sorted.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/30 px-6 py-16 text-center text-muted-foreground">
              No properties match your filters.
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                  : "flex flex-col gap-4"
              }
            >
              {sorted.map((property) => (
                <PropertyGridCard
                  key={property.id}
                  id={property.id}
                  image={property.image}
                  price={property.price}
                  title={property.title}
                  location={property.location}
                  beds={property.beds}
                  baths={property.baths}
                  sqft={property.sqft}
                  badge={property.badge}
                  isPending={property.isPending}
                  href={`${detailBasePath}/${property.id}`}
                />
              ))}
            </div>
          )}

          {!loading && sorted.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="outline" disabled>
                End of results
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertySearchPage;
