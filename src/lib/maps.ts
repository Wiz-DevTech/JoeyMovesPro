const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const OSRM_BASE_URL = "https://router.project-osrm.org";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
  };
}

// Geocode address to lat/lng using OpenStreetMap Nominatim
export async function geocodeAddress(address: string) {
  const params = new URLSearchParams({
    q: address,
    format: "jsonv2",
    addressdetails: "1",
    limit: "1",
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params.toString()}`, {
    headers: {
      "User-Agent": "JoeyMovesPro/1.0 (dispatch@joeymovespro.local)",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed with status ${response.status}`);
  }

  const results = (await response.json()) as NominatimResult[];

  if (results.length === 0) {
    throw new Error("No results found");
  }

  const result = results[0];

  return {
    lat: Number.parseFloat(result.lat),
    lng: Number.parseFloat(result.lon),
    formattedAddress: result.display_name,
    city: result.address?.city || result.address?.town || result.address?.village,
    state: result.address?.state,
    zip: result.address?.postcode,
  };
}

// Calculate distance between two points using OSRM public router
export async function calculateDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) {
  const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const params = new URLSearchParams({
    overview: "false",
  });

  const response = await fetch(
    `${OSRM_BASE_URL}/route/v1/driving/${coordinates}?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Distance calculation failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    code: string;
    routes: Array<{ distance: number; duration: number }>;
  };

  if (data.code !== "Ok" || data.routes.length === 0) {
    throw new Error("Distance calculation failed");
  }

  const route = data.routes[0];

  return {
    distance: route.distance,
    distanceMiles: route.distance * 0.000621371,
    duration: route.duration,
    durationMinutes: Math.round(route.duration / 60),
  };
}
