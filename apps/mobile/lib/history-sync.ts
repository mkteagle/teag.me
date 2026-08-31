import { getNetworkStateAsync } from 'expo-network';

import { authenticatedFetch } from './auth-client';
import type { HistoryEntry } from './history';

type RemoteCapture = {
  id: string;
  clientId: string;
  rawValue: string;
  normalizedUrl: string;
  host: string;
  source: 'camera' | 'photo' | 'web' | 'created';
  capturedAt: string;
};

type HistoryResponse = {
  capturedCodes: RemoteCapture[];
  pagination: { totalPages: number; totalCount: number };
  plan: 'FREE' | 'PRO';
  cloudLimit: number;
};

export type SyncSummary = {
  state: 'idle' | 'syncing' | 'synced' | 'offline' | 'limit' | 'error';
  total: number;
  limit: number;
  plan: 'FREE' | 'PRO';
};

export async function syncHistory(localEntries: HistoryEntry[]) {
  const network = await getNetworkStateAsync();
  if (!network.isConnected || network.isInternetReachable === false) {
    return { entries: localEntries, summary: { state: 'offline', total: localEntries.length, limit: 0, plan: 'FREE' } as SyncSummary };
  }

  let limitReached = false;
  for (let offset = 0; offset < localEntries.length; offset += 50) {
    const response = await authenticatedFetch('/api/captured-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ captures: localEntries.slice(offset, offset + 50) }),
    });
    if (response.status === 403) {
      limitReached = true;
      break;
    }
    if (!response.ok) throw new Error(`Upload failed (${response.status})`);
  }

  const remote: RemoteCapture[] = [];
  let page = 1;
  let latest: HistoryResponse | null = null;
  do {
    const response = await authenticatedFetch(`/api/captured-codes?page=${page}&limit=100`);
    if (!response.ok) throw new Error(`History fetch failed (${response.status})`);
    latest = await response.json() as HistoryResponse;
    remote.push(...latest.capturedCodes);
    page += 1;
  } while (latest && page <= latest.pagination.totalPages);

  const merged = new Map(localEntries.map((entry) => [entry.clientId, entry]));
  for (const item of remote) {
    merged.set(item.clientId, {
      clientId: item.clientId,
      serverId: item.id,
      rawValue: item.rawValue,
      normalizedUrl: item.normalizedUrl,
      host: item.host,
      source: item.source === 'photo' || item.source === 'created' ? item.source : 'camera',
      capturedAt: item.capturedAt,
    });
  }
  const entries = [...merged.values()].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
  const total = latest?.pagination.totalCount ?? remote.length;
  return {
    entries,
    summary: {
      state: limitReached ? 'limit' : 'synced',
      total,
      limit: latest?.cloudLimit ?? 0,
      plan: latest?.plan ?? 'FREE',
    } as SyncSummary,
  };
}

export async function deleteCloudEntry(serverId: string) {
  const response = await authenticatedFetch(`/api/captured-codes/${encodeURIComponent(serverId)}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 404) throw new Error('Cloud delete failed');
}

export async function clearCloudHistory() {
  const response = await authenticatedFetch('/api/captured-codes', { method: 'DELETE' });
  if (!response.ok) throw new Error('Cloud clear failed');
}
