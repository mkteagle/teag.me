import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateUniqueShortId } from "@/lib/utils";
import { generateQRWithLogoBuffer, processLogoImage } from "@/lib/qr-with-logo";
import { uploadToBlob, dataUrlToBuffer } from "@/lib/blob-storage";
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
    const body = await request.json();
    const { redirectUrl, userId, customPath, logoDataUrl, logoSize } = body;

    console.log("Create QR code request:", {
      redirectUrl,
      userId,
      customPath,
      hasLogo: !!logoDataUrl,
      logoSize,
    });

    if (!redirectUrl || !userId) {
      return withCors(
        NextResponse.json(
          { error: "redirectUrl and userId are required" },
          { status: 400 }
        )
      );
    }

    let id: string;

    if (customPath) {
      // Validate custom path format
      const customPathRegex = /^[a-zA-Z0-9-_]+$/;
      if (!customPathRegex.test(customPath)) {
        return withCors(
          NextResponse.json(
            {
              error:
                "Custom path can only contain letters, numbers, hyphens, and underscores",
            },
            { status: 400 }
          )
        );
      }

      // Check for reserved paths
      const reservedPaths = [
        "api",
        "auth",
        "admin",
        "login",
        "dashboard",
        "generate",
        "analytics",
        "privacy",
        "terms",
      ];
      if (reservedPaths.includes(customPath.toLowerCase())) {
        return withCors(
          NextResponse.json(
            { error: "This custom path is reserved and cannot be used" },
            { status: 400 }
          )
        );
      }

      // Check for existing custom path
      const existing = await prisma.qRCode.findFirst({
        where: { id: customPath },
      });

      if (existing) {
        return withCors(
          NextResponse.json(
            {
              error:
                "This custom path is already in use. Please choose another one.",
            },
            { status: 400 }
          )
        );
      }

      id = customPath;
    } else {
      // Generate a unique short ID if no custom path is provided
      id = await generateUniqueShortId(prisma);
    }

    // Create the short URL using teag.me domain
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://teag.me";
    const shortUrl = `${baseUrl}/${id}`;

    // Process and upload logo if provided
    let logoUrl: string | null = null;
    let processedLogoDataUrl: string | undefined;

    if (logoDataUrl) {
      console.log('Processing logo image...');
      const { dataUrl } = await processLogoImage(logoDataUrl);
      processedLogoDataUrl = dataUrl;

      // Upload logo to blob storage
      const logoBuffer = dataUrlToBuffer(dataUrl);
      logoUrl = await uploadToBlob(logoBuffer, `logos/${id}-logo.jpg`, 'image/jpeg');
      console.log('Logo uploaded to blob storage:', logoUrl);
    }

    // Generate QR code with or without logo
    console.log('Generating QR code...');
    const qrCodeBuffer = await generateQRWithLogoBuffer({
      text: shortUrl,
      logoDataUrl: processedLogoDataUrl,
      logoSize: logoSize || 20,
      qrSize: 512, // Back to 512 since we're using blob storage
      errorCorrectionLevel: 'H',
    });
    console.log('QR code generated successfully, size:', qrCodeBuffer.length);

    // Upload QR code to blob storage
    const qrCodeUrl = await uploadToBlob(qrCodeBuffer, `qr-codes/${id}.jpg`, 'image/jpeg');
    console.log('QR code uploaded to blob storage:', qrCodeUrl);

    // Create the QR code entry with blob URLs
    const qrCode = await prisma.qRCode.create({
      data: {
        id,
        redirectUrl,
        userId,
        base64: qrCodeUrl, // Now stores blob URL instead of base64
        routingUrl: shortUrl,
        logoUrl: logoUrl,
        logoSize: logoSize || null,
      },
    });

    return withCors(
      NextResponse.json({
        success: true,
        data: {
          id: qrCode.id,
          base64: qrCode.base64,
          redirectUrl: qrCode.redirectUrl,
          routingUrl: qrCode.routingUrl,
        },
      })
    );
  } catch (error) {
    console.error("Error creating QR code:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to create QR code";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return withCors(
      NextResponse.json({
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error)
      }, { status: 500 })
    );
  }
}
