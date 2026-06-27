export interface Location {
  country?: string;
  city?: string;
  region?: string;
  lat: number;
  lng: number;
  count: number;
  sources?: { [key: string]: number }; // Count by source
}

export interface Scan {
  id: string;
  timestamp: string;
  country?: string;
  city?: string;
  region?: string;
  ip: string;
  userAgent: string;
  type?: string;
  referrer?: string;
  source?: string;
  medium?: string;
  device?: string;
  browser?: string;
}

export interface Analytics {
  id: string;
  redirectUrl: string;
  createdAt: string;
  scans: Scan[];
}

export interface ExtendedQRCode {
  id: string;
  redirectUrl: string;
  base64: string;
  routingUrl: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  user?: {
    name: string;
    email: string;
  };
  scans: Scan[];
}
