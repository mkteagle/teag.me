interface Scan {
  country?: string;
  city?: string;
  region?: string;
}

interface Location {
  country?: string;
  city?: string;
  region?: string;
  count: number;
}

export function processLocationData(scans: Scan[]): Location[] {
  const locationMap = new Map<string, Location>();

  scans.forEach((scan) => {
    if (scan.country || scan.city || scan.region) {
      const locationKey = `${scan.country}-${scan.region}-${scan.city}`;

      if (locationMap.has(locationKey)) {
        const location = locationMap.get(locationKey)!;
        location.count += 1;
      } else {
        locationMap.set(locationKey, {
          country: scan.country,
          region: scan.region,
          city: scan.city,
          count: 1,
        });
      }
    }
  });

  return Array.from(locationMap.values());
}
