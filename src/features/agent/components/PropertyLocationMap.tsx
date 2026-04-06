"use client";

import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { isUnsetLngLat } from "../lib/property-location-utils";

/** GeoJSON order: [longitude, latitude] */
export type LngLat = [number, number];

const NYC: [number, number] = [40.7128, -74.006];
const DEFAULT_ZOOM_EXPLore = 12;
const DEFAULT_ZOOM_PIN = 16;

const ICON = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FlyToPin({
  lat,
  lng,
  revision,
}: {
  lat: number;
  lng: number;
  revision: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (revision < 1) return;
    if (isUnsetLngLat(lng, lat)) return;
    map.flyTo([lat, lng], DEFAULT_ZOOM_PIN, { duration: 0.55 });
  }, [revision, lat, lng, map]);
  return null;
}

function MapClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export interface PropertyLocationMapProps {
  /** [lng, lat] */
  lngLat: LngLat;
  /** Pin moved by user. Pass `{ fly: true }` when the map should animate to the new point (map click / search). */
  onLngLatChange: (
    lng: number,
    lat: number,
    opts?: { fly?: boolean },
  ) => void;
  /** Incremented internally when `fly` is requested; drives `FlyToPin`. */
  flyToRevision: number;
  className?: string;
  height?: number;
}

/**
 * Interactive OSM map: click the map or drag the pin to set coordinates (GeoJSON [lng, lat]).
 */
function PropertyLocationMapInner({
  lngLat,
  onLngLatChange,
  flyToRevision,
  className,
  height = 288,
}: PropertyLocationMapProps) {
  const [lng, lat] = lngLat;
  const unset = isUnsetLngLat(lng, lat);
  const centerLat = unset ? NYC[0] : lat;
  const centerLng = unset ? NYC[1] : lng;
  const zoom = unset ? DEFAULT_ZOOM_EXPLore : DEFAULT_ZOOM_PIN;

  return (
    <div className={className} style={{ height, width: "100%" }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        className="size-full rounded-lg z-0"
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToPin lat={lat} lng={lng} revision={flyToRevision} />
        {!unset ? (
          <Marker
            position={[lat, lng]}
            icon={ICON}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng();
                onLngLatChange(p.lng, p.lat);
              },
            }}
          />
        ) : null}
        <MapClickHandler
          onPick={(la, ln) => {
            onLngLatChange(ln, la, { fly: true });
          }}
        />
      </MapContainer>
    </div>
  );
}

export const PropertyLocationMap = PropertyLocationMapInner;
export default PropertyLocationMapInner;
