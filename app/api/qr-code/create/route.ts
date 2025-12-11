import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateUniqueShortId } from "@/lib/utils";
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
    const { redirectUrl, userId, customPath, logoDataUrl, logoSize } = await request.json();

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

    // Process logo if provided
    let processedLogoUrl = logoDataUrl;
    if (logoDataUrl) {
      const { dataUrl, error } = await processLogoImage(logoDataUrl);
      processedLogoUrl = dataUrl;
      if (error) {
        console.warn('Logo processing warning:', error);
      }
    }

    // Generate QR code with or without logo
    const qrDataUrl = await generateQRWithLogo({
      text: shortUrl,
      logoDataUrl: processedLogoUrl,
      logoSize: logoSize || 20,
      qrSize: 512,
      errorCorrectionLevel: 'H', // High error correction for logo embedding
    });

    // Create the QR code entry
    const qrCode = await prisma.qRCode.create({
      data: {
        id,
        redirectUrl,
        userId,
        base64: qrDataUrl,
        routingUrl: shortUrl,
        logoUrl: processedLogoUrl,
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
    return withCors(
      NextResponse.json({ error: "Failed to create QR code" }, { status: 500 })
    );
  }
}
