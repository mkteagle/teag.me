import { NextRequest, NextResponse } from "next/server";
import { generateQRWithLogo, processLogoImage } from "@/lib/qr-with-logo";

export async function POST(request: NextRequest) {
  try {
    const { redirectUrl, customPath, logoDataUrl, logoSize } = await request.json();

    if (!redirectUrl) {
      return NextResponse.json(
        { error: "redirectUrl is required" },
        { status: 400 }
      );
    }

    // Create the preview URL (same logic as create endpoint)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://teag.me";
    const previewPath = customPath || "preview";
    const previewUrl = `${baseUrl}/${previewPath}`;

    // Process logo if provided
    let processedLogoUrl = logoDataUrl;
    if (logoDataUrl) {
      const { dataUrl } = await processLogoImage(logoDataUrl);
      processedLogoUrl = dataUrl;
    }

    // Generate QR code preview with or without logo
    const qrDataUrl = await generateQRWithLogo({
      text: previewUrl,
      logoDataUrl: processedLogoUrl,
      logoSize: logoSize || 20,
      qrSize: 300,
      errorCorrectionLevel: 'H',
    });

    return NextResponse.json({
      success: true,
      preview: qrDataUrl,
      previewUrl: previewUrl,
    });
  } catch (error) {
    console.error("Error generating QR code preview:", error);

    let errorMessage = "Failed to generate preview";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
