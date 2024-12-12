// types/analytics.ts
export interface Location {
  country?: string;
  city?: string;
  region?: string;
  lat: number; // Make lat/lng required
  lng: number;
  count: number;
}

export interface Scan {
  id: string;
  timestamp: string;
  country?: string;
  city?: string;
  region?: string;
  ip: string;
  userAgent: string;
}

export interface Analytics {
  id: string;
  redirectUrl: string;
  createdAt: string;
  scans: Scan[];
}
