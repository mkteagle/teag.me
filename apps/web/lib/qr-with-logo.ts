import QRCode from 'qrcode';
import sharp from 'sharp';

interface QRWithLogoOptions {
  text: string;
  logoDataUrl?: string;
  logoSize?: number; // Percentage of QR code size (10-30)
  qrSize?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/** Decode a data URL (any image type) into a raw Buffer. */
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
    const logoSizePixels = Math.floor((qrSize * logoSize) / 100);
    const padding = 8;
    const bgSize = logoSizePixels + padding * 2;

    // Decode the logo (sharp handles png/jpeg/webp/svg natively — no node-canvas).
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

/**
 * Validate and normalize an uploaded logo. Accepts any sharp-readable format
 * (png/jpeg/webp/svg), resizes to a small square, and re-encodes as PNG so
 * transparency is preserved and downstream steps get a known format.
 */
export async function processLogoImage(
  imageDataUrl: string
): Promise<{ dataUrl: string; error?: string }> {
  try {
    const buffer = dataUrlToBuffer(imageDataUrl);

    const processedBuffer = await sharp(buffer)
      .resize(150, 150, { fit: 'cover', position: 'center' })
      .png()
      .toBuffer();

    return { dataUrl: `data:image/png;base64,${processedBuffer.toString('base64')}` };
  } catch (error) {
    console.error('Error processing logo image:', error);
    throw new Error('Failed to process logo image. Please try a different image.');
  }
}
