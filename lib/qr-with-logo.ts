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
  // Generate base QR code as PNG buffer first for better control
  const qrCodeBuffer = await QRCode.toBuffer(text, {
    width: qrSize,
    margin: 1,
    errorCorrectionLevel,
    type: 'png',
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  // If no logo, compress and return the base QR code
  if (!logoDataUrl) {
    // Use sharp to compress the QR code
    const compressedBuffer = await sharp(qrCodeBuffer)
      .png({ compressionLevel: 9, quality: 90 })
      .toBuffer();
    return `data:image/png;base64,${compressedBuffer.toString('base64')}`;
  }

  const qrCodeDataUrl = `data:image/png;base64,${qrCodeBuffer.toString('base64')}`;

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
    console.log('Loading logo image, data URL length:', logoDataUrl?.length);
    const logoImage = await loadImage(logoDataUrl);
    console.log('Logo image loaded successfully:', logoImage.width, 'x', logoImage.height);

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

    // Convert canvas to buffer and compress with sharp
    const canvasBuffer = canvas.toBuffer('image/png');
    const compressedBuffer = await sharp(canvasBuffer)
      .png({ compressionLevel: 9, quality: 90 })
      .toBuffer();

    console.log('Final QR code size:', compressedBuffer.length);
    return `data:image/png;base64,${compressedBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error generating QR code with logo:', error);
    // Return compressed base QR code if logo embedding fails
    const compressedBuffer = await sharp(qrCodeBuffer)
      .png({ compressionLevel: 9, quality: 90 })
      .toBuffer();
    return `data:image/png;base64,${compressedBuffer.toString('base64')}`;
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
    // Extract base64 data - support both PNG and JPEG
    const base64Data = imageDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    console.log('Original buffer size:', buffer.length);

    // Use sharp to process and optimize the image
    // Resize to smaller size and use JPEG for better compression
    const processedBuffer = await sharp(buffer)
      .resize(150, 150, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    console.log('Processed buffer size:', processedBuffer.length);

    // Convert back to data URL
    const processedDataUrl = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;

    return { dataUrl: processedDataUrl };
  } catch (error) {
    console.error('Error processing logo image:', error);
    // If sharp fails, return error without fallback to prevent DB issues
    throw new Error('Failed to process logo image. Please try a different image.');
  }
}
