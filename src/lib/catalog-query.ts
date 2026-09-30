import type { CatalogListing } from "@/lib/property-normalize";

export type ListingIntent = "buy" | "rent" | "sold";

export const PRICE_MIN = 100_000;
export const PRICE_MAX = 10_000_000;
export const PRICE_STEP = 50_000;

export const PROPERTY_TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Land", value: "land" },
  { label: "Commercial", value: "commercial" },
] as const;

export const AMENITY_OPTIONS = [
  { id: "pool", label: "Pool", needles: ["pool", "swimming"] },
  { id: "garage", label: "Garage", needles: ["garage", "parking"] },
  { id: "garden", label: "Garden", needles: ["garden"] },
  { id: "gym", label: "Gym", needles: ["gym"] },
  { id: "security", label: "Security", needles: ["security", "cctv"] },
] as const;

export type AmenityId = (typeof AMENITY_OPTIONS)[number]["id"];

export type CatalogFilters = {
  q: string;
  type: string;
  intent: ListingIntent | "";
  minPrice: number | null;
  maxPrice: number | null;
  minBeds: number | null;
  minBaths: number | null;
  minArea: number | null;
  maxArea: number | null;
  amenities: AmenityId[];
};

export function isListingIntent(value: string | null): value is ListingIntent {
  return value === "buy" || value === "rent" || value === "sold";
}

export function isAmenityId(value: string): value is AmenityId {
  return AMENITY_OPTIONS.some((option) => option.id === value);
}

export function emptyCatalogFilters(intent: ListingIntent | "" = ""): CatalogFilters {
  return {
    q: "",
    type: "",
    intent,
    minPrice: null,
    maxPrice: null,
    minBeds: null,
    minBaths: null,
    minArea: null,
    maxArea: null,
    amenities: [],
  };
}

function readNumber(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function parseCatalogFilters(params: URLSearchParams): CatalogFilters {
  const intentParam = params.get("intent");
  const amenities = (params.get("amenities") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(isAmenityId);

  return {
    q: params.get("q") ?? "",
    type: (params.get("type") ?? "").trim().toLowerCase(),
    intent: isListingIntent(intentParam) ? intentParam : "",
    minPrice: readNumber(params, "minPrice"),
    maxPrice: readNumber(params, "maxPrice"),
    minBeds: readNumber(params, "beds"),
    minBaths: readNumber(params, "baths"),
    minArea: readNumber(params, "minArea"),
    maxArea: readNumber(params, "maxArea"),
    amenities,
  };
}

export function catalogFiltersToQuery(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  const q = filters.q.trim();
  if (q) params.set("q", q);
  if (filters.type) params.set("type", filters.type);
  if (filters.intent) params.set("intent", filters.intent);
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.minBeds != null) params.set("beds", String(filters.minBeds));
  if (filters.minBaths != null) params.set("baths", String(filters.minBaths));
  if (filters.minArea != null) params.set("minArea", String(filters.minArea));
  if (filters.maxArea != null) params.set("maxArea", String(filters.maxArea));
  if (filters.amenities.length) params.set("amenities", filters.amenities.join(","));
  return params.toString();
}

export function buildCatalogSearchHref(input: {
  q?: string;
  type?: string;
  intent?: ListingIntent | "";
  minPrice?: number | null;
  maxPrice?: number | null;
}): string {
  const query = catalogFiltersToQuery({
    ...emptyCatalogFilters(input.intent ?? ""),
    q: input.q ?? "",
    type: input.type ?? "",
    minPrice: input.minPrice ?? null,
    maxPrice: input.maxPrice ?? null,
  });
  return query ? `/properties?${query}` : "/properties";
}

export function formatCompactNaira(value: number): string {
  if (value >= PRICE_MAX) return "NGN 10M+";
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const text = Number.isInteger(millions) ? String(millions) : millions.toFixed(1);
    return `NGN ${text}M`;
  }
  if (value >= 1_000) return `NGN ${Math.round(value / 1_000)}k`;
  return `NGN ${value.toLocaleString()}`;
}

export function listingMatchesIntent(
  status: string,
  intent: ListingIntent | "",
): boolean {
  if (!intent) return true;
  if (intent === "buy") return status === "available" || status === "pending";
  if (intent === "sold") return status === "sold";
  return false;
}

export function listingMatchesFilters(
  listing: CatalogListing,
  filters: CatalogFilters,
): boolean {
  if (filters.type && listing.propertyType !== filters.type) return false;
  if (!listingMatchesIntent(listing.status, filters.intent)) return false;
  if (filters.minPrice != null && listing.priceValue < filters.minPrice) return false;
  if (filters.maxPrice != null && listing.priceValue > filters.maxPrice) return false;
  if (filters.minBeds != null && listing.beds < filters.minBeds) return false;
  if (filters.minBaths != null && listing.baths < filters.minBaths) return false;
  if (filters.minArea != null || filters.maxArea != null) {
    if (listing.areaValue <= 0) return false;
    if (filters.minArea != null && listing.areaValue < filters.minArea) return false;
    if (filters.maxArea != null && listing.areaValue > filters.maxArea) return false;
  }
  if (
    filters.amenities.some((id) => {
      const option = AMENITY_OPTIONS.find((item) => item.id === id);
      if (!option) return true;
      return !option.needles.some((needle) => listing.amenityText.includes(needle));
    })
  ) {
    return false;
  }

  const q = filters.q.trim().toLowerCase();
  if (!q) return true;
  const haystack = `${listing.title} ${listing.location} ${listing.propertyType}`;
  return haystack.toLowerCase().includes(q);
}
