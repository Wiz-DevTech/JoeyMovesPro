"use client";

import { useEffect, useRef, useState } from "react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

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

export function FleetMap({ drivers, center }: FleetMapProps) {
  const defaultCenter = center || { lat: 28.0339, lng: -82.4497 }; // Spring Hill, FL

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={12}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
        className="w-full h-full"
      >
        {drivers.map((driver) => (
          <AdvancedMarker
            key={driver.id}
            position={{ lat: driver.lat, lng: driver.lng }}
          >
            <Pin
              background={getStatusColor(driver.status)}
              borderColor="#fff"
              glyphColor="#fff"
            />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: "#22c55e",
    HEADING_TO_PICKUP: "#eab308",
    AT_PICKUP: "#f59e0b",
    IN_TRANSIT: "#3b82f6",
    AT_DROPOFF: "#8b5cf6",
    OFFLINE: "#64748b",
    BUSY: "#ef4444",
  };
  return colors[status] || colors.OFFLINE;
}