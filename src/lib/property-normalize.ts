/**
 * Normalizes backend property payloads that may vary in shape (_id vs id,
 * nested media, paginated envelopes, etc.) for UI consumption.
 */

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function parsePropertyListEnvelope(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!isRecord(data)) return [];
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.properties)) return data.properties;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

/** Single-property responses: `{ property: {...} }` or `{ data: {...} }` */
export function unwrapSingleProperty(data: unknown): unknown {
  if (!isRecord(data)) return data;
  if (data.property !== undefined) return data.property;
  if (data.data !== undefined && !Array.isArray(data.data)) return data.data;
  return data;
}

export function getPropertyId(raw: unknown): string {
  if (!isRecord(raw)) return "";
  const id =
    raw._id ?? raw.id ?? raw.propertyId ?? raw.property_id ?? raw.listingId;
  if (id === undefined || id === null) return "";
  return String(id);
}

function pickNumber(...vals: unknown[]): number {
  for (const v of vals) {
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

function pickString(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === "string" && v.trim() !== "") return v.trim();
  }
  return "";
}

export function getPrimaryImageUrl(raw: unknown): string {
  if (!isRecord(raw)) return FALLBACK_IMAGE;

  const direct = pickString(raw.imageUrl, raw.image, raw.thumbnailUrl);
  if (direct.startsWith("http")) return direct;

  const media = raw.media;
  if (isRecord(media)) {
    const images = media.images;
    if (Array.isArray(images) && images.length > 0) {
      const first = images[0];
      if (typeof first === "string" && first.startsWith("http")) return first;
      if (isRecord(first)) {
        const u = pickString(first.url, first.src);
        if (u.startsWith("http")) return u;
      }
    }
  }

  return FALLBACK_IMAGE;
}

export function getImageUrls(raw: unknown): string[] {
  const primary = getPrimaryImageUrl(raw);
  if (!isRecord(raw)) return [primary];

  const media = raw.media;
  if (isRecord(media) && Array.isArray(media.images)) {
    const urls: string[] = [];
    for (const item of media.images) {
      if (typeof item === "string" && item.startsWith("http")) urls.push(item);
      else if (isRecord(item)) {
        const u = pickString(item.url, item.src);
        if (u.startsWith("http")) urls.push(u);
      }
    }
    if (urls.length) return urls;
  }
  return [primary];
}

export function formatPriceDisplay(price: number, currency: string): string {
  const code = currency && currency.length === 3 ? currency.toUpperCase() : "NGN";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${code} ${price.toLocaleString()}`;
  }
}

export function buildLocationLine(raw: unknown): string {
  if (!isRecord(raw)) return "";
  const loc = raw.location;
  if (!isRecord(loc)) return pickString(raw.address as string);

  const parts = [
    pickString(loc.address),
    pickString(loc.city),
    pickString(loc.state),
    pickString(loc.country),
  ].filter(Boolean);
  return parts.join(", ");
}

export type NormalizedPropertyCard = {
  id: string;
  image: string;
  price: string;
  title: string;
  location: string;
  beds: number;
  baths: number;
  sqft: string;
  badge?: string;
  isPending?: boolean;
};

export function normalizePropertyForCard(raw: unknown): NormalizedPropertyCard | null {
  const id = getPropertyId(raw);
  if (!id) return null;

  if (!isRecord(raw)) return null;

  const title = pickString(raw.title) || "Untitled listing";
  const priceNum = pickNumber(raw.price);
  const currency = pickString(raw.currency) || "NGN";
  const location = buildLocationLine(raw) || "Location not specified";

  const size = isRecord(raw.size) ? raw.size : {};
  const dim = isRecord(size.dimensionDetails) ? size.dimensionDetails : {};
  const beds = pickNumber(size.bedrooms, (size as Record<string, unknown>).beds);
  const baths = pickNumber(size.bathrooms, (size as Record<string, unknown>).baths);
  const area = pickNumber(
    dim.totalArea,
    (raw as Record<string, unknown>).totalArea,
  );

  const status = pickString(raw.status).toLowerCase();
  const isPending = status === "pending";

  return {
    id,
    image: getPrimaryImageUrl(raw),
    price: formatPriceDisplay(priceNum, currency),
    title,
    location,
    beds,
    baths,
    sqft: area > 0 ? Math.round(area).toLocaleString() : "—",
    badge:
      status === "available"
        ? "For Sale"
        : status
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : "Listing",
    isPending,
  };
}

/** GeoJSON Point coordinates [longitude, latitude], or null if missing. */
export function getPropertyLngLat(raw: unknown): [number, number] | null {
  if (!isRecord(raw)) return null;
  const loc = raw.location;
  if (!isRecord(loc)) return null;
  const c = loc.coordinates;
  if (!isRecord(c)) return null;
  const arr = c.coordinates;
  if (!Array.isArray(arr) || arr.length < 2) return null;
  const lng = Number(arr[0]);
  const lat = Number(arr[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  if (Math.abs(lng) < 1e-6 && Math.abs(lat) < 1e-6) return null;
  return [lng, lat];
}

export type NormalizedPropertyDetail = NormalizedPropertyCard & {
  description: string;
  type: string;
  status: string;
  features: string[];
  /** [lng, lat] when API provides GeoJSON Point */
  coordinates: [number, number] | null;
};

export function normalizePropertyForDetail(
  raw: unknown,
): NormalizedPropertyDetail | null {
  const card = normalizePropertyForCard(raw);
  if (!card || !isRecord(raw)) return null;

  const description = pickString(raw.description) || "No description provided.";
  const type = pickString(raw.type) || "—";
  const status = pickString(raw.status) || "—";

  let features: string[] = [];
  if (Array.isArray(raw.features)) {
    features = raw.features.filter((f): f is string => typeof f === "string");
  }

  return {
    ...card,
    description,
    type,
    status,
    features,
    coordinates: getPropertyLngLat(raw),
  };
}

export function listingStatusForAgent(raw: unknown): string {
  if (!isRecord(raw)) return "unknown";
  const s = pickString(raw.status).toLowerCase();
  const active = raw.isActive;
  if (typeof active === "boolean") {
    if (!active) return "inactive";
  }
  if (s === "sold" || s === "rented") return s;
  if (s === "pending") return "pending";
  if (s === "available") return "active";
  return s || "active";
}
