/**
 * OpenStreetMap Nominatim (https://nominatim.org) — use responsibly (≤ 1 req/s).
 * Client-side calls are acceptable for interactive search at low volume.
 */

export type GeocodeHit = {
  id: string;
  displayName: string;
  lat: number;
  lng: number;
  streetLine: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  countryCode: string;
};

type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  region?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
};

type NominatimItem = {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
};

function buildStreetLine(addr?: NominatimAddress): string {
  if (!addr) return "";
  const num = addr.house_number?.trim();
  const road =
    addr.road?.trim() ||
    addr.pedestrian?.trim() ||
    addr.suburb?.trim() ||
    "";
  if (num && road) return `${num} ${road}`;
  if (road) return road;
  if (num) return num;
  return "";
}

function buildCity(addr?: NominatimAddress): string {
  if (!addr) return "";
  return (
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.county ||
    ""
  );
}

function buildState(addr?: NominatimAddress): string {
  if (!addr) return "";
  return (addr.state || addr.region || "").trim();
}

function mapItem(item: NominatimItem, index: number): GeocodeHit {
  const addr = item.address;
  const streetLine = buildStreetLine(addr);
  const city = buildCity(addr);
  const lat = Number.parseFloat(item.lat);
  const lng = Number.parseFloat(item.lon);

  return {
    id: `${item.lat},${item.lon},${index}`,
    displayName: item.display_name,
    lat,
    lng,
    streetLine: streetLine || item.display_name.split(",").slice(0, 2).join(",").trim(),
    city,
    state: buildState(addr),
    postcode: addr?.postcode?.trim() ?? "",
    country: addr?.country?.trim() ?? "",
    countryCode: (addr?.country_code ?? "").toLowerCase(),
  };
}

export async function searchPlaces(query: string): Promise<GeocodeHit[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  url.searchParams.set("q", q);

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
    },
  });

  if (!res.ok) {
    throw new Error("Address search failed. Try again in a moment.");
  }

  const data = (await res.json()) as NominatimItem[];
  if (!Array.isArray(data)) return [];

  return data.map(mapItem);
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<GeocodeHit | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
    },
  });

  if (!res.ok) return null;

  const item = (await res.json()) as NominatimItem;
  if (!item?.lat || !item?.lon) return null;

  return mapItem(item, 0);
}
