import { put } from '@vercel/blob';

export async function uploadToBlob(
  data: Buffer,
  filename: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  const blob = await put(filename, data, {
    access: 'public',
    contentType,
  });

  return blob.url;
}

export function dataUrlToBuffer(dataUrl: string): Buffer {
  // Extract base64 data from data URL
  const base64Data = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}
