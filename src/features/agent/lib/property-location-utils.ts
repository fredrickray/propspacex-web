/** GeoJSON Point [longitude, latitude] — treat (0,0) as “no pin yet”. */
export function isUnsetLngLat(lng: number, lat: number): boolean {
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return true;
  return Math.abs(lng) < 1e-6 && Math.abs(lat) < 1e-6;
}
