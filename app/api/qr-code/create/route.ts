import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as QRCode from "qrcode";
import { generateUniqueShortId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { redirectUrl, userId, customPath } = await request.json();

    if (!redirectUrl || !userId) {
      return NextResponse.json(
        { error: "redirectUrl and userId are required" },
        { status: 400 }
      );
    }

    let id: string;

    if (customPath) {
      // Validate custom path format
      const customPathRegex = /^[a-zA-Z0-9-_]+$/;
      if (!customPathRegex.test(customPath)) {
        return NextResponse.json(
          {
            error:
              "Custom path can only contain letters, numbers, hyphens, and underscores",
          },
          { status: 400 }
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
        return NextResponse.json(
          { error: "This custom path is reserved and cannot be used" },
          { status: 400 }
        );
      }

      // Check for existing custom path
      const existing = await prisma.qRCode.findFirst({
        where: { id: customPath },
      });

      if (existing) {
        return NextResponse.json(
          {
            error:
              "This custom path is already in use. Please choose another one.",
          },
          { status: 400 }
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

    // Generate QR code with the short URL
    const qrDataUrl = await QRCode.toDataURL(shortUrl);

    // Create the QR code entry
    const qrCode = await prisma.qRCode.create({
      data: {
        id,
        redirectUrl,
        userId,
        base64: qrDataUrl,
        routingUrl: shortUrl,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: qrCode.id,
        base64: qrCode.base64,
        redirectUrl: qrCode.redirectUrl,
        routingUrl: qrCode.routingUrl,
      },
    });
  } catch (error) {
    console.error("Error creating QR code:", error);
    return NextResponse.json(
      { error: "Failed to create QR code" },
      { status: 500 }
    );
  }
}
