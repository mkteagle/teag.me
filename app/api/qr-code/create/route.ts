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

    // If customPath is provided, check if it's already in use
    if (customPath) {
      const existing = await prisma.qRCode.findFirst({
        where: { id: customPath },
      });

      if (existing) {
        return NextResponse.json(
          { error: "This custom path is already in use" },
          { status: 400 }
        );
      }
    }

    // Use either the custom path or generate a unique short ID
    const id = customPath || (await generateUniqueShortId(prisma));

    // Create the short URL using teag.me domain
    const shortUrl = `https://teag.me/${id}`;

    // Generate QR code with the short URL
    const qrDataUrl = await QRCode.toDataURL(shortUrl);

    // Create the QR code entry with the generated base64 data
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
