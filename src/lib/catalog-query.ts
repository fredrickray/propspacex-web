export type ListingIntent = "buy" | "rent" | "sold";

export const PROPERTY_TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Land", value: "land" },
  { label: "Commercial", value: "commercial" },
] as const;

export function isListingIntent(value: string | null): value is ListingIntent {
  return value === "buy" || value === "rent" || value === "sold";
}

export function buildCatalogSearchHref(input: {
  q?: string;
  type?: string;
  intent?: ListingIntent | "";
}): string {
  const params = new URLSearchParams();
  const q = input.q?.trim();
  if (q) params.set("q", q);
  if (input.type) params.set("type", input.type);
  if (input.intent) params.set("intent", input.intent);
  const query = params.toString();
  return query ? `/properties?${query}` : "/properties";
}

export function listingMatchesIntent(
  status: string,
  intent: ListingIntent | "",
): boolean {
  if (!intent) return true;
  if (intent === "buy") return status === "available" || status === "pending";
  if (intent === "sold") return status === "sold";
  // The API status enum has no "for rent" value. `rented` means the home is taken.
  return false;
}
