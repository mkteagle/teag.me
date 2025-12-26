import { NextRequest, NextResponse } from "next/server";
import { generateQRWithLogo, processLogoImage } from "@/lib/qr-with-logo";

// Allow CORS for https://www.mkteagle.com
const ALLOWED_ORIGIN = "https://www.mkteagle.com";

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

export async function OPTIONS() {
  // Preflight CORS support
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  try {
    const { redirectUrl, customPath, logoDataUrl, logoSize } = await request.json();

    if (!redirectUrl) {
      return withCors(
        NextResponse.json(
          { error: "redirectUrl is required" },
          { status: 400 }
        )
      );
    }

    // Create the preview URL (same logic as create endpoint)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://teag.me";
    const previewPath = customPath || "preview";
    const previewUrl = `${baseUrl}/${previewPath}`;

    // Process logo if provided
    let processedLogoUrl = logoDataUrl;
    if (logoDataUrl) {
      const { dataUrl, error } = await processLogoImage(logoDataUrl);
      processedLogoUrl = dataUrl;
      if (error) {
        console.warn('Logo processing warning:', error);
      }
    }

    // Generate QR code preview with or without logo
    const qrDataUrl = await generateQRWithLogo({
      text: previewUrl,
      logoDataUrl: processedLogoUrl,
      logoSize: logoSize || 20,
      qrSize: 512,
      errorCorrectionLevel: 'H', // High error correction for logo embedding
    });

    return withCors(
      NextResponse.json({
        success: true,
        preview: qrDataUrl,
        previewUrl: previewUrl,
      })
    );
  } catch (error) {
    console.error("Error generating QR code preview:", error);
    return withCors(
      NextResponse.json({ error: "Failed to generate preview" }, { status: 500 })
    );
  }
}
