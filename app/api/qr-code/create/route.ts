import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as QRCode from "qrcode";

export async function POST(request: NextRequest) {
  try {
    const { redirectUrl, userId } = await request.json();

    if (!redirectUrl || !userId) {
      return NextResponse.json(
        { error: "redirectUrl and userId are required" },
        { status: 400 }
      );
    }

    // Create QR code entry to get an ID
    const qrCodeEntry = await prisma.qRCode.create({
      data: {
        redirectUrl,
        userId,
        base64: "",
      },
    });

    // Generate routing URL using the ID
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const routingUrl = `${baseUrl}/r/${qrCodeEntry.id}`;

    // Generate QR code with routing URL
    const qrDataUrl = await QRCode.toDataURL(routingUrl);

    // Update with generated QR code
    const qrCode = await prisma.qRCode.update({
      where: { id: qrCodeEntry.id },
      data: { base64: qrDataUrl },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: qrCode.id,
        base64: qrCode.base64,
        redirectUrl: qrCode.redirectUrl,
        routingUrl,
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
