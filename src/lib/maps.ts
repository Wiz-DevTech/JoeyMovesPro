import { Loader } from "@googlemaps/js-api-loader";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

export const mapsLoader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: "weekly",
  libraries: ["places", "geometry", "marker"],
});

// Geocode address to lat/lng
export async function geocodeAddress(address: string) {
  try {
    const { Geocoder } = await mapsLoader.importLibrary("geocoding");
    const geocoder = new Geocoder();

    const result = await geocoder.geocode({ address });

    if (result.results.length === 0) {
      throw new Error("No results found");
    }

    const location = result.results[0].geometry.location;
    const addressComponents = result.results[0].address_components;

    return {
      lat: location.lat(),
      lng: location.lng(),
      formattedAddress: result.results[0].formatted_address,
      city: addressComponents.find((c) => c.types.includes("locality"))?.long_name,
      state: addressComponents.find((c) =>
        c.types.includes("administrative_area_level_1")
      )?.short_name,
      zip: addressComponents.find((c) => c.types.includes("postal_code"))?.long_name,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error;
  }
}

// Calculate distance between two points
export async function calculateDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) {
  try {
    const { DistanceMatrixService } = await mapsLoader.importLibrary("routes");
    const service = new DistanceMatrixService();

    const result = await service.getDistanceMatrix({
      origins: [origin],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    });

    const element = result.rows[0].elements[0];

    if (element.status !== "OK") {
      throw new Error("Distance calculation failed");
    }

    return {
      distance: element.distance.value, // meters
      distanceMiles: element.distance.value * 0.000621371, // miles
      duration: element.duration.value, // seconds
      durationMinutes: Math.round(element.duration.value / 60),
    };
  } catch (error) {
    console.error("Distance calculation error:", error);
    throw error;
  }
}