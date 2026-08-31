import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Scan } from './parseScan';

const HISTORY_KEY = 'teag.me.scan-history.v1';

export type CaptureSource = 'camera' | 'photo' | 'created';

export type HistoryEntry = {
  clientId: string;
  serverId?: string;
  rawValue: string;
  normalizedUrl: string;
  host: string;
  source: CaptureSource;
  capturedAt: string;
};

function createClientId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function createHistoryEntry(scan: Scan, source: CaptureSource): HistoryEntry | null {
  if (scan.kind !== 'url' || !scan.host) return null;

  let normalizedUrl: string;
  try {
    normalizedUrl = new URL(scan.raw).toString();
  } catch {
    return null;
  }

  return {
    clientId: createClientId(),
    rawValue: scan.raw,
    normalizedUrl,
    host: scan.host,
    source,
    capturedAt: new Date().toISOString(),
  };
}

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const stored = await AsyncStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry);
  } catch {
    return [];
  }
}

export async function saveHistory(entries: HistoryEntry[]) {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<HistoryEntry>;
  return (
    typeof entry.clientId === 'string' &&
    (entry.serverId === undefined || typeof entry.serverId === 'string') &&
    typeof entry.rawValue === 'string' &&
    typeof entry.normalizedUrl === 'string' &&
    typeof entry.host === 'string' &&
    (entry.source === 'camera' || entry.source === 'photo' || entry.source === 'created') &&
    typeof entry.capturedAt === 'string'
  );
}
