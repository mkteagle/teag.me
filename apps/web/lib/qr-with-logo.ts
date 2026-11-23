import QRCode from 'qrcode';
import sharp from 'sharp';

interface QRWithLogoOptions {
  text: string;
  logoDataUrl?: string;
  logoSize?: number; // Percentage of QR code size (10-30)
  qrSize?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const MAX_LOGO_PIXELS = 16_000_000;
const LOGO_DATA_PREFIX = /^data:image\/(?:png|jpe?g|webp);base64,/i;

export class InvalidLogoError extends Error {
  constructor() {
    super('Choose a PNG, JPEG, or WebP logo under 2 MB and 16 million pixels.');
  }
}

/** Decode a normalized PNG logo for QR compositing. */
function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.replace(/^data:[^;]+;base64,/, '');
  return Buffer.from(base64, 'base64');
}

export async function generateQRWithLogoBuffer({
  text,
  logoDataUrl,
  logoSize = 20,
  qrSize = 512,
  errorCorrectionLevel = 'H',
}: QRWithLogoOptions): Promise<Buffer> {
  // Generate the base QR code as a PNG buffer.
  const qrCodeBuffer = await QRCode.toBuffer(text, {
    width: qrSize,
    margin: 1,
    errorCorrectionLevel,
    type: 'png',
    color: { dark: '#000000', light: '#FFFFFF' },
  });

  // No logo: just compress and return.
  if (!logoDataUrl) {
    return sharp(qrCodeBuffer).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  }

  try {
    const percent = Number.isFinite(logoSize) ? Math.min(30, Math.max(10, logoSize)) : 20;
    const logoSizePixels = Math.floor((qrSize * percent) / 100);
    const padding = 8;
    const bgSize = logoSizePixels + padding * 2;

    const logoBuffer = dataUrlToBuffer(logoDataUrl);

    // Clip the logo into a circle: resize to a square, then keep only the
    // pixels under a white circle mask (dest-in).
    const r = logoSizePixels / 2;
    const circleMask = Buffer.from(
      `<svg width="${logoSizePixels}" height="${logoSizePixels}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`
    );
    const maskedLogo = await sharp(logoBuffer)
      .resize(logoSizePixels, logoSizePixels, { fit: 'cover', position: 'center' })
      .ensureAlpha()
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toBuffer();

    // White backing circle (with a subtle border) behind the logo for contrast.
    const br = bgSize / 2;
    const whiteCircle = Buffer.from(
      `<svg width="${bgSize}" height="${bgSize}">` +
        `<circle cx="${br}" cy="${br}" r="${br}" fill="#FFFFFF"/>` +
        `<circle cx="${br}" cy="${br}" r="${br - 1}" fill="none" stroke="#E5E7EB" stroke-width="2"/>` +
        `</svg>`
    );

    // Composite both, centered, over the QR code, then compress.
    return await sharp(qrCodeBuffer)
      .composite([
        { input: whiteCircle, gravity: 'centre' },
        { input: maskedLogo, gravity: 'centre' },
      ])
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
  } catch (error) {
    console.error('Error generating QR code with logo:', error);
    // Fall back to the plain QR so generation never hard-fails.
    return sharp(qrCodeBuffer).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  }
}

// Wrapper that returns a data URL for preview.
export async function generateQRWithLogo(options: QRWithLogoOptions): Promise<string> {
  const buffer = await generateQRWithLogoBuffer(options);
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

/** Normalize a bounded raster upload to a PNG before storing or compositing it. */
export async function processLogoImage(
  imageDataUrl: unknown
): Promise<{ dataUrl: string }> {
  if (typeof imageDataUrl !== 'string' || imageDataUrl.length > Math.ceil(MAX_LOGO_BYTES / 3) * 4 + 32 ||
      !LOGO_DATA_PREFIX.test(imageDataUrl)) throw new InvalidLogoError();

  const base64 = imageDataUrl.replace(LOGO_DATA_PREFIX, '');
  if (base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) throw new InvalidLogoError();
  const buffer = Buffer.from(base64, 'base64');
  const png = buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const webp = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  if (buffer.length > MAX_LOGO_BYTES || (!png && !jpeg && !webp)) throw new InvalidLogoError();

  try {
    const processedBuffer = await sharp(buffer, { limitInputPixels: MAX_LOGO_PIXELS })
      .resize(150, 150, { fit: 'cover', position: 'center' })
      .png()
      .toBuffer();

    return { dataUrl: `data:image/png;base64,${processedBuffer.toString('base64')}` };
  } catch {
    throw new InvalidLogoError();
  }
}
