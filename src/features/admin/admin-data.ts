import { api, PropertyStatus } from "@/lib/api";
import {
  getPropertyId,
  parsePropertyListEnvelope,
  readListMeta,
} from "@/lib/property-normalize";

export type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  verified: boolean;
};

export type ListingPhoto = {
  id: string;
  url: string;
  propertyId: string;
  propertyTitle: string;
  status: string;
  flagged: boolean;
};

export type ListingSummary = {
  id: string;
  title: string;
  city: string;
  status: string;
  createdAt: string;
  flagged: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function parseUsers(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!isRecord(data)) return [];
  for (const key of ["users", "data", "items", "results"]) {
    if (Array.isArray(data[key])) return data[key];
  }
  return [];
}

export function toDirectoryUser(raw: unknown): DirectoryUser | null {
  if (!isRecord(raw)) return null;
  const email = text(raw.email);
  const id = text(raw.userId, raw.id, raw._id) || email;
  if (!id) return null;
  const first = text(raw.firstName, raw.first_name);
  const last = text(raw.lastName, raw.last_name);
  const name = [first, last].filter(Boolean).join(" ") || text(raw.name) || email || "User";
  return {
    id,
    name,
    email,
    phone: text(raw.phone),
    role: text(raw.appRole, raw.role).toLowerCase(),
    verified:
      raw.isVerified === true || raw.verified === true || raw.is_verified === true,
  };
}

export async function loadDirectory(): Promise<{
  users: DirectoryUser[];
  total: number;
  truncated: boolean;
}> {
  const collected: DirectoryUser[] = [];
  const seen = new Set<string>();
  let page = 1;
  let total: number | null = null;
  let hasNext = true;

  while (hasNext && page <= 10) {
    const raw = await api.getUsers(page, 100);
    if (total === null) {
      const meta = readListMeta(raw);
      total = meta.total;
      hasNext = meta.hasNextPage;
    } else {
      hasNext = readListMeta(raw).hasNextPage;
    }
    const batch = parseUsers(raw)
      .map(toDirectoryUser)
      .filter((user): user is DirectoryUser => user !== null);
    if (batch.length === 0) break;
    let added = 0;
    for (const user of batch) {
      if (seen.has(user.id)) continue;
      seen.add(user.id);
      collected.push(user);
      added += 1;
    }
    if (added === 0) break;
    page += 1;
  }

  return {
    users: collected,
    total: total ?? collected.length,
    truncated: hasNext,
  };
}

function toListing(raw: unknown): ListingSummary | null {
  if (!isRecord(raw)) return null;
  const id = getPropertyId(raw);
  if (!id) return null;
  const location = isRecord(raw.location) ? raw.location : {};
  return {
    id,
    title: text(raw.title) || "Untitled listing",
    city: text(location.city, location.state),
    status: text(raw.status),
    createdAt: text(raw.createdAt, raw.created_at),
    flagged: raw.flagged === true,
  };
}

function photosFrom(raw: unknown): ListingPhoto[] {
  if (!isRecord(raw)) return [];
  const listing = toListing(raw);
  if (!listing) return [];
  const media = isRecord(raw.media) ? raw.media : {};
  const images = Array.isArray(media.images) ? media.images : [];
  return images.flatMap((image, index) => {
    if (!isRecord(image)) return [];
    const url = text(image.url);
    if (!url.startsWith("http")) return [];
    return [
      {
        id: text(image.mediaId, image.id) || `${listing.id}-${index}`,
        url,
        propertyId: listing.id,
        propertyTitle: listing.title,
        status: listing.status,
        flagged: listing.flagged,
      },
    ];
  });
}

async function loadStatus(status: PropertyStatus) {
  const raw = await api.getProperties({ status, page: 1, limit: 50 });
  const rows = parsePropertyListEnvelope(raw);
  return {
    total: readListMeta(raw).total ?? rows.length,
    rows,
  };
}

export async function loadListingSnapshot() {
  const [available, pending] = await Promise.all([
    loadStatus(PropertyStatus.AVAILABLE),
    loadStatus(PropertyStatus.PENDING),
  ]);
  const listings = [...available.rows, ...pending.rows]
    .map(toListing)
    .filter((row): row is ListingSummary => row !== null)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const photos = [...available.rows, ...pending.rows].flatMap(photosFrom);
  return {
    activeProperties: available.total,
    pendingListings: pending.total,
    listings,
    photos,
  };
}
