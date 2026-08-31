import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

import { API_BASE_URL, authenticatedFetch } from './auth-client';

export type GeneratedQr = {
  imageDataUrl: string;
  encodedUrl: string;
  destinationUrl: string;
  tracked: boolean;
  id?: string;
};

function normalizeHttpUrl(value: string) {
  const candidate = value.trim();
  const withProtocol = /^[a-z][a-z\d+.-]*:/i.test(candidate) ? candidate : `https://${candidate}`;
  const url = new URL(withProtocol);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Enter a web address beginning with http:// or https://.');
  return url.toString();
}

async function dataUrlFor(value: string) {
  const response = await fetch(`${API_BASE_URL}/api/qr-code/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: value, size: 1024, format: 'dataurl' }),
  });
  const body = await response.json() as { dataUrl?: string; error?: string };
  if (!response.ok || !body.dataUrl) throw new Error(body.error || 'Could not generate the QR code.');
  return body.dataUrl;
}

export async function generateQr(value: string, tracked: boolean): Promise<GeneratedQr> {
  const destinationUrl = normalizeHttpUrl(value);
  if (!tracked) {
    return { imageDataUrl: await dataUrlFor(destinationUrl), encodedUrl: destinationUrl, destinationUrl, tracked: false };
  }

  const response = await authenticatedFetch('/api/qr-code/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ redirectUrl: destinationUrl }),
  });
  const body = await response.json() as {
    data?: { id: string; base64: string; redirectUrl: string; routingUrl: string };
    error?: string;
    code?: string;
    limit?: number;
  };
  if (!response.ok || !body.data) {
    if (body.code === 'LIMIT_REACHED') throw new Error(`Your Free plan already has ${body.limit ?? 10} active tracked QR codes. Upgrade to Pro or archive one on teag.me.`);
    throw new Error(body.error || 'Could not create the tracked QR code.');
  }
  return {
    imageDataUrl: body.data.base64.startsWith('data:') ? body.data.base64 : await dataUrlFor(body.data.routingUrl),
    encodedUrl: body.data.routingUrl,
    destinationUrl: body.data.redirectUrl,
    tracked: true,
    id: body.data.id,
  };
}

function qrFile(qr: GeneratedQr) {
  const base64 = qr.imageDataUrl.split(',')[1];
  if (!base64) throw new Error('The QR image is unavailable.');
  const file = new File(Paths.cache, `teag-qr-${qr.id ?? Date.now()}.png`);
  file.create({ overwrite: true });
  file.write(base64, { encoding: 'base64' });
  return file;
}

export async function shareQr(qr: GeneratedQr) {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
  const file = qrFile(qr);
  await Sharing.shareAsync(file.uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: 'Share QR code' });
}

export async function saveQr(qr: GeneratedQr) {
  const permission = await MediaLibrary.requestPermissionsAsync(true, ['photo']);
  if (!permission.granted) throw new Error('Photo access is required to save the QR code.');
  const file = qrFile(qr);
  await MediaLibrary.saveToLibraryAsync(file.uri);
}
