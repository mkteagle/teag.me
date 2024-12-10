import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as QRCode from "qrcode";
import { generateUniqueShortId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { redirectUrl, userId } = await request.json();

    if (!redirectUrl || !userId) {
      return NextResponse.json(
        { error: "redirectUrl and userId are required" },
        { status: 400 }
      );
    }

    // Generate a unique short ID
    const shortId = await generateUniqueShortId(prisma);

    // Create the short URL using teag.me domain
    const shortUrl = `https://teag.me/r/${shortId}`;

    // Create initial QR code entry
    const qrCodeEntry = await prisma.qRCode.create({
      data: {
        id: shortId, // Use the short ID as the primary key
        redirectUrl,
        userId,
        base64: "",
        routingUrl: shortUrl,
      },
    });

    // Generate QR code with the short URL
    const qrDataUrl = await QRCode.toDataURL(shortUrl);

    // Update QR code with the base64 data
    const qrCode = await prisma.qRCode.update({
      where: { id: shortId },
      data: {
        base64: qrDataUrl,
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
