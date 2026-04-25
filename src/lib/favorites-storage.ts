const STORAGE_KEY = "propspacex_favorite_properties_v2";
const LEGACY_IDS_KEY = "propspacex_favorite_property_ids";

export type FavoritePropertySnapshot = {
  id: string;
  title: string;
  priceLabel: string;
  locationLabel: string;
  imageUrl: string;
  savedAtIso: string;
};

function isSnapshot(x: unknown): x is FavoritePropertySnapshot {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    typeof o.priceLabel === "string" &&
    typeof o.locationLabel === "string" &&
    typeof o.imageUrl === "string" &&
    typeof o.savedAtIso === "string"
  );
}

export function readFavoriteSnapshots(): FavoritePropertySnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter(isSnapshot);
      }
    }
    const legacy = localStorage.getItem(LEGACY_IDS_KEY);
    if (legacy) {
      const ids = JSON.parse(legacy) as unknown;
      if (Array.isArray(ids)) {
        return ids
          .filter((x): x is string => typeof x === "string")
          .map((id) => ({
            id,
            title: "Saved listing",
            priceLabel: "—",
            locationLabel: "—",
            imageUrl: "/placeholder.svg",
            savedAtIso: new Date().toISOString(),
          }));
      }
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function writeFavoriteSnapshots(items: FavoritePropertySnapshot[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function upsertFavorite(snapshot: FavoritePropertySnapshot) {
  const cur = readFavoriteSnapshots().filter((x) => x.id !== snapshot.id);
  writeFavoriteSnapshots([snapshot, ...cur]);
}

export function removeFavorite(propertyId: string) {
  writeFavoriteSnapshots(readFavoriteSnapshots().filter((x) => x.id !== propertyId));
}

export function isFavorite(propertyId: string): boolean {
  return readFavoriteSnapshots().some((x) => x.id === propertyId);
}
