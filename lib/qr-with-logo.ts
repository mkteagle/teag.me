import QRCode from 'qrcode';
import { createCanvas, loadImage, Image } from 'canvas';
import sharp from 'sharp';

interface QRWithLogoOptions {
  text: string;
  logoDataUrl?: string;
  logoSize?: number; // Percentage of QR code size (10-30)
  qrSize?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export async function generateQRWithLogo({
  text,
  logoDataUrl,
  logoSize = 20,
  qrSize = 512,
  errorCorrectionLevel = 'H', // High error correction for logo embedding
}: QRWithLogoOptions): Promise<string> {
  // Generate base QR code
  const qrCodeDataUrl = await QRCode.toDataURL(text, {
    width: qrSize,
    margin: 1,
    errorCorrectionLevel,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  // If no logo, return the base QR code
  if (!logoDataUrl) {
    return qrCodeDataUrl;
  }

  try {
    // Create canvas
    const canvas = createCanvas(qrSize, qrSize);
    const ctx = canvas.getContext('2d');

    // Load and draw QR code
    const qrImage = await loadImage(qrCodeDataUrl);
    ctx.drawImage(qrImage, 0, 0, qrSize, qrSize);

    // Calculate logo dimensions
    const logoSizePixels = Math.floor((qrSize * logoSize) / 100);
    const logoPosition = (qrSize - logoSizePixels) / 2;

    // Load logo image
    const logoImage = await loadImage(logoDataUrl);

    // Draw white background circle for logo (for better visibility)
    const padding = 8;
    const bgSize = logoSizePixels + padding * 2;
    const bgPosition = (qrSize - bgSize) / 2;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(
      bgPosition + bgSize / 2,
      bgPosition + bgSize / 2,
      bgSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Create circular clip for logo
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      logoPosition + logoSizePixels / 2,
      logoPosition + logoSizePixels / 2,
      logoSizePixels / 2,
      0,
      Math.PI * 2
    );
    ctx.clip();

    // Draw logo
    ctx.drawImage(
      logoImage,
      logoPosition,
      logoPosition,
      logoSizePixels,
      logoSizePixels
    );

    ctx.restore();

    // Optional: Add a subtle border around the logo
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      logoPosition + logoSizePixels / 2,
      logoPosition + logoSizePixels / 2,
      logoSizePixels / 2,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    // Convert canvas to data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating QR code with logo:', error);
    // Return base QR code if logo embedding fails
    return qrCodeDataUrl;
  }
}

/**
 * Validate and process uploaded logo image
 * Ensures the image is properly formatted and sized
 */
export async function processLogoImage(
  imageDataUrl: string
): Promise<{ dataUrl: string; error?: string }> {
  try {
    // Extract base64 data
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Use sharp to process and optimize the image
    const processedBuffer = await sharp(buffer)
      .resize(200, 200, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();

    // Convert back to data URL
    const processedDataUrl = `data:image/png;base64,${processedBuffer.toString('base64')}`;

    return { dataUrl: processedDataUrl };
  } catch (error) {
    console.error('Error processing logo image:', error);
    return {
      dataUrl: imageDataUrl,
      error: 'Failed to process image. Using original.',
    };
  }
}
