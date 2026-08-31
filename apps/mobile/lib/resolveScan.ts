import { API_BASE_URL } from './auth-client';
import { parseScan, type Scan } from './parseScan';

const TEAG_ME_HOSTS = new Set(['teag.me', 'www.teag.me']);

function getTeagMeQrId(scan: Scan) {
  if (scan.kind !== 'url') return null;

  try {
    const url = new URL(scan.raw);
    if (!TEAG_ME_HOSTS.has(url.hostname.toLowerCase())) return null;

    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length === 1) return segments[0];
    if (segments.length === 2 && segments[0] === 'r') return segments[1];
  } catch {
    return null;
  }

  return null;
}

export async function resolveScan(scan: Scan): Promise<Scan> {
  const id = getTeagMeQrId(scan);
  if (!id) return scan;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_000);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/qr-code/${encodeURIComponent(id)}/resolve`,
      { signal: controller.signal }
    );
    if (!response.ok) return scan;

    const payload: unknown = await response.json();
    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof (payload as { redirectUrl?: unknown }).redirectUrl !== 'string'
    ) {
      return scan;
    }

    return parseScan((payload as { redirectUrl: string }).redirectUrl);
  } catch {
    return scan;
  } finally {
    clearTimeout(timeout);
  }
}
