"use client";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

export interface PropertyReadOnlyMapProps {
  /** GeoJSON order [longitude, latitude] */
  lngLat: [number, number];
  height?: number;
  className?: string;
}

/**
 * Non-interactive listing map (buyer-facing): shows approximate location only.
 */
export default function PropertyReadOnlyMap({
  lngLat,
  height = 256,
  className,
}: PropertyReadOnlyMapProps) {
  const [lng, lat] = lngLat;

  return (
    <div className={className} style={{ height, width: "100%" }}>
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        className="size-full z-0 rounded-lg"
        style={{ height: "100%", width: "100%" }}
        dragging
        scrollWheelZoom={false}
        doubleClickZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={ICON} interactive={false} />
      </MapContainer>
    </div>
  );
}
