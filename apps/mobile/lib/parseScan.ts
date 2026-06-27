// Parses a raw QR payload into a structured result the UI can render.

export type ScanKind = 'url' | 'wifi' | 'text';

export type WifiInfo = {
  ssid: string;
  security: string; // e.g. "WPA2", "WEP", "Open"
  password: string | null;
  hidden: boolean;
};

export type Scan = {
  raw: string;
  kind: ScanKind;
  host: string | null; // domain for url kind
  wifi: WifiInfo | null; // populated for wifi kind
};

function parseWifi(raw: string): WifiInfo | null {
  // Format: WIFI:S:<ssid>;T:<WPA|WEP|nopass>;P:<pwd>;H:<true|false>;;
  if (!/^WIFI:/i.test(raw)) return null;
  const body = raw.slice(raw.indexOf(':') + 1);
  const fields: Record<string, string> = {};
  // Split on unescaped semicolons.
  const parts = body.split(/(?<!\\);/);
  for (const part of parts) {
    const idx = part.indexOf(':');
    if (idx === -1) continue;
    const key = part.slice(0, idx).toUpperCase();
    const value = part.slice(idx + 1).replace(/\\([\\;,":])/g, '$1');
    if (key) fields[key] = value;
  }
  const ssid = fields.S ?? '';
  if (!ssid) return null;
  const rawType = (fields.T ?? '').toUpperCase();
  let security = 'WPA2';
  if (rawType === 'WEP') security = 'WEP';
  else if (rawType === 'NOPASS' || rawType === '') security = 'Open';
  else if (rawType === 'WPA') security = 'WPA2';
  else security = rawType;
  return {
    ssid,
    security,
    password: fields.P ? fields.P : null,
    hidden: /^true$/i.test(fields.H ?? ''),
  };
}

export function parseScan(input: string): Scan {
  const raw = input.trim();

  if (/^https?:\/\//i.test(raw)) {
    let host: string | null = null;
    try {
      host = new URL(raw).hostname.replace(/^www\./, '');
    } catch {
      host = null;
    }
    return { raw, kind: 'url', host, wifi: null };
  }

  const wifi = parseWifi(raw);
  if (wifi) {
    return { raw, kind: 'wifi', host: null, wifi };
  }

  return { raw, kind: 'text', host: null, wifi: null };
}
