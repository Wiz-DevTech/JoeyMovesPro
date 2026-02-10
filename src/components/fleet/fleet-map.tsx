"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Driver {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
  currentJob?: {
    id: string;
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
  };
}

interface FleetMapProps {
  drivers: Driver[];
  center?: { lat: number; lng: number };
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function FleetMap({ drivers, center }: FleetMapProps) {
  const defaultCenter: [number, number] = center
    ? [center.lat, center.lng]
    : [28.0339, -82.4497];

  return (
    <MapContainer center={defaultCenter} zoom={12} className="w-full h-full rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {drivers.map((driver) => (
        <Marker key={driver.id} position={[driver.lat, driver.lng]} icon={markerIcon}>
          <Popup>
            <p className="font-semibold">{driver.name}</p>
            <p>Status: {driver.status}</p>
            {driver.currentJob ? <p>Active Job: #{driver.currentJob.id.slice(-6)}</p> : null}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
