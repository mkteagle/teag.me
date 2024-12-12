import { Scan, Location } from "@/types/analytics";
import axios from "axios";

interface GeocodingResponse {
  lat: string;
  lon: string;
}

// Cache geocoding results to avoid repeated API calls
const geocodingCache: Record<string, { lat: number; lng: number }> = {};

async function geocodeLocation(
  city?: string,
  country?: string
): Promise<{ lat: number; lng: number } | null> {
  if (!city || !country) return null;

  const cacheKey = `${city},${country}`;
  if (geocodingCache[cacheKey]) {
    return geocodingCache[cacheKey];
  }

  try {
    const response = await axios.get<GeocodingResponse[]>(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          city,
          country,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "Teag.me QR Code Tracker",
        },
      }
    );

    if (response.data?.[0]) {
      const result = {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon),
      };
      geocodingCache[cacheKey] = result;
      return result;
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export async function processLocationData(scans: Scan[]): Promise<Location[]> {
  const locationMap = new Map<string, Location>();

  for (const scan of scans) {
    if (scan.country || scan.city) {
      const locationKey = `${scan.country}-${scan.region}-${scan.city}`;

      if (!locationMap.has(locationKey)) {
        const coordinates = await geocodeLocation(scan.city, scan.country);

        locationMap.set(locationKey, {
          country: scan.country,
          region: scan.region,
          city: scan.city,
          lat: coordinates?.lat ?? 0,
          lng: coordinates?.lng ?? 0,
          count: 1,
        });
      } else {
        const location = locationMap.get(locationKey)!;
        location.count += 1;
      }
    }
  }

  return Array.from(locationMap.values());
}
